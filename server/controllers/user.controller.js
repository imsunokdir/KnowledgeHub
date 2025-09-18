const User = require("../models/user.model");

const getUsers = async (req, res) => {
  const search = req.query.search || "";
  try {
    const users = await User.find({
      email: { $regex: search, $options: "i" },
    }).select("name email");
    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

module.exports = { getUsers };
