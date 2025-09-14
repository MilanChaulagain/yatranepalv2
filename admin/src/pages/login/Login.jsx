import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./login.scss";
import { Lock, User } from "lucide-react";
import {toast} from "react-hot-toast";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const { loading, error, dispatch } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!credentials.username || !credentials.password) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: { message: "Please enter username and password" },
      });
      return;
    }

    dispatch({ type: "LOGIN_START" });

    try {
      const res = await axios.post(
        "http://localhost:8800/api/auth/login",
        credentials,
        { withCredentials: true }
      );

      if (res.data.isAdmin) {
        // Store token in localStorage for authenticated requests
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        dispatch({ type: "LOGIN_SUCCESS", payload: res.data.details });
        toast.success("Logged in successfully");
        navigate("/");
      } else {
        dispatch({
          type: "LOGIN_FAILURE",
          payload: { message: "You are not allowed!" },
        });
      }
    } catch (err) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: err.response?.data || { message: "Login failed" },
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src={`images/logo.png`} alt="Yatra Nepal Logo" />
          <h1>Yatra Nepal Admin</h1>
          <p>Welcome back! Please login to your account.</p>
        </div>

        <form onSubmit={handleClick}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-icon">
              <User size={20}/>
              <input
                type="text"
                id="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-icon">
              <Lock size={20} />
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            {error && (
            <p style={{color: "red"}}>
              {error.message}
            </p>
          )}
          </div>
          
          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login to Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;