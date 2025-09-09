
import React, { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

import awsExports from "./aws-exports";
import { listNotes } from "./graphql/queries";
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from "./graphql/mutations";

Amplify.configure(awsExports);
const client = generateClient();

const App = () => {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "" });

  async function fetchNotes() {
    const apiData = await client.graphql({ query: listNotes });
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await client.graphql({
      query: createNoteMutation,
      variables: { input: { ...formData } }
    });
    setFormData({ name: "", description: "" });
    fetchNotes();
  }

  async function deleteNote(id) {
    await client.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } }
    });
    fetchNotes();
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div style={{ padding: 20 }}>
          <h2>Hello, {user.username}</h2>
          <button onClick={signOut}>Sign Out</button>

          <h3>My Notes</h3>
          <input
            placeholder="Note name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            placeholder="Note description"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
          <button onClick={createNote}>Create Note</button>

          <div style={{ marginTop: 20 }}>
            {notes.map(n => (
              <div key={n.id} style={{ marginBottom: 10 }}>
                <strong>{n.name}</strong> – {n.description}
                <button onClick={() => deleteNote(n.id)} style={{ marginLeft: 10 }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Authenticator>
  );
};

export default App;
