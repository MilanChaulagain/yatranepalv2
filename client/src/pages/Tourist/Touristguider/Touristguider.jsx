import React, { useState } from "react";
import axios from "axios";
import "./Touristguider.css";
import Navbar from "../../../components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import { useNavigate } from "react-router-dom";

// Add this license number pattern validation
const licenseNumberPattern = /^[A-Z0-9]+$/; // Allows uppercase letters, numbers, and hyphens

const categoryOptions = [
    "Adventure",
    "Cultural",
    "Historical",
    "Wildlife",
    "Religious",
    "Eco-tourism",
    "Trekking",
    "Local Experience",
];

const TouristGuideForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        location: "",
        language: "",
        experience: "",
        contactNumber: "",
        availability: "",
        licenseNumber: "",
        category: [],
        image: "",
    });

    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        const updated = checked
            ? [...formData.category, value]
            : formData.category.filter((cat) => cat !== value);
        setFormData((prev) => ({ ...prev, category: updated }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };
    const uploadToCloudinary = async () => {
        if (!imageFile) return "";
        const data = new FormData();
        data.append("file", imageFile);
        data.append("", "");

        const res = await axios.post(
            data
        );

        return res.data.secure_url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const licenseTrimmed = formData.licenseNumber.trim();

        if (!licenseNumberPattern.test(licenseTrimmed)) {
            alert("Invalid license number format");
            return;
        }

        setUploading(true);

        try {
            let imageUrl = "";
            if (imageFile) {
                imageUrl = await uploadToCloudinary();
            }

            const payload = {
                ...formData,
                experience: Number(formData.experience),
                licenseNumber: licenseTrimmed,
                image: imageUrl,
            };

            await axios.post("http://localhost:8800/api/touristguide/register", payload, {
                withCredentials: true,
            });

            alert("Tourist guide registered successfully!");
            navigate("/touristguide-dashboard");

            // Reset form
            setFormData({
                name: "",
                email: "",
                location: "",
                language: "",
                experience: "",
                contactNumber: "",
                availability: "",
                licenseNumber: "",
                category: [],
                image: "",
            });
            setImageFile(null);
            setPreview(null);
        } catch (err) {
            console.error(err);
            alert("Registration failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <Navbar />
            <form className="tourist-guide-form" onSubmit={handleSubmit}>
                <h2>Create Tourist Guide Account</h2>

                <div className="tourist-form-row">
                    <div className="tourist-form-group">
                        <label>Upload Profile Image</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                        {preview && <img src={preview} alt="Preview" className="image-preview" />}
                    </div>

                    <div className="tourist-form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            onChange={handleInputChange}
                            value={formData.name}
                        />
                    </div>

                    <div className="tourist-form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            onChange={handleInputChange}
                            value={formData.email}
                        />
                    </div>
                </div>

                <div className="tourist-form-row">
                    <div className="tourist-form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            required
                            onChange={handleInputChange}
                            value={formData.location}
                        />
                    </div>

                    <div className="tourist-form-group">
                        <label>Language</label>
                        <input
                            type="text"
                            name="language"
                            required
                            onChange={handleInputChange}
                            value={formData.language}
                        />
                    </div>

                    <div className="tourist-form-group">
                        <label>Experience (years)</label>
                        <input
                            type="number"
                            name="experience"
                            required
                            min={0}
                            onChange={handleInputChange}
                            value={formData.experience}
                        />
                    </div>
                </div>

                <div className="tourist-form-row">
                    <div className="tourist-form-group">
                        <label>Contact Number</label>
                        <input
                            type="tel"
                            name="contactNumber"
                            required
                            onChange={handleInputChange}
                            value={formData.contactNumber}
                        />
                    </div>

                    <div className="tourist-form-group">
                        <label>Availability</label>
                        <input
                            type="text"
                            name="availability"
                            required
                            onChange={handleInputChange}
                            value={formData.availability}
                        />
                    </div>

                    <div className="tourist-form-group">
                        <label>License Number</label>
                        <input
                            type="text"
                            name="licenseNumber"
                            required
                            onChange={handleInputChange}
                            value={formData.licenseNumber}
                        />
                    </div>
                </div>

                <div className="tourist-form-row">
                    <div className="tourist-form-group">
                        <label>Select Categories</label>
                        <div className="tourist-category-checkboxes">
                            {categoryOptions.map((cat) => (
                                <label key={cat}>
                                    <input
                                        type="checkbox"
                                        value={cat}
                                        checked={formData.category.includes(cat)}
                                        onChange={handleCategoryChange}
                                    />
                                    {cat}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={uploading}>
                    {uploading ? "Uploading..." : "Create Guide"}
                </button>
            </form>
            <Footer />
        </>
    );
};

export default TouristGuideForm;
