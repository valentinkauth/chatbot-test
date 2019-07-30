/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { BotkitConversation } = require("botkit");


// TODO: Remind user of his goals and check is they where achieved
// TODO: Lead to positive feedback thread if goals are achieved
// TODO: Lead to motivational thread (and notify therapist) of goals where not achieved
module.exports = function(controller) {
  const MY_DIALOG_ID = "goals";

  let convo = new BotkitConversation(MY_DIALOG_ID, controller);


  convo.before('default', async(convo, bot) => {
    // TODO: load user data
    
    // set user name
    convo.setrVar('user_name', 'Valentin')

    // set goals
    convo.setVar('goal', '3-mal die Woche laufen gehen für mindestens 30 Minuten');
   
   });

  

  // send greeting
  convo.say("Hallo {{ vars.user_name }}, schön dich wieder zu sehen :)");

  // send goal
  convo.say(
    "Bei dem letzten Gespräch mit deinem Therapeuten habt ihr folgendes Ziel vereinbart: {{ vars.goal }}"
  );

  // TODO: ask question and follow up with positive or negative thread
  convo.say(
    "Konntest du das Ziel in der vergangenen Woche erreichen?"
  );

  // TODO: negative thread --> Alles klar, kein Problem!. Magst du mir verraten woran es gelegen hat? ... Okay, das habe ich mir notiert (save as note to database)

  // TODO: positive thread --> Super, user_name, mach weiter so! usw.

  // log all variables when dialog is completed
  convo.after(async (results, bot) => {
    // Check if all fields of questionnaire are field and mark questionnaire as done if so.
    
    // TODO: Log if goals where achieved

    console.log(results);

  });

  // Add questionnaire to controller
  controller.addDialog(convo);
};
