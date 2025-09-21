import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Pizza, Users, LogIn, LogOut } from "lucide-react";
import { useAuth } from "./lib/auth";
import "./components/Navbar.css";

function AppShell() {
    const location = useLocation();
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen h-full flex flex-col">
            <header className="navbar">
                <div className="navbar-container">
                    <Link to="/app" className="navbar-logo">
                        <Pizza className="navbar-logo-icon" />
                        <span className="navbar-logo-text">
                            Late On Time Pizza
                        </span>
                    </Link>

                    <nav className="navbar-nav">
                        <Link
                            to="/app"
                            className={`navbar-nav-item ${
                                location.pathname === "/app" ||
                                location.pathname.startsWith("/app/groups")
                                    ? "active"
                                    : ""
                            }`}
                        >
                            <Users className="navbar-nav-icon" />
                            <span>Groups</span>
                        </Link>

                        {user ? (
                            <div className="navbar-user-section">
                                <span className="navbar-user-email">
                                    {user.email}
                                </span>
                                <button
                                    onClick={logout}
                                    className="navbar-sign-out-btn"
                                >
                                    <LogOut className="navbar-nav-icon" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        ) : (
                            <Link to="/" className="navbar-sign-in-btn">
                                <LogIn className="navbar-nav-icon" />
                                <span>Sign In</span>
                            </Link>
                        )}
                    </nav>
                </div>
            </header>
            <main className="flex-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

export default AppShell;
