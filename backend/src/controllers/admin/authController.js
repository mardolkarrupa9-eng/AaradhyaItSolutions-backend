import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check username
    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};