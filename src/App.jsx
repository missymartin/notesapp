
import React, { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import { generateClient } from 'aws-amplify/api';

import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
Amplify.configure(awsExports);

const App = () => {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const client = generateClient();

  async function fetchNotes() {
    const apiData = await client.listNotes();
    setNotes(apiData.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await client.createNote({ input: { ...formData } });
    setFormData({ name: '', description: '' });
    fetchNotes();
  }

  async function deleteNote(id) {
    await client.deleteNote({ input: { id } });
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

/*
import reactLogo from "./assets/react.svg";
import "./App.css";
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={reactLogo} className="logo react" alt="React logo" />
        <h1>Hello from Amplify</h1>
      </header>
    </div>
  );
}
export default App;
*/
