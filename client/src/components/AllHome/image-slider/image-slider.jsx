import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./image-slider.css";

function ImageSlider() {
    const [images, setImages] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log("Fetching images from API...");
                
                // Add your API endpoint here
                const res = await axios.get("http://localhost:8800/api/imageSlider");
                console.log("API response:", res.data);
                
                if (res.data.success && res.data.data && res.data.data.length > 0) {
                    setImages(res.data.data);
                } else {
                    setImages([
                    {
                        _id: "1",
                        imagePath: "/images/slider1.jpg",
                        name: "Default Image 1"
                    },
                    {
                        _id: "2", 
                        imagePath: "/images/slider2.jpg",
                        name: "Default Image 2"
                    },
                    {
                        _id: "3", 
                        imagePath: "/images/slider3.jpg",
                        name: "Default Image 3"
                    }
                ]);
                    // throw new Error("Invalid response format");
                    
                }


            } catch (error) {
                console.error("Failed to fetch images:", error);
                setError("Failed to load images. Please try again later.");
                
                // Fallback to default images if API fails
                setImages([
                    {
                        _id: "1",
                        imagePath: "/images/slider1.jpg",
                        name: "Default Image 1"
                    },
                    {
                        _id: "2", 
                        imagePath: "/images/slider2.jpg",
                        name: "Default Image 2"
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, []);

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
    }, [images, activeIndex, startAutoSlide]);

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
                            e.target.src = "/images/slider1.jpg";
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