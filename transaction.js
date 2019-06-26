const moment = require('moment');

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

    static parse ( str, lineNumber, dateFormat ) {
        let [date,from,to,narrative,amount] = str.split(',');
        date = moment(date,dateFormat);
        if(date == undefined || from == undefined || to == undefined || narrative == undefined || amount == undefined) {
            logger.error(`On line ${lineNumber}: "${str}"`);
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
            return undefined;
        }

        return new exports.Transaction ( from, to, amount, date, narrative );
    }

    run (accounts, transactions, lineNumber) {
        //console.log(`Running transaction ${t.from} ${t.to} ${t.amount} ${t.date} ${t.narrative}`)
    
        //Create accounts if they haven't been seen yet
        if ( accounts[this.from] == undefined ) {
            accounts[this.from] = new Account(0);
        }
        if ( accounts[this.to] == undefined ) {
            accounts[this.to] = new Account(0);
        }
        
        //Record the transaction
        transactions.push(this);
        transactions.sort((l,r)=>{
            if ( l.date.unix() > r.date.unix() ) {
                return 1;
            } else if ( l.date.unix() == r.date.unix() ) {
                return 0;
            } else {
                return -1;
            }
        })
    
        //Perform the transaction
        if ( Number.isNaN(+this.amount) ) {
            logger.error(`On line ${lineNumber}: "date: ${this.date}, from: ${this.from}, to: ${this.to}, narrative: ${this.narrative}, amount: ${this.amount}"`);
            logger.error('  amount is not a number');
            return false;
        } else {
            accounts[this.from].debit(+this.amount);
            accounts[this.to].credit(+this.amount);
            return true;
        }
    }
}