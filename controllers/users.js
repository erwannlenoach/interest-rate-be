const fs = require("fs");
const path = require("path");
const User = require("../models/users");
const Loan = require("../models/loans");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const crypto = require("crypto");
const secretKey = crypto.randomBytes(64).toString("hex");
const saltRounds = 10;

async function createUsers(req, res) {
  const { email, username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
  
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });

  const token = jwt.sign(
    { id: user.id, username: user.username },
    secretKey,
    { expiresIn: "1h" }
  );
    
    res.status(201).json({ message: "User created", token });
  } catch (error) {
    console.error("Error in createUsers:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(500).json({ error: "User already exists" });
    } else {
      res.status(500).json({ error: "Error creating user", error });
    }
  }
}

async function connexionUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username },
      secretKey,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    console.error("Error finding the user", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getUser(req, res) {
  try {
    const { username } = req.body;
    const user = await User.findOne({
      where: { username },
      include: [
        {
          model: Loan,
          as: "loans",
        },
      ],
    });
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error getting loans:", error);
  }
}

async function editPassword(req, res) {
  const { email, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match) {
      return res.status(400).send({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await User.update({ password: hashedPassword }, { where: { email } });

    res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).send({ message: "Internal server error" });
  }
}

// Middleware d'authentification
// Exemple de route protégée
// Exemple de route protégée
//  app.get('/profile', authenticateToken, (req, res) => {
//      res.json({ message: 'This is a protected route', user: req.user });
//    });

async function authenticateToken(req, res, next) {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "No token provided" });
    jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = user;
      next();
    });
  } catch (error) {
    console.log("Error authenticating the user", error);
  }
}

module.exports = {
  createUsers,
  connexionUser,
  authenticateToken,
  getUser,
  editPassword,
};
