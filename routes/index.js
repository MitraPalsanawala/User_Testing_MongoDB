var express = require('express');
var router = express.Router();
const UserController = require('../controller/UserController');
const PostController = require('../controller/PostController');
router.post('/Registration', UserController.Registration);
router.post('/LogIn', UserController.Login);
router.post('/setPost', PostController.setPost);
router.post('/getPost',PostController.getPost);
router.post('/deletePost',PostController.deletePost);
router.post('/DashboardCountPost',PostController.DashboardCountPost);

module.exports = router;
