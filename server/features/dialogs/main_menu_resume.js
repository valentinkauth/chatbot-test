/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { BotkitConversation } = require("botkit");
var emoji = require("node-emoji");

module.exports = function(controller) {

  const MY_DIALOG_ID = "main_menu_resume";

  let convo = new BotkitConversation(MY_DIALOG_ID, controller);

  // set a variable here that can be used in the message template
  convo.before("default", async (convo, bot) => {
    // Access user data from DB
    const items = await controller.storage.read([convo.vars.user]);
    const userData = items[convo.vars.user] || {};

    // Set user name
    convo.setVar("name", userData.user_info.nick_name);
  });



  convo.ask(
    {
      text: "Kann ich dir sonst noch weiterhelfen {{ vars.name }}?",
      quick_replies: [
        {
          title: "Ja",
          payload: "Ja"
        },
        {
          title: "Nein ",
          payload: "Nein"
        }
      ]
    },
    [
      {
        pattern: "Ja",
        type: "string",
        handler: async (response, convo, bot) => {
          return await convo.gotoThread("yes_thread");
        }
      },
      {
        pattern: "Nein",
        type: "string",
        handler: async (response, convo, bot) => {
          return await convo.gotoThread("no_thread");
        }
      },
      {
        default: true,
        handler: async (response, convo, bot) => {
          await bot.say("Tut mir leid {{ vars.name }}, das habe ich nicht verstanden.");
          // start over!
          return await convo.repeat();
        }
      }
    ],
    {}
  );


  convo.addMessage({
    text: 'Alles klar, leg los! Klicke eine der Auswahlmöglichkeiten an oder schreibe mir direkt und ich versuche dir weiterzuhelfen!',
    quick_replies: [
        {
            title: "Übungen " + emoji.get('muscle'),
            payload: "Übungen",
        },
        {
            title: "Ernährungstipps " + emoji.get('avocado'),
            payload: "Ernährungstipps"
        },
        {
            title: "Meine Ziele " + emoji.get('white_check_mark'),
            payload: "Zeige mir meine Ziele"
        },
        {
            title: "Regionale Angebote " + emoji.get('earth_asia'),
            payload: "Regionale Angebote"
        }
    ]
}, "yes_thread");



  convo.addMessage("Alles klar, ich bin jederzeit für dich da, falls du noch Fragen hast.", "no_thread");


  // Add questionnaire to controller
  controller.addDialog(convo);
};
