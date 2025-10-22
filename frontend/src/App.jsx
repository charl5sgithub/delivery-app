import { useState } from "react";
import Login from "./components/Login";
import './App.css';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

function App() {
  const [user, setUser] = useState(null);
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     setUser(currentUser);
  //   });
  //   return () => unsubscribe();
  // }, []);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="app-container">
      <h1>Hello, {user.displayName}</h1>
      <p>🎉 You're logged in. Next: build your Landing Page & Cart!</p>
    </div>
  );
}

export default App;
