import { useState } from "react";
import Login from "./components/Login";

function App() {
  const [user, setUser] = useState(null);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="p-4">
      <h1>Hello, {user.displayName}</h1>
      <p>🎉 You're logged in. Next: build your Landing Page & Cart!</p>
    </div>
  );
}

export default App;
