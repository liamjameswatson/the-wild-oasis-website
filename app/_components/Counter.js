"use client";

import { useState } from "react";

export default function Counter({ users }) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>There are {users.length} users</h2>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
      <button onClick={() => setCount((c) => c + 1)}>click ME</button>

      <span>{count}</span>
    </div>
  );
}
