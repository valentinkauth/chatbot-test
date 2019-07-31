/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
module.exports = function(controller) {
  if (controller.adapter.name === "Web Adapter") {
    console.log("Loading sample web features...");

    controller.hears(new RegExp("quick"), "message", async (bot, message) => {
      await bot.reply(message, {
        text: "Here are some quick replies",
        quick_replies: [
          {
            title: "Foo",
            payload: "foo"
          },
          {
            title: "Bar",
            payload: "bar"
          }
        ]
      });
    });
  }

  // Greet user when websocket connection established successfully
  controller.on("welcome_back", async (bot, message) => {
    // TODO: search for user in database
    var userKnown = true;

    if (userKnown) {
      //TODO: If user known --> start welcome back dialog
      await bot.beginDialog('welcome_back_dialog');
    } else {
      // TODO: If user unknown --> start onboarding dialog
      await bot.reply(message, `Hallo, freut mich dich kennen zu lernen!`);
    }
  });

  // React on identification event
  controller.on("identify", async (bot, message) => {
    await bot.reply(message, `Seems like I should identify you...`);
  });
};
