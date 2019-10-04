/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
module.exports = function (controller) {

     // main menu: reply to goals request
     controller.hears('ziele','message', async(bot, message) => {
        await bot.reply(message, 'Ich zeige dir jetzt deine Ziele');
    });
    
}