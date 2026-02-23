import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../firebaseConfig';

export default function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      // AuthContext automatically picks up the new user via onAuthStateChanged
    } catch (error) {
      console.error('Google login failed:', error);
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
