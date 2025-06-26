import mongoose from 'mongoose';
import { Admin } from '../models/admin.model.js';
import seedAdminData from '../seeders/admin.seeder.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_CONNECTION_STRING = process.env.MONGODB_URI;
// console.log( process.env.MONGODB_URI, " process.env.MONGODB_URI");

const dbConnect = async () => {
  try {
    mongoose.set("strictQuery", false); // Optional if you're using Mongoose 6+
    const conn = await mongoose.connect(MONGODB_CONNECTION_STRING);


    const existingAdmin = await Admin.findOne({ userType: 'Admin' });
    // const existingMerchant = await Merchandiser.findOne({ userType: 'Merchandiser' });
    if (!existingAdmin)  await seedAdminData();

    console.log(`Database connected to host: ${conn.connection.host}`);

    // Listen for Mongoose connection events
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected.");
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Reconnecting...");
    });

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    
    console.log(`Database connected to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

export default dbConnect;
