const express = require("express");
const { connexionUser, createUsers } = require("../controllers/users");
const router = express.Router();

router.post("/users/connexion", connexionUser);
router.post("/users/create", createUsers);

module.exports = router;
