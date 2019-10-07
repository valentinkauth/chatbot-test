/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { BotkitConversation } = require("botkit");
const DBHelper = require("../../helper/DBHelper");
var questionnaireIds = require("../../constants/questionnaire_id");

module.exports = function(controller) {
  // Load json questionnaire
  var fragebogen = require(`../../data/${questionnaireIds.QNEU_FILENAME}`);
  var questions = fragebogen.questions.question;

  // Create conversation object
  let convo = new BotkitConversation(questionnaireIds.QNEU_ID, controller);

  // Initiate variable that shows current Category
  var currentCategory = "";

  // Iterate through categories and create categories dictionary with categories and the corresponding explanation texts
  var categories = {};
  if (questions.category_descriptions) {
    questions.category_descriptions.forEach(element => {
      if (element["main_title"] && element["category"]) {
        categories[element["category"]] = element["main_title"];
      }
    });
  }

  // Handling dynamic start before start of the converstaion
  convo.before("default", async (convo, bot) => {
    // Set questionnaire ID initially
    convo.setVar("id", questionnaireIds.QNEU_ID);

    console.log(convo.vars.id);

    // Access user data from DB
    const items = await controller.storage.read([convo.vars.user]);
    const userData = items[convo.vars.user] || {};

    // Set user name
    convo.setVar("name", userData.user_info.nick_name);

    // DO STUFF WITH USER DATE HERE / UDPATE USER DATA HERE

    // Check if questionnaire is already added to user data
    if (!(convo.vars.id in userData.questionnaires)) {
      // Add new questionnaire to user data array
      console.log(
        `Added new questionnaire with the id ${convo.vars.id} to questionnaire object in user data`
      );
      userData.questionnaires[convo.vars.id] = {
        state: "incomplete",
        current_question: "default",
        results: []
      };
      // Set current question to default initially
      var current_question = "default";
    }
    // Set current question thread if questionnaire already exists
    else {
      var current_question =
        userData.questionnaires[convo.vars.id].current_question;
    }

    // Store updated user data in db
    // TODO: Instead of manually setting the user, use the pre-defined constants (currently not working)
    await controller.storage.write({ [convo.vars.user]: userData });

    // Start conversation with current question
    convo.gotoThread(current_question);
  });

  // send greeting & explanation
  convo.say("Hallo {{ vars.name }}, dies ist der neue Testfragebogen.");
  convo.say(
    "Ich werde dir nun ein paar Fragen stellen und es wäre super, wenn du mir diese beantworten könntest."
  );
  convo.say(
    "Die meisten Fragen kommen mit Antwortmöglichkeiten, die du dann einfach anklicken kannst."
  );
  convo.say(
    "Bei bestimmten Fragen kannst du Zahlenwerte (z.B dein Gewicht) oder Worte ganz einfach in die Textzeile eingeben, ich gebe dir dann aber nochmals bescheid ;)"
  );
  convo.say(
    'Um den Fragebogen zu unterbrechen, tippe "stop" in das Textfeld. Es ist möglich den Fragebogen zu einem späteren Zeitpunkt fortzusetzen.'
  );

  // Go to first question normally
  //convo.addAction('thread_name')

  // Iterate through all elements
  questions.forEach((question, index) => {
    // Assign first question to default thread
    if (index == 0) {
      var threadName = "default";
    } else {
      var threadName = question["name"];
    }

    // Check for needed fields
    if (
      question["item"] &&
      question["name"] &&
      question["answer_options"]["answer_option"] &&
      question["answer_options"]["state"] &&
      question["category"]
    ) {
      // Send category explanation if current question it part of new category
      if (
        question["category"] &&
        question["category"] != currentCategory &&
        categories[question["category"]]
      ) {
        convo.addMessage(categories[question["category"]], threadName);
        currentCategory = question["category"];
      }

      // Sort answers
      if (question["answer_options"]["answer_option"].length > 1) {
        // Sort list based on code, so answers are not in random order and the -99 code will be displayed in the end
        var answerOptionsSorted = question["answer_options"][
          "answer_option"
        ].sort(function(a, b) {
          return Math.abs(a["code"]) - Math.abs(b["code"]);
        });
      } else {
        var answerOptionsSorted = question["answer_options"]["answer_option"];
      }

      // Set question
      var questionString = question["item"];

      // Initialize empty array for quick reply objects
      var replies = [];

      // Initialize empty array for (answer) pattern objects
      var patterns = [];

      // Assign value for next thread if there is another question following the current one. Otherwise assign empty next thread to end conversation
      // TODO: Instead of iterating to next element, give each individual question element a pointer to the next thread
      var nextThread = "";
      if (index < questions.length - 1) {
        if (questions[index + 1]["name"]) {
          nextThread = questions[index + 1]["name"];
        } else {
          nextThread = "end_thread";
        }
      } else {
        // This should be called for the last question
        nextThread = "end_thread";
      }

      answerOptionsSorted.forEach(answerOption => {
        switch (answerOption["code"]) {
          // float: No quick reply button, handler checks for float
          case "-94":
            questionString +=
              "Bitte gebe die Antwort als Zahlenwert in das Textfeld des Chats ein. Du kannst auch Kommazahlen verwenden";

            type = "float";

            handler = async (response, convo, bot) => {
              // TODO: Check if number is a float value, replace true in IF statement by the check
              if (true) {
                // READ AND WRITE DB
                // Access user data from DB
                const items = await controller.storage.read([convo.vars.user]);
                const userData = items[convo.vars.user] || {};
                // Add response to results in user data
                userData.questionnaires[convo.vars.id].results.push({
                  id: question["name"],
                  code: answerOption["code"],
                  value: response
                });
                // Update current question in user data
                userData.questionnaires[
                  convo.vars.id
                ].current_question = nextThread;
                // Write updated user data to storage
                await controller.storage.write({ [convo.vars.user]: userData });
                // Go to next thread
                await convo.gotoThread(nextThread);
              } else {
                // Repeat question
                await bot.say(
                  "Bitte gebe als Antwort nur ganze Zahlenwerte ein."
                );
                await convo.repeat();
              }
            };

            // Add pattern and correspoding handler to patterns array
            patterns.push({ default: true, type: type, handler: handler });

            break;

          // freetext: No quick reply button, handler might check for text
          case "-95":
            questionString +=
              " Bitte gebe die Antwort als Freitext in das Textfeld des Chats ein.";

            type = "string";

            handler = async (response, convo, bot) => {
              // READ AND WRITE DB
              // Access user data from DB
              const items = await controller.storage.read([convo.vars.user]);
              const userData = items[convo.vars.user] || {};
              // Add response to results in user data
              userData.questionnaires[convo.vars.id].results.push({
                id: question["name"],
                code: answerOption["code"],
                value: response
              });
              // Update current question in user data
              userData.questionnaires[
                convo.vars.id
              ].current_question = nextThread;
              // Write updated user data to storage
              await controller.storage.write({ [convo.vars.user]: userData });
              // Go to next thread
              await convo.gotoThread(nextThread);
            };

            // Add pattern and correspoding handler to patterns array
            patterns.push({ default: true, type: type, handler: handler });

            break;
          // int: No quick reply button, handler checks for int
          case "-96":
            questionString +=
              " Bitte gebe die Antwort als Zahlenwert in das Textfeld des Chats ein. Bitte verwende nur ganze Zahlenwerte.";

            type = "int";

            handler = async (response, convo, bot) => {
              // Check if response is a valid number
              if (!isNaN(response)) {
                // READ AND WRITE DB
                // Access user data from DB
                const items = await controller.storage.read([convo.vars.user]);
                const userData = items[convo.vars.user] || {};
                // Add response to results in user data
                userData.questionnaires[convo.vars.id].results.push({
                  id: question["name"],
                  code: answerOption["code"],
                  value: response
                });
                // Update current question in user data
                userData.questionnaires[
                  convo.vars.id
                ].current_question = nextThread;
                // Write updated user data to storage
                await controller.storage.write({ [convo.vars.user]: userData });
                // Go to next thread
                await convo.gotoThread(nextThread);
              } else {
                // Repeat question
                await bot.say(
                  "Bitte gebe als Antwort nur ganze Zahlenwerte ein."
                );
                await convo.repeat();
              }
            };

            // Add pattern and correspoding handler to patterns array
            patterns.push({ default: true, type: type, handler: handler });

            break;

          // Create quick reply button and corresponding handler, that reacts only on the specific string (question text)
          // This way we can display the text as the bots answer instead of the code/payload
          default:
            // In this case, the answer option is the pattern to look for

            // Convert string to regular expression, example from https://github.com/sindresorhus/escape-string-regexp
            escapeStringRegExp.matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
            function escapeStringRegExp(str) {
              return str.replace(escapeStringRegExp.matchOperatorsRe, "\\$&");
            }

            var pattern = new RegExp(escapeStringRegExp(answerOption["text"]));

            var type = "string";

            var handler = async (response, convo, bot) => {
              // READ AND WRITE DB
              // Access user data from DB
              const items = await controller.storage.read([convo.vars.user]);
              const userData = items[convo.vars.user] || {};
              // Add response to results in user data
              userData.questionnaires[convo.vars.id].results.push({
                id: question["name"],
                code: answerOption["code"],
                value: response
              });
              // Update current question in user data
              userData.questionnaires[
                convo.vars.id
              ].current_question = nextThread;
              // Write updated user data to storage
              await controller.storage.write({ [convo.vars.user]: userData });

              // Update currentThread
              convo.setVar("currentThread", nextThread);
              // Go to next thread
              await convo.gotoThread(nextThread);
            };

            // Add pattern and correspoding handler to patterns array
            patterns.push({ pattern: pattern, type: type, handler: handler });

            // Add single quick reply object to array
            replies.push({
              title: answerOption["text"],
              payload: answerOption["text"]
            });

            break;
        }
      });

      patterns.push({
        default: true,
        handler: async (response, convo, bot) => {
          await bot.say(
            "Bitte benutze zum Antworten eine der vorgebebenen Möglichkeiten"
          );
          // start over!
          return await convo.repeat();
        }
      });

      // Add quick reply to repeat last question
      if (!(threadName === "default")) {
        replies.push({
          title: "Letzte Frage wiederholen",
          payload: "Letzte Frage wiederholen",
          repeat: true
        });

        patterns.push({
          pattern: "Letzte Frage wiederholen",
          handler: async (response, convo, bot) => {
            const items = await controller.storage.read([convo.vars.user]);
            const userData = items[convo.vars.user] || {};

            var lastResult = userData.questionnaires[
              convo.vars.id
            ].results.pop();

            // Check if there was an element found in the results array and the results array is not empty
            if (lastResult != undefined && userData.questionnaires[
              convo.vars.id
            ].results.length > 0) {
              // Update current question before going to its thread
              userData.questionnaires[convo.vars.id].current_question =
                lastResult.id;
              // Update user data with cropped results array and new current question
              await controller.storage.write({ [convo.vars.user]: userData });
              // Go to question thread of last element found in results array
              await convo.gotoThread(lastResult.id);
            } else if (lastResult != undefined && userData.questionnaires[
              convo.vars.id
            ].results.length < 1) { 
              // Update current question before going to its thread
              userData.questionnaires[convo.vars.id].current_question = "default"
              // Update user data with cropped results array and new current question
              await controller.storage.write({ [convo.vars.user]: userData });
              // Go to default thread if results array is empty
              await convo.gotoThread("default");
            } 
            else {
              await bot.say(
                "Leider kann ich die letzte Frage nicht wiederholen."
              );
              await convo.repeat();
            }

            // if (userData.questionnaires[convo.vars.id]) {
            //   // Use pop function to remove last element of answer array
            //   var lastThread = userData.questionnaires[
            //     convo.vars.id
            //   ].results.pop();

            //   await controller.storage.write({ [convo.vars.user]: userData });

            //   console.log(lastThread.id);

            //   await convo.gotoThread(lastThread.id);
            // } else {
            //   // Repeat question
            //   await bot.say(
            //     "Leider kann ich die letzte Frage nicht wiederholen."
            //   );
            //   await convo.repeat();
            // }
          }
        });
      }

      // React on the "stop" keyword
      patterns.push({
        pattern: "stop",
        handler: async (response, convo, bot) => {
          // Save last thread before going to the stopping thread
          await convo.setVar("lastThread", convo.step.thread);

          // Go to stopping thread
          await convo.gotoThread("stop");
        }
      });

      // Add question with message object, including quick replies, and all patterns to the corresponding thread name
      convo.addQuestion(
        {
          text: questionString,
          quick_replies: replies
        },
        patterns,
        {},
        threadName
      );
    } else {
      console.log(
        "Element does not contain all informations: " + question + index
      );
    }
  });

  // Add stopping thread
  convo.addQuestion(
    {
      text:
        "Möchtest du den Fragebogen unterbrechen? Du kannst ihn zu einem späteren Zeitpunkt wieder fortsetzen",
      quick_replies: [
        { title: "Ja", payload: "Ja" },
        { title: "Nein", payload: "Nein" }
      ]
    },
    [
      {
        pattern: "Nein",
        handler: async function(answer, convo, bot) {
          await convo.gotoThread(convo.vars.lastThread);
        }
      },
      {
        pattern: "Ja (funktioniert noch nicht richtig)",
        handler: async function(answer, convo, bot) {
          // TODO: Find nicer way to end the dialog
          await bot.beginDialog("main_menu");
        }
      }
    ],
    {},
    "stop"
  );

  // Add final message
  convo.addMessage(
    "Super {{ vars.name }}, das war es auch schon. Vielen Dank für das Beantworten der Fragen! Die Antworten werden jetzt von mir an unseren Server übertragen. Die Informationen helfen uns bei der Erforschung der perinatalen Prägung enorm.",
    "end_thread"
  );

  // log all variables when dialog is completed
  convo.after(async (results, bot) => {
    // TODO: Check if all fields of questionnaire are field and mark questionnaire as done if so.
    // If not all fields are marked, redo questionnaire

    // Access user data from DB
    const items = await controller.storage.read([results.user]);
    const userData = items[results.user] || {};

    // Set questionnaire state to finished
    userData.questionnaires[results.id].state = "finished";

    // Remove questionnaire from queue
    var index = userData.queue.indexOf(results.id);
    if (index > -1) {
      userData.queue.splice(index, 1);
    }

    // Write updated user data to database
    await controller.storage.write({ [results.user]: userData });

    console.log(`Dialog ${results.id} ended. All data transferred to database`);

    // TODO: Go to dialog "after_questionnaire" -> e.g. "Kann ich sonst noch etwas für dich tun username?"
    await bot.beginDialog("main_menu_resume");
  });

  // Add questionnaire to controller
  controller.addDialog(convo);
};
