const path = require('path');
const fs = require('fs');
/**
 * Singleton class for database
 */
class Database {
    datapath = "./data";
    constructor() {

    }

    getProgression(playerid) {
        return new Promise((resolve, reject) => {
            var fs = require('fs');
            fs.readFile(path.join(this.datapath, playerid, "progression.json"), 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    var progression = JSON.parse(data);
                    resolve(progression);
                }
            });
        });
    }
}

exports.Database = new Database();