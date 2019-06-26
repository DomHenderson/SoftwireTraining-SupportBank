const readline = require('readline-sync');
const fio = require('./fileIO');
const logger = require('./logging').logger;

const dateFormat = 'DD/MM/YYYY';

exports.askYesNo = function(message) {
    console.log(message);
    let response = readline.prompt();
    while ( response != '' && response != 'yes' && response != 'y' && response != 'no' && response != 'n' ) {
        console.log(message);
        console.log(`Valid responses are "", "yes", "y", "no", and "n"`);
        response = readline.prompt();
    }
    return (response == '' || response == 'y' || response == 'yes' );
}

function getValidUserInput() {
    let command;
    function getCommand () {
        console.log('Available commands are List All, List [Account], Import File [Filename], and Quit');
        command = readline.prompt();
    }

    getCommand();
    while ( command.toLowerCase().match(/^(quit|list ((all)|([a-z]+( [a-z]+)*))|import file .*\.(csv|json|xml))$/)  == null ) {
        if ( command.toLowerCase().match (/import file .*/) != null ) {
            console.log('Files must have extension ".csv", ".json", or ".xml"');
            getCommand();
        } else {
            console.log(`"${command}" is not a valid command`);
            getCommand();
        }
    }
    return command;
}

exports.processUserCommand = function(accounts,transactions) {
    let command = getValidUserInput();
    let commandLowerCase = command.toLowerCase();
    if ( command == 'Quit' ) {
        //Return that we are done
        return true;
    } else if ( command == 'List All' ) {
        listAll(accounts);

        //Return that the user should be prompted for another command
        return false;
    } else if ( commandLowerCase.match(/list [a-z]+( [a-z]+)*/) != null ) {
        listAccount ( command.substr(5), accounts, transactions );

        //Return that the user should be prompted for another command
        return false;
    } else if ( commandLowerCase.match(/import file .*\.csv/) != null ) {
        fio.parseCSV(command.substr(12),accounts,transactions);
        return false;
    } else if ( commandLowerCase.match(/import file .*\.json/) != null ) {
        fio.parseJSON(command.substr(12),accounts,transactions);
        return false;
    } else if ( commandLowerCase.match(/import file .*\.xml/) != null ) {
        fio.parseXML(command.substr(12),accounts,transactions);
        return false;
    } else {
        console.log('Your invalid input managed to bypass validation');
        logger.debug(`Invalid input ${command} bypassed validation`)
        //Return that the user should be prompted for another command
        return false;
    }
}

function listAll(accounts) {
    if ( Object.keys(accounts).length == 0 ) {
        console.log('No transactions logged');
    } else {
        for ( person in accounts ) {
            console.log(`${person}: £${accounts[person].balance.toFixed(2)}`);
        }
    }
}

function findMaxLengths ( transactions ) {
    let amountMax = 0;
    let toMax = 0;
    let fromMax = 0;
    let dateMax = 0;
    let narrativeMax = 0;
    for ( t of transactions ) {
        let amount = `${(+t.amount).toFixed(2)}`;
        if ( amount.length > amountMax ) amountMax = amount.length;
        let to = `${t.to}`;
        if ( to.length > toMax ) toMax = to.length;
        let from = `${t.from}`;
        if ( from.length > fromMax ) fromMax = from.length;
        let date = `${t.date.format(dateFormat)}`;
        if ( date.length > dateMax ) dateMax = date.length;
        let narrative = `${t.narrative}`;
        if ( narrative.length > narrativeMax ) narrativeMax = narrative.length;
    }
    return {
        'amount' : amountMax,
        'to' : toMax,
        'from' : fromMax,
        'date' : dateMax,
        'narrative' : narrativeMax
    };
}

function rightPadToLength ( str, length, pad ) {
    if ( pad == undefined ) pad = ' ';
    return str + pad.repeat(length-str.length);
}

function leftPadToLength ( str, length, pad ) {
    if ( pad == undefined ) pad = ' ';
    return pad.repeat(length-str.length) + str;
}

function listAccount(name,accounts,transactions) {
    if ( accounts[name] == undefined ) {
        console.log(`${name} is not a recognised account name`);
    } else {
        // for ( t of transactions ) {
        //     if ( t.from == name ) {
        //         console.log(`${t.narrative}: £${t.amount} to ${t.to} on the ${t.date.format(dateFormat)}`);
        //     } else if ( t.to == name ) {
        //         console.log(`${t.narrative}: £${t.amount} from ${t.from} on the ${t.date.format(dateFormat)}`);
        //     }
        // }
        let ts = transactions.filter((t)=>t.from == name || t.to == name);
        let lengths = findMaxLengths(ts);
        //console.log(lengths);
        let amountLength = lengths['amount'];
        //For the £
        lengths['amount'] += 1;

        for ( title in lengths ) {
            if ( lengths[title] < title.length ) lengths[title] = title.length;
        }
        
        console.log(lengths['narrative']);

        console.log(`${rightPadToLength('amount',lengths['amount'])} | ${rightPadToLength('from',lengths['from'])} | ${rightPadToLength('to',lengths['to'])} | ${rightPadToLength('date',lengths['date'])} | ${rightPadToLength('narrative',lengths['narrative'])}`);
        console.log(`${'-'.repeat(lengths['amount'])}-+-${'-'.repeat(lengths['from'])}-+-${'-'.repeat(lengths['to'])}-+-${'-'.repeat(lengths['date'])}-+-${'-'.repeat(lengths['narrative'])}`);
        for ( t of ts ) {
            console.log(`${rightPadToLength('£'+leftPadToLength((+t.amount).toFixed(2),amountLength,'0'),lengths['amount'],' ')} | ${rightPadToLength(t.from,lengths['from'])} | ${rightPadToLength(t.to,lengths['to'])} | ${rightPadToLength(t.date.format(dateFormat),lengths['date'])} | ${rightPadToLength(t.narrative,lengths['narrative'])}`);
        }
    }
}