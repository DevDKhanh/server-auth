const mongoose = require('mongoose');
require('dotenv').config();
const dev = process.env.DEV=='true';
async function connect() {
    try {
        await mongoose.connect(
            dev ? process.env.DBMONGO_LOCAL : process.env.DBMONGO_SERVER,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
            },
        );
        console.log('Connect successfully!!!');
    } catch (error) {
        console.log('Connect failure!!!');
    }
}
module.exports = { connect };