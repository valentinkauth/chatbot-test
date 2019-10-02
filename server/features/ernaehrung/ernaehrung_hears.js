/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
module.exports = function (controller) {

    // main menu: reply to nutrition request
    controller.hears(['ernaehrung', 'ernährung', 'essen', 'hunger'], 'message', async (bot, message) => {

        let response = await fetch(`https://api.github.com/users/valentinkauth`);
        let data = await response.json()

        console.log(data)

       // return data;

        await bot.reply(message, data.blog);
    });
}