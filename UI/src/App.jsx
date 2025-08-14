import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./Home";
import ProductDirectory from "./ProductDirectory";
import ArtisanDashboard from "./pages/ArtisanDashboard";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login"; // Import Login page
import Register from "./pages/Register"; // Import Register page
import Cart from "./pages/Cart";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductDirectory />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/artisan" element={<ArtisanDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}