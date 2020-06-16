var faker = require("faker");
var Sequelize = require("sequelize");

function getModels() {
    /** THIS IS WHERE MODEL DESCRIPTIONS SHOULD BE DEFINED */
    /** DO NOT INITIALIZE THEM, JUST DEFINE THE FIELDS AS DATA */

    return {
        User: {
            firstName: { type: Sequelize.STRING },
            lastName: { type: Sequelize.STRING },
        },
        Post: {
            title: { type: Sequelize.STRING },
            text: { type: Sequelize.TEXT },
        },
    };
}

function connectModels(db) {
    /** THIS IS WHERE MODEL RELATIONS SHOULD BE DEFINED */

    db.User.hasMany(db.Post);
    db.Post.belongsTo(db.User);
}

function getFakeDataRules() {
    /** THIS IS WHERE MODEL RULES FOR FAKE DATA SHOULD BE DEFINED */
    /** THE DATA WILL BE GENERATED IN THE ORDER SPECIFIED HERE */
    /** IT IS POSSIBLE TO GENERATE DATA FOR A MODEL MORE THAN ONCE */

    return [{
            model: "User",
            rules: {
                count: 10,
                valueGetters: {
                    firstName: () => faker.name.firstName(),
                    lastName: () => faker.name.lastName(),
                },
            },
        },
        {
            model: "Post",
            rules: {
                count: 10,
                valueGetters: {
                    title: () =>
                        `Why did the ${faker.hacker.noun()} ${faker.hacker.verb()}?`,
                    text: () => faker.hacker.phrase(),
                    UserId: () => faker.random.number({ min: 1, max: 9 }),
                },
            },
        },
    ];
}

module.exports = { getModels, connectModels, getFakeDataRules };