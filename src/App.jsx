
import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import { Authenticator } from "@aws-amplify/ui-react";

import awsExports from "./aws-exports";
import { listTodos } from "./graphql/queries";
import {
  createTodo as createTodoMutation,
  deleteTodo as deleteTodoMutation,
} from "./graphql/mutations";

Amplify.configure(awsExports);

const client = generateClient();

const App = () => {
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // Fetch Todos
  async function fetchTodos() {
    try {
      const apiData = await client.graphql({ query: listTodos });
      setTodos(apiData.data.listTodos.items);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  }

  // Create Todo
  async function createTodo() {
    if (!formData.name || !formData.description) return;
    try {
      await client.graphql({
        query: createTodoMutation,
        variables: { input: { ...formData } },
      });
      setFormData({ name: "", description: "" });
      fetchTodos();
    } catch (err) {
      console.error("Error creating note:", err);
    }
  }

  // Delete Todo
  async function deleteTodo(id) {
    try {
      await client.graphql({
        query: deleteTodoMutation,
        variables: { input: { id } },
      });
      fetchTodos();
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  }

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div style={{ padding: 20 }}>
          <h2>Hello, {user?.username}</h2>
          <button onClick={signOut}>Sign Out</button>

          <h3>My Notes</h3>
          <input
            placeholder="Note name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          <input
            placeholder="Note description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <button onClick={createTodo}>Create Note</button>

          <div style={{ marginTop: 20 }}>
            {todos.map((t) => (
              <div key={t.id} style={{ marginBottom: 10 }}>
                <strong>{t.name}</strong> – {t.description}
                <button
                  onClick={() => deleteTodo(t.id)}
                  style={{ marginLeft: 10 }}
                >
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
