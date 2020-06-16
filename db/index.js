var Sequelize = require("sequelize");

var modelDefinitions = require("./models");

async function init(
    o = {
        forceSync: true,
        populate: true,
        writeHelpFiles: true,
    }
) {
    var sequelize = get_SQLITE_Sequalize();
    var db = await define(sequelize, o.forceSync);
    if (o.populate) await populate(db);
    if (o.writeHelpFiles) await writeHelpDocs(db);

    return db;
}

function get_SQLITE_Sequalize() {
    var sequelize = new Sequelize("TestDB", /*user*/ "", /*pass*/ "", {
        host: "localhost",
        dialect: "sqlite",
        retry: { max: 5 },
        pool: { max: 5, min: 0, idle: 10000 },
        // SQLite only
        storage: "./database.sqlite",
    });

    sequelize.options.host = sequelize.options.host || { name: "localhost" };

    return sequelize;
}

var fs = require("fs");
async function define(sequelize, forceSync) {
    var models = modelDefinitions.getModels();
    var db = { sequelize, Sequelize, create: createFunction };
    for (const name in models) db[name] = sequelize.define(name, models[name]);
    modelDefinitions.connectModels(db);
    for (const name in models) await db[name].sync({ force: forceSync });
    return db;
}

async function createFunction(model, values, o) {
    var result = await model.create(values, o);
    for (const i in values) {
        if (result.dataValues[i] !== values[i])
            throw new Error("Expected value was not set");
    }
    return result;
}

async function populate(db) {
    var rules = modelDefinitions.getFakeDataRules();

    for (let i = 0; i < rules.length; i++) {
        await createFakeItemsForModel(
            db,
            rules[i].model,
            rules[i].rules.count,
            rules[i].rules.valueGetters
        );
    }
}

async function writeHelpDocs(db) {
    var helpFilePaths = fs.readdirSync("./helpFiles");
    for (let i = 0; i < helpFilePaths.length; i++)
        fs.unlinkSync("./helpFiles/" + helpFilePaths[i]);

    var modelNames = Object.keys(db);
    for (let i = 0; i < modelNames.length; i++) {
        if (modelNames[i].toLowerCase() === "sequelize") continue;
        if (modelNames[i].toLowerCase() === "create") continue;
        var instance = await db[modelNames[i]].findOne();
        var contents = [`----------Members of [${modelNames[i]}]----------`];
        printMethodsOfModel(instance, modelNames, false, (str) =>
            contents.push(str)
        );
        fs.writeFileSync(
            `./helpFiles/help.${modelNames[i]}.txt`,
            contents.join("\n")
        );
    }
}
async function createFakeItemsForModel(
    db,
    modelName,
    count,
    valueGetters = { fieldName: () => undefined }
) {
    function getValues(i) {
        var values = {};
        Object.keys(valueGetters).forEach(
            (key) => (values[key] = valueGetters[key](i))
        );
        return values;
    }

    for (let i = 0; i < count; i++) {
        var values = getValues(i);
        try {
            await db.create(db[modelName], values);
        } catch (error) {
            console.error(error);
            console.error("When inserting " + modelName);
            console.error(JSON.stringify(values, null, 2));
            throw error;
        }
    }
}

function printMembersOf(obj, withValues = false, printMethod = console.log) {
    if (!obj) return printMethod("instance is NULL");

    var keys = Object.keys(obj);
    var types = keys.map((k) => {
        try {
            return obj[k].constructor.name;
        } catch (error) {
            return typeof obj[k];
        }
    });

    for (let i = 0; i < keys.length; i++) {
        var str = `${types[i]} ${keys[i]}`;
        if (withValues) str += " ==> " + obj[keys[i]];
        printMethod(str);
    }
}

const methodSufixes = ["get", "find", "set", "add"];

function printMethodsOfModel(
    modelInstance,
    namesOfAllModels,
    withValues = false,
    printMethod = console.log
) {
    if (!modelInstance) return printMethod("instance is NULL");

    var objToPrint = {};
    methodSufixes.forEach((suf) => {
        namesOfAllModels.forEach((name) => {
            ["", "s"].forEach((ending) => {
                var key = suf + name + ending;
                if (modelInstance[key]) objToPrint[key] = modelInstance[key];
            });
        });
    });

    for (const key in modelInstance.dataValues)
        objToPrint["dataValues." + key] = modelInstance.dataValues[key];

    printMembersOf(objToPrint, withValues, printMethod);
}

module.exports = { init };