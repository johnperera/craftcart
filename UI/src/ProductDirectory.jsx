import React from 'react';
import { Link } from 'react-router-dom';
import ProductTable from './components/ProductTable';

const API_URL = "http://localhost:4000/graphql";

class ProductDirectory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      filteredProducts: [],
      loading: false,
      error: null
    };
    this.searchProducts = this.searchProducts.bind(this);
  }

  async loadProducts() {
  try {
    this.setState({ loading: true });

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            products {
              id
              name
              description
              price
              quantity
              images
              category { name }
              artisan { name }
              reviews { rating }
              createdAt
              updatedAt
            }
          }
        `
      })
    });

    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);

    const transformedProducts = result.data.products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.quantity,
      imageUrl: p.images?.[0] || "/uploads/default.png",
      category: p.category?.name || "Uncategorized",
      artisan: p.artisan?.name || "Unknown"
    }));

    this.setState({
      products: transformedProducts,
      filteredProducts: transformedProducts,
      loading: false
    });
  } catch (error) {
    this.setState({
      error: error.message,
      loading: false
    });
  }
}


  componentDidMount() {
    this.loadProducts();
  }

  searchProducts(searchText) {
    const filtered = this.state.products.filter(product => 
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase()) ||
      product.category.toLowerCase().includes(searchText.toLowerCase())
    );
    this.setState({ filteredProducts: filtered });
  }

render() {
  return (
    <div
      className="product-directory"
      style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'Segoe UI, sans-serif',
        minHeight: '100vh'
      }}
    >
      <h1
        style={{
          color: '#ef4100',
          marginBottom: '2rem',
          textAlign: 'center',
          fontWeight: '700',
          fontSize: '2rem'
        }}
      >
        CraftCart Marketplace
      </h1>

      <div
        className="search-container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2.5rem'
        }}
      >
        <input
          type="text"
          placeholder="Search handmade items..."
          onChange={(e) => this.searchProducts(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            boxShadow: '0 1px 5px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      {this.state.loading ? (
        <p style={{ textAlign: 'center', color: '#555' }}>Loading products...</p>
      ) : (
        <ProductTable products={this.state.filteredProducts} />
      )}
    </div>
  );
}
}

export default ProductDirectory;