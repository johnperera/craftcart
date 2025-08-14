import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaTags,
  FaUsers,
  FaSignOutAlt,FaShoppingBag
} from "react-icons/fa";

const AdminLayout = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")); // Assuming user object includes 'role'
  const role = user?.role;

  const linkClass = ({ isActive }) =>
    `nav-link d-flex align-items-center gap-2 py-2 px-3 rounded ${
      isActive ? "bg-active text-white" : "text-dark"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
    >
      {/* Sidebar */}
      <aside
        className="shadow-sm d-flex flex-column justify-content-between"
        style={{
          width: "260px",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #dee2e6",
          padding: "2rem 1.25rem",
        }}
      >
        <div>
          <div className="text-center mb-4">
            <NavLink to="/">
              <img
                src="/img/logo.png"
                alt="CraftCart Logo"
                style={{ height: "48px" }}
              />
            </NavLink>
            <p className="text-muted mt-2 mb-0" style={{ fontSize: "0.85rem" }}>
              {role !== "ARTISAN"? 'Admin Panel':"Artisan Dashboard"}
            </p>
          </div>

          <ul className="nav flex-column">
            <li className="nav-item">
              <NavLink to="/admin" end className={linkClass}>
                <FaTachometerAlt /> Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/admin/products" className={linkClass}>
                <FaBoxOpen /> Products
              </NavLink>
            </li>

            {/* Show only if NOT artisan */}
            {role !== "ARTISAN" && (
              <>
                <li className="nav-item">
                  <NavLink to="/admin/categories" className={linkClass}>
                    <FaTags /> Categories
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/admin/users" className={linkClass}>
                    <FaUsers /> Users
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/admin/orders" className={linkClass}>
                    <FaShoppingBag /> Orders
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Logout Button */}
        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 p-4 bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
