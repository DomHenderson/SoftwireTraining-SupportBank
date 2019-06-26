exports.Account = class {
    constructor ( initialBalance ) {
        this.balance = initialBalance;
    }
    
    credit ( amount ) {
        this.balance += amount;
    }

    debit ( amount ) {
        this.balance -= amount;
    }
}