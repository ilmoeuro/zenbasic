const Promise = require('bluebird');
const sqlite3 = Promise.promisifyAll(require('sqlite3').verbose());

sqlite3.Database.prototype.runAsync = function runAsync(sql, params) {
    return new Promise((resolve, reject) => {
        this.run(sql, params, function cb(err) {
            if(err) {
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
}

module.exports = sqlite3;
