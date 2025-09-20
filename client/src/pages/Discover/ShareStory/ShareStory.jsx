import React, { useMemo, useState } from 'react';
import Navbar from '../../../components/navbar/Navbar';
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import api from '../../../utils/api';
import './ShareStory.css';

const ShareStory = () => {
  const [form, setForm] = useState({
    title: '',
    destination: '',
    content: '',
    rating: 0,
    tags: '',
    visitDate: '',
    durationDays: '',
    budgetRange: '',
    images: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tagsArray, setTagsArray] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onImages = (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    setImageFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const uploadImagesToCloudinary = async (files) => {
    const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error('Image upload is not configured. Please set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET.');
    }
    const uploads = files.map(async (file) => {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data,
      });
      if (!res.ok) throw new Error('Cloudinary upload failed');
      const json = await res.json();
      return json.secure_url;
    });
    return Promise.all(uploads);
  };

  // Tag chips handlers
  const addTag = (val) => {
    const tag = String(val || tagInput).trim();
    if (!tag) return;
    if (tagsArray.includes(tag)) return setTagInput('');
    setTagsArray((prev) => [...prev, tag]);
    setTagInput('');
  };
  const removeTag = (t) => {
    setTagsArray((prev) => prev.filter((x) => x !== t));
  };
  const onTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' ) {
      e.preventDefault();
      addTag();
    }
  };

  // Drag & drop for images
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length) {
      setImageFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeImage = (idx) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const previews = useMemo(() => imageFiles.map((f) => URL.createObjectURL(f)), [imageFiles]);

  const StarRating = ({ value, onChange }) => {
    const stars = [1,2,3,4,5];
    return (
      <div className="stars">
        {stars.map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`Rate ${s}`}
            className={s <= value ? 'star active' : 'star'}
            onClick={() => onChange(s)}
          >★</button>
        ))}
        <span className="stars-value">{value}/5</span>
      </div>
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      // Ensure auth token is present and explicitly attach it
      let token = null;
      try {
        const storedToken = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        token = storedToken || user?.token || null;
      } catch (_) {
        token = localStorage.getItem('token');
      }

      if (!token) {
        setError('You must be logged in to share a story. Please login and try again.');
        setSubmitting(false);
        return;
      }

      let imageUrls = [];
      if (imageFiles.length) {
        imageUrls = await uploadImagesToCloudinary(imageFiles);
      }
      const payload = {
        title: form.title,
        destination: form.destination,
        content: form.content,
        rating: Number(form.rating) || 0,
        tags: tagsArray.length ? tagsArray : (form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : []),
        visitDate: form.visitDate || undefined,
        durationDays: form.durationDays ? Number(form.durationDays) : undefined,
        budgetRange: form.budgetRange || undefined,
        images: imageUrls,
      };
      await api.post('/stories', payload, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Your story has been submitted!');
      setForm({ title:'', destination:'', content:'', rating:0, tags:'', visitDate:'', durationDays:'', budgetRange:'', images:[] });
      setImageFiles([]);
      setTagsArray([]);
      setTagInput('');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again to share your story.');
      } else {
        setError(err.response?.data?.message || err.message || 'Submission failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="share-story">
      <Navbar />
      <Header type="list" />
      <div className="share-container">
        <div className="share-hero">
          <h2>Share Your Travel Story</h2>
          <p>Inspire others with your destination highlights, experiences, and tips.</p>
        </div>
        <div className="share-card">
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}
        <form className="share-form" onSubmit={onSubmit}>
          <div className="grid">
            <label>
              <span>Title</span>
              <input name="title" value={form.title} onChange={onChange} required />
            </label>
            <label>
              <span>Destination</span>
              <input name="destination" value={form.destination} onChange={onChange} required />
            </label>
            <label>
              <span>Visited on</span>
              <input type="date" name="visitDate" value={form.visitDate} onChange={onChange} />
            </label>
            <label>
              <span>Trip length (days)</span>
              <input type="number" name="durationDays" value={form.durationDays} onChange={onChange} min="0" />
            </label>
            <label>
              <span>Budget Range</span>
              <input name="budgetRange" value={form.budgetRange} onChange={onChange} placeholder="e.g., NPR 5,000-15,000/day" />
            </label>
            <label>
              <span>Rating</span>
              <StarRating value={Number(form.rating) || 0} onChange={(v)=> setForm((f)=> ({...f, rating: v}))} />
            </label>
            <label className="full">
              <span>Content</span>
              <textarea name="content" value={form.content} onChange={onChange} rows={6} required placeholder="Share your experience, highlights, tips..." />
            </label>
            <label className="full">
              <span>Tags</span>
              <div className="tags-input">
                {tagsArray.map((t) => (
                  <span className="chip" key={t}>
                    {t}
                    <button type="button" className="chip-x" onClick={() => removeTag(t)} aria-label={`Remove ${t}`}>×</button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Type and press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={onTagKeyDown}
                />
              </div>
            </label>
            <label className="full">
              <span>Images</span>
              <div
                className={`dropzone ${dragActive ? 'active' : ''}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
              >
                <input id="file-input" type="file" multiple accept="image/*" onChange={onImages} hidden />
                <p>Drag & drop images here, or <button type="button" className="linklike" onClick={()=> document.getElementById('file-input').click()}>browse</button></p>
              </div>
              {previews.length > 0 && (
                <div className="previews">
                  {previews.map((src, idx) => (
                    <div className="preview" key={idx}>
                      <img src={src} alt={`preview-${idx}`} />
                      <button type="button" className="remove" onClick={()=> removeImage(idx)} aria-label="Remove image">×</button>
                    </div>
                  ))}
                </div>
              )}
            </label>
          </div>
          <div className="actions">
            <button className="button-17" type="submit" disabled={submitting || !form.title || !form.destination || !form.content}>
              {submitting ? 'Submitting...' : 'Submit Story'}
            </button>
          </div>
        </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShareStory;
