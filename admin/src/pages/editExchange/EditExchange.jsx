import "../NewExchange/NewExchange.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const EditExchange = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    contactNumber: "",
    hours: "",
    services: "",
    description: "",
    isActive: true,
    lat: "",
    lng: "",
    images: [],
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingLatLng, setLoadingLatLng] = useState(false);
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => () => { isMounted.current = false; }, []);

  useEffect(() => {
    const ac = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:8800/api/money-exchange/${id}`, { withCredentials: true, signal: ac.signal });
        const d = res.data?.data || res.data;
        setForm({
          name: d.name || "",
          // Backend stores address as a single string possibly including city; try to split best-effort
          address: (d.address || "").replace(/,\s*(Kathmandu|Lalitpur|Bhaktapur).*/i, "").trim(),
          city: ((d.address || "").match(/(Kathmandu|Lalitpur|Bhaktapur)/i)?.[0]) || "",
          contactNumber: d.contactNumber || "",
          hours: d.hours || "",
          services: d.services || "",
          description: d.description || "",
          isActive: d.isActive !== false,
          lat: (d.lat != null ? parseFloat(d.lat).toString() : ""),
          lng: (d.lng != null ? parseFloat(d.lng).toString() : ""),
          images: Array.isArray(d.images) ? d.images : [],
        });
      } catch (e) {
        if (!axios.isCancel(e)) {
          console.error(e);
          toast.error("Failed to load exchange center");
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
    return () => ac.abort();
  }, [id]);

  const previewSrc = useMemo(() => {
    if (files.length > 0) return URL.createObjectURL(files[0]);
    if (form.images && form.images.length > 0) return form.images[0];
    return `${process.env.PUBLIC_URL}/images/placeholder.jpg`;
  }, [files, form.images]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onFileChange = (e) => {
    const selected = Array.from(e.target.files || []).slice(0, 3);
    setFiles(selected);
  };

  const uploadImages = async () => {
    if (files.length === 0) return undefined; // no change
    const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error("Missing Cloudinary config. Set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET.");
    }
    const urls = [];
    for (const file of files) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET);
      const resp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data,
        credentials: 'omit',
        mode: 'cors',
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Upload failed ${resp.status}: ${txt}`);
      }
      const json = await resp.json();
      urls.push(json.secure_url || json.url);
    }
    return urls;
  };

  const validate = () => {
    if (!form.name || !form.address || !form.city || !form.contactNumber || !form.hours || !form.services) {
      toast.error("Please fill all required fields.");
      return false;
    }
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error("Please provide valid latitude and longitude.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      const maybeImages = await uploadImages();
      const payload = {
        name: form.name,
        address: `${form.address}, ${form.city}`.trim(),
        contactNumber: form.contactNumber,
        hours: form.hours,
        services: form.services,
        description: form.description || undefined,
        isActive: !!form.isActive,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
      };
      if (maybeImages) payload.images = maybeImages; // only include if replaced
      await axios.put(`http://localhost:8800/api/money-exchange/${id}`, payload, { withCredentials: true });
      toast.success("Exchange Center updated successfully!");
      navigate("/money-exchange");
    } catch (err) {
      console.error("Update error:", err);
      const msg = err?.response?.data?.error || err?.response?.data?.message || "Failed to update Exchange Center.";
      toast.error(msg);
    } finally {
      if (isMounted.current) setSaving(false);
    }
  };

  const suggestLocations = async () => {
    const { name, city, address } = form;
    if (!name && !city && !address) {
      toast.error("Enter name/city/address first.");
      return;
    }
    setLoadingLatLng(true);
    setShowSuggestions(false);
    setSuggestedLocations([]);
    try {
      const apiKey = process.env.REACT_APP_LOCATIONIQ_ACCESS_TOKEN;
      if (!apiKey) throw new Error("Missing LocationIQ token");
      const queries = [];
      if (name && address && city) queries.push(`${name}, ${address}, ${city}, Nepal`);
      if (name && city) queries.push(`${name}, ${city}, Nepal`);
      if (name && address) queries.push(`${name}, ${address}, Nepal`);
      if (address && city) queries.push(`${address}, ${city}, Nepal`);
      if (name) queries.push(`${name}, Nepal`);
      if (city) queries.push(`${city}, Nepal`);
      if (address) queries.push(`${address}, Nepal`);

      const all = [];
      for (const q of queries.slice(0, 4)) {
        const resp = await fetch(`https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(q)}&format=json`);
        if (!resp.ok) continue;
        const data = await resp.json();
        (data || []).slice(0, 3).forEach((r) => {
          const lat = parseFloat(r.lat);
          const lng = parseFloat(r.lon);
          const display = r.display_name || "";
          let score = 0;
          const dl = display.toLowerCase();
          if (name && dl.includes(name.toLowerCase())) score += 3;
          if (city && dl.includes(city.toLowerCase())) score += 2;
          if (address && dl.includes(address.toLowerCase())) score += 2;
          if (dl.includes("nepal")) score += 1;
          const exists = all.find((s) => Math.abs(s.lat - lat) < 0.0005 && Math.abs(s.lng - lng) < 0.0005);
          if (!exists) all.push({ id: `${lat}-${lng}-${Math.random()}`, address: display, lat, lng, score });
        });
      }
      all.sort((a, b) => b.score - a.score);
      setSuggestedLocations(all.slice(0, 6));
      setShowSuggestions(all.length > 0);
      if (all.length === 0) toast.error("No suggestions found");
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch suggestions");
    } finally {
      setLoadingLatLng(false);
    }
  };

  if (loading) {
    return (
      <div className="new">
        <Sidebar />
        <div className="newContainer">
          <Navbar />
          <div className="top">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">Edit Exchange Center</div>
        <div className="bottom">
          <div className="left">
            <img src={previewSrc} alt="Preview" />
          </div>
          <div className="right">
            <form onSubmit={handleSubmit}>
              <div className="formInput">
                <label htmlFor="file">Replace Images (Max 3): <DriveFolderUploadOutlinedIcon /></label>
                <input id="file" type="file" accept="image/*" multiple onChange={onFileChange} style={{ display: "none" }} />
              </div>

              <div className="formGrid">
                <div className="formInput">
                  <label htmlFor="name">Name</label>
                  <input id="name" name="name" type="text" placeholder="Exchange Center Name" value={form.name} onChange={onChange} required />
                </div>
                <div className="formInput">
                  <label htmlFor="city">City</label>
                  <input id="city" name="city" type="text" placeholder="Kathmandu" value={form.city} onChange={onChange} required />
                </div>
                <div className="formInput">
                  <label htmlFor="address">Address</label>
                  <input id="address" name="address" type="text" placeholder="Street, Area" value={form.address} onChange={onChange} required />
                </div>
                <div className="formInput">
                  <label htmlFor="contactNumber">Contact Number</label>
                  <input id="contactNumber" name="contactNumber" type="text" placeholder="+977 01 1234567" value={form.contactNumber} onChange={onChange} required />
                </div>
                <div className="formInput">
                  <label htmlFor="hours">Working Hours</label>
                  <input id="hours" name="hours" type="text" placeholder="9 AM - 5 PM" value={form.hours} onChange={onChange} required />
                </div>
                <div className="formInput">
                  <label htmlFor="services">Services</label>
                  <input id="services" name="services" type="text" placeholder="Currency exchange, Money transfer, etc." value={form.services} onChange={onChange} required />
                </div>
                <div className="formInput">
                  <label htmlFor="description">Description</label>
                  <input id="description" name="description" type="text" placeholder="Additional details (optional)" value={form.description} onChange={onChange} />
                </div>
                <div className="formInput">
                  <label htmlFor="isActive">Is Active?</label>
                  <select id="isActive" name="isActive" value={form.isActive ? "true" : "false"} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === "true" }))}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="locationSuggestionSection">
                  <h3><LocationOnIcon /> Smart Location Finder</h3>
                  <p>Fill name, city, and address above, then click to get accurate coordinates.</p>
                  <button type="button" onClick={suggestLocations} disabled={loadingLatLng}>
                    {loadingLatLng ? "Searching..." : "Suggest Exact Location"}
                  </button>

                  {showSuggestions && suggestedLocations.length > 0 && (
                    <div className="suggestions-list">
                      {suggestedLocations.map((s, idx) => (
                        <div key={s.id} className="suggestion-item" onClick={() => {
                          setForm((prev) => ({ ...prev, lat: s.lat.toString(), lng: s.lng.toString() }));
                          setShowSuggestions(false);
                        }}>
                          <div className="address">#{idx + 1} {s.address}</div>
                          <div className="coords">Lat: {s.lat.toFixed(6)}, Lng: {s.lng.toFixed(6)}</div>
                          <div className="confidence">Score: {s.score}</div>
                        </div>
                      ))}
                      <button type="button" className="cancel-button" onClick={() => setShowSuggestions(false)}>Cancel</button>
                    </div>
                  )}

                  <div className="formInput">
                    <label htmlFor="lat">Latitude</label>
                    <input id="lat" name="lat" type="text" placeholder="27.7172" value={form.lat} onChange={onChange} readOnly={loadingLatLng} />
                  </div>
                  <div className="formInput">
                    <label htmlFor="lng">Longitude</label>
                    <input id="lng" name="lng" type="text" placeholder="85.3240" value={form.lng} onChange={onChange} readOnly={loadingLatLng} />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditExchange;
