"use client"
import React, { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Upload, User, Mail, MapPin, Phone, Lock } from "lucide-react"
import axios from "axios"

import "./register.css"
import { AuthContext } from "../../context/AuthContext"
import Navbar from "../../components/navbar/Navbar"

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        country: "",
        city: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [localError, setLocalError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const { dispatch } = useContext(AuthContext)
    const navigate = useNavigate()

    const countries = ["Nepal", "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Japan", "Brazil", "India", "China", "Mexico", "Italy", "Spain", "Netherlands", "Sweden", "Norway", "Denmark", "Finland"]

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const uploadImageToCloudinary = async () => {
        if (!imageFile) return "";
        
        console.log("Image upload functionality not configured yet");

        // Return empty string for now - user will be registered without image
        return "";
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLocalError("")
        setIsLoading(true)

        // Client-side validations
        if (formData.password !== formData.confirmPassword) {
            setLocalError("Passwords do not match.")
            setIsLoading(false)
            return
        }
        if (formData.password.length < 8) {
            setLocalError("Password must be at least 8 characters long.")
            setIsLoading(false)
            return
        }

        try {
            console.log("Starting registration process...")
            // Clear old token from localStorage
            // localStorage.removeItem("token");
            // localStorage.removeItem("user");
            let imageUrl = ""
            if (imageFile) {
                console.log("Uploading image...")
                imageUrl = await uploadImageToCloudinary()
                console.log("Image upload result:", imageUrl ? "success" : "skipped")
            }

            // Send registration request
            console.log("Sending registration request...")
            const registerResponse = await axios.post(
                "http://localhost:8800/api/auth/register", 
                {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    city: formData.city,
                    country: formData.country,
                    img: imageUrl
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

            console.log("Registration successful:", registerResponse.data)

            // Auto-login after registration
            console.log("Attempting auto-login...")
            const loginRes = await axios.post(
                "http://localhost:8800/api/auth/login", 
                {
                    username: formData.username,
                    password: formData.password
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

            console.log("Login successful:", loginRes.data)

            // Save user data and token
            if (loginRes.data.details) {
                localStorage.setItem("user", JSON.stringify(loginRes.data.details))
            }
            if (loginRes.data.token) {
                localStorage.setItem("token", loginRes.data.token)
            }

            // Update auth context
            dispatch({ type: "LOGIN_SUCCESS", payload: loginRes.data.details })
            
            alert("Registration and login successful!")
            navigate("/")
            
        } catch (err) {
            console.error("Registration error:", err)
            console.error("Error response:", err.response?.data)
            
            let errorMessage = "Registration failed. Please try again."
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message
            } else if (err.message) {
                errorMessage = err.message
            }

            if (errorMessage.toLowerCase().includes("username")) {
                setLocalError("Username is already taken.")
            } else if (errorMessage.toLowerCase().includes("email")) {
                setLocalError("Email is already registered.")
            } else if (errorMessage.toLowerCase().includes("cors")) {
                setLocalError("Network error. Please check if the server is running.")
            } else {
                setLocalError(errorMessage)
            }
            
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <Navbar />
            <div className="register-container">
                <div className="register-card">
                    <div className="register-header">
                        <h1 className="register-title">Create Account</h1>
                        <p className="register-description">Fill in your information to register for an account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="register-form">
                        {/* Profile Image */}
                        <div className="profile-upload-container">
                            <div className="profile-image-wrapper">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile preview" className="profile-image" />
                                ) : (
                                    <div className="profile-placeholder">
                                        <User className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                                <label htmlFor="img" className="profile-upload-button">
                                    <Upload size={16} />
                                </label>
                                <input
                                    id="img"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="profile-upload-input"
                                />
                            </div>
                            <label htmlFor="img" className="profile-upload-label">
                                <Upload size={16} /> Upload Profile Image
                            </label>
                        </div>

                        {/* Username & Email */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="username" className="form-label"><User size={16} /> Username *</label>
                                <input 
                                    id="username" 
                                    type="text" 
                                    placeholder="Enter your username" 
                                    value={formData.username} 
                                    onChange={handleChange} 
                                    required 
                                    className="form-input" 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email" className="form-label"><Mail size={16} /> Email *</label>
                                <input 
                                    id="email" 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                    className="form-input" 
                                />
                            </div>
                        </div>

                        {/* Country & City */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="country" className="form-label"><MapPin size={16} /> Country *</label>
                                <select 
                                    id="country" 
                                    value={formData.country} 
                                    onChange={handleChange} 
                                    required 
                                    className="form-select"
                                >
                                    <option value="">Select your country</option>
                                    {countries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="city" className="form-label"><MapPin size={16} /> City *</label>
                                <input 
                                    id="city" 
                                    type="text" 
                                    placeholder="Enter your city" 
                                    value={formData.city} 
                                    onChange={handleChange} 
                                    required 
                                    className="form-input" 
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="form-group">
                            <label htmlFor="phone" className="form-label"><Phone size={16} /> Phone Number *</label>
                            <input 
                                id="phone" 
                                type="tel" 
                                placeholder="Enter your phone number" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                required 
                                className="form-input" 
                            />
                        </div>

                        {/* Password & Confirm */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password" className="form-label"><Lock size={16} /> Password *</label>
                                <div className="password-container">
                                    <input 
                                        id="password" 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="Enter your password" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        required 
                                        minLength={8} 
                                        className="form-input" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className="password-toggle"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label"><Lock size={16} /> Confirm Password *</label>
                                <div className="password-container">
                                    <input 
                                        id="confirmPassword" 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        placeholder="Confirm your password" 
                                        value={formData.confirmPassword} 
                                        onChange={handleChange} 
                                        required 
                                        minLength={8} 
                                        className="form-input" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                        className="password-toggle"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Errors */}
                        {localError && (
                            <div className="error-text">
                                {localError}
                            </div>
                        )}

                        {/* Submit */}
                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="submit-button"
                        >
                            {isLoading ? (
                                <div>
                                    Creating Account...
                                </div>
                            ) : (
                                "Create Account"
                            )}
                        </button>

                        <div className="login-link-container">
                            Already have an account?{" "}
                            <button
                                onClick={() => navigate("/login")}
                                className="login-link"
                            >
                                Sign in here
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage