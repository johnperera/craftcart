import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const sendGraphQLRequest = async (query, variables = {}) => {
    const res = await fetch("https://craftcart.onrender.com/graphql", {
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

  // ---------------- FETCH CART FROM GRAPHQL ----------------
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
      } catch (err) {
        alert("Failed to fetch cart: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const removeItem = async (productId) => {
    const query = `
    mutation RemoveFromCart($removeFromCartProductId2: ID!) {
      removeFromCart(productId: $removeFromCartProductId2) {
        id
        items {
          product {
            id
            name
            price
          }
          quantity
        }
        totalItems
        subtotal
      }
    }
  `;

    try {
      const data = await sendGraphQLRequest(query, {
        removeFromCartProductId2: productId,
      });

      const updatedItems = data.removeFromCart.items.map(
        ({ product, quantity }) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
        })
      );

      setCartItems(updatedItems);
    } catch (err) {
      alert("Error removing item: " + err.message);
    }
  };

  const clearCart = async () => {
    const query = `mutation { clearCart }`;
    try {
      await sendGraphQLRequest(query);
      setCartItems([]);
    } catch (err) {
      alert("Error clearing cart: " + err.message);
    }
  };

  const updateQuantity = async (id, newQty) => {
    if (newQty < 1) return;

    const query = `
      mutation UpdateCartItem($productId: ID!) {
        addToCart(productId: $productId) {
          id
        }
      }
    `;

    try {
      await sendGraphQLRequest(query, { productId: id, quantity: newQty });
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQty } : item
        )
      );
    } catch (err) {
      alert("Failed to update quantity: " + err.message);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ---------------- UI ----------------
  if (loading) return <p>Loading cart...</p>;

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "2rem auto",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <h2 style={{ color: "#ef4100", marginBottom: "1.5rem" }}>
        Your Shopping Cart
      </h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "1rem",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #ef4100" }}>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>
                  Product
                </th>
                <th style={{ textAlign: "center", padding: "0.5rem" }}>
                  Price
                </th>
                <th style={{ textAlign: "center", padding: "0.5rem" }}>
                  Quantity
                </th>
                <th style={{ textAlign: "center", padding: "0.5rem" }}>
                  Total
                </th>
                <th style={{ padding: "0.5rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(({ id, name, price, quantity }) => (
                <tr key={id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "0.5rem" }}>{name}</td>
                  <td style={{ textAlign: "center" }}>${price.toFixed(2)}</td>
                  <td style={{ textAlign: "center" }}>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        updateQuantity(id, Number(e.target.value))
                      }
                      style={{ width: "60px", textAlign: "center" }}
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    ${(price * quantity).toFixed(2)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(`Remove "${name}" from your cart?`)
                        ) {
                          removeItem(id);
                        }
                      }}
                      style={{
                        backgroundColor: "#ef4100",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ textAlign: "right", marginRight: "1rem" }}>
            Total: ${totalPrice.toFixed(2)}
          </h3>

          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}
          >
            <button
              onClick={clearCart}
              style={{
                backgroundColor: "#777",
                color: "#fff",
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Clear Cart
            </button>

            <Link
              to={`/checkout`}
              className="action-button"
              style={{
                textAlign: "center",
                backgroundColor: "#ef4100",
                color: "#fff",
                padding: "0.5rem",
                textDecoration: "none",
                borderRadius: "4px",
                fontWeight: 500,
                display: "block",
              }}
            >
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
