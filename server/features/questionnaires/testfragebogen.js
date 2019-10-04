/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { BotkitConversation } = require("botkit");




module.exports = function (controller) {

    const MY_DIALOG_ID = "testfragebogen";

    var fragebogen = require('../../data/testfragebogen.json');
    var questions = fragebogen.questions.question;


    // Initiate variable that shows current Category
    var currentCategory = "";

    // Iterate through categories and create categories dictionary with categories and the corresponding explanation texts
    var categories = {};
    questions.forEach(element => {
        if (element['main_title'] && element['category']) {
            categories[element['category']] = element['main_title']

        }
    })


    // TODO: Use xml-query package to load xml for further processing 

    let convo = new BotkitConversation(MY_DIALOG_ID, controller);

    // set a variable here that can be used in the message template 
    convo.before('default', async (convo, bot) => {



        convo.setVar('fragebogen_id', 0);

        convo.setVar('user_name', 'Valentin');

    });


    // Create message in test thread
    convo.addMessage("Schade, dass du diese Frage nicht beantworten willst. Ich bin ein neuer thread und habe den default thread unterbrochen.", 'test')


    // send greeting
    convo.say("Hallo {{ vars.user_name }}, dies ist der Testfragebogen.");

    // send general explanation
    convo.say(
        "Ich werde dir nun ein paar Fragen stellen und du kannst die jeweiligen Antworten auswählen."
    );

    // Iterate through questions
    questions.forEach(element => {

        // Check for needed parameters
        if (element['item'] && element['name'] && element['answer_options']) {

            // Send category explanation if current question it part of new category
            if (element['category'] && element['category'] != currentCategory && categories[element['category']]) {

                convo.say(categories[element['category']]);

                currentCategory = element['category'];
            }

            // Check for single choice questionss
            if (element['answer_options']['state'] == "single-choice") {

                // Sort list based on code, so answers are not in random order and the -99 code will be displayed in the end
                var answerOptionsSorted = element['answer_options']['answer_option'].sort(function (a, b) {
                    return Math.abs(a['code']) - Math.abs(b['code'])
                })

                // Initialize empty array for quick reply objects
                var replies = []

                // Create answer array in Botkit's quick reply format
                answerOptionsSorted.forEach(element => {
                    var text = element['text'];
                    var code = element['code'];

                    // Add single quick reply object to array
                    replies.push({ title: text, payload: code })

                    

                }
                )

                // Create Botkit question containing quick reply array
                convo.ask({
                    text: element['item'],
                    quick_replies: replies
                }, [{
                    pattern: '-99',
                    type: 'string',
                    handler: async (response, convo, bot) => {
                        return await convo.gotoThread('test');
                    }
                }], element['_name'])

            }
            else if (element['answer_options']['_tate'] == "freetext") {
                convo.ask((element['item'] + ' Bitte gebe deine Antwort als Freitext in das Texteingabefeld ein'), [], element['_name']);

            }
            else if (element['answer_options']['state'] == "int") {
                convo.ask((element['item'] + ' Bitte gebe deine Antwort als Zahlenwert in das Texteingabefeld ein'), [], element['_name']);

            }
            else if (element['answer_options']['state'] == "float") {
                convo.ask((element['item'] + ' Bitte gebe deine Antwort als Zahlenwert (Kommastellen sind möglich) in das Texteingabefeld ein'), [], element['_name']);

            }
            else {
                convo.say('Ich weiß leider noch nicht wie ich mit dieser Frage umgehen soll...')
            }
        }
    });




    // log all variables when dialog is completed
    convo.after(async (results, bot) => {
        // Check if all fields of questionnaire are field and mark questionnaire as done if so.
        // If not all fields are marked, redo questionnaire
        // handle results.name, results.age, results.color

        console.log(results);

    });


    // Add a new dialog to the controller that can be used as a child question for optional questions
    var addOptionalQuestion = (question, number, name, code) => {
        let childDialog = new BotkitConversation(name, controller);
        childDialog.ask(question, async (res, convo, bot) => { }, { key: 'name' });
        controller.addDialog(childDialog);

    }


    // Add questionnaire to controller
    controller.addDialog(convo);
};


var getMessageObject = function() {
    
}