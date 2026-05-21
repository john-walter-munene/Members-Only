const { body } = require("express-validator");
const { getUserEmail } = require("../db/queries");

const validateRegistration = [
    body("firstName")
        .trim().escape()
        .notEmpty().withMessage("First name is required")
        .isLength({ min: 2, max: 20 }).withMessage("First name must be between 2 and 20 characters")
        .isAlpha("en-US", { ignore: " -" }).withMessage("First name can only contain letters"),

    body("lastName")
        .trim().escape()
        .notEmpty().withMessage("Last name is required")
        .isLength({ min: 2, max: 20 }).withMessage("Last name must be between 2 and 20 characters")
        .isAlpha("en-US", { ignore: " -" }).withMessage("Last name can only contain letters"),

    body("email")
        .trim().normalizeEmail()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email")
        .custom(async (value) => {
            const userEmail = await getUserEmail(value);
            if (userEmail) throw new Error("Email already in use");
            return true;
        }),

    body("password")
        .trim().notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/).withMessage("Password must contain at least one number"),

    body("confirmPassword")
        .trim().notEmpty().withMessage("Please confirm your password")
        .custom((value, { req }) => {
            if (value !== req.body.password) throw new Error("Passwords do not match");
            return true;
        }),
];

const validateLogin = [
    body("email")
        .trim().normalizeEmail()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email"),

    body("password").trim().notEmpty().withMessage("Password is required"),
];

module.exports = { validateRegistration, validateLogin };