const fs = require('fs');

const Transaction = require('./transaction').Transaction;
const userInput = require('./userInput');

var failedTransactions = 0;

function ReportFailedTransactions( filename ) {
    if ( failedTransactions == 1 ) {
        console.log(`1 transaction has failed in ${filename}`);
    } else {
        console.log(`${failedTransactions} transactions have failed in ${filename}`);
    }

    if ( failedTransactions > 0 ) {
        //Reset counter so it only counts for next transactions
        failedTransactions = 0;
        return userInput.AskYesNo ( 'Continue anyway?' ); 
    }
    return true;
}

exports.ParseCSV = function ( filename, accounts, transactions ) {
    try {
        let data = fs.readFileSync(filename,'utf8');
        let lines = data.split('\n');
        //From 1 because the first line is the headers
        for ( var i = 1; i < lines.length; ++i ) {        
            if ( !(Transaction.Parse(lines[i],accounts,transactions,i)) ) {
                ++failedTransactions;
            }
        }
        return ReportFailedTransactions ( filename );
    } catch (e) {
        console.log(`"${filename}" does not exist`);
        console.log("Error:",e.stack);
        return true;
    }
}

exports.ParseJSON = function ( filename, accounts, transactions ) {
    try {
        let data = fs.readFileSync(filename,'utf8');
        let parsed = JSON.parse(data);

        for ( let i = 0; i < parsed.length; ++i ) {
            let t = parsed[i];
            if ( !Transaction.Run(new Transaction(t.FromAccount, t.ToAccount, t.Amount, t.Date, t.Narrative),accounts,transactions,i) ) {
                ++failedTransactions;
            }
        }

        return ReportFailedTransactions ( filename );
    } catch (e) {
        console.log(`"${filename}" does not exist`);
        console.log("Error:",e.stack);
        return true;
    }
}
