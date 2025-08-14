import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "BUYER",
    profileImage: null,
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage") {
      setFormData((prev) => ({ ...prev, profileImage: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validation function
  const validateForm = () => {
    setError(null);

    // Name: letters and spaces only
    if (!/^[A-Za-z\s]+$/.test(formData.name)) {
      setError("Name can only contain letters and spaces.");
      return false;
    }

    // Email: basic regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    // Password: min 6 chars, at least one letter and one number
    if (
      formData.password.length < 6 ||
      !/[a-zA-Z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password)
    ) {
      setError(
        "Password must be at least 6 characters long and include at least one letter and one number."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    // Prepare GraphQL mutation
    const query = `
      mutation Register($registerInput3: RegisterInput!) {
        register(input: $registerInput3) {
          user {
            id
            name
            email
            role
            profileImage
            createdAt
          }
        }
      }
    `;

    const variables = {
      registerInput3: {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        profileImage: null, // adjust if you support uploading
      },
    };

    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });

      const json = await response.json();

      if (json.errors) {
        setError(json.errors[0].message || "Registration failed");
        return;
      }

      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError("Registration failed: " + err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Register</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <label style={styles.label}>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <label style={styles.label}>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <label style={styles.label}>Role:</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="BUYER">Buyer</option>
          <option value="ARTISAN">Artisan</option>
        </select>

        <label style={styles.label}>Profile Image:</label>
        <input
          type="file"
          name="profileImage"
          accept="image/*"
          onChange={handleChange}
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Register
        </button>

        {error && (
          <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>
            {error}
          </p>
        )}

        {success && (
          <p style={{ color: "green", marginTop: "1rem", textAlign: "center" }}>
            {success}
          </p>
        )}
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "auto",
    padding: "2rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    margin: "0.5rem 0 0.2rem",
  },
  input: {
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    marginTop: "1rem",
    padding: "0.75rem",
    fontSize: "1rem",
    backgroundColor: "#ef4100",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Register;
