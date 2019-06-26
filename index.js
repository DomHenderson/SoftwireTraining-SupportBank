const logger = require('./logging').logger;
const userInput = require('./userInput');

logger.info('Started');

var accounts = [];
var transactions = [];

var done = false;
// done = done || !fio.ParseCSV('Transactions2014.csv',accounts,transactions);
// done = done || !fio.ParseCSV('DodgyTransactions2015.csv',accounts,transactions);
// done = done || !fio.ParseJSON('Transactions2013.json',accounts,transactions);
while ( !done ) {
    done = userInput.processUserCommand(accounts,transactions);
}
logger.info('Quit');