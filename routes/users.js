const express = require("express");
const { connexionUser, createUsers, getUser} = require("../controllers/users");
const router = express.Router();

router.get("/users/profile", getUser);
router.post("/users/connexion", connexionUser);
router.post("/users/register", createUsers);

module.exports = router;
