import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Buyer",
    active: true,
  });
  const [loading, setLoading] = useState(false);

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

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    const query = `
      query Users {
        users {
          id
          name
          email
          role
          profileImage
          createdAt
        }
      }
    `;
    try {
      const data = await sendGraphQLRequest(query);
      // Assuming name format: "First Last", split it for the form
      const transformedUsers = data.users.map((u) => {
        const [firstName, ...lastName] = u.name.split(" ");
        return {
          _id: u.id,
          firstName: firstName || "",
          lastName: lastName.join(" ") || "",
          email: u.email,
          role: u.role.charAt(0) + u.role.slice(1).toLowerCase(), // Format role to match your UI
          active: true, // You might need to fetch this from backend if available
        };
      });
      setUsers(transformedUsers);
    } catch (err) {
      alert("Failed to fetch users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  // TODO: Implement these mutations on your backend and call them here
  const createUserMutation = `
    mutation CreateUser($input: CreateUserInput!) {
      createUser(input: $input) {
        id
      }
    }
  `;

  const updateUserMutation = `
    mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
      updateUser(id: $id, input: $input) {
        id
      }
    }
  `;

  const deleteUserMutation = `
    mutation DeleteUser($id: ID!) {
      deleteUser(id: $id)
    }
  `;

  const handleSave = async (e) => {
    e.preventDefault();

    // Prepare name as "FirstName LastName"
    const name = `${formData.firstName} ${formData.lastName}`.trim();

    // Prepare role in uppercase to match backend enums if needed
    const role = formData.role.toUpperCase();

    const input = {
      name,
      email: formData.email,
      role,
      // add more fields as needed
    };

    try {
      if (editData) {
        // Update user
        await sendGraphQLRequest(updateUserMutation, {
          id: editData._id,
          input,
        });
      } else {
        // Create user
        await sendGraphQLRequest(createUserMutation, { input });
      }
      await fetchUsers();
      setShowModal(false);
      setEditData(null);
      resetForm();
    } catch (err) {
      alert("Error saving user: " + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "Buyer",
      active: true,
    });
  };

  const openEditModal = (user) => {
    setEditData(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      active: user.active,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditData(null);
    resetForm();
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await sendGraphQLRequest(deleteUserMutation, { id });
      await fetchUsers();
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="container">
      <h2 className="mb-4">Manage Users</h2>
      <div className="text-end mb-3">
        {/* <button className="btn btn-primary" onClick={openAddModal}>
          Add User
        </button> */}
      </div>

      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            {/* <th>Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id}>
              <td>{index + 1}</td>
              <td>
                {user.firstName} {user.lastName}
              </td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.active ? "Active" : "Suspended"}</td>
              {/* <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => openEditModal(user)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(user._id)}
                >
                  Delete
                </button>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add/Edit Users Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{editData ? "Edit User" : "Add User"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Buyer">Buyer</option>
                <option value="Artisan">Artisan</option>
                <option value="Admin">Admin</option>
              </Form.Select>
            </Form.Group>
            {/* If you want to support active/suspended, add a checkbox here */}
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

export default AdminUsers;
