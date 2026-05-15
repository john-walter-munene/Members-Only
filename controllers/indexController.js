const getIndex = async (req, res) => {
    const posts = [];
    res.render("index", { posts });
};

module.exports = {
    getIndex,
};