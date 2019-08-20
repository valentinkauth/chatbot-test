/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { BotkitConversation } = require("botkit");


// TODO: Remind user of his goals and check is they where achieved
// TODO: Lead to positive feedback thread if goals are achieved
// TODO: Lead to motivational thread (and notify therapist) of goals where not achieved
module.exports = function(controller) {
  const MY_DIALOG_ID = "goals_overview";

  let convo = new BotkitConversation(MY_DIALOG_ID, controller);


  convo.before('default', async(convo, bot) => {
    // TODO: load user data
    
    // set user name
    convo.setVar('user_name', 'Valentin')

    // set goals
    convo.setVar('goal', '3-mal die Woche laufen gehen für mindestens 30 Minuten');
   
   });



  // send goal
  convo.say(
    "Die folgenden Ziele hast du bei deinem letzten Gespräch vereinbart: {{ vars.goal }}"
  );

  // TODO: ask question and follow up with positive or negative thread
  convo.say(
    "Warst du erfolgreich und konntest diese Ziele in den vergangenen Tagen erreichen?"
  );

  // TODO: negative thread --> Alles klar, kein Problem!. Magst du mir verraten woran es gelegen hat? ... Okay, das habe ich mir notiert (save as note to database)

  // TODO: positive thread --> Super, user_name, mach weiter so! usw.

  // log all variables when dialog is completed
  convo.after(async (results, bot) => {
    // Check if all fields of questionnaire are field and mark questionnaire as done if so.
    
    // TODO: Log if goals where achieved

    console.log(MY_DIALOG_ID + " ended")

  });

  // Add questionnaire to controller
  controller.addDialog(convo);
};
