/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { BotkitConversation } = require("botkit");


module.exports = function (controller) {
  const MY_DIALOG_ID = "missing_data_warning";


  let convo = new BotkitConversation(MY_DIALOG_ID, controller);

  // send greeting
  convo.say("Leider kann ich keine Daten zu deinem Nutzernamen finden, daher kann dieser Dialog nicht gestartet werden.");

  // Add questionnaire to controller
  controller.addDialog(convo);
};