import TouristGuide from "../models/touristguide.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const LICENSE_PATTERN = /^[A-Z0-9]+$/;


// CREATE a tourist guide
export const createTouristGuide = async (req, res, next) => {
    try {
        let user;
        if (req.body.email) {
            user = await User.findOne({ email: req.body.email });
            console.log(user);
            if (!user) return res.status(404).json({ message: "User with this email not found." });
        } else {
            user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: "User not found." });
        }

        console.log(req.body);

        const {
            name,
            img,
            location,
            language,
            experience,
            contactNumber,
            availability,
            licenseNumber,
            category,
        } = req.body;

        console.log( name,
            img,
            location,
            language,
            experience,
            contactNumber,
            availability,
            licenseNumber,
            category
        )

        const missingFields = [];
        if (!language) missingFields.push("language");
        if (experience == null) missingFields.push("experience");
        if (!contactNumber) missingFields.push("contactNumber");
        if (!availability) missingFields.push("availability");
        if (!licenseNumber) missingFields.push("licenseNumber");
        if (!category) missingFields.push("category");
        
        else if (!Array.isArray(category)) {
            return res.status(400).json({ message: "Category must be an array." });
        }

        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing fields: ${missingFields.join(", ")}` });
        }

        // Validate license number format
        if (!LICENSE_PATTERN.test(String(licenseNumber || '').toUpperCase())) {
            return res.status(400).json({ message: "Invalid license number format." });
        }

        const existingGuide = await TouristGuide.findOne({
            $or: [{ userId: user._id }, { contactNumber, licenseNumber }],
        });
        if (existingGuide) {
            return res.status(400).json({ message: "User is already registered as a tourist guide." });
        }

        // Update user role (match enum in model)
        if (user.role !== "tourist guide") {
            user.role = "tourist guide";
            await user.save();
        }

        const newGuide = new TouristGuide({
            userId: user._id,
            name: name || user.username || "",
            email: user.email,
            img: img || user.img || "",
            location: location || user.city || user.country || "",
            language,
            experience,
            contactNumber,
            availability,
            licenseNumber,
            category,
        });

        const savedGuide = await newGuide.save();
        res.status(201).json(savedGuide);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Duplicate entry detected.", error: err.keyValue });
        }
        next(err);
    }
};

// UPDATE a tourist guide
export const updateTouristGuide = async (req, res, next) => {
    try {
        delete req.body.userId;
        delete req.body.email;

        if (req.body.licenseNumber && !LICENSE_PATTERN.test(String(req.body.licenseNumber).toUpperCase())) {
            return res.status(400).json({ message: "Invalid license number format." });
        }

        // Prevent duplicate contactNumber + licenseNumber
        if (req.body.contactNumber || req.body.licenseNumber) {
            const guideWithSameInfo = await TouristGuide.findOne({
                _id: { $ne: req.params.id },
                contactNumber: req.body.contactNumber || undefined,
                licenseNumber: req.body.licenseNumber || undefined
            });
            if (guideWithSameInfo) {
                return res.status(400).json({ message: "Contact number or license number already exists." });
            }
        }

        const updated = await TouristGuide.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: "Guide not found." });
        res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
};

// DELETE a tourist guide
export const deleteTouristGuide = async (req, res, next) => {
    try {
        const deleted = await TouristGuide.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Guide not found." });
        res.status(200).json({ message: "Tourist guide deleted successfully." });
    } catch (err) {
        next(err);
    }
};

// GET a single tourist guide
export const getTouristGuide = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid guide id" });
        }
        const guide = await TouristGuide.findById(req.params.id)
            .populate("userId", "username role");
        if (!guide) return res.status(404).json({ message: "Guide not found." });
        res.status(200).json(guide);
    } catch (err) {
        if (err?.name === 'CastError') {
            return res.status(400).json({ message: "Invalid guide id" });
        }
        next(err);
    }
};

// GET all tourist guides
export const getAllTouristGuides = async (req, res, next) => {
    try {
        const guides = await TouristGuide.find()
            .populate("userId", "username role");
        // Return empty array with 200 to keep admin list UX consistent
        res.status(200).json(Array.isArray(guides) ? guides : []);
    } catch (err) {
        next(err);
    }
};
