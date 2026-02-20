// db/connect.js
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const uri = process.env.MONGO_URI;
console.log("first", uri)
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;


