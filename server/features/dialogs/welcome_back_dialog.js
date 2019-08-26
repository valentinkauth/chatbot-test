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

    // TODO: Check for existing and unfinished conversations
    // TODO: Check for any conversations waiting in the queue (e.g. enabled by triggers while user was not connected)

    // Get user of conversation
    let user = convo.vars.user; 

    userData = await controller.storage.read([user])

    console.log(userData)

    if (Object.keys(userData).length) {

      convo.setVar('user_name', userData[user].user_info.user_name);
    } else {
      convo.setVar('user_name', 'XXX')
    }    

  });



  // send greeting
  // TODO: create variatons in greeting
  convo.say("Hallo {{ vars.user_name }}, willkommen zurück!");




  // log all variables when dialog is completed
  convo.after(async (results, bot) => {

    // TODO: Check if there are questionnaires in the queue that need to be triggered
    // If yes, trigger them here
    // If no, start main menu conversation
    await bot.beginDialog('main_menu');


  });

  // Add questionnaire to controller
  controller.addDialog(convo);
};