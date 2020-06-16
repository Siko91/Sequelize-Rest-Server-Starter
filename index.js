var dbInit = require("./db/index.js");
var srvInit = require("./service/index.js");

dbInit
    .init({
        forceSync: true,
        populate: true,
        writeHelpFiles: true,
    })
    .then((db) => {
        return srvInit.init(db, {
            adminPanel: true,
            modelRest: true,
            drawChart: true,
        });
    });