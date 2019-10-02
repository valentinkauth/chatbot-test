/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { BotkitConversation } = require("botkit");


module.exports = function (controller) {

    // Set variating greeting strings
    let greeting = ['Was kann ich heute für dich tun?', 'Was kann ich für dich tun?', 'Wie kann ich dir behilflich sein?'] 
    let greeting2 = ['Klicke eine der Auswahlmöglichkeiten an oder schreibe mir direkt und ich versuche dir weiterzuhelfen! :)']

    const MY_DIALOG_ID = "main_menu";

    let convo = new BotkitConversation(MY_DIALOG_ID, controller);

    // set a variable here that can be used in the message template 
    convo.before('default', async (convo, bot) => {

        // let userName = await getUserName();
        var message = greeting[Math.floor(Math.random() * greeting.length)] + ' ' + greeting2[Math.floor(Math.random() * greeting2.length)]
        convo.setVar('main_menu', message)
    });

    // TODO: Change main menu from ask to say conversation to not have a conversation open
    // TODO: offer pre-defined selections (and later enable free-text with intent analysis)


    

    convo.say({
        text: '{{ vars.main_menu }}',
        quick_replies: [
            {
                title: "Übungen",
                payload: "Übungen",
            },
            {
                title: "Ernährungstipps",
                payload: "Ernährungstipps"
            },
            {
                title: "Meine Ziele",
                payload: "Zeige mir meine Ziele"
            },
            {
                title: "Regionale Angebote",
                payload: "Regionale Angebote"
            }
        ]
    })

    // Add questionnaire to controller
    controller.addDialog(convo);
};