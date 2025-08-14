import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { FaBoxOpen, FaListAlt, FaUsers } from "react-icons/fa";

const AdminPanel = () => {
  const user = JSON.parse(localStorage.getItem("user")); // Assuming user object includes 'role'
  const role = user?.role;
  const summary = {
    products: 7,
    categories: 6,
    users: 10,
  };

  return (
    <div className="container">
      <h2 className="mb-4">{role !== "ARTISAN"? 'Admin Dashboard':"Artisan Dashboard"}</h2>

      <Row className="g-4">
        {/* Products Card */}
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Body className="d-flex align-items-center">
              <FaBoxOpen size={36} className="text-primary me-3" />
              <div>
                <h6 className="mb-1">Total Products</h6>
                <h4>{summary.products}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Categories Card */}
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Body className="d-flex align-items-center">
              <FaListAlt size={36} className="text-success me-3" />
              <div>
                <h6 className="mb-1">Total Categories</h6>
                <h4>{summary.categories}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Users Card */}
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Body className="d-flex align-items-center">
              <FaUsers size={36} className="text-warning me-3" />
              <div>
                <h6 className="mb-1">Total Users</h6>
                <h4>{summary.users}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminPanel;
