import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const GRAPHQL_ENDPOINT = "https://craftcart.onrender.com/graphql";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const sendGraphQLRequest = async (query, variables = {}) => {
    const token = localStorage.getItem("token"); // if auth needed
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);
    return json.data;
  };

  const fetchCategories = async () => {
    const query = `
      query {
        categories {
          id
          name
          description
        }
      }
    `;
    try {
      const data = await sendGraphQLRequest(query);
      setCategories(
        data.categories.map(({ id, name, description }) => ({
          _id: id,
          name,
          description,
        }))
      );
    } catch (err) {
      alert("Failed to fetch categories: " + err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const saveCategory = async (e) => {
    e.preventDefault();
    const input = { name, description };

    try {
      if (editData) {
        const mutation = `
          mutation UpdateCategory($id: ID!, $input: CategoryUpdateInput!) {
            updateCategory(id: $id, input: $input) {
              id
              name
              description
            }
          }
        `;
        await sendGraphQLRequest(mutation, {
          id: editData._id,
          input,
        });
      } else {
        const mutation = `
          mutation CreateCategory($input: CategoryInput!) {
            createCategory(input: $input) {
              id
              name
              description
            }
          }
        `;
        await sendGraphQLRequest(mutation, { input });
      }

      await fetchCategories();
      setShowModal(false);
      setEditData(null);
      setName("");
      setDescription("");
    } catch (err) {
      alert("Error saving category: " + err.message);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    const mutation = `
      mutation DeleteCategory($id: ID!) {
        deleteCategory(id: $id)
      }
    `;

    try {
      await sendGraphQLRequest(mutation, { id });
      await fetchCategories();
    } catch (err) {
      alert("Error deleting category: " + err.message);
    }
  };

  const openEditModal = (cat) => {
    setEditData(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditData(null);
    setName("");
    setDescription("");
    setShowModal(true);
  };

  return (
    <div className="container">
      <h2 className="mb-4">Manage Categories</h2>
      <div className="text-end mb-3">
        <button className="btn btn-primary" onClick={openAddModal}>
          Add Category
        </button>
      </div>

      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, index) => (
            <tr key={cat._id}>
              <td>{index + 1}</td>
              <td>{cat.name}</td>
              <td>{cat.description || "-"}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => openEditModal(cat)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteCategory(cat._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add/Edit Categories Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={saveCategory}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editData ? "Edit Category" : "Add Category"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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

export default AdminCategories;
