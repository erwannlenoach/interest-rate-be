const express = require("express");
const {
  connexionUser,
  createUsers,
  getUser,
  editPassword,
} = require("../controllers/users");
const router = express.Router();

router.post("/users/profile", getUser);
router.post("/users/connexion", connexionUser);
router.post("/users/register", createUsers);
router.post("/users/password/edit", editPassword);

module.exports = router;
