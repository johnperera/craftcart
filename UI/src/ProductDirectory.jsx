import React from 'react';
import ProductTable from './components/ProductTable';

const API_URL = "https://craftcart.onrender.com/graphql";

class ProductDirectory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      filteredProducts: [],
      categories: [],
      searchText: '',
      selectedCategory: null,
      minPrice: '',
      maxPrice: '',
      loading: false,
      error: null
    };
    this.searchProducts = this.searchProducts.bind(this);
  }

  async loadProducts(filter = {}) {
    try {
      this.setState({ loading: true });

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query($filter: ProductFilter) {
              products(filter: $filter) {
                id
                name
                description
                price
                quantity
                images
                category { id, name }
                artisan { name }
                reviews { rating }
                createdAt
                updatedAt
              }
            }
          `,
          variables: { filter }
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
      this.setState({ error: error.message, loading: false });
    }
  }

  async loadCategories() {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              categories {
                id
                name
              }
            }
          `
        })
      });

      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);

      this.setState({ categories: result.data.categories });
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }

  componentDidMount() {
    this.loadProducts();
    this.loadCategories();
  }

  searchProducts() {
    const { searchText, selectedCategory, minPrice, maxPrice } = this.state;
    const filter = {
      searchQuery: searchText || null,
      categoryId: selectedCategory || null,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      artisanId: null
    };

    this.loadProducts(filter);
  }

  render() {
    const { categories, searchText, selectedCategory, minPrice, maxPrice, loading, error, filteredProducts } = this.state;

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
          className="filters-container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '2.5rem'
          }}
        >
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search handmade items..."
            value={searchText}
            onChange={(e) => this.setState({ searchText: e.target.value }, this.searchProducts)}
            style={{
              padding: '0.75rem 1rem',
              width: '200px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              boxShadow: '0 1px 5px rgba(0,0,0,0.1)'
            }}
          />

          {/* Category Dropdown */}
          <select
            value={selectedCategory || ''}
            onChange={(e) => this.setState({ selectedCategory: e.target.value || null }, this.searchProducts)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem'
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Min Price */}
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => this.setState({ minPrice: e.target.value }, this.searchProducts)}
            style={{
              padding: '0.75rem 1rem',
              width: '100px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem'
            }}
          />

          {/* Max Price */}
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => this.setState({ maxPrice: e.target.value }, this.searchProducts)}
            style={{
              padding: '0.75rem 1rem',
              width: '100px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem'
            }}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#555' }}>Loading products...</p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
        ) : (
          <ProductTable products={filteredProducts} />
        )}
      </div>
    );
  }
}

export default ProductDirectory;
