/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { BotkitConversation } = require("botkit");


module.exports = function (controller) {
    const MY_DIALOG_ID = "main_menu";

    let convo = new BotkitConversation(MY_DIALOG_ID, controller);

    // set a variable here that can be used in the message template 
    convo.before('default', async (convo, bot) => {

    });

    // TODO: Change main menu from ask to say conversation to not have a conversation open
    // TODO: offer pre-defined selections (and later enable free-text with intent analysis)
    convo.ask({
        text: 'Was kann ich für dich tun? Klicke eine der Auswahlmöglichkeiten an und ich versuche dir weiter zu helfen :)',
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
                title: "Zeige mir meine Ziele",
                payload: "Zeige mir meine Ziele"
            }
        ]
    }, [
            {
                pattern: 'Übungen',
                handler: async function (answer, convo, bot) {
                    //await convo.gotoThread('exercises');
                }
            },
            {
                pattern: 'Ernährungstipps',
                handler: async function (answer, convo, bot) {
                    //await convo.gotoThread('nutrition');
                }
            },
            {
                pattern: 'Zeige mir meine Ziele',
                handler: async function (answer, convo, bot) {
                    await bot.beginDialog('goals');
                }
            }
        ], {})

    // Add questionnaire to controller
    controller.addDialog(convo);
};