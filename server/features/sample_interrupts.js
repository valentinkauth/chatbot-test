module.exports = function(controller) {
   
    controller.interrupts('quit', 'message', async(bot, message) => {
        await bot.reply(message, 'Quitting!');
    
        // cancel any active dialogs
        await bot.cancelAllDialogs();
    });


    // Test to send random answer out of array of answers
    var answerArray = ['Benötigst du Hilfe?', 'Kann ich dir weiterhelfen?', 'Wie kann ich dir weiterhelfen?']

    controller.interrupts(['help', 'hilfe'],'message', async(bot, message) => {
        await bot.reply(message, answerArray[Math.floor(Math.random() * answerArray.length)])
    });


    controller.hears(['ernährung', 'essen'],'message', async(bot, message) => {
        await bot.say('Willst du Tipps oder Hilfe bezüglich deiner Ernähung')
    });

}