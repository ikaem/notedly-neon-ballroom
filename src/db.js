// require the mongoose library
const mongoose = require("mongoose");

module.exports = {
    connect: DB_HOST => {
        // use the mongo driver's update url string parser
        mongoose.set("useNewUrlParser", true);
        // use find one and update() in place of find and modify()
        mongoose.set("useFindAndModify", false);
        // use create index() in place of ensure index()
        mongoose.set("useCreateIndex", true);
        // use the new server discovery and monitoring engine
        mongoose.set("useUnifiedTopology", true);
        // connect to the db
        mongoose.connect(DB_HOST);
        // log error if we fail to connect
        mongoose.connection.on("error", err => {
            console.error(err);
            console.log("MongoDB connection error. Please make sure MongoDB is running");
            process.exit();
        });
    },
    close: () => {
        mongoose.connection.close();
    }
};