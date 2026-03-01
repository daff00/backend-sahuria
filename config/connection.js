import mongoose from "mongoose";

const connectDB = () => {
    return mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("Connected to MongoDB!"));
};

export default connectDB;