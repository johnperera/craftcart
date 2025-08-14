import React, { useEffect, useState } from "react";

const GRAPHQL_ENDPOINT = "https://craftcart.onrender.com/graphql";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    setLoading(true);
    const query = `
      query Orders {
        orders {
          id
          buyer {
            email
            name
          }
          total
          items {
            product {
              id
              name
            }
            quantity
            priceAtPurchase
          }
          status
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();

      if (result.errors) {
        setError(result.errors[0].message);
      } else {
        setOrders(result.data.orders);
        setFilteredOrders(result.data.orders); // initial display
      }
    } catch (err) {
      setError("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("You must be logged in to view orders.");
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [token]);

  const applyFilters = () => {
    let filtered = [...orders];

    if (statusFilter) {
      filtered = filtered.filter(
        (order) => order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (dateFrom) {
      const fromTimestamp = new Date(dateFrom).getTime();
      filtered = filtered.filter(
        (order) => Number(order.createdAt) >= fromTimestamp
      );
    }

    if (dateTo) {
      const toTimestamp = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1; // end of day
      filtered = filtered.filter(
        (order) => Number(order.createdAt) <= toTimestamp
      );
    }

    setFilteredOrders(filtered);
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading orders...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#ef4100" }}>
        Admin Orders
      </h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />

        <button
          onClick={applyFilters}
          style={{
            padding: "8px 16px",
            backgroundColor: "#ef4100",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Apply Filters
        </button>
      </div>

      {/* Orders Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <thead style={{ backgroundColor: "#ef4100", color: "#fff" }}>
          <tr>
            <th style={{ padding: "10px", textAlign: "left" }}>Order ID</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Buyer</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Items</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Total</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Created At</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "10px" }}>{order.id.slice(-6)}</td>
              <td style={{ padding: "10px" }}>
                {order.buyer.name} <br />
                <small>{order.buyer.email}</small>
              </td>
              <td style={{ padding: "10px" }}>
                {order.items.map((item) => (
                  <div key={item.product.id}>
                    {item.product.name} x {item.quantity} (${item.priceAtPurchase.toFixed(2)})
                  </div>
                ))}
              </td>
              <td style={{ padding: "10px" }}>${order.total.toFixed(2)}</td>
              <td style={{ padding: "10px" }}>{order.status}</td>
              <td style={{ padding: "10px" }}>
                {new Date(Number(order.createdAt)).toLocaleString()}
              </td>
              <td style={{ padding: "10px" }}>
                {new Date(Number(order.updatedAt)).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders;