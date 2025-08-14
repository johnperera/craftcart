import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";
const IMAGE_UPLOAD_URL = "http://localhost:4000/upload";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    price: "",
    quantity: "",
    description: "",
    imageFile: null,
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const sendGraphQLRequest = async (query, variables = {}) => {
    const res = await fetch(GRAPHQL_ENDPOINT, {
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

  const fetchCategories = async () => {
    const query = `
      query Categories {
        categories {
          id
          name
        }
      }
    `;
    try {
      const data = await sendGraphQLRequest(query);
      setCategories(data.categories);
    } catch (err) {
      alert("Failed to fetch categories: " + err.message);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const query = `
      query {
        products {
          id
          name
          category {
            id
            name
          }
          price
          quantity
          description
        }
      }
    `;
    try {
      const data = await sendGraphQLRequest(query);
      const formatted = data.products.map((p) => ({
        _id: p.id,
        name: p.name,
        category: p.category?.name || "",
        categoryId: p.category?.id || "",
        price: p.price,
        quantity: p.quantity,
        description: p.description || "",
      }));
      setProducts(formatted);
    } catch (err) {
      alert("Failed to fetch products: " + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      setFormData((prev) => ({ ...prev, imageFile: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const price = parseFloat(formData.price);
    const quantity = parseInt(formData.quantity, 10);

    if (isNaN(price) || isNaN(quantity)) {
      alert("Please enter valid price and quantity.");
      return;
    }

    let uploadedImageUrl = null;

    if (formData.imageFile) {
      const form = new FormData();
      form.append("image", formData.imageFile);

      try {
        const res = await fetch(IMAGE_UPLOAD_URL, {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        uploadedImageUrl = data.url;
      } catch (err) {
        alert("Image upload failed: " + err.message);
        return;
      }
    }

    const input = {
      name: formData.name,
      description: formData.description,
      price,
      quantity,
      categoryId: formData.categoryId,
      images: uploadedImageUrl ? [uploadedImageUrl] : [],
    };

    try {
      if (editData) {
        const mutation = `
          mutation UpdateProduct($id: ID!, $input: ProductUpdateInput!) {
            updateProduct(id: $id, input: $input) {
              id
              name
            }
          }
        `;
        await sendGraphQLRequest(mutation, {
          id: editData._id,
          input,
        });
      } else {
        const mutation = `
          mutation CreateProduct($input: ProductInput!) {
            createProduct(input: $input) {
              id
              name
            }
          }
        `;
        await sendGraphQLRequest(mutation, { input });
      }

      await fetchProducts();
      setShowModal(false);
      setEditData(null);
      resetForm();
    } catch (err) {
      alert("Error saving product: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const mutation = `
      mutation DeleteProduct($id: ID!) {
        deleteProduct(id: $id)
      }
    `;

    try {
      await sendGraphQLRequest(mutation, { id });
      await fetchProducts();
    } catch (err) {
      alert("Error deleting product: " + err.message);
    }
  };

  const openEditModal = (product) => {
    setEditData(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      quantity: product.quantity,
      description: product.description,
      imageFile: null,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditData(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      categoryId: "",
      price: "",
      quantity: "",
      description: "",
      imageFile: null,
    });
  };

  return (
    <div className="container">
      <h2 className="mb-4">Manage Products</h2>

      <div className="text-end mb-3">
        <button className="btn btn-primary" onClick={openAddModal}>
          Add Product
        </button>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price ($)</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod, index) => (
              <tr key={prod._id}>
                <td>{index + 1}</td>
                <td>{prod.name}</td>
                <td>{prod.category}</td>
                <td>{parseFloat(prod.price).toFixed(2)}</td>
                <td>{prod.quantity}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => openEditModal(prod)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(prod._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{editData ? "Edit Product" : "Add Product"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Product Image</Form.Label>
              <Form.Control type="file" name="imageFile" accept="image/*" onChange={handleChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editData ? "Update" : "Add"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProducts;
