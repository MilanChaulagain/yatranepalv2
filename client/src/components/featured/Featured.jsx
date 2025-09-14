import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./featured.css";
import useFetch from '../../hooks/useFetch.js';

const Featured = () => {
  // Fetch all hotels
  const { data, loading, error } = useFetch("http://localhost:8800/api/hotels");
  const navigate = useNavigate();

  if (loading) return <div className="featured-loading">Loading...</div>;
  if (error) return <div className="featured-error">Error loading data — check console</div>;
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="featured-empty">No hotels found.</div>;
  }

  // Group hotels by city
  const cities = ["Kathmandu", "Lalitpur", "Bhaktapur"];
  const hotelsByCity = cities.map(city => ({
    city,
    hotels: data.filter(hotel => hotel.city === city)
  }));

  return (
    <div className="featured-grid">
      {hotelsByCity.map(({ city, hotels }) => (
        <div key={city} className="featured-city-section">
          <h2 className="featured-city-title">{city}</h2>
          <div className="hotel-cards-row">
            {hotels.length === 0 ? (
              <div className="no-hotels">No hotels found for {city}.</div>
            ) : (
              hotels.map(hotel => (
                <div
                  key={hotel._id}
                  className="hotel-card"
                  onClick={() => navigate(`/stays/${hotel._id}`)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${hotel.name}`}
                >
                  <div className="hotel-image-container">
                    <img
                      src={
                        Array.isArray(hotel.photos) && hotel.photos.length > 0
                          ? hotel.photos[0]
                          : "https://via.placeholder.com/200x140?text=No+Image"
                      }
                      alt={hotel.name}
                      className="hotel-image"
                    />
                  </div>
                  <div className="hotel-info">
                    <h3 className="hotel-name">{hotel.name}</h3>
                    <span className="hotel-type">{hotel.type}</span>
                    <span className="hotel-city">{hotel.city}</span>
                    {hotel.cheapestPrice && (
                      <span className="hotel-price">From NPR {hotel.cheapestPrice}</span>
                    )}
                    {hotel.desc && (
                      <p className="hotel-desc">{hotel.desc.length > 120 ? hotel.desc.slice(0, 120) + '...' : hotel.desc}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Featured;