import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../../../components/navbar/Navbar";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import "./TouristGuideDashboard.scss";

const TouristGuideDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const navigate = useNavigate();

    // Sample data for demonstration
    const [upcomingTours, setUpcomingTours] = useState([
        { id: 1, name: "Historical City Tour", date: "2023-08-15", time: "10:00 AM", participants: 8, status: "confirmed" },
        { id: 2, name: "Mountain Hike", date: "2023-08-17", time: "8:00 AM", participants: 5, status: "confirmed" },
        { id: 3, name: "Wine Tasting Experience", date: "2023-08-20", time: "3:00 PM", participants: 6, status: "pending" }
    ]);

    const [reviews, setReviews] = useState([
        { id: 1, user: "Sarah Johnson", rating: 5, comment: "Amazing tour guide! Very knowledgeable.", date: "2023-08-10" },
        { id: 2, user: "Michael Brown", rating: 4, comment: "Great experience, would recommend.", date: "2023-08-05" },
        { id: 3, user: "Emily Davis", rating: 5, comment: "Best guide we've ever had!", date: "2023-07-28" }
    ]);

    const [earnings, setEarnings] = useState({
        total: 2450,
        upcoming: 780,
        lastMonth: 1870
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
        setLoading(false);
    }, []);

    const handleEditProfile = () => {
        navigate("/guide-profile/edit");
    };

    const handleViewTour = (tourId) => {
        navigate(`/tour/${tourId}`);
    };

    const handleAddNewTour = () => {
        navigate("/create-tour");
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            <Navbar />
            <Header />
            <div className="tourist-guide-dashboard">
                <div className="dashboard-header">
                    <div className="welcome-section">
                        <h1>Welcome back, {user.username}!</h1>
                        <p>Here's what's happening with your tours today.</p>
                    </div>
                    <button className="edit-profile-btn" onClick={handleEditProfile}>
                        <i className="fas fa-user-edit"></i> Edit Profile
                    </button>
                </div>

                <div className="stats-cards">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fas fa-calendar-check"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{upcomingTours.length}</h3>
                            <p>Upcoming Tours</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fas fa-star"></i>
                        </div>
                        <div className="stat-info">
                            <h3>4.8</h3>
                            <p>Average Rating</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fas fa-users"></i>
                        </div>
                        <div className="stat-info">
                            <h3>42</h3>
                            <p>Total Clients</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fas fa-dollar-sign"></i>
                        </div>
                        <div className="stat-info">
                            <h3>${earnings.total}</h3>
                            <p>Total Earnings</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-tabs">
                    <button 
                        className={activeTab === "overview" ? "tab-active" : ""}
                        onClick={() => setActiveTab("overview")}
                    >
                        <i className="fas fa-chart-pie"></i> Overview
                    </button>
                    <button 
                        className={activeTab === "tours" ? "tab-active" : ""}
                        onClick={() => setActiveTab("tours")}
                    >
                        <i className="fas fa-route"></i> My Tours
                    </button>
                    <button 
                        className={activeTab === "reviews" ? "tab-active" : ""}
                        onClick={() => setActiveTab("reviews")}
                    >
                        <i className="fas fa-star"></i> Reviews
                    </button>
                    <button 
                        className={activeTab === "earnings" ? "tab-active" : ""}
                        onClick={() => setActiveTab("earnings")}
                    >
                        <i className="fas fa-chart-line"></i> Earnings
                    </button>
                </div>

                <div className="dashboard-content">
                    {activeTab === "overview" && (
                        <div className="overview-tab">
                            <div className="upcoming-tours">
                                <h2>Upcoming Tours</h2>
                                <button className="add-tour-btn" onClick={handleAddNewTour}>
                                    <i className="fas fa-plus"></i> Add New Tour
                                </button>
                                
                                <div className="tours-list">
                                    {upcomingTours.map(tour => (
                                        <div key={tour.id} className="tour-card">
                                            <div className="tour-info">
                                                <h3>{tour.name}</h3>
                                                <p><i className="fas fa-calendar"></i> {tour.date} at {tour.time}</p>
                                                <p><i className="fas fa-users"></i> {tour.participants} participants</p>
                                            </div>
                                            <div className="tour-actions">
                                                <span className={`status-badge ${tour.status}`}>{tour.status}</span>
                                                <button onClick={() => handleViewTour(tour.id)}>View Details</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="reviews-preview">
                                <h2>Recent Reviews</h2>
                                <div className="reviews-list">
                                    {reviews.slice(0, 2).map(review => (
                                        <div key={review.id} className="review-item">
                                            <div className="review-header">
                                                <h4>{review.user}</h4>
                                                <div className="rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        <i 
                                                            key={i} 
                                                            className={`fas fa-star ${i < review.rating ? 'active' : ''}`}
                                                        ></i>
                                                    ))}
                                                </div>
                                            </div>
                                            <p>{review.comment}</p>
                                            <span className="review-date">{review.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === "tours" && (
                        <div className="tours-tab">
                            <h2>My Tours</h2>
                            <div className="tours-controls">
                                <div className="search-box">
                                    <i className="fas fa-search"></i>
                                    <input type="text" placeholder="Search tours..." />
                                </div>
                                <button className="add-tour-btn" onClick={handleAddNewTour}>
                                    <i className="fas fa-plus"></i> Add New Tour
                                </button>
                            </div>
                            <div className="tours-table">
                                <div className="table-header">
                                    <div>Tour Name</div>
                                    <div>Date</div>
                                    <div>Participants</div>
                                    <div>Status</div>
                                    <div>Actions</div>
                                </div>
                                {upcomingTours.map(tour => (
                                    <div key={tour.id} className="table-row">
                                        <div>{tour.name}</div>
                                        <div>{tour.date} at {tour.time}</div>
                                        <div>{tour.participants}</div>
                                        <div><span className={`status-badge ${tour.status}`}>{tour.status}</span></div>
                                        <div>
                                            <button className="action-btn view" onClick={() => handleViewTour(tour.id)}>
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button className="action-btn edit">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button className="action-btn delete">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {activeTab === "reviews" && (
                        <div className="reviews-tab">
                            <h2>Customer Reviews</h2>
                            <div className="reviews-summary">
                                <div className="average-rating">
                                    <h3>4.8</h3>
                                    <div className="stars">
                                        {[...Array(5)].map((_, i) => (
                                            <i key={i} className="fas fa-star active"></i>
                                        ))}
                                    </div>
                                    <p>Based on 24 reviews</p>
                                </div>
                                <div className="rating-bars">
                                    <div className="rating-bar">
                                        <span>5 stars</span>
                                        <div className="bar">
                                            <div className="fill" style={{width: '80%'}}></div>
                                        </div>
                                        <span>80%</span>
                                    </div>
                                    <div className="rating-bar">
                                        <span>4 stars</span>
                                        <div className="bar">
                                            <div className="fill" style={{width: '15%'}}></div>
                                        </div>
                                        <span>15%</span>
                                    </div>
                                    <div className="rating-bar">
                                        <span>3 stars</span>
                                        <div className="bar">
                                            <div className="fill" style={{width: '5%'}}></div>
                                        </div>
                                        <span>5%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="all-reviews">
                                {reviews.map(review => (
                                    <div key={review.id} className="review-card">
                                        <div className="reviewer-info">
                                            <div className="avatar">
                                                <i className="fas fa-user"></i>
                                            </div>
                                            <div>
                                                <h4>{review.user}</h4>
                                                <div className="rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        <i 
                                                            key={i} 
                                                            className={`fas fa-star ${i < review.rating ? 'active' : ''}`}
                                                        ></i>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p>{review.comment}</p>
                                        <span className="review-date">{review.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {activeTab === "earnings" && (
                        <div className="earnings-tab">
                            <h2>Earnings Overview</h2>
                            <div className="earnings-cards">
                                <div className="earning-card">
                                    <h3>Total Earnings</h3>
                                    <p className="amount">${earnings.total}</p>
                                    <span className="period">All time</span>
                                </div>
                                <div className="earning-card">
                                    <h3>Upcoming</h3>
                                    <p className="amount">${earnings.upcoming}</p>
                                    <span className="period">Next 30 days</span>
                                </div>
                                <div className="earning-card">
                                    <h3>Last Month</h3>
                                    <p className="amount">${earnings.lastMonth}</p>
                                    <span className="period">July 2023</span>
                                </div>
                            </div>
                            
                            <div className="earnings-chart">
                                <h3>Earnings History</h3>
                                <div className="chart-placeholder">
                                    <p>Earnings chart visualization would appear here</p>
                                </div>
                            </div>
                            
                            <div className="transactions">
                                <h3>Recent Transactions</h3>
                                <div className="transactions-list">
                                    <div className="transaction">
                                        <div className="transaction-info">
                                            <h4>Historical City Tour</h4>
                                            <p>August 10, 2023</p>
                                        </div>
                                        <div className="transaction-amount">$120</div>
                                    </div>
                                    <div className="transaction">
                                        <div className="transaction-info">
                                            <h4>Mountain Hike</h4>
                                            <p>August 5, 2023</p>
                                        </div>
                                        <div className="transaction-amount">$90</div>
                                    </div>
                                    <div className="transaction">
                                        <div className="transaction-info">
                                            <h4>Wine Tasting Experience</h4>
                                            <p>July 28, 2023</p>
                                        </div>
                                        <div className="transaction-amount">$150</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default TouristGuideDashboard;