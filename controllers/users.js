const fs = require("fs");
const path = require("path");
const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const crypto = require("crypto");
const secretKey = crypto.randomBytes(64).toString("hex");

async function createUsers(req, res) {
  const { email, username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(
      "Debug: Email, Username, HashedPassword:",
      email,
      username,
      hashedPassword
    );

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    res.status(201).json({ message: "User created", user });
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

module.exports = { createUsers, connexionUser, authenticateToken, getUser };
