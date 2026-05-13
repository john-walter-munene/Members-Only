const bycript = require("bcrypt");
const pool = require("../db/pool");

const getSignUp = (request, response) => {
    response.render("sign-up");
};

const postSignUp = async (request, response) => {
    const { email, password, firstName, lastName } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    await pool.query(`INSERT INTO users (email, password, first_name, last_name) 
        VALUES ($1, $2, $3, $4) RETURNING *`, [email, hashedPassword, firstName, lastName]);
    
    response.redirect("/sign-in");
};

const getSignIn = (request, response) => {
    response.render("sign-in");
};

const postSignIn = (request, response) => {
    response.redirect("/");
}

const signOut = (request, response, next) => {
    request.logout((err) => {
        if (err) {
            return next(err);
        }

        response.redirect("/");
    });
};

module.exports = { getSignUp, postSignUp, getSignIn, postSignIn, signOut };