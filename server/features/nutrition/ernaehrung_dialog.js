/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { BotkitConversation } = require("botkit");


module.exports = function (controller) {

    const MY_DIALOG_ID = "ernaehrung";

    let convo = new BotkitConversation(MY_DIALOG_ID, controller);

    // set a variable here that can be used in the message template 
    convo.before('default', async (convo, bot) => {

        // TODO: Check user goals and choose nutrition tipps based on goals.

        // Access user data from DB
        const items = await controller.storage.read([convo.vars.user]);
        const userData = items[convo.vars.user] || {}
        // Set user name
        convo.setVar('name', userData.user_info.nick_name)
        
        
    });

    convo.say("Hey {{ vars.name }}, gerne berate ich dich um Themen rund um deine Ernährung.")

    convo.say("Das hier sind Ernährungstipps")


    // Add questionnaire to controller
    controller.addDialog(convo);
};