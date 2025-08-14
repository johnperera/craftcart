import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
export default function Checkout() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true); // Start in loading state
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const token = localStorage.getItem("token");

  const sendGraphQLRequest = async (query, variables = {}) => {
    const res = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);
    return json.data;
  };

  // Fetch cart from backend (GraphQL)
  useEffect(() => {
    const fetchCart = async () => {
      const query = `
        query {
          myCart {
            id
            items {
              product {
                id
                name
                price
              }
              quantity
            }
            subtotal
            totalItems
          }
        }
      `;

      try {
        const data = await sendGraphQLRequest(query);
        const transformedItems = data.myCart.items.map(
          ({ product, quantity }) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity,
          })
        );
        setCartItems(transformedItems);
        setTotal(data.myCart.subtotal);
      } catch (err) {
        setErrorMsg("Failed to fetch cart: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Canadian postal code regex: A1A 1A1 or A1A1A1
  const postalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

  // Expiry MM/YY regex, basic validation
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;

  // CVV 3 or 4 digits
  const cvvRegex = /^\d{3,4}$/;

  const validateForm = () => {
    const errors = {};

    if (!form.fullName.trim()) errors.fullName = "Full name is required.";
    if (!form.address.trim()) errors.address = "Address is required.";
    if (!form.city.trim()) errors.city = "City is required.";

    if (!form.postalCode.trim())
      errors.postalCode = "Postal code is required.";
    else if (!postalCodeRegex.test(form.postalCode.trim()))
      errors.postalCode = "Invalid Canadian postal code.";

    if (!form.cardNumber.trim())
      errors.cardNumber = "Card number is required.";
    else if (!/^\d{13,19}$/.test(form.cardNumber.trim()))
      errors.cardNumber = "Card number must be 13-19 digits.";

    if (!form.expiry.trim())
      errors.expiry = "Expiry date is required.";
    else if (!expiryRegex.test(form.expiry.trim()))
      errors.expiry = "Expiry must be in MM/YY format.";

    if (!form.cvv.trim())
      errors.cvv = "CVV is required.";
    else if (!cvvRegex.test(form.cvv.trim()))
      errors.cvv = "CVV must be 3 or 4 digits.";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!validateForm()) {
      setErrorMsg("Please fix the errors in the form.");
      return;
    }

    setLoading(true);


    /*
    const mutation = `...`;
    const variables = {...};
    try {
      const data = await sendGraphQLRequest(mutation, variables);
      setSuccessMsg(`Order placed! Order ID: ${data.placeOrder.id}`);
      // Clear cart, redirect, etc.
    } catch (err) {
      setErrorMsg("Failed to place order: " + err.message);
    } finally {
      setLoading(false);
    }
    */
    // setLoading(false);
    navigate("/orderSuccess");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "Segoe UI" }}>
      <h2 style={{ marginBottom: "1.5rem", color: "#ef4100" }}>Checkout</h2>

      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {loading && <p>Loading cart...</p>}

      {/* Cart Summary */}
      {!loading && (
        <div
          style={{
            marginBottom: "2rem",
            border: "1px solid #ddd",
            padding: "1rem",
            borderRadius: 8,
          }}
        >
          <h4 style={{ marginBottom: "1rem" }}>Cart Summary</h4>
          {cartItems.length === 0 ? (
            <p>No items in cart.</p>
          ) : (
            <ul style={{ paddingLeft: 20 }}>
              {cartItems.map((item) => (
                <li key={item.id} style={{ marginBottom: 6 }}>
                  {item.name} x {item.quantity} — $
                  {(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
          )}
          <h5 style={{ marginTop: "1rem" }}>Total: ${total.toFixed(2)}</h5>
        </div>
      )}

      {/* Checkout Form */}
      <form onSubmit={handleSubmit} noValidate>
        <h4>Shipping Information</h4>
        <input
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            marginBottom: 8,
            padding: 8,
            borderColor: validationErrors.fullName ? "red" : "#ccc",
          }}
        />
        {validationErrors.fullName && (
          <p style={{ color: "red", marginTop: -6, marginBottom: 8 }}>
            {validationErrors.fullName}
          </p>
        )}

        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            marginBottom: 8,
            padding: 8,
            borderColor: validationErrors.address ? "red" : "#ccc",
          }}
        />
        {validationErrors.address && (
          <p style={{ color: "red", marginTop: -6, marginBottom: 8 }}>
            {validationErrors.address}
          </p>
        )}

        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            marginBottom: 8,
            padding: 8,
            borderColor: validationErrors.city ? "red" : "#ccc",
          }}
        />
        {validationErrors.city && (
          <p style={{ color: "red", marginTop: -6, marginBottom: 8 }}>
            {validationErrors.city}
          </p>
        )}

        <input
          name="postalCode"
          placeholder="Postal Code (e.g. K1A 0B1)"
          value={form.postalCode}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            marginBottom: 16,
            padding: 8,
            borderColor: validationErrors.postalCode ? "red" : "#ccc",
          }}
        />
        {validationErrors.postalCode && (
          <p style={{ color: "red", marginTop: -6, marginBottom: 8 }}>
            {validationErrors.postalCode}
          </p>
        )}

        <h4>Payment Details</h4>
        <input
          name="cardNumber"
          placeholder="Card Number"
          value={form.cardNumber}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            marginBottom: 8,
            padding: 8,
            borderColor: validationErrors.cardNumber ? "red" : "#ccc",
          }}
          maxLength={19}
          inputMode="numeric"
          pattern="\d*"
        />
        {validationErrors.cardNumber && (
          <p style={{ color: "red", marginTop: -6, marginBottom: 8 }}>
            {validationErrors.cardNumber}
          </p>
        )}

        <input
          name="expiry"
          placeholder="MM/YY"
          value={form.expiry}
          onChange={handleChange}
          required
          style={{
            width: "48%",
            marginBottom: 8,
            padding: 8,
            marginRight: "4%",
            borderColor: validationErrors.expiry ? "red" : "#ccc",
          }}
          maxLength={5}
          pattern="(0[1-9]|1[0-2])\/\d{2}"
        />
        {validationErrors.expiry && (
          <p style={{ color: "red", marginTop: -6, marginBottom: 8 }}>
            {validationErrors.expiry}
          </p>
        )}

        <input
          name="cvv"
          placeholder="CVV"
          value={form.cvv}
          onChange={handleChange}
          required
          style={{
            width: "48%",
            marginBottom: 16,
            padding: 8,
            borderColor: validationErrors.cvv ? "red" : "#ccc",
          }}
          maxLength={4}
          inputMode="numeric"
          pattern="\d*"
        />
        {validationErrors.cvv && (
          <p style={{ color: "red", marginTop: -6, marginBottom: 8 }}>
            {validationErrors.cvv}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || cartItems.length === 0}
          style={{
            backgroundColor: "#ef4100",
            color: "#fff",
            padding: "12px 20px",
            border: "none",
            borderRadius: "4px",
            cursor: loading || cartItems.length === 0 ? "not-allowed" : "pointer",
            width: "100%",
          }}
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}
