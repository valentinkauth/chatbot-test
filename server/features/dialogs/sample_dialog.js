/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { BotkitConversation } = require("botkit");


module.exports = function (controller) {
  const MY_DIALOG_ID = "sample_dialog";

  let convo = new BotkitConversation(MY_DIALOG_ID, controller);

  // set a variable here that can be used in the message template 
  convo.before('default', async (convo, bot) => {

    convo.setVar('user_name', 'Valentin');

  });


  // send greeting
  // TODO: create variatons in greeting
  convo.say("Hallo {{ vars.user_name }}, willkommen zurück!");

  convo.say('Whats up?')

  convo.addAction('q1')


  convo.addQuestion({
    text: "Das ist die optionale Frage",

    quick_replies: [{
      title: 'Antwort 1 ', payload: '1'
    },
    {
      title: 'Antwort 2', payload: '2'
    },]
  }, [
      {
        default: true,
        handler: async (response, convo, bot) => {
          await convo.gotoThread('q2');
        }
      }
    ], 'frage_optional', 'frage_optional');


  // do a simple conditional branch looking for user to say "no"
  convo.addQuestion({
    text: "Das ist Frage 1",

    quick_replies: [{
      title: 'Antwort 1 zu Frage 1', payload: '1'
    },
    {
      title: 'Antwort 2 zu Frage 1', payload: '2'
    },
    {
      title: 'Gehe zur optionalen Frage', payload: '3'
    }]
  }, [
      {
        pattern: '3',
        handler: async (response, convo, bot) => {
          // if user says no, go back to favorite color.
          await convo.gotoThread('frage_optional');
        }
      },
      {
        default: true,
        handler: async (response, convo, bot) => {
          await convo.gotoThread('q2');
        }
      }
    ], 'frage1', 'q1');


    convo.addQuestion({
      text: "Das ist Frage 2",
  
      quick_replies: [{
        title: 'Antwort 1 zu Frage 2', payload: '1'
      },
      {
        title: 'Antwort 2 zu Frage 2', payload: '2'
      },
      {
        title: 'Antowrt 3 zu Frage 2', payload: '3'
      }]
    }, [
        {
          default: true,
          handler: async (response, convo, bot) => {
            // End conversation
          }
        }
      ], 'frage2', 'q2');





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
