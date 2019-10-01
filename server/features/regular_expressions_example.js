/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
module.exports = function(controller) {

  // var testString = /\(1\)23/;

  var testString = "(1)23"

  escapeStringRegExp.matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
  function escapeStringRegExp(str) {
      return str.replace(escapeStringRegExp.matchOperatorsRe, '\\$&');
  }
  

    controller.hears(new RegExp(escapeStringRegExp('(1)23')), "message", async (bot, message) => {
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
};
