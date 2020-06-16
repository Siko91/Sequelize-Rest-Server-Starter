# Sequelize REST server

## Starter Pack

Simply define your models and some fake data rules, and the rest will just work:

- Automatic generation of fake data (based on the rules you set)
- REST API for CRUD operations on all models
- Admin panel with UI
- Help files listing the methods and data fields of each Sequelize type
- An SVG chart of the models and their relations

---

- define your models in **db/models.js** in the **getModels and connectModels** methods
- define your fake data rules in **db/models.js** in the **getFakeDataRules** method

---

The API endpoints will be listed on "/" but it is probably best to list some of the possible queries here:

#### Pagination

- <http://localhost:8080/Post?offset=500&count=100>

#### Search by Text

- <http://localhost:8080/Post?q=bananas>

#### Search field

- <http://localhost:8080/User?firstName=Leo>
- <http://localhost:8080/Post?UserId=4>

#### Sorting

- <http://localhost:8080/User?sort=firstName>
- <http://localhost:8080/User?sort=lastName,firstName>
- <http://localhost:8080/User?sort=-lastName,-firstName> (- means descending)
