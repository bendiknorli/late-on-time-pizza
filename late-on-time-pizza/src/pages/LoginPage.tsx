import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const { signInWithEmail, signUpWithEmail, signInWithGoogle, user } =
        useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate("/app");
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        setMessage("");

        try {
            if (isSignUp) {
                await signUpWithEmail(email, password);
                setMessage(
                    "Account created successfully! You're now signed in."
                );
            } else {
                await signInWithEmail(email, password);
                setMessage("Signed in successfully!");
            }
            navigate("/app");
        } catch (error: any) {
            console.error("Auth error:", error);
            setMessage(
                error.message || "Authentication failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setMessage("");

        try {
            await signInWithGoogle();
            setMessage("Signed in with Google!");
            navigate("/app");
        } catch (error: any) {
            console.error("Google sign-in error:", error);
            setMessage(
                error.message || "Google sign-in failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <h1>🍕 Late on Time Pizza</h1>
                    <p>Sign in to manage your pizza debts</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !email || !password}
                        className="login-button"
                    >
                        {loading
                            ? "Please wait..."
                            : isSignUp
                            ? "Create Account"
                            : "Sign In"}
                    </button>

                    <div className="auth-toggle">
                        <p>
                            {isSignUp
                                ? "Already have an account?"
                                : "Don't have an account?"}
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="toggle-button"
                                disabled={loading}
                            >
                                {isSignUp ? "Sign In" : "Sign Up"}
                            </button>
                        </p>
                    </div>

                    <div className="divider">
                        <span>or</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="google-button"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path
                                fill="#4285F4"
                                d="M18 9.2C18 8.5 17.9 7.9 17.8 7.3H9.2v3.6h4.9c-.2 1.1-.8 2-1.7 2.6v2.1h2.7c1.6-1.5 2.5-3.6 2.5-6.2z"
                            />
                            <path
                                fill="#34A853"
                                d="M9.2 18c2.4 0 4.4-.8 5.9-2.2l-2.7-2.1c-.8.5-1.8.8-3.2.8-2.4 0-4.5-1.6-5.2-3.8H1.1v2.2C2.6 16 5.7 18 9.2 18z"
                            />
                            <path
                                fill="#FBBC04"
                                d="M4 10.7c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V5.1H1.1C.4 6.5 0 7.8 0 9.2s.4 2.7 1.1 4.1l2.9-2.6z"
                            />
                            <path
                                fill="#EA4335"
                                d="M9.2 3.6c1.4 0 2.6.5 3.6 1.4l2.7-2.7C14.6.7 12.1 0 9.2 0 5.7 0 2.6 2 1.1 5.1l2.9 2.6c.7-2.2 2.8-3.8 5.2-3.8z"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    {message && (
                        <div
                            className={`message ${
                                message.includes("successfully")
                                    ? "success"
                                    : "error"
                            }`}
                        >
                            {message}
                        </div>
                    )}
                </form>

                <div className="demo-link">
                    <p>Want to try it out first?</p>
                    <button
                        onClick={() => navigate("/app")}
                        className="demo-button"
                    >
                        Continue with Demo Mode
                    </button>
                </div>
            </div>
        </div>
    );
}
