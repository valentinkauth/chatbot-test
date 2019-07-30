/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { BotkitConversation } = require("botkit");


module.exports = function (controller) {
  const MY_DIALOG_ID = "fragebogen_01";

  let convo = new BotkitConversation(MY_DIALOG_ID, controller);

  // set a variable here that can be used in the message template 
  convo.before('default', async (convo, bot) => {

    convo.setVar('fragebogen_id', 1);

    convo.setVar('user_name', 'Valentin');

    convo.setVar('answers_q1', [{ text: 'Antwort 1 zu Frage 1', value: '1' }, { text: 'Antwort 2 zu Frage 1', value: '2' }, { text: 'Antwort 3 zu Frage 1', value: '3' }])

  });


  // send greeting
  convo.say("Hallo {{ vars.user_name }}, dies ist der erste Fragebogen.");

  // send general explanation
  convo.say(
    "Ich werde dir nun ein paar Fragen stellen und du kannst die jeweiligen Antworten auswählen."
  );

  // send general explanation (help  not working yet)
  convo.say(
    "Wenn du einmal nicht weiter weißt, schreibe einfach das Wort 'Hilfe' in die Textzeile"
  );

  // TODO: ask question 1 and store reply in variable answer_f1_a1
  convo.ask({
    text: "Das ist Frage 1",

    quick_replies: [{
      title: 'Antwort 1 zu Frage 1', payload: '1'
    },
    {
      title: 'Antwort 2 zu Frage 1', payload: '2'
    },
    {
      title: 'Antwort 3 zu Frage 1', payload: '3'
    }]
  }, [], 'answer_f1_a1')


  // TODO: ask question 2 and store reply in variable answer_f1_a2
  convo.ask({
    text: "Das ist Frage 2",

    quick_replies: [{
      title: 'Antwort 1 zu Frage 2', payload: '1'
    },
    {
      title: 'Antwort 2 zu Frage 2', payload: '2'
    },
    {
      title: 'Antwort 3 zu Frage 2', payload: '3'
    }]
  }, [], 'answer_f1_a2')


  convo.ask({
    text: "Wie oft haben Sie in den letzten 4 Wochen zuckerhaltige Erfrischungsgetränke getrunken (z.B. Cola, Limonade, Eistee, Malzbier, Energiegetränke, aromatisiertes Wasser)?",

    quick_replies: [{
      title: 'nie', payload: '0'
    },
    {
      title: '1 Mal im Monat', payload: '1'
    },
    {
      title: '2-3 Mal im Monat', payload: '2'
    },
    {
      title: '1-2 Mal pro Woche', payload: '3'
    },
    {
      title: '3-4 Mal pro Woche', payload: '4'
    },
    {
      title: '5-6 Mal pro Woche', payload: '5'
    },
    {
      title: '1 Mal am Tag', payload: '6'
    },
    {
      title: '2 Mal am Tag', payload: '7'
    },
    {
      title: '3 Mal am Tag', payload: '8'
    },
    {
      title: '4-5 Mal am Tag', payload: '9'
    },
    {
      title: 'Diese Frage möchte ich nicht beantworten', payload: '-99'
    },]
  }, [], 'answer_f1_a3')



  // TODO: ask question 1 and store reply in variable answer_01

  // convo.ask("What would you like the quick reply to say?", [], "reply_title");

  // convo.say({
  //   text: "Here is your dynamic button:",
  //   quick_replies: async (template, vars) => {
  //     return [{ title: vars.reply_title, payload: vars.reply_title }];
  //   }
  // });



  // log all variables when dialog is completed
  convo.after(async (results, bot) => {
    // Check if all fields of questionnaire are field and mark questionnaire as done if so.
    // If not all fields are marked, redo questionnaire
    // handle results.name, results.age, results.color

    console.log(results);

  });

  // Add questionnaire to controller
  controller.addDialog(convo);
};
