const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    MONGODB_CON_URL: process.env.MONGODB_CON_URL,
    PORT: process.env.PORT,
};
