import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Navigation, ArrowLeft, Info } from "lucide-react";
import useFetch from "../../hooks/useFetch";
import "./hotelDetails.css";
import Navbar from "../../components/navbar/Navbar";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8800";

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(`${BASE_URL}/api/hotels/${id}`);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(location);
            setLocationError("");
            resolve(location);
          },
          (err) => {
            const errorMsg = `Location access denied: ${err.message}`;
            setLocationError(errorMsg);
            reject(errorMsg);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        const errorMsg = "Geolocation is not supported by your browser";
        setLocationError(errorMsg);
        reject(errorMsg);
      }
    });
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here you would typically make an API call to save to favorites
  };

  const handleGetDirections = async () => {
    try {
      if (!data?.name) {
        throw new Error("Hotel name not available");
      }
      const currentLocation = userLocation || await getUserLocation();
      // Use hotel name for destination in Google Maps
      const destination = encodeURIComponent(data.name + (data.city ? ", " + data.city : ""));
      const origin = currentLocation ? `${currentLocation.lat},${currentLocation.lng}` : "";
      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      // Fallback: search by hotel name
      if (data?.name) {
        const destination = encodeURIComponent(data.name + (data.city ? ", " + data.city : ""));
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${destination}`,
          "_blank",
          "noopener,noreferrer"
        );
      }
      setLocationError(err.message);
    }
  };

  if (loading) return <div className="hotelDetails-loading">Loading hotel details...</div>;
  if (error || !data) return <div className="hotelDetails-error">Error loading hotel details.</div>;

  return (

    <>
        <Navbar />
    <div className="hotelDetails-container">
              
      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back to Stays
      </button>

      <div className="hotelDetails-header">
        <h1 className="hotelDetails-name">{data.name}</h1>
        <span className="hotelDetails-type">{data.type}</span>
        <span className="hotelDetails-city">{data.city}</span>
        {data.cheapestPrice && (
            <span className="hotelDetails-price">From NPR {data.cheapestPrice} / night</span>
        )}
      </div>


      <div className="hotelDetails-actions">
        <button
          className={`favorite-button ${isFavorite ? "active" : ""}`}
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
          {isFavorite ? "Saved" : "Save"}
        </button>
      </div>

      {/* Embedded Google Maps for hotel location or search by name */}
      <div style={{ width: "100%", height: "350px", marginBottom: "24px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(67, 97, 238, 0.08)" }}>
        {data?.location?.coordinates ? (
          (() => {
            const [lng, lat] = data.location.coordinates;
            return (
              <iframe
                title="Hotel Location Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`}
              />
            );
          })()
        ) : (
          <iframe
            title="Hotel Location Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(data.name + (data.city ? ", " + data.city : ""))}&hl=en&z=15&output=embed`}
          />
        )}
      </div>

      {locationError && (
        <div className="location-error">
          <Info size={16} />
          <p>{locationError}</p>
        </div>
      )}

      <div className="hotelDetails-images">
        {Array.isArray(data.photos) && data.photos.length > 0 ? (
            data.photos.map((photo, idx) => (
                <img key={idx} src={photo} alt={`Hotel ${data.name} ${idx + 1}`} className="hotelDetails-image" />
            ))
        ) : (
          <img src="https://via.placeholder.com/400x250?text=No+Image" alt="No hotel" className="hotelDetails-image" />
        )}
      </div>

      <div className="hotelDetails-desc">
        <h2>Description</h2>
        <p>{data.desc || "No description available."}</p>
      </div>

      {/* You can add reviews, tips, and more info here similar to PlaceDetails */}
    </div>
</>
  );
};

export default HotelDetails;
