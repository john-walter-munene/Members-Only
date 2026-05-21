const path = require("node:path");
require("dotenv").config({
    path: path.join(__dirname, "../.env"),
});

const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) throw new Error("Missing DATABASE_URL in environment variables");

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

module.exports = pool;