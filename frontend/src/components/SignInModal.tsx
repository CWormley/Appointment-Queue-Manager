/**
 * SignInModal Component
 * 
 * @description
 * Authentication modal with sign-in and sign-up functionality.
 * Handles user authentication, account creation, and local storage
 * of user session data. Provides seamless switching between modes.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
 *
 */
import { useState } from "react";
import { userAPI } from "../services/api";

interface SignInModalProps {
  onSignIn: (email: string, userId: string, name?: string) => void;
  onClose: () => void;
}

function SignInModal({ onSignIn, onClose }: SignInModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // Sign up mode - create new user
        if (!name.trim()) {
          setError("Name is required for sign up");
          setLoading(false);
          return;
        }
        const user = await userAPI.create(email, name);
        console.log("Created user:", user);
        onSignIn(email, user.id, user.name);
      } else {
        // Sign in mode - find existing user
        const user = await userAPI.findByEmail(email);
        if (!user) {
          setError("User not found. Please sign up or check your email.");
        } else {
          console.log("Signed in user:", user);
          onSignIn(email, user.id, user.name);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      if (isSignUp) {
        setError(`Failed to create account: ${errorMessage}`);
      } else {
        setError(`Failed to sign in: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 w-96 shadow-lg relative z-[10000]">
        <h2 className="text-2xl font-bold mb-6">{isSignUp ? "Create Account" : "Sign In"}</h2>
        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Your Full Name"
                required={isSignUp}
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="your@email.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
          >
            {loading ? (isSignUp ? "Creating Account..." : "Signing In...") : (isSignUp ? "Create Account" : "Sign In")}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setEmail("");
                setName("");
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full text-gray-600 hover:text-gray-800 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default SignInModal;