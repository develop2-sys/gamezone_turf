import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Home from "./pages/Home.jsx";
import Book from "./pages/Book.jsx";
import BookingDetail from "./pages/BookingDetail.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import AdminRequests from "./pages/AdminRequests.jsx";
import AdminSlots from "./pages/AdminSlots.jsx";
import AdminWalkins from "./pages/AdminWalkins.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/booking/:id" element={<BookingDetail />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="requests" element={<AdminRequests />} />
          <Route path="slots" element={<AdminSlots />} />
          <Route path="walkins" element={<AdminWalkins />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);