import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const GRAPHQL_ENDPOINT = "https://craftcart.onrender.com/graphql";
const IMAGE_URL = "http://localhost:4000";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      const query = `
        query Product($productId2: ID!) {
          product(id: $productId2) {
            id
            name
            description
            price
            quantity
            images
            category {
              id,
              name
            }
            artisan {
              name
            }
            reviews {
              rating
            }
            createdAt
            updatedAt
          }
        }
      `;

      const variables = { productId2: id };

      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables }),
        });

        const result = await response.json();
        const currentProduct = result.data?.product || null;
        setProduct(currentProduct);

        // Fetch related products using categoryId
        if (currentProduct?.category?.id) {
          fetchRelatedProducts(currentProduct.category.id, currentProduct.id);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedProducts = async (categoryId, excludeId) => {
      const query = `
        query Products($filter: ProductFilter) {
          products(filter: $filter) {
            id
            name
            description
            price
            quantity
            images
            category { name }
            artisan { name }
            createdAt
            updatedAt
          }
        }
      `;

      const variables = { filter: { categoryId } };

      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables }),
        });

        const result = await response.json();
        // Exclude current product and limit to 4 items
        const related = result.data.products
          .filter((p) => p.id !== excludeId)
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (error) {
        console.error("Error fetching related products:", error);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to add to cart.");
      return;
    }

    const query = `
      mutation AddToCart($productId: ID!, $quantity: Int) {
        addToCart(productId: $productId, quantity: $quantity) {
          id
          subtotal
          totalItems
        }
      }
    `;

    const variables = {
      productId: id,
      quantity: parseInt(quantity),
    };

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables }),
      });

      const result = await response.json();

      if (result.errors) {
        alert(result.errors[0].message);
      } else {
        alert("Product added to cart!");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart.");
    }
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", padding: "50px" }}>Loading product...</p>
    );
  if (!product)
    return (
      <p style={{ textAlign: "center", padding: "50px" }}>Product not found.</p>
    );

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 20px" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {/* Image Section */}
        <div style={{ flex: "1 1 300px", padding: "20px" }}>
          <img
            src={IMAGE_URL + product.images[0]}
            alt={product.name}
            style={{
              width: "100%",
              borderRadius: "8px",
              objectFit: "cover",
              maxHeight: "400px",
            }}
          />
        </div>

        {/* Info Section */}
        <div style={{ flex: "1 1 400px", padding: "20px" }}>
          <h2 style={{ marginBottom: "10px" }}>{product.name}</h2>
          <p style={{ color: "#666", marginBottom: "15px" }}>
            {product.description}
          </p>

          <p>
            <strong>Price:</strong> ${product.price.toFixed(2)}
          </p>
          <p>
            <strong>Available:</strong> {product.quantity}
          </p>
          <p>
            <strong>Category:</strong> {product.category.name}
          </p>
          <p>
            <strong>Artisan:</strong> {product.artisan.name}
          </p>

          {/* Quantity & Button */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <label htmlFor="quantity">
              <strong>Qty:</strong>
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              max={product.quantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={{
                width: "70px",
                padding: "6px 8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={addToCart}
              style={{
                padding: "10px 16px",
                backgroundColor: "#ef4100",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h3 style={{ marginBottom: "20px" }}>Related Products</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  padding: "10px",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <img
                  src={IMAGE_URL + (p.images[0] || "/uploads/default.png")}
                  alt={p.name}
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    marginBottom: "10px",
                  }}
                />
                <h4 style={{ fontSize: "1rem", marginBottom: "5px" }}>
                  {p.name}
                </h4>
                <p style={{ color: "#666", fontSize: "0.9rem" }}>
                  ${p.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
