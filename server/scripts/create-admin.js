import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB, AdminUser } from "../services/db.js";

async function run() {
  const args = process.argv.slice(2);
  const email = (args[0] || process.env.ADMIN_EMAIL || "admin@civicsense.ng").toLowerCase().trim();
  const password = args[1] || process.env.ADMIN_PASSWORD || "AdminCivic2027!";
  const name = args[2] || process.env.ADMIN_NAME || "System Administrator";
  const role = (args[3] || "superadmin").toLowerCase().trim();

  if (!email || !password) {
    console.error("Usage: node scripts/create-admin.js <email> <password> [name] [role]");
    process.exit(1);
  }

  if (!["superadmin", "moderator"].includes(role)) {
    console.error("Error: Role must be either 'superadmin' or 'moderator'.");
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error("\n[Error] MONGODB_URI is not set in server/.env.");
    console.error("Please add your MongoDB connection string to server/.env before creating an admin account.\n");
    console.error("Example in server/.env:");
    console.error("  MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/civicsense\n");
    process.exit(1);
  }

  console.log(`Connecting to database to provision admin: ${email}...`);
  const connected = await connectDB();
  if (!connected) {
    console.error("[Error] Failed to connect to MongoDB. Check your MONGODB_URI connection string.");
    process.exit(1);
  }

  try {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    let admin = await AdminUser.findOne({ email });
    if (admin) {
      admin.passwordHash = passwordHash;
      admin.name = name;
      admin.role = role;
      await admin.save();
      console.log("\n==================================================");
      console.log(" Admin account updated successfully:");
      console.log(` Email:    ${admin.email}`);
      console.log(` Name:     ${admin.name}`);
      console.log(` Role:     ${admin.role}`);
      console.log(` ID:       ${admin._id}`);
      console.log("==================================================\n");
    } else {
      admin = await AdminUser.create({
        email,
        passwordHash,
        name,
        role,
      });
      console.log("\n==================================================");
      console.log(" Admin account created successfully:");
      console.log(` Email:    ${admin.email}`);
      console.log(` Name:     ${admin.name}`);
      console.log(` Role:     ${admin.role}`);
      console.log(` ID:       ${admin._id}`);
      console.log("==================================================\n");
    }
  } catch (err) {
    console.error(`[Error] Failed to provision admin: ${err.message}`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
