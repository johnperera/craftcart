import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Ensure this file has the base styles

export default function Home() {
  const featuredProducts = [
    {
      id: 1,
      name: "Featured Handmade Vase",
      description: "Beautiful ceramic vase with unique patterns",
      price: 65.99,
      imageUrl: "/img/vase.jpg"
    },
    {
      id: 2,
      name: "Artisan Wooden Chair",
      description: "Handcrafted oak chair with comfortable cushion",
      price: 120.00,
      imageUrl: "/img/chair.jpg"
    }
  ];

  return (
    <div className="home-container" style={{ padding: '2rem', }}>
      <h1 style={{ textAlign: 'center', color: '#ef4100', marginBottom: '1.5rem', fontWeight: '700' }}>
        Welcome to CraftCart
      </h1>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
        Featured Products
      </h2>

      <div className="card-container" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {featuredProducts.map(product => (
          <div key={product.id} className="feature-card" style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            maxWidth: '300px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s ease',
          }}>
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover'
              }}
            />
            <div style={{ padding: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#000' }}>{product.name}</h4>
              <p style={{ fontSize: '0.95rem', color: '#555' }}>{product.description}</p>
              <p style={{ fontWeight: 'bold', color: '#000' }}>${product.price.toFixed(2)}</p>
              {/* <Link
                to={`/products/${product.id}`}
                className="action-button"
                style={{
                  display: 'inline-block',
                  marginTop: '0.75rem',
                  backgroundColor: '#ef4100',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                View Product
              </Link> */}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ textAlign: 'center', margin: '3rem 0 2rem', color: '#333' }}>
        Explore More
      </h2>

      <div className="card-container" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="feature-card" style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '300px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}>
          <h4 style={{ color: '#000' }}>Browse All Products</h4>
          <p style={{ color: '#555' }}>Discover unique handmade items from local artisans</p>
          <Link
            to="/products"
            className="action-button"
            style={{
              backgroundColor: '#ef4100',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: '500',
              marginTop: '1rem',
              display: 'inline-block'
            }}
          >
            View Marketplace
          </Link>
        </div>

        {/* <div className="feature-card" style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '300px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}>
          <h4 style={{ color: '#000' }}>For Artisans</h4>
          <p style={{ color: '#555' }}>Sell your handmade creations on our platform</p>
          <Link
            to="/artisan"
            className="action-button"
            style={{
              backgroundColor: '#ef4100',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: '500',
              marginTop: '1rem',
              display: 'inline-block'
            }}
          >
            Artisan Dashboard
          </Link>
        </div> */}
      </div>
    </div>
  );
}
