const logger = require('./logging').logger;
const userInput = require('./userInput');
const fio = require('./fileIO');

logger.info('Started');

var accounts = [];
var transactions = [];

var done = false;
while ( !done ) {
    done = userInput.processUserCommand(accounts,transactions);
}
logger.info('Quit');
