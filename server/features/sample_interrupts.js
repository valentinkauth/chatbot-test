module.exports = function (controller) {

    // Cancels all dialog if the word 'quit' is detected
    controller.interrupts(async (message) => {
        // Only react to 'quit' and don't react if 'quit' is part of other words, e.g. 'Quitting', 'Quitten' etc. 
        return (message.text.toLowerCase() === 'quit')
    }, 'message', async (bot, message) => {

        await bot.reply(message, 'Quitting!');
        // cancel any active dialogs
        await bot.cancelAllDialogs();
    });


    // Test to send random answer out of array of answers
    var answerArray = ['Benötigst du Hilfe?', 'Kann ich dir weiterhelfen?', 'Wie kann ich dir weiterhelfen?']

    controller.interrupts(['help', 'hilfe'], 'message', async (bot, message) => {
        console.log(message)
        await bot.reply(message, answerArray[Math.floor(Math.random() * answerArray.length)])
    });


    controller.hears(['ernährung', 'essen'], 'message', async (bot, message) => {
        await bot.say('Willst du Tipps oder Hilfe bezüglich deiner Ernähung')
    });

}