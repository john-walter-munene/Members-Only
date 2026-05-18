const path = require("node:path");
require("dotenv").config({
    path: path.join(__dirname, "../.env"),
});

const { Client } = require("pg");

const initializeMembersOnlyDatabase = `
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

        email TEXT NOT NULL UNIQUE,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,

        membership_status BOOLEAN NOT NULL DEFAULT false,
        password_hash VARCHAR(255) NOT NULL,
        admin BOOLEAN NOT NULL DEFAULT false,

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE
    );

    -- Posts Table
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

        title TEXT NOT NULL,
        message TEXT NOT NULL,

        author_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE,

        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Sessions Table (connect-pg-simple)
    CREATE TABLE IF NOT EXISTS users_sessions (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL,
        PRIMARY KEY (sid)
    );

    CREATE INDEX IF NOT EXISTS IDX_users_sessions_expire ON users_sessions (expire);
    CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
`;

const {
    DB_USER: user,
    DB_PASSWORD: password,
    DB_NAME: dbName,
    DB_HOST: host,
    DB_PORT: port,
    NODE_ENV,
} = process.env;

if (!user || !password || !host || !port || !dbName) {
    throw new Error("Missing environment variables in .env file");
}

const dbUrl = `postgresql://${user}:${password}@${host}:${port}/${dbName}`;

async function main() {
    console.log("Initializing database...");

    const client = new Client({
        connectionString: dbUrl,
        ssl:
            NODE_ENV === "production"
                ? { rejectUnauthorized: false }
                : false,
    });

    try {
        await client.connect();
        console.log("Beginning database setup...");

        await client.query("BEGIN");

        await client.query(initializeMembersOnlyDatabase);

        await client.query("COMMIT");

        console.log("Database initialized successfully");
    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (_) {}

        console.error("Initialization failed:", error);
    } finally {
        await client.end();
        console.log("Connection closed");
    }
}

main();