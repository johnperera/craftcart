import React from "react";

const AdminDashboard = () => {
  return (
    <div className="container">
      <h3 className="mb-4">Admin Dashboard</h3>
      <div className="row">
        <div className="col-md-4">
          <div className="card bg-primary text-white mb-4">
            <div className="card-body">Total Products</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-dark mb-4">
            <div className="card-body">Total Categories</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white mb-4">
            <div className="card-body">Total Users</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;