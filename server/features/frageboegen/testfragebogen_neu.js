/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { BotkitConversation } = require("botkit");
var questionnaireIds = require('../../constants/questionnaire_id');


module.exports = function (controller) {

    // Load json questionnaire
    var fragebogen = require(`../../data/${questionnaireIds.QNEU_FILENAME}`);
    var questions = fragebogen.questions.question;

    // Create conversation object
    let convo = new BotkitConversation(questionnaireIds.QNEU_ID, controller);


    // Initiate variable that shows current Category
    var currentCategory = "";

    // Iterate through categories and create categories dictionary with categories and the corresponding explanation texts
    var categories = {};
    questions.forEach(element => {
        if (element['main_title'] && element['category']) {
            categories[element['category']] = element['main_title']
        }
    })



    // Handling dynamic start before start of the converstaion
    convo.before('default', async (convo, bot) => {

        // Set questionnaire ID
        convo.setVar('id', questionnaireIds.QNEU_ID);

        // Set user id from conversation context
        let user_id = convo.vars.user;

        // Set current question to default initially
        var current_question = "default"

        // Access user data from DB
        const items = await controller.storage.read([user_id]);
        const userData = items[user_id] || {};

        // Check if user data available and set nick name
        if (Object.keys(userData).length) {
            if ("nick_name" in userData.user_info) {
                convo.setVar('user_name', userData.user_info.nick_name)
            } else if ("first_name" in userData.user_info) {
                convo.setVar('user_name', userData.user_info.first_name)
            } else {
                convo.setVar('user_name', "Unbekannter Benutzer")
            }
        }
        else {
            convo.setVar('user_name', "Unbekannter Benutzer")
        }


        // DO STUFF WITH USER DATE HERE / UDPATE USER DATA HERE

        // TODO: Set questionnaire as started/unfinished

        // Check if questionnaire is already added to user data
        if (!(questionnaireIds.QNEU_ID in userData.questionnaires)) {
            // Add new questionnaire to user data array
            console.log(`Added new questionnaire with the id ${questionnaireIds.QNEU_ID} to questionnaire object in user data`)
            userData.questionnaires[questionnaireIds.QNEU_ID] = { 'state': "incomplete", 'current_question': "default", 'results': {} }
        }
        // Set current question thread if questionnaire already exists
        else {
            current_question = userData.questionnaires[questionnaireIds.QNEU_ID].current_question
        }

        // Store updated user data in db
        // TODO: Instead of manually setting the user, use the pre-defined constants (currently not working)
        await controller.storage.write({ "test_user": userData });

        // Start conversation with current question
        //convo.gotoThread(current_question);
        convo.gotoThread("Psy_G_01_t0");
    });


    // send greeting
    convo.say("Hallo {{ vars.user_name }}, dies ist der neue Testfragebogen.");

    // Go to first question normally
    //convo.addAction('thread_name')


    // Iterate through all elements
    questions.forEach((question, index) => {

        // Assign first question to default thread
        if (index == 0) {
            var threadName = "default"
        } else {
            var threadName = question['name']
        }

        // Check for needed fields
        if (question['item'] && question['name'] && question['answer_options']['answer_option'] && question['answer_options']['state'] && question['category']) {

            // Send category explanation if current question it part of new category
            if (question['category'] && question['category'] != currentCategory && categories[question['category']]) {

                convo.addMessage(categories[question['category']], threadName);
                currentCategory = question['category'];
            }


            if (question['answer_options']['answer_option'].length > 1) {
                // Sort list based on code, so answers are not in random order and the -99 code will be displayed in the end
                var answerOptionsSorted = question['answer_options']['answer_option'].sort(function (a, b) {

                    return Math.abs(a['code']) - Math.abs(b['code'])
                })

            } else {
                var answerOptionsSorted = question['answer_options']['answer_option']
            }



            // Set question 
            var questionString = question['item']

            // Initialize empty array for quick reply objects
            var replies = []

            // Initialize empty array for (answer) pattern objects
            var patterns = []

            // Assign value for next thread if there is another question following the current one. Otherwise assign empty next thread to end conversation
            // TODO: Instead of iterating to next element, give each individual question element a pointer to the next thread
            var nextThread = '';
            if (index < questions.length - 1) {
                if (questions[index + 1]['name']) {
                    nextThread = questions[index + 1]['name'];
                }
            } else {
                nextThread = '';
            }


            answerOptionsSorted.forEach(answerOption => {

                switch (answerOption['code']) {
                    // float: No quick reply button, handler checks for float
                    case "-94":

                        questionString += " Bitte gebe die Antwort als Zahlenwert in das Textfeld des Chats ein. Du kannst auch Kommazahlen verwenden"

                        var handler = async (response, convo, bot) => {
                            convo.setVar(question['name'], { code: answerOption['code'], value: response })
                            // TODO: only go to next thread if input type is right and inside given range (e.g. to avoid typos in weight or other inputs)
                            // TODO: Store value right here for better persistence

                            await convo.gotoThread(nextThread);
                        }

                        patterns.push({ default: true, handler: handler })

                        break;

                    // freetext: No quick reply button, handler might check for text
                    case "-95":

                        questionString += " Bitte gebe die Antwort als Freitext in das Textfeld des Chats ein."

                        break;
                    // int: No quick reply button, handler checks for int
                    case "-96":
                        questionString += " Bitte gebe die Antwort als Zahlenwert in das Textfeld des Chats ein. Bitte verwende nur ganze Zahlenwerte."

                        break;
                    // Create quick reply button and corresponding handler, that reacts only on the specific string (question text)
                    // This way we can display the text as the bots answer instead of the code/payload
                    default:

                        // In this case, the answer option is the pattern to look for 
                        // TODO: Enable matching of answers with brackets
                        var pattern = answerOption['text']

                        var type = 'string'

                        var handler = async (response, convo, bot) => {

                            // TODO: Outsource in seperate reusable method
                            //await storeAnswer(convo.vars.user, questionnaire_id, question_id, answerOption, value)

                            // READ AND WRITE DB
                            // Access user data from DB
                            let user_id = convo.vars.user;
                            const items = await controller.storage.read([user_id]);
                            const userData = items[user_id] || {};
                            var userDateModified = userData;
                            // Add response to results in user data
                            userDateModified.questionnaires[questionnaireIds.QNEU_ID].results[question['name']] = { code: answerOption['code'], value: response }
                            // Update current question in user data
                            userDateModified.questionnaires[questionnaireIds.QNEU_ID].current_question = question['name']
                            // Write updated user data to storage
                            await controller.storage.write({ "test_user": userDateModified });

                            //convo.setVar(question['name'], { code: answerOption['code'], value: response })

                            // Go to next thread
                            await convo.gotoThread(nextThread);
                        }

                        // Add pattern and correspoding handler to patterns array
                        patterns.push({ pattern: pattern, type: type, handler: handler })

                        // Add single quick reply object to array
                        replies.push({ title: answerOption['text'], payload: answerOption['text'] })

                        break;
                }


            })


            patterns.push({
                default: true,
                handler: async (response, convo, bot) => {
                    await bot.say('Bitte benutze zum Antworten eine der vorgebebenen Möglichkeiten');
                    // start over!
                    return await convo.repeat();
                }
            });


            convo.addQuestion({
                text: questionString,
                quick_replies: replies
            }, patterns, {}, threadName)

            //  console.log(questionString, replies, patterns, threadName)




        } else {
            console.log("Element does not contain all informations: " + question + index)
        }

    });




    // log all variables when dialog is completed
    convo.after(async (results, bot) => {
        // Check if all fields of questionnaire are field and mark questionnaire as done if so.
        // If not all fields are marked, redo questionnaire
        // handle results.name, results.age, results.color
        console.log("Testfragebogen finished")
        console.log(results);

        // TODO: If everything successfull: Remove questionnaire from queue

        // TODO: Go to dialog "after_questionnaire" -> e.g. "Kann ich sonst noch etwas für dich tun username?"
        //await bot.beginDialog('after_questionnaire');
    });

    // Add questionnaire to controller
    controller.addDialog(convo);
};