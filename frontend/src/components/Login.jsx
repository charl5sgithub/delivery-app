import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebaseConfig";

export default function Login({ onLogin }) {
  const handleLogin = async () => {
    try {
      // ✅ Prevent re-click while popup is open
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      onLogin(user); // update parent component state
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  return (
  <div className="login-container">
      <h2>Welcome to Delivery App</h2>
      <button className="login-button" onClick={handleLogin}>
        Sign in with Google
      </button>
    </div>
  );
}
