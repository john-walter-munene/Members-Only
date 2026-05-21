const pool = require("../db/pool");
const db = require("../db/queries");
const { formatDate } = require("../utils/utils");
const CustomNotFoundError = require("../errors/CustomNotFoundError");

const getNextStep = (currentUser) => {
    // Redirect to the login page
    if (!currentUser) {
        return {
            content: "You need to login to write a message.",
            link: "/sign-in",
            text: "Sign In",
        };
    }

    // If user is not a member guide to join membership 
    if (!currentUser.membership_status) {
        return {
            content: `Welcome back ${currentUser.first_name}! Although you can write messages, you need to join the membership club to see usernames.`,
            link: "/membership",
            text: "Become a Member",
        };
    }

    // If Member guide to join administratorship
    if (!currentUser.admin) {
        return {
            content: `Hello ${currentUser.first_name}! You are now a member. You need to become an admin to edit or delete messages.`,
            link: "/admin",
            text: "Become Admin",
        };
    }

    // If admin give access to administrator page
    return {
        content: `Hello ${currentUser.first_name}! You are now an Members Only admin.`,
        link: "/manage-posts",
        text: "Manage Posts!"
    };
};

const getIndex = async (request, response) => {
    const posts = await db.getAllPosts() 

    // Throw an error if posts do not exist.
    if (!posts) throw new CustomNotFoundError("Database failed to provide posts");

    const formattedPosts = posts.map(post => ({ ...post, created_at: formatDate(post.created_at), }));
    const currentUser = request.user;
    const nextStep = getNextStep(currentUser);
    response.render("index", {
        posts: formattedPosts,
        formatDate,
        nextStepContent: nextStep.content || null,
        nextStepLink: nextStep.link || null,
        nextStepText: nextStep.text || null,
        user: currentUser || null,
    });
};

const getMembership = async (request, response) => {
    response.render("membership", { error: null });
};

const postMembership = async (request, response) => {
    const { membership_phrase: membershipPhrase } = request.body;
    const correctPhrase = "i want to become a member";
    const membershipPhraseNormalized = membershipPhrase.trim().toLowerCase();

    if (membershipPhraseNormalized === correctPhrase) {
        const user = request.user;
        const updatedUser = await db.makeUserAMember(user.id);

        // Handle membership updates error if any
        if(!updatedUser) throw new CustomNotFoundError("This user is not available");
        request.user.membership_status = true;
        response.redirect("/");
    } else response.status(400).render("membership", { error: "Invalid membership phrase.", });
};

const getAdmin = async (request, response) => {
    response.render("admin", { error: null });
};

const postAdmin = async (request, response) => {
    const { admin_phrase: adminPhrase } = request.body;
    const correctPhrase = "i want to become an admin";
    const adminPhraseNormalized = adminPhrase.trim().toLowerCase();

    if (adminPhraseNormalized === correctPhrase) {
        const user = request.user;
        const updatedUser = await db.makeUserAnAdmin(user.id);
        
        // Handle membership updates error if any
        if(!updatedUser) throw new CustomNotFoundError("This user is not available");
        request.user.is_admin = true;
        response.redirect("/");
    } else {
        response.status(400).render("admin", { error: "Invalid admin phrase." });
    }
};

const getNewPost = async (request, response) => {
    response.render("new-post", { error: null });
};

const postNewPost = async (request, response) => {
    const { title, post: message } = request.body;
    const user = request.user;
    const newPost = await db.createPost(title, message, Number(user.id));
    if (!newPost) throw new CustomNotFoundError("This post can't find it's fields in the database");
    response.redirect("/");
};

const getMembers = async (request, response) => {
    const members = await db.getAllUsers();
    if (!members) throw new CustomNotFoundError("Members resource unavailable in the database");
    response.render("members", { members });
};

const getManagePosts = async (request, response) => {
    const user = request.user;
    
    // Make page only accessible to admins
    if (!user || !user.admin) return response.redirect("/admin");
    const posts = await db.getAllPosts();

    // Throw an error if posts do not exist.
    if (!posts) throw new CustomNotFoundError("Database failed to provide posts");
    response.render("manage-posts", { posts, formatDate });
};

const postDeletePost = async (request, response) => {
    const user = request.user;

    // Make page only accessible to admins
    if (!user || !user.admin) return response.redirect("/admin");
    
    // Proceed with deleting the post
    const postId = Number(request.params.id);
    const deletedPost = await db.deletePost(postId);

    // Catch failed delete errors
    if (!deletedPost) throw new CustomNotFoundError("The delete resource is unavailable in the database");
    response.redirect("/manage-posts");
};

module.exports = {
    getIndex,
    getMembership,
    postMembership,
    getAdmin,
    postAdmin,
    getNewPost,
    postNewPost,
    getMembers,
    getManagePosts,
    postDeletePost,
};