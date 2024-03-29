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


    // TODO: Get user name
    // TODO: Get latest queue item

    let user_id = convo.vars.user;
    let userName = "";

    // Access user data from DB
    const items = await controller.storage.read([user_id]);
    const userData = items[user_id] || {};

    // Check if user data available and set nick name
    if (userData.user_info && userData.user_info.nick_name) {
      userName = userData.user_info.nick_name
    }

    // Define string to greet including the user name
    let greeting = [`Hallo ${userName} Willkommen zurück!`, `Schön dich wieder zu sehen, ${userName}!`, `Hey ${userName}, ich hoffe du hast einen tollen Tag!`, `Hey ${userName}`]

    // Select a greeting string randomly
    convo.setVar('greeting', greeting[Math.floor(Math.random() * greeting.length)])


    if (userData.queue) {
      if (userData.queue.length > 0) {
        console.log(userData.queue[0])
        await bot.beginDialog(userData.queue[0]);
      } else {
        await convo.gotoThread('default')
      }
    } else {
      await convo.gotoThread('default')
    }

    // Set starting thread in before 
    await convo.gotoThread('default')
  });


  // send greeting
  convo.say("{{ vars.greeting }}");


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