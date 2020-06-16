const express = require("express");
const AdminBro = require("admin-bro");
const AdminBroExpress = require("admin-bro-expressjs");
const AdminBroSequelize = require("admin-bro-sequelizejs");
const finale = require("finale-rest");
const bodyParser = require("body-parser");
const listEndpoints = require("express-list-endpoints");
const sequelizeErd = require("sequelize-erd");

async function init(
    db,
    o = {
        adminPanel: true,
        modelRest: true,
        drawChart: true,
    }
) {
    const app = express();

    var tableNames = Object.keys(db).filter(
        (i) => i.toLowerCase() !== "sequelize" && i !== "create"
    );

    var mainPageContent = {};
    app.get("/", (req, res) => res.json(mainPageContent));

    if (o.modelRest) {
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));

        // Initialize finale
        finale.initialize({ app: app, sequelize: db.sequelize });

        // Create REST resources
        var resources = tableNames.map((name) =>
            finale.resource({
                model: db[name],
                endpoints: [`/${name.toLowerCase()}`, `/${name.toLowerCase()}/:id`],
            })
        );
    }

    if (o.adminPanel) {
        AdminBro.registerAdapter(AdminBroSequelize);
        const adminBro = new AdminBro({
            databases: [db],
            rootPath: "/admin",
            resources: tableNames.map((name) => ({ resource: db[name] })),
            branding: { companyName: "CompanyName" },
        });
        const adminBroRouter = AdminBroExpress.buildRouter(adminBro);
        app.use(adminBro.options.rootPath, adminBroRouter);
    }

    if (o.drawChart) {
        var svg = await sequelizeErd({ source: db.sequelize });
        app.get("/chart.svg", (req, res) => res.send(svg));
    }

    mainPageContent = {
        Endpoints: listEndpoints(app).filter((i) => i.path.indexOf("/admin/") < 0),
    };

    app.listen(8080, () => {
        console.log("Service running on http://localhost:8080/");

        if (o.adminPanel) {
            console.log("Admin Panel on http://localhost:8080/admin");
        }
        if (o.drawChart) {
            console.log("Model Chart on http://localhost:8080/chart.svg");
        }
    });
}

module.exports = { init };