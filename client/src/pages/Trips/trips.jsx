import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import "./trips.css"; // Import the CSS

export default function Trips() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [newTrip, setNewTrip] = useState({ name: "", description: "", startDate: "", endDate: "" });

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8800/api/trips/user", {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setTrips(res.data.data || []);
        } catch (err) {
            setError("Failed to load trips");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTrip = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:8800/api/trips", newTrip, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setShowCreate(false);
            setNewTrip({ name: "", description: "", startDate: "", endDate: "" });
            fetchTrips();
        } catch (err) {
            setError("Failed to create trip");
        }
    };

    return (
        <div>
            <Navbar />
            <Header />
            <div className="trips-container">
                <h1 className="trips-heading">My Trips</h1>
                <button className="create-trip-btn" onClick={() => setShowCreate(true)}>Create New Trip</button>
                {showCreate && (
                    <form className="create-trip-form" onSubmit={handleCreateTrip}>
                        <input type="text" placeholder="Trip Name" value={newTrip.name} onChange={e => setNewTrip({ ...newTrip, name: e.target.value })} required />
                        <input type="text" placeholder="Description" value={newTrip.description} onChange={e => setNewTrip({ ...newTrip, description: e.target.value })} />
                        <input type="date" value={newTrip.startDate} onChange={e => setNewTrip({ ...newTrip, startDate: e.target.value })} />
                        <input type="date" value={newTrip.endDate} onChange={e => setNewTrip({ ...newTrip, endDate: e.target.value })} />
                        <button type="submit">Save Trip</button>
                        <button type="button" onClick={() => setShowCreate(false)}>Cancel</button>
                    </form>
                )}
                {loading ? <p>Loading...</p> : error ? <p>{error}</p> : (
                    <ul className="trips-list">
                        {trips.map(trip => (
                            <li key={trip._id} className="trip-item">
                                <h2>{trip.name}</h2>
                                <p>{trip.description}</p>
                                <p>{trip.startDate ? `Start: ${new Date(trip.startDate).toLocaleDateString()}` : ""}</p>
                                <p>{trip.endDate ? `End: ${new Date(trip.endDate).toLocaleDateString()}` : ""}</p>
                                <p>{trip.places?.length ? `${trip.places.length} places` : "No places added yet"}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <Footer />
        </div>
    );
}