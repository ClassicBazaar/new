const { MongoClient } = require("mongodb");
const state = {
    db: null,
};
module.exports.connect = async function (done) {
    // needed things for connecting to server
    // const url = "mongodb://0.0.0.0:27017"; 
    const url ='mongodb+srv://classicbazaar313:pyoGSuv65lhESECu@classicbazaardatabase.w0048g7.mongodb.net/?retryWrites=true&w=majority'
    const dbname = "Classicbazaar";
    const client = new MongoClient(url);
    // connection of mongodb client
    await client.connect();
    console.log("connected successfuly");
    state.db = client.db(dbname);
};

module.exports.get = function () {
    return state.db;
};
