const fs = require('fs');
const xml = require('xml2js');
const moment = require('moment');

const Account = require('./Account').Account;
const Transaction = require('./Transaction').Transaction;
const UserInput = require('./userInput');

var failedTransactions = 0;
var loadedFiles = [];

function reportFailedTransactions ( filename ) {
    if ( failedTransactions == 1 ) {
        console.log(`1 transaction has failed in ${filename}`);
    } else {
        console.log(`${failedTransactions} transactions have failed in ${filename}`);
    }

    if ( failedTransactions > 0 ) {
        //Reset counter so it only counts for next transactions
        failedTransactions = 0;
        return UserInput.askYesNo ( 'Apply anyway?' ); 
    }
    return true;
}

function backupAccounts ( accounts ) {
    let backup = [];
    for ( name in accounts ) {
        backup[name] = new Account ( accounts[name].balance );
    }
    return backup;
}

function backupTransactions ( transactions ) {
    let backup = [];
    for ( i in transactions ) {
        let t = transactions[i];
        backup[i] = new Transaction ( t.from, t.to, t.amount, t.date, t.narrative );
    }
    return backup;
}

function restore ( newData, oldData ) {
    for ( i in newData ) {
        newData[i] = oldData[i];
    }
}

function runWithRollback ( accounts, transactions, filename, fn ) {
    let oldAccounts = backupAccounts ( accounts );
    let oldTransactions = backupTransactions ( transactions );

    fn();

    if ( !reportFailedTransactions ( filename ) ) {
        console.log('Backing up');
        restore(accounts,oldAccounts);
        restore(transactions,oldTransactions);
        return false;
    }
    return true;
}

function runWithHistoryCheckAndRollback ( accounts, transactions, filename, fn ) {
    if ( !(loaded=loadedFiles.includes (filename)) || UserInput.askYesNo(`${filename} has already been loaded. Load again?`) ) {
        if ( runWithRollback ( accounts, transactions, filename, fn ) ) {
            if ( !loaded ) {
                loadedFiles.push(filename);
            }
        }
    }
}

function applyTransaction ( transaction, accounts, transactions, lineNumber ) {
    if ( transaction == undefined || !transaction.run(accounts,transactions,lineNumber) ) {
        ++failedTransactions;
    }
}

exports.parseCSV = function ( filename, accounts, transactions ) {
    runWithHistoryCheckAndRollback ( accounts, transactions, filename, ()=> {
        try {
            let data = fs.readFileSync(filename,'utf8');
            let lines = data.split('\n');
            //From 1 because the first line is the headers
            for ( var i = 1; i < lines.length; ++i ) {
                if ( lines[i] != "" ) {
                    applyTransaction(Transaction.parse(lines[i],i,"DD/MM/YYYY"),accounts,transactions,i);
                }
            }
        } catch (e) {
            console.log(`"${filename}" does not exist`);
            console.log("Error:",e.stack);
            return true;
        }
    } );
    
}

exports.parseJSON = function ( filename, accounts, transactions ) {
    runWithHistoryCheckAndRollback ( accounts, transactions, filename, ()=>{
        try {
            let data = fs.readFileSync(filename,'utf8');
            let parsed = JSON.parse(data);

            for ( i in parsed ) {
                let t = parsed[i];
                applyTransaction(new Transaction ( t.FromAccount, t.ToAccount, t.Amount, moment(t.Date), t.Narrative ), accounts, transactions, i);
            }
        } catch (e) {
            console.log(`"${filename}" does not exist`);
            console.log("Error:",e.stack);
            return true;
        }
    } );
}

exports.parseXML = function ( filename, accounts, transactions ) {
    runWithHistoryCheckAndRollback ( accounts, transactions, filename, () => {
        try {
            let data = fs.readFileSync(filename,'utf8');
            let parsed;
            xml.parseString ( data, function ( err, result ) {
                parsed = result;
            } );
            let supportTransaction = parsed.TransactionList.SupportTransaction;
            for ( i in supportTransaction ) {
                let t = supportTransaction[i];
                applyTransaction(
                    new Transaction ( t.Parties[0].From[0], t.Parties[0].To[0], t.Value[0], moment('1900-01-01').add(t['$'].Date-1,'day'), t.Description[0] ),
                    accounts,
                    transactions,
                    i
                );
            }
        } catch (e) {
            console.log(`"${filename}" does not exist`);
            console.log("Error:",e.stack);
            return true;
        }
    } );
}
