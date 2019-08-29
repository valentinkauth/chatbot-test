/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
module.exports = function(controller) {

    // use a function to match a condition in the message
    controller.hears(async(message) => message.text && message.text.toLowerCase() === 'foo', ['message'], async (bot, message) => {
        await bot.reply(message, 'I heard "foo" via a function test');
    });

    // use a regular expression to match the text of the message
    controller.hears(new RegExp(/^\d+$/), ['message','direct_message'], async function(bot, message) {
        await bot.reply(message,{ text: 'I heard a number using a regular expression.' });
    });

    // match any one of set of mixed patterns like a string, a regular expression
    controller.hears(['allcaps', new RegExp(/^[A-Z\s]+$/)], ['message','direct_message'], async function(bot, message) {
        await bot.reply(message,{ text: 'I HEARD ALL CAPS!' });
    });

    // reply with user id
    controller.hears('whoami','message', async(bot, message) => {
        await bot.reply(message, `You are ${ message.user }`);
    });

    // reply with user id
    controller.hears(async(message) => message.text && message.text.toLowerCase() === 'f', ['message'], async(bot, message) => {
        await bot.beginDialog('fragebogen_01');
    });

    // reply with user id
    controller.hears(async(message) => message.text && message.text.toLowerCase() === 't', ['message'], async(bot, message) => {
        await bot.beginDialog('testfragebogen');
    });

    // reply with user id
    controller.hears(async(message) => message.text && message.text.toLowerCase() === 't2', ['message'], async(bot, message) => {
        await bot.beginDialog('testfragebogen_neu');
    });

    // reply with user id
    controller.hears(async(message) => message.text && message.text.toLowerCase() === 's', ['message'], async(bot, message) => {
        await bot.beginDialog('sample_dialog');
    });

     // reply with user id
     controller.hears('typing','message', async(bot, message) => {
        await bot.say({ type: 'typing' });
    });


    // main menu: reply to goals request
    controller.hears('ziele','message', async(bot, message) => {
        await bot.reply(message, 'Ich zeige dir jetzt deine Ziele');
    });

    // main menu: reply to exercises request
    controller.hears(['übungen', 'uebungen'],'message', async(bot, message) => {
        await bot.reply(message, 'Ich zeige dir jetzt ein paar Übungen');
    });

    // main menu: reply to exercises request
    controller.hears(['ernaehrung', 'ernährung'],'message', async(bot, message) => {
        await bot.reply(message, 'Ich gebe dir jetzt ein paar Ernährungstipps');
    });


}