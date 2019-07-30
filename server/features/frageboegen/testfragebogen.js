/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { BotkitConversation } = require("botkit");




module.exports = function (controller) {

    var fragebogen = require('../../data/testfragebogen.json');
    var questions = fragebogen.questions.question;

    const MY_DIALOG_ID = "testfragebogen";

    // TODO: Use xml-query package to load xml for further processing 

    let convo = new BotkitConversation(MY_DIALOG_ID, controller);

    // set a variable here that can be used in the message template 
    convo.before('default', async (convo, bot) => {

        convo.setVar('fragebogen_id', 0);

        convo.setVar('user_name', 'Valentin');

    });

    


    // send greeting
    convo.say("Hallo {{ vars.user_name }}, dies ist der Testfragebogen.");

    // send general explanation
    convo.say(
        "Ich werde dir nun ein paar Fragen stellen und du kannst die jeweiligen Antworten auswählen."
    );

    // Iterate through questions
    questions.forEach(element => {

        // Check for needed parameters
        if (element['item'] && element['_name'] && element['answer_options']) {

            // Check for single choice questionss
            if (element['answer_options']['_state'] == "single-choice") {

                // Initialize empty array for quick reply objects
                var replies = []

                // Create answer array in Botkit's quick reply format
                element['answer_options']['answer_option'].forEach(element => {
                    var text = element['__text'];
                    var code = element['_code'];

                    // Add single quick reply object to array
                    replies.push({ title: text, payload: code })

                }
                )

                // Create Botkit question containing quick reply array
                convo.ask({
                    text: element['item'],
                    quick_replies: replies
                }, [], element['_name'])

            }
            else {
                convo.ask(element['item'], [], element['_name']);
            }
        }

        //  convo.say(element['_category']);
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
