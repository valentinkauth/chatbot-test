/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
module.exports = function(controller) {
  
  
  // Start most relevant questionnaire, if there's one in the queue
  // reply with user id
  controller.hears("fragebogen", "questionnaire", async (bot, message) => {
    // TOOD: Get user data and queue data
    // TODO: If there's an open questionnaire in the queue, start it now

    await bot.reply(
      "Ich muss noch lernen, jetzt nach dem aktuellsten Fragebogen zu suchen und diesen dann fortzusetzen"
    );
  });

  // Start fragebogen_01
  controller.hears(
    async message => message.text && message.text.toLowerCase() === "f",
    ["message"],
    async (bot, message) => {
      await bot.beginDialog("fragebogen_01");
    }
  );

  // Start testfragebogen
  controller.hears(
    async message => message.text && message.text.toLowerCase() === "t",
    ["message"],
    async (bot, message) => {
      await bot.beginDialog("testfragebogen");
    }
  );

  // Start testfragebogen_neu (most developed version so far)
  controller.hears(
    async message => message.text && message.text.toLowerCase() === "t2",
    ["message"],
    async (bot, message) => {
      await bot.beginDialog("testfragebogen_neu");
    }
  );
};
