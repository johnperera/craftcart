import React from "react";
import {
  NavLink,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import Home from "../Home";
import ProductDirectory from "../ProductDirectory";
import ProductDetails from "../pages/ProductDetails";
import ArtisanDashboard from "../pages/ArtisanDashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Cart from "../pages/Cart";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminPanel from "../pages/admin/AdminPanel";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminUsers from "../pages/admin/AdminUsers";
import Checkout from "../pages/Checkout";
import OrderSuccess from "../pages/OrderSuccess";

const NotFound = () => <h1>404 - Page Not Found</h1>;

export function NavPage() {
  const navigate = useNavigate();
  const location = useLocation(); // Get current path
  const isAdminPath = location.pathname.startsWith("/admin");

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  return (
    <>
      {/* Only show Navbar if NOT in /admin */}
      {!isAdminPath && (
        <Navbar
          bg="light"
          variant="light"
          expand="lg"
          fixed="top"
          className="shadow-sm"
        >
          <Container>
            <Navbar.Brand
              as={NavLink}
              to="/"
              className="fw-bold d-flex align-items-center"
            >
              <img
                src="/img/logo.png"
                alt="CraftCart Logo"
                style={{ height: "40px", marginRight: "10px" }}
              />
              CraftCart
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="main-navbar-nav" />
            <Navbar.Collapse id="main-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link as={NavLink} to="/" end>
                  Home
                </Nav.Link>
                <Nav.Link as={NavLink} to="/products">
                  Products
                </Nav.Link>

                {token ? (
                  <>
                    {user?.role !== "BUYER" && (
                      <Nav.Link as={NavLink} to="/artisan">
                        For Artisans
                      </Nav.Link>
                    )}
                    <Nav.Link as={NavLink} to="/cart">
                      Cart
                    </Nav.Link>
                    <Nav.Link
                      as="button"
                      onClick={handleLogout}
                      className="btn btn-link text-decoration-none"
                      style={{ padding: "0.5rem 1rem", fontWeight: 500 }}
                    >
                      Logout
                    </Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link as={NavLink} to="/register">
                      Register
                    </Nav.Link>
                    <Nav.Link as={NavLink} to="/login">
                      Login
                    </Nav.Link>
                  </>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}

      {/* Adjust top margin based on whether Navbar is shown */}
      <div style={{ marginTop: isAdminPath ? "0" : "90px", padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductDirectory />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/artisan" element={<ArtisanDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orderSuccess" element={<OrderSuccess />}/>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminPanel />} />
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default NavPage;
