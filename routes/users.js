const express = require('express');
const { createUsers, forgotPassword, connexionUser, authenticateToken, getUser, editPassword, editUsername, resetPassword } = require('../controllers/users');
const router = express.Router();

router.post('/register', createUsers);
router.post('/login', connexionUser);
router.post('/profile', authenticateToken,getUser);
router.patch('/username/edit', authenticateToken,editUsername);
router.patch('/password/edit', authenticateToken,editPassword);
router.post('/password/forgot', forgotPassword);
router.post('/password/reset/:token', resetPassword); 

module.exports = router;
