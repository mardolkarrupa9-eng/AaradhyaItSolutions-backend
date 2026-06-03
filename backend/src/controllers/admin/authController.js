import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { db } from "../../db/index.js";
import { adminTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";

dotenv.config();

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // find admin in DB
    const [admin] = await db
      .select()
      .from(adminTable)
      .where(eq(adminTable.username, username));

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // check password
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // create token
    const token = jwt.sign(
      { admin_id: admin.admin_id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};