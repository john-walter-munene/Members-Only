const path = require("node:path");
require("dotenv").config({
    path: path.join(__dirname, "../.env"),
});

const { Client } = require("pg");
const bcrypt = require("bcryptjs");

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

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error("Database URL is missing!");

async function seed(client) {
  console.log("🌱 Seeding database...");

  try {

    // Create users
    const hashedPassword = await bcrypt.hash("Password123", 10);

    const { rows: users } = await client.query(
        `
        INSERT INTO users (email, password_hash, first_name, last_name)
        VALUES
            ($1, $2, $3, $4),
            ($5, $6, $7, $8),
            ($9, $10, $11, $12),
            ($13, $14, $15, $16)
        RETURNING *
        `,
        [
            "alice@example.com", hashedPassword, "Alice", "Johnson",
            "bob@example.com", hashedPassword, "Bob", "Smith",
            "charlie@example.com", hashedPassword, "Charlie", "Ngugi",
            "diana@example.com", hashedPassword, "Diana", "Kimani"
        ]
    );

    // Upgrade some users
    await client.query(`UPDATE users SET membership_status = true WHERE id = $1`, [users[0].id]);
    await client.query(`UPDATE users SET membership_status = true WHERE id = $1`, [users[1].id]);
    await client.query(`UPDATE users SET admin = true WHERE id = $1`, [users[0].id]);

    // Create posts
    await client.query(
        `INSERT INTO posts (title, message, author_id) VALUES ($1, $2, $3)`,
        [
            "Why I switched from REST to GraphQL",
            "REST was fine until our frontend grew too complex...",
            users[0].id
        ]
    );

    await client.query(
        `INSERT INTO posts (title, message, author_id) VALUES ($1, $2, $3)`,
        [
            "Authentication lessons I learned the hard way",
            "Never store plain passwords. Ever. Also sessions matter more than you think.",
            users[1].id
        ]
    );

    await client.query(
        `INSERT INTO posts (title, message, author_id) VALUES ($1, $2, $3)`,
        [
            "Building side projects that actually get finished",
            "Most projects die in the UI stage. Here's what helped me...",
            users[2].id
        ]
    );

    await client.query(
        `
        INSERT INTO posts (title, message, author_id)
        VALUES ($1, $2, $3)
        `,
        [
            "Why backend developers should care about UX",
            "Even APIs have UX. Naming, structure, and errors matter.",
            users[0].id
        ]
    );

    console.log("✅ Seeding complete!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    throw err;
  }
}

async function main() {
    console.log("Initializing database...");
    const client = new Client({
        connectionString: dbUrl,
        ssl: {
            rejectUnauthorized: false,
        },
    }); 

    try {
        await client.connect();
        console.log("Beginning database setup...");

        await client.query("BEGIN");
        await client.query(initializeMembersOnlyDatabase);
        await client.query("COMMIT");
        console.log("Database initialized successfully");
        await seed(client);
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