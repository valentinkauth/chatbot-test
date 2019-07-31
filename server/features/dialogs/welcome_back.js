/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { BotkitConversation } = require("botkit");


module.exports = function (controller) {
  const MY_DIALOG_ID = "welcome_back_dialog";

  let convo = new BotkitConversation(MY_DIALOG_ID, controller);

  // set a variable here that can be used in the message template 
  convo.before('default', async (convo, bot) => {

    convo.setVar('user_name', 'Valentin');

  });


  // send greeting
  // TODO: create variatons in greeting
  convo.say("Hallo {{ vars.user_name }}, willkommen zurück!");

  // TODO: offer pre-defined selections (and later enable free-text with intent analysis)
  // convo.ask()


  // log all variables when dialog is completed
  convo.after(async (results, bot) => {
    // Check if all fields of questionnaire are field and mark questionnaire as done if so.
    // If not all fields are marked, redo questionnaire
    // handle results.name, results.age, results.color

    console.log(MY_DIALOG_ID + " ended");
    console.log("results:")
    console.log(results);

  });

  // Add questionnaire to controller
  controller.addDialog(convo);
};