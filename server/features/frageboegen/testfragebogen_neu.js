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

        

        // TODO: Check in database which answers are already answered and continue with last answered question.
        convo.setVar('starting_thread', 'welcome_back_questionnaire_thread')
        convo.setVar('current_question_thread', 'Psy_G_01_t0')
        
        // TODO: If questionnaire is started for the first time (no data in database available) start with default thread
        convo.setVar('starting_thread', 'introduction_questionnaire_thread')
        convo.setVar('current_question_thread', 'default/initial')

    });


    // send greeting
    convo.say("Hallo {{ vars.user_name }}, dies ist der neue Testfragebogen.");

    convo.addAction('Psy_G_01_t0');


    // Iterate through all elements
    questions.forEach((question, index) => {

        var threadName = question['name']

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

                        var pattern = answerOption['text']

                        var type = 'string'
                        
                        var handler = async (response, convo, bot) => {
                            convo.setVar(question['name'], { code: answerOption['code'], value: response })
                            console.log(answerOption['code'])
                            await convo.gotoThread(nextThread);
                        }

                        // Add pattern and correspoding handler to patterns array
                        patterns.push({ pattern: pattern, type: type, handler: handler })

                        // Add single quick reply object to array
                        replies.push({ title: answerOption['text'], payload: answerOption['text'] })

                        break;
                }


            })


            // Typing stuff
            // convo.addAction('typing', threadName)
            // convo.addMessage({type: 'typing'}, 'typing');
            // convo.addAction('next_thread','typing');

            // convo.before(threadName,  async() => {
            //     return new Promise((resolve, reject) => {
            //         // simulate some long running process
            //         setTimeout(resolve, 3000);
            //     });
            // });

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

        console.log(results);

    });

    // Add questionnaire to controller
    controller.addDialog(convo);
};