import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaPhoneAlt, FaClock, FaStar, FaWater, FaWhatsapp } from "react-icons/fa";
import { GiMountainCave, GiElephant } from "react-icons/gi";
import { MdTempleBuddhist } from "react-icons/md";
import { PiTShirtFill } from "react-icons/pi";
import { GiNoodles } from "react-icons/gi";
import { FaMoneyBillWave } from "react-icons/fa";
import { GiHiking } from "react-icons/gi";
import { BsFillCalendarEventFill } from "react-icons/bs";
import Navbar from "../../../components/navbar/Navbar";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import "./touristuser.css";

// Add this line to define BASE_URL
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8800";

// Star Rating Component
const StarRating = ({ rating, size = 16, reviewCount = 0 }) => {
  if (rating === null || rating === undefined) return null;
  
  return (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => (
        <FaStar
          key={index}
          size={size}
          style={{
            fill: index < Math.floor(rating) ? "#FFD700" : "#ccc",
            color: index < Math.floor(rating) ? "#FFD700" : "#ccc"
          }}
        />
      ))}
      <span className="rating-text">({rating.toFixed(1)}{reviewCount > 0 ? `, ${reviewCount} reviews` : ''})</span>
    </div>
  );
};

// Review Component for Guides
const GuideReviewSection = ({ guideId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(null);

  useEffect(() => {
    const fetchReviewData = async () => {
      if (!guideId) return;
      
      setLoading(true);
      try {
        // Get all reviews and filter for this guide
        const reviewsResponse = await fetch(`${BASE_URL}/api/review/`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          
          // Handle different response structures
          let allReviews = [];
          if (Array.isArray(reviewsData)) {
            allReviews = reviewsData;
          } else if (reviewsData.data && Array.isArray(reviewsData.data)) {
            allReviews = reviewsData.data;
          }
          
          // Filter reviews for this specific guide
          const guideReviews = allReviews.filter(review => 
            review.reviewedItem && 
            review.reviewedItem._id === guideId && 
            review.reviewedModel === "TouristGuide"
          );
          
          setReviews(guideReviews);
          
          // Calculate average rating
          if (guideReviews.length > 0) {
            const totalRating = guideReviews.reduce((sum, review) => sum + review.rating, 0);
            setAverageRating(totalRating / guideReviews.length);
          } else {
            setAverageRating(null);
          }
        } else {
          console.error("Failed to fetch reviews:", reviewsResponse.status);
        }
      } catch (error) {
        console.error("Error fetching review data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, [guideId]);

  if (loading) return <div className="reviews-loading">Loading reviews...</div>;
  
  return (
    <div className="guide-reviews-section">
      {averageRating !== null ? (
        <div className="guide-average-rating">
          <StarRating rating={averageRating} size={14} reviewCount={reviews.length} />
        </div>
      ) : (
        <div className="no-reviews-text">No reviews yet</div>
      )}
    </div>
  );
};

const UserDashboard = () => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("guides");
    const [showContactOptions, setShowContactOptions] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGuides = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/touristguide`, {
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                setGuides(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGuides();
    }, []);

    const handleWhatsAppClick = (phoneNumber) => {
        const cleanedNumber = phoneNumber.replace(/\D/g, '');
        const formattedNumber = cleanedNumber.startsWith('977') ? cleanedNumber :
            cleanedNumber.startsWith('9') ? `977${cleanedNumber}` :
                `977${cleanedNumber}`;
        window.open(`https://wa.me/${formattedNumber}`, '_blank');
    };


    const toggleContactOptions = (guideId) => {
        setShowContactOptions(showContactOptions === guideId ? null : guideId);
    };

    return (
        <>
            <Navbar />
            <Header />
            <div className="touristuser-dashboard">
                <div className="touristuser-hero">
                    <h1>Discover Nepal with Expert Guides</h1>
                    <p>Experience the Himalayas like never before with our certified local guides</p>
                </div>

                <div className="touristuser-tabs">
                    {["guides", "attractions", "tips", "events"].map((tab) => (
                        <button
                            key={tab}
                            className={`touristuser-tab ${activeTab === tab ? "touristuser-tab-active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Guides Section */}
                {activeTab === "guides" && (
                    <section className="touristuser-section touristuser-guides-section">
                        <div className="touristuser-section-header">
                            <h2>Available Tourist Guides</h2>
                            <div className="touristuser-filters">
                                <select className="touristuser-select">
                                    <option>Sort by Experience</option>
                                    <option>Sort by Rating</option>
                                </select>
                                <select className="touristuser-select">
                                    <option>All Locations</option>
                                    <option>Kathmandu</option>
                                    <option>Lalitpur</option>
                                    <option>Bhaktapur</option>
                                </select>
                            </div>
                        </div>
                        {loading ? (
                            <div className="touristuser-loading">
                                <div className="touristuser-spinner"></div>
                                <p>Loading guides...</p>
                            </div>
                        ) : error ? (
                            <p className="touristuser-error">Error: {error}</p>
                        ) : guides.length === 0 ? (
                            <p className="touristuser-no-guides">No guides available at the moment.</p>
                        ) : (
                            <div className="touristuser-guide-cards">
                                {guides.map((guide) => (
                                    <div className="touristuser-guide-card" key={guide._id}>
                                        <div className="touristuser-guide-image">
                                            {guide.img && (
                                                <img
                                                    src={guide.img}
                                                    alt={guide.name}
                                                />
                                            )}
                                            <div className="touristuser-guide-rating">
                                                <GuideReviewSection guideId={guide._id} />
                                            </div>
                                        </div>
                                        <div className="touristuser-guide-info">
                                            <div className="touristuser-guide-header">
                                                <h4>{guide.name}</h4>
                                                <div className="touristuser-guide-experience">
                                                    {guide.experience} years
                                                </div>
                                            </div>
                                            <div className="touristuser-guide-meta">
                                                <div className="touristuser-guide-location">
                                                    <FaMapMarkerAlt /> {guide.location}
                                                </div>
                                                <div className="touristuser-guide-availability">
                                                    <FaClock /> {guide.availability}
                                                </div>
                                            </div>
                                            <p className="touristuser-guide-languages">
                                                <strong>Languages:</strong> {guide.language}
                                            </p>
                                            <div className="touristuser-guide-categories">
                                                {guide.category.map((cat, index) => (
                                                    <span key={index} className="touristuser-category-badge">{cat}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="touristuser-guide-footer">
                                            <div className="touristuser-guide-contact">
                                                <FaPhoneAlt /> {guide.contactNumber}
                                            </div>
                                            <div className="touristuser-contact-options-container">
                                                <button
                                                    className="touristuser-contact-button"
                                                    onClick={() => toggleContactOptions(guide._id)}
                                                >
                                                    Contact Guide
                                                </button>

                                                {showContactOptions === guide._id && (
                                                    <div className="touristuser-contact-options">
                                                        <button
                                                            className="touristuser-chat-option"
                                                            onClick={() => {
                                                                navigate(`/chat/${guide._id}`, { state: { guide } });
                                                                setShowContactOptions(null);
                                                            }}
                                                        >
                                                            Chat here
                                                        </button>
                                                        <button
                                                            className="touristuser-whatsapp-option"
                                                            onClick={() => {
                                                                handleWhatsAppClick(guide.contactNumber);
                                                                setShowContactOptions(null);
                                                            }}
                                                        >
                                                            <FaWhatsapp /> WhatsApp
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Attractions Section */}
                {activeTab === "attractions" && (
                    <section className="touristuser-section touristuser-attractions-section">
                        <h2>Top Attractions in Nepal</h2>
                        <div className="touristuser-attraction-grid">
                            <div className="touristuser-attraction-card">
                                <div className="touristuser-attraction-image" style={{ backgroundImage: "url('https://i.natgeofe.com/n/2dc54f0a-0786-4593-86b3-fd06a50d1851/everest-basecamp-life-er-camp.jpg')" }}></div>
                                <h3>Mount Everest Base Camp</h3>
                                <p>Journey to the base of the world's highest mountain</p>
                                <div className="touristuser-attraction-stats">
                                    <span><GiMountainCave /> Trekking</span>
                                    <span className="attraction-rating"><StarRating rating={4.9} size={14} reviewCount={1200} /></span>
                                </div>
                            </div>
                            <div className="touristuser-attraction-card">
                                <div className="touristuser-attraction-image" style={{ backgroundImage: "url('https://dynamic-media-cdn.tripadvisor.com/media/photo-o/13/4a/95/ac/pashupatinath-is-the.jpg?w=900&h=500&s=1')" }}></div>
                                <h3>Pashupatinath Temple</h3>
                                <p>Sacred Hindu temple complex on the banks of the Bagmati River</p>
                                <div className="touristuser-attraction-stats">
                                    <span><MdTempleBuddhist /> Cultural</span>
                                    <span className="attraction-rating"><StarRating rating={4.7} size={14} reviewCount={850} /></span>
                                </div>
                            </div>
                            <div className="touristuser-attraction-card">
                                <div className="touristuser-attraction-image" style={{ backgroundImage: "url('https://accessnepaltour.com/wp-content/uploads/2023/12/lake-5903329-2-scaled-1.jpg')" }}></div>
                                <h3>Pokhara Lakeside</h3>
                                <p>Beautiful lakes with stunning views of the Annapurna range</p>
                                <div className="touristuser-attraction-stats">
                                    <span><FaWater /> Nature</span>
                                    <span className="attraction-rating"><StarRating rating={4.8} size={14} reviewCount={1100} /></span>
                                </div>
                            </div>
                            <div className="touristuser-attraction-card">
                                <div className="touristuser-attraction-image" style={{ backgroundImage: "url('https://www.greenparkchitwan.com/storage/posts/August2022/chitwan%20national%20park.png')" }}></div>
                                <h3>Chitwan National Park</h3>
                                <p>UNESCO World Heritage site with diverse wildlife</p>
                                <div className="touristuser-attraction-stats">
                                    <span><GiElephant /> Wildlife</span>
                                    <span className="attraction-rating"><StarRating rating={4.6} size={14} reviewCount={930} /></span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Travel Tips Section */}
                {activeTab === "tips" && (
                    <section className="touristuser-section touristuser-tips-section">
                        <h2>Essential Travel Tips</h2>
                        <div className="touristuser-tips-container">
                            <div className="touristuser-tip-card">
                                <div className="touristuser-tip-icon"><PiTShirtFill /></div>
                                <h3>Dress Appropriately</h3>
                                <p>Respect local customs by dressing modestly, especially near religious sites.</p>
                            </div>
                            <div className="touristuser-tip-card">
                                <div className="touristuser-tip-icon"><GiNoodles /></div>
                                <h3>Try Local Cuisine</h3>
                                <p>Don't miss traditional Nepali food like momo and dal bhat.</p>
                            </div>
                            <div className="touristuser-tip-card">
                                <div className="touristuser-tip-icon"><FaMoneyBillWave /></div>
                                <h3>Carry Cash</h3>
                                <p>Cash is essential in rural areas where card access is limited.</p>
                            </div>
                            <div className="touristuser-tip-card">
                                <div className="touristuser-tip-icon"><GiHiking /></div>
                                <h3>Hire Certified Guides</h3>
                                <p>Always hire certified guides for trekking and mountain tours.</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Events Section */}
                {activeTab === "events" && (
                    <section className="touristuser-section touristuser-events-section">
                        <h2>Upcoming Festivals</h2>
                        <div className="touristuser-events-timeline">
                            <div className="touristuser-event">
                                <div className="touristuser-event-date">
                                    <span>OCT</span>
                                    <strong>5–19</strong>
                                </div>
                                <div className="touristuser-event-content">
                                    <h3><BsFillCalendarEventFill /> Dashain</h3>
                                    <p>Nepal's biggest festival celebrating the victory of gods over demons.</p>
                                </div>
                            </div>
                            <div className="touristuser-event">
                                <div className="touristuser-event-date">
                                    <span>NOV</span>
                                    <strong>9–13</strong>
                                </div>
                                <div className="touristuser-event-content">
                                    <h3><BsFillCalendarEventFill /> Tihar</h3>
                                    <p>Festival of lights honoring different animals each day.</p>
                                </div>
                            </div>
                            <div className="touristuser-event">
                                <div className="touristuser-event-date">
                                    <span>MAR</span>
                                    <strong>25</strong>
                                </div>
                                <div className="touristuser-event-content">
                                    <h3><BsFillCalendarEventFill /> Holi</h3>
                                    <p>Vibrant celebration with colored powders signifying good over evil.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
            <Footer />
        </>
    );
};

export default UserDashboard;