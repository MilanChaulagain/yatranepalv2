import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import List from "./pages/list/List";
// import New from "./pages/new/New";
import NewUser from "./pages/newUser/NewUser";
import EditUser from "./pages/editUser/EditUser";
import Profile from "./pages/profile/Profile";
import NewHotel from "./pages/newHotel/NewHotel";
import NewRoom from "./pages/newRoom/NewRoom";
import NewExchange from "./pages/NewExchange/NewExchange";
import NewTouristGuide from "./pages/Touristguide/NewTouristguide";
import NewPlace from "./pages/newPlaces/newplaces";
import NewChadparba from "./pages/newChadparba/newChadparba";
import AdminBookings from "./pages/Booking/booking";
import NewImageSlider from "./pages/ImageSlider/imageSlider";
// import EditEntity from "./pages/Edit/EditEntity";
import EditRoom from "./pages/editRoom/EditRoom";
import EditHotel from "./pages/editHotel/EditHotel";
import EditImageSlider from "./pages/editImageSlider/EditImageSlider";
import EditChadparba from "./pages/editChadparba/EditChadparba";
import EditExchange from "./pages/editExchange/EditExchange";
import EditPlace from "./pages/editPlace/EditPlace";
import EditTouristGuide from "./pages/editTouristGuide/EditTouristGuide";
import Single from "./pages/single/Single";

import {
  chadParbaInputs,
  imageSliderInputs,
  moneyexchangeInputs,
  placeInputs,
  touristguideInputs,
  // userInputs,
} from "./formSource";

import {
  chadParbaColumns,
  hotelColumns,
  imageSliderColumns,
  moneyexchangeColumns,
  placeColumns,
  roomColumns,
  touristguideColumns,
  userColumns,
} from "./datatablesource";

import "./style/dark.scss";
import "./style/global.scss";

import { useContext, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

function App() {
  const { darkMode, sidebarCollapsed } = useContext(DarkModeContext);

  const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    if (!user) return <Navigate to="/login" />;
    return children;
  };

  // Attach auth token to every axios request
  // Ensures delete and other protected endpoints include the Bearer token
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error?.response?.status === 401) {
          // Optionally redirect to login on unauthorized
          // and/or clear token
          // localStorage.removeItem("token");
          toast.error("Session expired. Please log in again.");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <div className={`app ${darkMode ? 'dark' : ''} fade-in main-layout`} style={{"--sidebar-width": sidebarCollapsed ? "80px" : "280px"}}>
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route path="login" element={<Login />} />
            <Route
              index
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile/edit"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Users */}
            <Route path="users">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={userColumns} />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute>
                    <Single />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id/edit"
                element={
                  <ProtectedRoute>
                    <EditUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <NewUser />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Hotels */}
            <Route path="hotels">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={hotelColumns} />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id/edit"
                element={
                  <ProtectedRoute>
                    <EditHotel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <NewHotel />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Rooms */}
            <Route path="rooms">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={roomColumns} />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id/edit"
                element={
                  <ProtectedRoute>
                    <EditRoom />
                  </ProtectedRoute>
                }
              />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <NewRoom />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Money Exchange */}
            <Route path="money-exchange">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={moneyexchangeColumns} />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id/edit"
                element={
                  <ProtectedRoute>
                    <EditExchange />
                  </ProtectedRoute>
                }
              />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <NewExchange
                      inputs={moneyexchangeInputs}
                      title="Add New Exchange Center"
                    />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Tourist Guide */}
            <Route path="touristguide">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={touristguideColumns} />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute>
                    <Single />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id/edit"
                element={
                  <ProtectedRoute>
                    <EditTouristGuide />
                  </ProtectedRoute>
                }
              />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <NewTouristGuide
                      inputs={touristguideInputs}
                      title="Add New Tourist Guide"
                      isAdmin={true}
                    />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Places */}
            <Route path="place">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={placeColumns} />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute>
                    <Single />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id/edit"
                element={
                  <ProtectedRoute>
                    <EditPlace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <NewPlace
                      inputs={placeInputs}
                      title="Add New Place"
                      isAdmin={true}
                    />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Chadparba */}
            <Route path="chadparba">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={chadParbaColumns} />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id/edit"
                element={
                  <ProtectedRoute>
                    <EditChadparba />
                  </ProtectedRoute>
                }
              />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <NewChadparba
                      inputs={chadParbaInputs}
                      title="Add New ChadParba"
                      isAdmin={true}
                    />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Image Slider */}
            <Route path="imageslider">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={imageSliderColumns} />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id/edit"
                element={
                  <ProtectedRoute>
                    <EditImageSlider />
                  </ProtectedRoute>
                }
              />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <NewImageSlider
                      inputs={imageSliderInputs}
                      title="Add New Slider Image"
                      isAdmin={true}
                    />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>

          {/* Bookings */}
          <Route path="/admin-booking" element={<AdminBookings />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
