const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const User = require("../models/user.model");

// Cookie options
const cookieOptions = {
  httpOnly: true, // prevents JS access
  secure: process.env.NODE_ENV === "production", // https in production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role });

    const token = generateToken(user._id, user.role);

    res
      .cookie("jwt", token, cookieOptions)
      .status(201)
      .json({
        message: "registered successfully",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id, user.role);
      res.cookie("jwt", token, cookieOptions).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getCurrentUser = (req, res) => {
  if (!req.currentUser) {
    return res.status(401).json({ message: "Not authorized" });
  }

  res.status(200).json({
    _id: req.currentUser._id,
    name: req.currentUser.name,
    email: req.currentUser.email,
    role: req.currentUser.role,
  });
};

const logout = (req, res) => {
  res.cookie("jwt", "", {
    ...cookieOptions,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
};
