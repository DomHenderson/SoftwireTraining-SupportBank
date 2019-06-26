const readline = require('readline-sync');
const fio = require('./fileIO');

exports.AskYesNo = function(message) {
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
    console.log('Available commands are List All, List [Account], Import File [Filename], and Quit');
    let command = readline.prompt();
    while ( command.match(/(Quit)|(List ((All)|([a-zA-Z]+( [a-zA-Z]+)*)))|(Import File .*\.(csv)|(json))/)  == null ) {
        console.log(`"${command}" is not a valid command`);
        console.log('Available commands are List All, List [Account], Import File [Filename], and Quit');
        command = readline.prompt();
    }
    return command;
}

exports.processUserCommand = function(accounts,transactions) {
    let command = getValidUserInput();
    if ( command == 'Quit' ) {
        //Return that we are done
        return true;
    } else if ( command == 'List All' ) {
        ListAll(accounts);

        //Return that the user should be prompted for another command
        return false;
    } else if ( command.match(/List [a-zA-Z]+( [a-zA-Z]+)*/) != null ) {
        ListAccount ( command.substr(5), accounts, transactions );

        //Return that the user should be prompted for another command
        return false;
    } else if ( command.match(/Import File .*\.csv/) != null ) {
        return !fio.ParseCSV(command.substr(12),accounts,transactions);
    } else if ( command.match(/Import File .*\.json/) != null ) {
        return !fio.ParseJSON(command.substr(12),accounts,transactions);
    } else {
        console.log('Your invalid input managed to bypass validation');
        logging.logger.debug(`Invalid input ${command} bypassed validation`)
        //Return that the user should be prompted for another command
        return false;
    }
}

function ListAll(accounts) {
    for ( person in accounts ) {
        console.log(`${person}: £${accounts[person].balance.toFixed(2)}`);
    }
}

function ListAccount(name,accounts,transactions) {
    if ( accounts[name] == undefined ) {
        console.log(`${name} is not a recognised account name`);
    } else {
        for ( t in transactions ) {
            if ( transactions[t].from == name ) {
                console.log(`${transactions[t].narrative}: -${transactions[t].amount} on ${transactions[t].date}`);
            } else if ( transactions[t].to == name ) {
                console.log(`${transactions[t].narrative}: +${transactions[t].amount} on ${transactions[t].date}`);
            }
        }
    }
}