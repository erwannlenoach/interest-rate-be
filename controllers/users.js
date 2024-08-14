require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Op } = require("sequelize");
const User = require("../models/users");
const Loan = require("../models/loans");
const transporter = require("../nodemailer");

const saltRounds = 10;
const secretKey = process.env.SECRET_KEY;

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
      { expiresIn: "72h" }
    );

    await sendMail(
      user.email,
      "Account Created",
      `Welcome ${user.username}, your account has been created on Nostra.`
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
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
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
    const user = await User.findOne({
      where: { email: req.body.username },
      include: [
        {
          model: Loan,
          as: "loans",
        },
      ],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error getting loans:", error);
  }
}

async function editPassword(req, res) {
  const { email, currentPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).send({ message: "New passwords do not match" });
  }

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

async function resetPassword(req, res) {
  const { newPassword } = req.body;
  const { token } = req.params;

  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res
        .status(400)
        .send("Password reset token is invalid or has expired.");
    }

    user.password = await bcrypt.hash(newPassword, saltRounds);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).send("Password has been reset.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const token = crypto.randomBytes(20).toString("hex");
    const expiration = Date.now() + 3600000;

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiration;
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${token}`;
    const emailContent = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                          Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
                          ${resetLink}\n\n
                          If you did not request this, please ignore this email and your password will remain unchanged.\n`;

    await sendMail(user.email, "Password Reset", emailContent);

    res.status(200).send("Recovery email sent");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
}

async function editUsername(req, res) {
  const { email, username } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    await User.update({ username }, { where: { email } });
    res
      .status(200)
      .send({ username, message: "Username updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).send({ message: "Internal server error" });
  }
}

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader.split(" ")[1];
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

async function sendMail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (err, response) => {
    if (err) {
      console.error("There was an error:", err);
    }
  });
}

module.exports = {
  createUsers,
  connexionUser,
  authenticateToken,
  getUser,
  editPassword,
  forgotPassword,
  resetPassword,
  editUsername,
};
