/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { BotkitConversation } = require("botkit");
const express = require("express");
const path = require("path");

module.exports = function(controller) {
  const MY_DIALOG_ID = "fragebogen_01";

  let convo = new BotkitConversation(MY_DIALOG_ID, controller);

  // send a greeting
  convo.say("Hallo User, dies ist der erste Fragebogen.");

  // send a greeting
  convo.say(
    "Ich werde dir nun ein paar Fragen stellen und du kannst die jeweiligen Antowrten direkt anklicken."
  );

  convo.ask("What would you like the quick reply to say?", [], "reply_title");

  // convo.setTimeout(6000 * 60);
  // convo.onTimeout(function(convo) {
  //   convo.ask("Hey, are you still there");
  //   convo.next();
  // });

  convo.say({
    text: "Here is your dynamic button:",
    quick_replies: async (template, vars) => {
      return [{ title: vars.reply_title, payload: vars.reply_title }];
    }
  });
  // ask a question, store the the response in 'name'
  // convo.ask(
  //   "What is your name?",
  //   async (response, convo, bot) => {
  //     console.log(`user name is ${response}`);
  //     // do something?
  //   },
  //   "name"
  // );

  convo.after(async (results, bot) => {
    // Check if all fields of questionnaire are field and mark questionnaire as done if so.
    // If not all fields are marked, redo questionnaire
    // handle results.name, results.age, results.color
  });

  // Add questionnaire to controller
  controller.addDialog(convo);
};
