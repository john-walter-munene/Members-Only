const passport = require("passport");
const bcrypt = require("bcryptjs");
const pool = require("../db/pool");
const { matchedData, validationResult } = require("express-validator");
const { validateRegistration, validateLogin } = require("../middleware/validation"); 
const { addNewUser } = require("../db/queries");

const getSignUp = (request, response) => {
    const errors = [];
    const data = {};
    response.render("sign-up", { errors, data });
};

const postSignUp = [
    validateRegistration,
    async (request, response) => {

        // Handle validation errors
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).render("sign-up", {
                errors: errors.array(),
                data: request.body,
            });
        }

        // Work with valid data
        const { firstName, lastName, email, password } = matchedData(request);
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await addNewUser(email, hashedPassword, firstName, lastName);
        console.log("New user created:", newUser);
        response.redirect("/sign-in");
    },
];

const getSignIn = (request, response) => {
    const errors = [];
    const data = {};

    response.render("sign-in", { errors, data });
};

const postSignIn = [
    validateLogin,
    (request, response, next) => {
        const errors = validationResult(request);

        if (!errors.isEmpty()) {
            return response.status(400).render("sign-in", {
                errors: errors.array(),
                data: request.body,
            });
        }

        console.log(request.body.email, request.body.password);

        next();
    },

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/sign-in",
    }),
];

const signOut = (request, response, next) => {
    request.logout((err) => {
        if (err) {
            return next(err);
        }

        response.redirect("/");
    });
};

module.exports = { getSignUp, postSignUp, getSignIn, postSignIn, signOut };