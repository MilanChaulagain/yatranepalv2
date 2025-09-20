import React, { useEffect, useState } from 'react';
import './TravellersStories.css';
import { FaRegHeart, FaHeart, FaRegComment, FaMapMarkerAlt, FaCalendarAlt, FaUserAlt } from 'react-icons/fa';
import { GiMountainRoad, GiTempleGate,GiElephant } from 'react-icons/gi';
import Navbar from '../../../components/navbar/Navbar';
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';

const TravelStories = () => {
    const [activeTab, setActiveTab] = useState('featured');
    const navigate = useNavigate();
    const [fetchedStories, setFetchedStories] = useState([]);
    const [expandedComments, setExpandedComments] = useState({});
    const [commentsByStory, setCommentsByStory] = useState({});
    const [loadingComments, setLoadingComments] = useState({});

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await api.get('/stories');
                const list = res.data?.data || res.data || [];
                if (!mounted) return;
                // Normalize to match the card UI shape minimally
                const normalized = list.map(s => ({
                    id: s._id,
                    title: s.title,
                    author: s.user?.username || 'Anonymous',
                    date: s.visitDate ? new Date(s.visitDate).toLocaleDateString() : new Date(s.createdAt).toLocaleDateString(),
                    location: s.destination,
                    image: s.images?.[0] || 'https://via.placeholder.com/800x500?text=Travel+Story',
                    content: s.content,
                    likes: s.likes || 0,
                    comments: Array.isArray(s.comments) ? s.comments.length : 0,
                    category: (s.tags && s.tags[0]) || 'story',
                    readTime: '5 min read',
                    icon: null,
                    liked: !!s.liked,
                }));
                setFetchedStories(normalized);
                // Initialize liked state and comments cache from API so it persists on reload
                const initialLiked = normalized.reduce((acc, st) => {
                    acc[st.id] = !!st.liked;
                    return acc;
                }, {});
                setLikedStories(initialLiked);
                // Seed commentsByStory with populated comments (including author info) from the list response
                const initialComments = (list || []).reduce((acc, s) => {
                    if (Array.isArray(s.comments) && s.comments.length) acc[s._id] = s.comments;
                    return acc;
                }, {});
                setCommentsByStory((prev) => ({ ...initialComments, ...prev }));
            } catch (e) {
                // silent fail to keep dummy data
            }
        })();
        return () => { mounted = false; };
    }, []);
    const [likedStories, setLikedStories] = useState({});
    const [commentInputs, setCommentInputs] = useState({});

    const toggleLike = async (story) => {
        const id = story.id;
        // If it's a fetched story (has Mongo ObjectId-like id), hit API
        const isReal = typeof id === 'string' && id.length >= 12;
        if (isReal) {
            try {
                await api.post(`/stories/${id}/like`);
            } catch (_) { /* ignore errors to keep UI responsive */ }
        }
        setLikedStories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleCommentChange = (id, val) => {
        setCommentInputs((prev) => ({ ...prev, [id]: val }));
    };

    const submitComment = async (story) => {
        const id = story.id;
        const text = (commentInputs[id] || '').trim();
        if (!text) return;
        const isReal = typeof id === 'string' && id.length >= 12;
        if (isReal) {
            try {
                const res = await api.post(`/stories/${id}/comments`, { text });
                const updated = res.data?.data;
                // Optimistically update local comments list and count
                setCommentsByStory((prev) => ({
                    ...prev,
                    [id]: updated?.comments || prev[id] || []
                }));
                // also update fetchedStories comments count for that id
                setFetchedStories((prev) => prev.map(st => st.id === id ? { ...st, comments: (updated?.comments?.length ?? (st.comments || 0) + 1) } : st));
                setCommentInputs((prev) => ({ ...prev, [id]: '' }));
            } catch (_) { /* ignore for now */ }
        } else {
            setCommentInputs((prev) => ({ ...prev, [id]: '' }));
        }
    };

    const toggleCommentsPanel = async (story) => {
        const id = story.id;
        const nextState = !expandedComments[id];
        setExpandedComments((prev) => ({ ...prev, [id]: nextState }));
        const isReal = typeof id === 'string' && id.length >= 12;
        if (nextState && isReal && !commentsByStory[id]) {
            try {
                setLoadingComments((prev) => ({ ...prev, [id]: true }));
                const res = await api.get(`/stories/${id}`);
                const full = res.data?.data;
                setCommentsByStory((prev) => ({ ...prev, [id]: full?.comments || [] }));
            } catch (_) { /* noop */ }
            finally {
                setLoadingComments((prev) => ({ ...prev, [id]: false }));
            }
        }
    };

    const featuredStories = [
        {
            id: 1,
            title: "Trekking to Everest Base Camp: A Life-Changing Journey",
            author: "Sarah Johnson",
            date: "March 15, 2023",
            location: "Everest Region, Nepal",
            image: "https://b1088268.smushcdn.com/1088268/wp-content/uploads/2021/12/everest-base-camp-trek-1-scaled-1.jpg?lossy=2&strip=1&webp=1",
            content: "The Everest Base Camp trek cost me NPR 80,000 for 12 days, including permits, guide, and teahouses. Waking up to panoramic views of the Himalayas was worth every rupee. The day we reached base camp at 5,364m was emotional - standing in the shadow of the world's highest peak is something I'll never forget. Pro tip: Budget NPR 2,000-3,000 per day for extra snacks and drinks!",
            likes: 284,
            comments: 42,
            category: "trekking",
            readTime: "8 min read",
            icon: <GiMountainRoad />
        },
        {
            id: 2,
            title: "Discovering Kathmandu's Hidden Temples",
            author: "Rajesh Thapa",
            date: "January 5, 2023",
            location: "Kathmandu Valley",
            image: "https://www.mountainmarttreks.com/public/uploads/kathmandu-pagoda-temples-1.webp",
            content: "Exploring Kathmandu's temples on a budget of NPR 500 per day is possible! Beyond the famous Durbar Squares (entry NPR 1,000), I discovered tiny neighborhood shrines where elderly priests still perform ancient rituals. The most magical moment was stumbling upon a hidden courtyard in Patan where Newari craftsmen were creating intricate wood carvings using techniques unchanged for centuries.",
            likes: 156,
            comments: 23,
            category: "culture",
            readTime: "5 min read",
            icon: <GiTempleGate />
        }
    ];

    const recentStories = [
        {
            id: 3,
            title: "Jungle Safari in Chitwan: Spotting the Elusive Rhino",
            author: "Emma Wilson",
            date: "April 2, 2023",
            location: "Chitwan National Park",
            image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2d/77/9b/63/one-horn-rhino-in-chitwan.jpg?w=1200&h=-1&s=1",
            content: "Our 3-day jungle safari package cost NPR 15,000 including accommodation. We spotted rhinos, crocodiles, and countless birds. The elephant-back safari at sunrise (NPR 2,500 extra) was surreal - floating through the misty jungle as the world woke up. The Tharu cultural show in the evening (included) gave wonderful insight into local traditions.",
            likes: 98,
            comments: 15,
            category: "wildlife",
            readTime: "6 min read",
            icon: <GiElephant />
        },
        {
            id: 4,
            title: "Pokhara's Secret Sunrise Spot",
            author: "David Chen",
            date: "February 28, 2023",
            location: "Pokhara",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShDckp7IiPsT7Qzvh7QLeLIk_syAURWKFU3g&s",
            content: "Skip the crowded Sarangkot (NPR 500 entry) and visit the World Peace Pagoda instead (free entry). After a short boat ride (NPR 800) across Phewa Lake and a 30-minute hike, you reach this stunning white stupa with panoramic views of the Annapurnas. I arrived before dawn and had the place to myself as the first light painted the mountains pink.",
            likes: 132,
            comments: 28,
            category: "adventure",
            readTime: "4 min read",
            icon: <GiMountainRoad />
        }
    ];

    const popularStories = [
        {
            id: 5,
            title: "Living with Monks in a Himalayan Monastery",
            author: "Sophie Martin",
            date: "December 10, 2022",
            location: "Tengboche, Everest Region",
            image: "https://static-blog.treebo.com/wp-content/uploads/2023/04/Phuktal-Monastery-Zanskar-_flickr-1024x675.jpg",
            content: "I volunteered at Tengboche Monastery for NPR 5,000 donation, which included simple accommodation and meals. Waking at 4am for prayers, drinking endless butter tea, and learning about Buddhist philosophy transformed my understanding of happiness. The monks' laughter during our makeshift soccer games (played in maroon robes!) showed me joy exists everywhere.",
            likes: 421,
            comments: 67,
            category: "spiritual",
            readTime: "10 min read",
            icon: <GiTempleGate />
        },
        {
            id: 6,
            title: "The Hidden Valley of Upper Mustang",
            author: "Amit Sharma",
            date: "October 15, 2022",
            location: "Mustang, Nepal",
            image: "https://himalayasonfoot.com/wp-content/uploads/2024/02/Upper-Mustang-Trek.jpg",
            content: "The restricted area permit costs NPR 50,000 for 10 days, but this high desert kingdom is worth every rupee. Ancient cave dwellings, colorful prayer flags against red cliffs, and welcoming Lobas people who maintain traditions unchanged for centuries. Budget NPR 3,000-5,000 per day for basic accommodations but extraordinary landscapes.",
            likes: 387,
            comments: 53,
            category: "offbeat",
            readTime: "12 min read",
            icon: <GiMountainRoad />
        }
    ];

    const renderStories = () => {
        switch (activeTab) {
            case 'featured':
                return [...fetchedStories, ...featuredStories];
            case 'recent':
                return [...fetchedStories, ...recentStories];
            case 'popular':
                return [...fetchedStories, ...popularStories];
            default:
                return [...fetchedStories, ...featuredStories, ...recentStories, ...popularStories];
        }
    };

    return (
        <div className="travelerstories">
            <Navbar />
            <Header type="list" />
            
            {/* Banner */}
            <div className="travelerstories-banner">
                <div className="travelerstories-banner-content">
                    <h1>Travel Stories from Nepal</h1>
                    <p>Real experiences shared by travelers who've explored the Himalayas</p>
                </div>
            </div>

            <div className="travelerstories-container">
                <div className="travelerstories-header">
                    <h2>Inspiration for Your Journey</h2>
                    <p>Read personal accounts with practical budget tips in Nepali Rupees (NPR)</p>
                    
                    <div className="travelerstories-tabs">
                        <button 
                            className={activeTab === 'featured' ? 'active' : ''}
                            onClick={() => setActiveTab('featured')}
                        >
                            Featured Stories
                        </button>
                        <button 
                            className={activeTab === 'recent' ? 'active' : ''}
                            onClick={() => setActiveTab('recent')}
                        >
                            Recent Adventures
                        </button>
                        <button 
                            className={activeTab === 'popular' ? 'active' : ''}
                            onClick={() => setActiveTab('popular')}
                        >
                            Most Popular
                        </button>
                    </div>
                </div>

                <div className="travelerstories-grid">
                    {renderStories().map(story => (
                        <div key={story.id} className="travelerstories-card">
                            <div className="travelerstories-card-image">
                                <img src={story.image} alt={story.title} />
                                <div className="travelerstories-card-category">
                                    {story.icon}
                                    <span>{story.category}</span>
                                </div>
                            </div>
                            <div className="travelerstories-card-content">
                                <h3>{story.title}</h3>
                                
                                <div className="travelerstories-card-meta">
                                    <span><FaUserAlt /> {story.author}</span>
                                    <span><FaCalendarAlt /> {story.date}</span>
                                    <span><FaMapMarkerAlt /> {story.location}</span>
                                    <span>{story.readTime}</span>
                                </div>
                                
                                <p>{story.content}</p>
                                
                                <div className="travelerstories-card-actions">
                                    <button 
                                        className="travelerstories-like-btn"
                                        onClick={() => toggleLike(story)}
                                    >
                                        {likedStories[story.id] ? (
                                            <FaHeart className="liked" />
                                        ) : (
                                            <FaRegHeart />
                                        )}
                                        <span>{likedStories[story.id] ? story.likes + 1 : story.likes}</span>
                                    </button>
                                    <button className="travelerstories-comment-btn" onClick={() => toggleCommentsPanel(story)}>
                                        <FaRegComment />
                                        <span>Comments ({story.comments})</span>
                                    </button>
                                </div>
                                {expandedComments[story.id] && (
                                    <div className="travelerstories-comments">
                                        <div className="travelerstories-comment-box">
                                            <input
                                                type="text"
                                                placeholder="Write a comment..."
                                                value={commentInputs[story.id] || ''}
                                                onChange={(e) => handleCommentChange(story.id, e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && submitComment(story)}
                                            />
                                            <button onClick={() => submitComment(story)}>Post</button>
                                        </div>
                                        {loadingComments[story.id] ? (
                                            <div className="travelerstories-comments-loading">Loading comments...</div>
                                        ) : (
                                            <div className="travelerstories-comments-list">
                                                {(commentsByStory[story.id] || []).map((c, idx) => (
                                                    <div key={idx} className="comment-item">
                                                        <div className="comment-avatar">
                                                            {(c.user?.img) ? (
                                                                <img src={c.user.img} alt={c.user?.username || 'user'} />
                                                            ) : (
                                                                <div className="avatar-fallback">{(c.user?.username || 'U').charAt(0).toUpperCase()}</div>
                                                            )}
                                                        </div>
                                                        <div className="comment-body">
                                                            <div className="comment-meta">
                                                                <span className="comment-author">{c.user?.username || 'User'}</span>
                                                                <span className="comment-date">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
                                                            </div>
                                                            <div className="comment-text">{c.text}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!commentsByStory[story.id] || commentsByStory[story.id].length === 0) && (
                                                    <div className="travelerstories-comments-empty">No comments yet. Be the first to comment!</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="travelerstories-share">
                    <h3>Have a story to share?</h3>
                    <p>Contribute your own travel experience to inspire others</p>
                    <button className="travelerstories-cta-button" onClick={()=>navigate('/share-story')}>Share Your Story</button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default TravelStories;