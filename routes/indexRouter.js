const { Router } = require("express");
const indexController = require("../controllers/indexController");
const indexRouter = Router();

indexRouter.get("/", indexController.getIndex);
indexRouter.get("/membership", indexController.getMembership);
indexRouter.post("/membership", indexController.postMembership);
indexRouter.get("/admin", indexController.getAdmin);
indexRouter.post("/admin", indexController.postAdmin);
indexRouter.get("/new-post", indexController.getNewPost);
indexRouter.post("/new-post", indexController.postNewPost);
indexRouter.get("/members", indexController.getMembers);
indexRouter.get("/manage-posts", indexController.getManagePosts);
indexRouter.post("/manage-posts/:id/delete", indexController.postDeletePost);

module.exports = indexRouter;