import mongoose from "mongoose";

const touristguideSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    img: {
        type: String,
    },
    location: {
        type: String,
        required: true,
    },

    language: {
        type: String,
        required: true,
    },
    experience: {
        type: Number,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    availability: {
        type: String,
        required: true,
    },
    licenseNumber: {
        type: String,
        required: true,
        match: [/^[A-Z0-9]+$/, "Invalid license number format"]
    },
    category: {
        type: [String],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const TouristGuide = mongoose.models.TouristGuide || mongoose.model("TouristGuide", touristguideSchema);
export default TouristGuide;