import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { orderId } = useParams(); // optionally get orderId from URL params

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Thank You for Your Order!</h1>
      <p style={styles.message}>
        Your order has been placed successfully.
      </p>
      {orderId && (
        <p style={styles.orderId}>
          <strong>Order ID:</strong> {orderId}
        </p>
      )}

      <button
        style={styles.button}
        onClick={() => navigate("/")}
        aria-label="Go to Home Page"
      >
        Back to Home
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 600,
    margin: "4rem auto",
    padding: "2rem",
    textAlign: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    border: "1px solid #ddd",
    borderRadius: 8,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  title: {
    color: "#ef4100",
    marginBottom: "1rem",
  },
  message: {
    fontSize: "1.2rem",
    marginBottom: "1rem",
  },
  orderId: {
    fontSize: "1rem",
    marginBottom: "2rem",
    color: "#333",
  },
  button: {
    backgroundColor: "#ef4100",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "1rem",
    cursor: "pointer",
  },
};

export default OrderSuccess;
