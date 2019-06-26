const Account = require('./account').Account;
const logger = require('./logging').logger;

exports.Transaction = class {
    constructor ( from, to, amount, date, narrative ) {
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.date = date;
        this.narrative = narrative;
    }

    static Run (t, accounts, transactions, lineNumber) {
        //console.log(`Running transaction ${t.from} ${t.to} ${t.amount} ${t.date} ${t.narrative}`)
    
        //Create accounts if they haven't been seen yet
        if ( accounts[t.from] == undefined ) {
            accounts[t.from] = new Account(0);
        }
        if ( accounts[t.to] == undefined ) {
            accounts[t.to] = new Account(0);
        }
        
        //Record the transaction
        transactions.push(t);
    
        //Perform the transaction
        if ( Number.isNaN(+t.amount) ) {
            logger.error(`On line ${lineNumber}: "date: ${t.date}, from: ${t.from}, to: ${t.to}, narrative: ${t.narrative}, amount: ${t.amount}"`);
            logger.error('  amount is not a number');
            return false;
        } else {
            accounts[t.from].debit(+t.amount);
            accounts[t.to].credit(+t.amount);
            return true;
        }
    }

    static Parse ( line, accounts, transactions, lineNumber ) {
        if ( line!= "" ) {
            let [date,from,to,narrative,amount] = line.split(',');
            if ( date != undefined && from != undefined && to != undefined && narrative != undefined && amount != undefined ) {
                return this.Run(new exports.Transaction(from, to, amount, date, narrative), accounts, transactions, lineNumber);
            } else {
                logger.error(`On line ${lineNumber}: "${line}"`);
                if ( date == undefined ) {
                    logger.error('  Date is undefined');
                }
                if ( from == undefined ) {
                    logger.error('  From is undefined');
                }
                if ( to == undefined ) {
                    logger.error('  To is undefined');
                }
                if ( narrative == undefined ) {
                    logger.error('  Narrative is undefined');
                }
                if ( amount == undefined ) {
                    logger.error('  Amount is undefined');
                }
                return false;
            }
        }
        return true;
    }
}