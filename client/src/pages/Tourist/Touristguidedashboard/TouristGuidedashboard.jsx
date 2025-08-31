
import React from "react";
import Navbar from "../../../components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import "./touristguidedashboard.css";

const TouristGuideDashboard = () => {
  return (
    <>
      <Navbar />
      <div className="tourist-guide-dashboard">
        <h2>Welcome to the Tourist Guide Dashboard</h2>
        <p>Here you can manage your profile, view bookings, and more features coming soon.</p>
        {/* Add dashboard widgets, stats, and actions here */}
      </div>
      <Footer />
    </>
  );
};

export default TouristGuideDashboard;
