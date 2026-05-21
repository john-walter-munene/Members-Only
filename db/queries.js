const pool = require("./pool");

const getUserEmail = async (email) => {   
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const userEmail = rows.length > 0 ? rows[0].email : null;
    return userEmail;
};

const addNewUser = async (email, hashedPassword, firstName, lastName) => {
    const { rows } = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name)
            VALUES ($1, $2, $3, $4) RETURNING *`, [email, hashedPassword, firstName, lastName]);
    return rows[0];
};

const makeUserAMember = async (id) => {
    const { rows } = await pool.query(`UPDATE users SET membership_status = true WHERE id = $1 RETURNING *`, [id]);
    return rows[0];
};

const makeUserAnAdmin = async (id) => {
    const { rows } = await pool.query(`UPDATE users SET admin = true WHERE id = $1 RETURNING *`, [id]);
    return rows[0];
};

const createPost = async (title, message, userId) => {
    const { rows } = await pool.query(
        `INSERT INTO posts (title, message, author_id) VALUES ($1, $2, $3) RETURNING *`,
        [title, message, userId]
    );
    return rows[0];
};

const getAllPosts = async () => {
    const { rows } = await pool.query(`
        SELECT 
            posts.id,
            posts.title,
            posts.message,
            posts.created_at,

            users.first_name AS author_name,
            users.email AS author_email
        FROM posts
        JOIN users ON posts.author_id = users.id
        ORDER BY posts.created_at DESC
    `);

    return rows;
};

const getAllUsers = async () => {
    const { rows } = await pool.query(`
        SELECT
            users.id,
            CONCAT(users.first_name, ' ', users.last_name) AS full_name,
            users.email,
            COUNT(posts.id) AS posts_created,
            users.membership_status,
            users.admin
        FROM users
        LEFT JOIN posts
            ON users.id = posts.author_id
        WHERE users.membership_status = true
        GROUP BY
            users.id,
            users.first_name,
            users.last_name,
            users.email,
            users.membership_status,
            users.admin
        ORDER BY users.id
    `);

    return rows;
};

const deletePost = async (id) => {
    const { rows } = await pool.query(`DELETE FROM posts WHERE id = $1 RETURNING *`, [id]);
    return rows[0];
};

module.exports = {
    getUserEmail,
    addNewUser,
    makeUserAMember,
    makeUserAnAdmin,
    createPost,
    getAllPosts,
    getAllUsers,
    deletePost,
};