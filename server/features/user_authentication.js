/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
module.exports = function(controller) {


  // Check for existing user in database after web socket connection was established successfully
  controller.on("welcome_back", async (bot, message) => {
    // Check for user in Database

    let userData = await controller.storage.read([message.user])

    if (Object.keys(userData).length) {
      if (userData[message.user].user_info.nick_name) {
        await bot.beginDialog("welcome_back_dialog");
      } else {
          console.log("No name of user defined. No conversation started.")
      }
    } else {
        console.log("User not found in data base. No conversation started.")
      // await bot.beginDialog("new_user_dialog");
    }
  });

  // React on identification event, not implemented on client site, probably not neccessary
  controller.on("identify", async (bot, message) => {
    await bot.reply(message, `Seems like I should identify you...`);
  });
};
