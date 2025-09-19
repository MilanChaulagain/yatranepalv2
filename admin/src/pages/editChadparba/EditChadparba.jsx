import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import axios from "axios";
import toast from "react-hot-toast";
import { chadParbaInputs } from "../../formSource";
import "./editChadparba.scss";

const EditChadparba = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    const controller = new AbortController();
    isMounted.current = true;

    const fetchEvent = async () => {
      try {
        const res = await axios.get(`http://localhost:8800/api/chadparba/${id}`, { withCredentials: true, signal: controller.signal });
        if (!isMounted.current) return;
        setInfo(res.data || {});
      } catch (err) {
        if (!isMounted.current) return;
        if (err?.name === 'CanceledError') return;
        console.error("Failed to fetch ChadParba:", err);
        toast.error("Failed to load event");
        navigate("/chadparba");
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchEvent();
    return () => { isMounted.current = false; controller.abort(); };
  }, [id, navigate]);

  const handleChange = (e) => {
    const { id, value, type } = e.target;
    setInfo((prev) => ({
      ...prev,
      [id]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const payload = { ...info };
      delete payload._id; delete payload.__v; delete payload.createdAt; delete payload.updatedAt;
      await toast.promise(
        axios.put(`http://localhost:8800/api/chadparba/${id}`, payload, { withCredentials: true }),
        { loading: 'Updating event...', success: 'Event updated!', error: 'Failed to update event' }
      );
      navigate('/chadparba');
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      if (isMounted.current) setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="editChadParba">
        <Sidebar />
        <div className="editChadParbaContainer">
          <Navbar />
          <div className="loading" style={{ padding: 20, textAlign: 'center' }}>Loading event...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="editChadParba">
      <Sidebar />
      <div className="editChadParbaContainer">
        <Navbar />
        <div className="top">
          <h1>Edit ChadParba Event</h1>
        </div>
        <div className="bottom">
          <form className="form" onSubmit={handleSubmit}>
            {chadParbaInputs.map((input) => (
              <div className="formInput" key={input.id}>
                <label>{input.label}</label>
                {input.type === 'select' ? (
                  <select id={input.id} onChange={handleChange} required={input.required} value={info[input.id] ?? ''}>
                    <option value="" disabled>{input.placeholder}</option>
                    {input.options.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : input.type === 'textarea' ? (
                  <textarea id={input.id} placeholder={input.placeholder} onChange={handleChange} required={input.required} value={info[input.id] || ''} />
                ) : (
                  <input id={input.id} type={input.type} placeholder={input.placeholder} onChange={handleChange} required={input.required} min={input.min} max={input.max} value={info[input.id] ?? ''} />
                )}
              </div>
            ))}
            <div className="actions">
              <button type="button" className="secondary-btn" onClick={()=>navigate(-1)} disabled={saving}>Cancel</button>
              <button type="submit" className="primary-btn" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditChadparba;
