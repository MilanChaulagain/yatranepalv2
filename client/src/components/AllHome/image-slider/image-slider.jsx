import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./image-slider.css";

const DEFAULTS = [
    { _id: "1", imagePath: `${process.env.PUBLIC_URL || ""}/images/slider1.jpg`, name: "Default Image 1" },
    { _id: "2", imagePath: `${process.env.PUBLIC_URL || ""}/images/slider2.jpg`, name: "Default Image 2" },
    { _id: "3", imagePath: `${process.env.PUBLIC_URL || ""}/images/slider3.jpg`, name: "Default Image 3" },
];

function ImageSlider() {
    const [images, setImages] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);
    const pollRef = useRef(null);
    const isMountedRef = useRef(true);

    const fetchImages = useCallback(async () => {
        try {
            if (!isMountedRef.current) return;
            setError(null);
            const res = await axios.get("http://localhost:8800/api/imageSlider", { withCredentials: false });
            const payload = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            const list = Array.isArray(payload) ? payload : [];
            if (list.length === 0) {
                if (images.length === 0) setImages(DEFAULTS);
                return;
            }
            // Only update if changed (length or ids differ) to avoid resetting animation unnecessarily
            const changed = images.length !== list.length || images.some((it, i) => (it._id || i) !== (list[i]?._id || i));
            if (changed) {
                setImages(list);
                if (activeIndex >= list.length) setActiveIndex(0);
            }
        } catch (err) {
            console.error("Failed to fetch images:", err);
            if (images.length === 0) setImages(DEFAULTS);
            setError(null); // do not show persistent error in UI for background poll
        } finally {
            if (loading) setLoading(false);
        }
    }, [activeIndex, images, loading]);

    useEffect(() => {
        isMountedRef.current = true;
        fetchImages();
        // light polling to reflect admin uploads "near real-time"
        pollRef.current = setInterval(fetchImages, 15000);
        return () => {
            isMountedRef.current = false;
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [fetchImages]);

    const startAutoSlide = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % images.length);
        }, 3000);
    }, [images.length]);

    useEffect(() => {
        if (images.length === 0) return;
        startAutoSlide();
        return () => stopAutoSlide();
    }, [images, startAutoSlide]);

    const stopAutoSlide = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    const slideNext = () => {
        setActiveIndex((prev) => (prev + 1) % images.length);
    };

    const slidePrev = () => {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (loading) {
        return <div className="slider-loading">Loading images...</div>;
    }

    if (error) {
        return <div className="slider-error">{error}</div>;
    }

    if (images.length === 0) {
        return <div className="slider-empty">No images available</div>;
    }

    return (
        <div
            className="container__slider"
            onMouseEnter={stopAutoSlide}
            onMouseLeave={startAutoSlide}
        >
            {images.map((img, index) => (
                <div
                    key={img._id || index}
                    className={
                        "slider__item " +
                        (activeIndex === index ? "slider__item-active" : "slider__item-inactive")
                    }
                >
                    <img
                        src={img.imagePath}
                        alt={img.name || `Slide ${index + 1}`}
                        className="slider__image"
                        onError={(e) => {
                            // Fallback if image fails to load
                            e.target.src = `${process.env.PUBLIC_URL || ""}/images/slider1.jpg`;
                            e.target.alt = "Image not available";
                        }}
                    />
                </div>
            ))}

            <div className="container__slider__links">
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={
                            activeIndex === index
                                ? "container__slider__links-small container__slider__links-small-active"
                                : "container__slider__links-small"
                        }
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveIndex(index);
                        }}
                    ></button>
                ))}
            </div>

            <button className="slider__btn-next" onClick={slideNext}>
                {">"}
            </button>
            <button className="slider__btn-prev" onClick={slidePrev}>
                {"<"}
            </button>
        </div>
    );
}

export default ImageSlider;