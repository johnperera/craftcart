import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        role
        id
        name
        email
      }
    }
  }
`;

export default function Login() {
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const variables = {
      input: { email: formState.email, password: formState.password },
    };

    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: LOGIN_MUTATION, variables }),
      });

      const json = await response.json();

      if (json.errors) {
        setError(json.errors[0].message || "Login failed");
        return;
      }

      const { token, user } = json.data.login;

      // Save token and user info to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "ADMIN" || user.role === "ARTISAN") {
        window.location.href = "#/admin"; // full redirect for admin
      } else {
        navigate("/"); // navigate within app for regular users
      }
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "400px",
        margin: "4rem auto",
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "1.5rem",
          color: "#ef4100",
        }}
      >
        Login to CraftCart
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1.2rem" }}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: 500,
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formState.email}
            onChange={(e) =>
              setFormState({ ...formState, email: e.target.value })
            }
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: 500,
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formState.password}
            onChange={(e) =>
              setFormState({ ...formState, password: e.target.value })
            }
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#ef4100",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "1rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Login
        </button>

        {error && (
          <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
