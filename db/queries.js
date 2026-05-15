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

module.exports = {
    getUserEmail,
    addNewUser
};  