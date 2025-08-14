import React from 'react';
import { Link } from 'react-router-dom';
const IMAGE_URL = "http://localhost:4000";

const ProductTable = ({ products }) => {
  return (
    <div
      className="product-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.5rem',
      }}
    >
      {products.map((product) => (
        <div
          key={product.id}
          className="product-card"
          style={{
            backgroundColor: '#fff',
            border: '1px solid #eee',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <img
            src={IMAGE_URL + product.imageUrl}
            alt={product.name}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
            }}
          />
          <div className="product-info" style={{ padding: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem' }}>{product.name}</h4>
            <p style={{ fontSize: '0.95rem', color: '#555', minHeight: '60px' }}>
              {product.description}
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 500,
                fontSize: '0.95rem',
                marginBottom: '0.75rem',
              }}
            >
              <span style={{ color: '#000' }}>${product.price.toFixed(2)}</span>
              <span style={{ color: '#777' }}>By: {product.artisan}</span>
            </div>
            <Link
              to={`/products/${product.id}`}
              className="action-button"
              style={{
                textAlign: 'center',
                backgroundColor: '#ef4100',
                color: '#fff',
                padding: '0.5rem',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: 500,
                display: 'block',
              }}
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductTable;
