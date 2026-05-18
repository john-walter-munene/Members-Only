const pool = require("../db/pool");
const db = require("../db/queries");
const { formatDate } = require("../utils/utils");

const getIndex = async (request, response) => {
    const posts = await db.getAllPosts() 
    const formattedPosts = posts.map(post => ({ ...post, created_at: formatDate(post.created_at), }));

    const currentUser = request.user;

    let nextStep = {
        content: "You need to login to write a message.",
        link: "/sign-in",
        text: "Sign In",
    };

    if (currentUser) {
        if (!currentUser.membership_status) {
            nextStep = {
                content: `Welcome back ${currentUser.first_name}! Although you can write messages, you need to join the membership club to see usernames.`,
                link: "/membership",
                text: "Become a Member",
            };
        } else if (!currentUser.is_admin) {
            nextStep = {
                content: `Hello ${currentUser.first_name}! You are now a member. You need to become an admin to edit or delete messages.`,
                link: "/admin",
                text: "Become Admin",
            };
        } else {
            nextStep = {};
        }
    }

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
        request.user.membership_status = true;
        console.log(`User ${updatedUser.first_name} has become a member.`);
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
        request.user.is_admin = true;
        console.log(`User ${updatedUser.first_name} has become an admin.`);
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
    console.log(`New post created with ID: ${newPost.id} by user: ${user.first_name}`);
    response.redirect("/");
};

const getMembers = async (request, response) => {
    const members = await db.getAllUsers();
    response.render("members", { members });
};

const getManagePosts = async (request, response) => {
    const user = request.user;

    // Make page only accessible to admins
    if (!user || !user.admin) {
        return response.redirect("/admin");
    }

    const posts = await db.getAllPosts();

    response.render("manage-posts", { posts, formatDate });
};

const postDeletePost = async (request, response) => {
    const user = request.user;

    // Make page only accessible to admins
    if (!user || !user.admin) return response.redirect("/admin");
    
    const postId = Number(request.params.id);
    const deletedPost = await db.deletePost(postId);
    console.log(`Post "${deletedPost.title}" deleted by ${user.first_name}.`);

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