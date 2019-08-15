/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { BotkitConversation } = require("botkit");


module.exports = function (controller) {

    // Load json questionnaire
    var fragebogen = require('../../data/testfragebogen.json');
    var questions = fragebogen.questions.question;


    const MY_DIALOG_ID = "testfragebogen_neu";
    let convo = new BotkitConversation(MY_DIALOG_ID, controller);


    // Initiate variable that shows current Category
    var currentCategory = "";

    // Iterate through categories and create categories dictionary with categories and the corresponding explanation texts
    var categories = {};
    questions.forEach(element => {
        if (element['main_title'] && element['category']) {
            categories[element['category']] = element['main_title']

        }
    })



    // set a variable here that can be used in the message template 
    convo.before('default', async (convo, bot) => {

        convo.setVar('fragebogen_id', 2);

        convo.setVar('user_name', 'Valentin');

        convo.setVar('current_thread', 'Psy_G_01_t0')

    });


    // send greeting
    convo.say("Hallo {{ vars.user_name }}, dies ist der neue Testfragebogen.");

    convo.addAction('Psy_G_01_t0');


    // Iterate through all elements
    questions.forEach((element, index) => {

        var threadName = element['name']

        // Check for needed fields
        if (element['item'] && element['name'] && element['answer_options']['answer_option'] && element['answer_options']['state'] && element['category']) {

            // Send category explanation if current question it part of new category
            if (element['category'] && element['category'] != currentCategory && categories[element['category']]) {

                convo.addMessage(categories[element['category']], threadName);
                currentCategory = element['category'];
            }


            if (element['answer_options']['answer_option'].length > 1) {
                // Sort list based on code, so answers are not in random order and the -99 code will be displayed in the end
                var answerOptionsSorted = element['answer_options']['answer_option'].sort(function (a, b) {

                    return Math.abs(a['code']) - Math.abs(b['code'])
                })

            } else {
                var answerOptionsSorted = element['answer_options']['answer_option']
            }



            var questionString = element['item']

            // Initialize empty array for quick reply objects
            var replies = []

            // Initialize empty array for (answer) pattern objects
            var patterns = []



            // Assign value for next thread if there is another question following the current one. Otherwise assign empty next thread to end conversation
            var nextThread = '';
            if (index < questions.length - 1) {
                if (questions[index + 1]['name']) {
                    nextThread = questions[index + 1]['name'];
                }
            } else {
                nextThread = '';
            }


            answerOptionsSorted.forEach(element => {

                switch (element['code']) {
                    // float: No quick reply button, handler checks for float
                    case "-94":

                        questionString += " Bitte gebe die Antwort als Zahlenwert in das Textfeld des Chats ein. Du kannst auch Kommazahlen verwenden"

                        var handler = async (response, convo, bot) => {
                            convo.setVar(element['name'], { code: element['code'], value: response })
                            // TODO: only go to next thread if input type is right and inside given range (e.g. to avoid typos in weight or other inputs)
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

                        var pattern = element['text']
                        var handler = async (response, convo, bot) => {
                            convo.setVar(element['name'], { code: element['code'], value: response })
                            await convo.gotoThread(nextThread);
                        }

                        // Add pattern and correspoding handler to patterns array
                        patterns.push({ pattern: pattern, handler: handler })

                        // Add single quick reply object to array
                        replies.push({ title: element['text'], payload: element['text'] })

                        break;
                }


            })



            convo.addQuestion({
                text: questionString,
                quick_replies: replies
            }, patterns, {}, threadName)


            console.log(questionString, replies, patterns, threadName)




        } else {
            console.log("Element does not contain all informations: " + element + index)
        }

    });




    // log all variables when dialog is completed
    convo.after(async (results, bot) => {
        // Check if all fields of questionnaire are field and mark questionnaire as done if so.
        // If not all fields are marked, redo questionnaire
        // handle results.name, results.age, results.color

        //console.log(results);

    });

    console.log(convo)

    // Add questionnaire to controller
    controller.addDialog(convo);
};