const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Auth middleware
const authenticateUser = async (req, res, next) => {
  let authToken;

  // First check cookie
  if (req.cookies && req.cookies.jwt) {
    authToken = req.cookies.jwt;
  }
  // Fallback: Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    authToken = req.headers.authorization.split(" ")[1];
  }

  if (!authToken) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }

  try {
    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

    req.currentUser = await User.findById(decodedData.id).select("-password");
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

// Role-based middleware
const requireAdmin = (req, res, next) => {
  if (req.currentUser && req.currentUser.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};

module.exports = {
  authenticateUser,
  requireAdmin,
};
