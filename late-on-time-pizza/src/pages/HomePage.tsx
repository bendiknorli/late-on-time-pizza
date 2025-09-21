import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useDemo } from "../lib/demo";
import { useAuth } from "../lib/auth";

export default function HomePage() {
    const { seed } = useDemo();
    const { user, logout } = useAuth();

    return (
        <section className="page">
            <div className="grid md:grid-cols-2 gap-6 items-stretch">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="glass rounded-2xl p-8"
                >
                    <h1 className="text-3xl font-bold mb-2">Welcome</h1>
                    <p className="text-white/70 mb-4">
                        Manage meeting groups and automatically award pizza
                        slices for lateness. Balances never expire.
                    </p>

                    {user ? (
                        <div className="mb-4 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                            <p className="text-green-300 text-sm">
                                ✅ Connected to Firebase as {user.email}
                            </p>
                        </div>
                    ) : (
                        <div className="mb-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                            <p className="text-blue-300 text-sm">
                                📱 Running in Demo Mode - data stored locally
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Link
                            to="/app"
                            className="px-4 py-2 rounded-lg bg-amber-500/90 hover:bg-amber-400 text-black font-medium transition-colors"
                        >
                            {user ? "My Groups" : "Enter Demo"}
                        </Link>
                        {user ? (
                            <button
                                onClick={logout}
                                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                            >
                                Sign Out
                            </button>
                        ) : (
                            <Link
                                to="/"
                                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="glass rounded-2xl p-8"
                >
                    <h2 className="text-xl font-semibold mb-2">How it works</h2>
                    <ul className="list-disc list-inside text-white/80 space-y-1">
                        <li>Create a group, invite members</li>
                        <li>Track minutes late per meeting</li>
                        <li>We compute slices and whole pizzas</li>
                    </ul>
                    <button
                        onClick={seed}
                        className="mt-4 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20"
                    >
                        Seed demo data
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
