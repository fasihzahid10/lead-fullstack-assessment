import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_SUPABASE_FN_URL ||
  "http://localhost:54321/functions/v1/entries";

export default function App() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadEntries() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Could not load entries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    setError("");
    try {
      const isEditing = Boolean(editingId);
      const target = isEditing ? `${API_URL}?id=${editingId}` : API_URL;
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(target, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }

      cancelEdit();
      loadEntries();
    } catch (err) {
      console.error(err);
      setError("Request failed");
    }
  }

  function startEdit(e) {
    setEditingId(e.id);
    setTitle(e.title || "");
    setDescription(e.description || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setDescription("");
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "3rem auto",
        fontFamily: "Inter, sans-serif",
        background: "#fafafa",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <h1 style={{ marginBottom: "0.5rem", fontSize: "2rem" }}>
        Super Admin Panel
      </h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Manage Supabase Entries (via Edge Functions)
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <input
          style={{
            padding: "10px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
          placeholder="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          style={{
            padding: "10px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "1rem",
            minHeight: "80px",
          }}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            style={{
              background: "#111",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            {editingId ? "Save Changes" : "Add Entry"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              style={{
                background: "#eee",
                border: "none",
                borderRadius: "6px",
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && (
        <p style={{ color: "red", background: "#fee", padding: "0.5rem" }}>
          {error}
        </p>
      )}

      <h2 style={{ marginBottom: "1rem" }}>Entries</h2>
      {loading ? (
        <p>Loading...</p>
      ) : entries.length === 0 ? (
        <p>No entries yet.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <thead style={{ background: "#f4f4f4" }}>
            <tr>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Timestamp</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td style={tdStyle}>{e.title}</td>
                <td style={tdStyle}>{e.description}</td>
                <td style={tdStyle}>
                  {e.timestamp ? new Date(e.timestamp).toLocaleString() : "-"}
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => startEdit(e)}
                    style={{
                      padding: "4px 10px",
                      border: "none",
                      borderRadius: "4px",
                      background: "#007bff",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={loadEntries}
        style={{
          marginTop: 20,
          padding: "8px 14px",
          borderRadius: "6px",
          border: "1px solid #ddd",
          background: "#f9f9f9",
          cursor: "pointer",
        }}
      >
        Refresh
      </button>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "10px",
  fontWeight: "600",
  color: "#333",
};

const tdStyle = {
  borderBottom: "1px solid #eee",
  padding: "10px",
  color: "#555",
};
