//  __   __  ___        ___
// |__) /  \  |  |__/ |  |  
// |__) \__/  |  |  \ |  |  

// This is the main file for the GeMuKiBot bot.

// Import Botkit's core features
const { Botkit, BotkitConversation } = require('botkit');
const { BotkitCMSHelper } = require('botkit-plugin-cms');

// Import a platform-specific adapter for web.

const { WebAdapter } = require('botbuilder-adapter-web');

const { MongoDbStorage } = require('botbuilder-storage-mongodb');

// Load process.env values from .env file
require('dotenv').config();

const https = require('https');
const fs = require('fs');


// Terminal command to start mongoDB: sudo service mongod start
let storage = null;
if (process.env.MONGO_URI) {
    storage = mongoStorage = new MongoDbStorage({
        url : process.env.MONGO_URI,
        database: "GeMuKi",
        collection: "gemuki",
    });
}


// Tests for creating custom https server

// var testServer = https.createServer({
//     key: fs.readFileSync('./localhost.key'),
//     cert: fs.readFileSync('./localhost.crt'),
//     requestCert: true,
//       rejectUnauthorized: false 
//   }
//   ).listen(443, 'localhost');

//const adapter = new WebAdapter({server: testServer});

// Create Web Adapter
const adapter = new WebAdapter({});
// TODO: Add web adapter middleware here


const controller = new Botkit({
    debug: true,
    webhook_uri: '/api/messages',

    adapter: adapter,

    storage: storage,
});



if (process.env.cms_uri) {
    controller.usePlugin(new BotkitCMSHelper({
        cms_uri: process.env.cms_uri,
        token: process.env.cms_token,
    }));
}

// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {

    // load traditional developer-created local custom feature modules
    controller.loadModules(__dirname + '/features');
    controller.loadModules(__dirname + '/features/dialogs');
    controller.loadModules(__dirname + '/features/questionnaires');
    controller.loadModules(__dirname + '/features/goals');
    controller.loadModules(__dirname + '/features/nutrition');
    controller.loadModules(__dirname + '/features/exercises');
    

    /* catch-all that uses the CMS to trigger dialogs */
    if (controller.plugins.cms) {
        controller.on('message,direct_message', async (bot, message) => {
            let results = false;
            results = await controller.plugins.cms.testTrigger(bot, message);

            if (results !== false) {
                // do not continue middleware!
                return false;
            }
        });
    }

});

