// ./apps/config/connectdb.js
import mongoose from "mongoose";
import pg from "pg";
const { Pool } = pg;

export const connectPG = async () => {
  try {
    const pool = new Pool({
      connectionString: process.env.POSTGRES_CONNECTIONSTRING,
    });

    await pool.query("SELECT 1");
    console.log("Kết nối PostgreSQL thành công!");

    return pool;
  } catch (error) {
    console.error("Lỗi khi kết nối PostgreSQL:", error);
    process.exit(1);
  }
};

export const connectMG = async () => {
  try {
    await mongoose.connect(
        process.env.MONGODB_CONNECTIONSTRING
    );

    console.log("Liên kết CSDL MongoDB thành công!");

  } catch (error) {
    console.log("Lỗi khi kết nối CSDL MongoDB:", error);
    process.exit(1);
  }
  
};