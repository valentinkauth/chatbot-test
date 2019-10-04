/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
module.exports = function(controller) {
  
    // main menu: reply to exercises request
  controller.hears(["übungen", "uebungen"], "message", async (bot, message) => {
    await bot.reply(message, "Ich zeige dir jetzt ein paar Übungen");
  });
  
};
