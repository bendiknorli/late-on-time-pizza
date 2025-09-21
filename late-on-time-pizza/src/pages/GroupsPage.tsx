//
import { motion } from "framer-motion";
import { useDemo } from "../lib/demo";
import { useAuth } from "../lib/auth";
import { repo } from "../lib/repo";
import { firebaseRealtimeRepo } from "../lib/firebaseRealtimeRepo";
import { useNavigate } from "react-router-dom";
import "./GroupsPage.css";

export default function GroupsPage() {
    const { state, isFirebaseMode } = useDemo();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Check if current user is admin of a specific group
    const isUserAdminOfGroup = (groupId: string) => {
        if (!user?.email) return false;
        const group = state.groups.find((g) => g.id === groupId);
        if (!group?.settings?.adminEmails) return false;
        return group.settings.adminEmails.includes(user.email);
    };

    const demo = state.groups.map((g) => ({
        id: g.id,
        name: g.name,
        emoji: g.emoji,
        color: g.color,
        members: g.members.length,
        pizzas: Math.floor(
            g.members.reduce((a, m) => a + m.totalSlices, 0) / 6
        ),
    }));

    return (
        <section className="groups-page">
            <div className="groups-header">
                <div className="groups-title-section">
                    <h1>Your Groups</h1>
                    <p>Manage your meeting groups and pizza debts</p>
                </div>
                <button
                    className="create-group-btn"
                    onClick={async () => {
                        const name = prompt("Group name:");
                        if (!name) return;
                        const emoji = prompt("Emoji (e.g. 🍕):", "🍕") || "🍕";
                        const color =
                            prompt("Header color (hex):", "#f59e0b") ||
                            "#f59e0b";

                        try {
                            if (isFirebaseMode) {
                                const g =
                                    await firebaseRealtimeRepo.createGroup({
                                        name,
                                        emoji,
                                        color,
                                        adminId: "current-user", // This will be replaced with actual user ID in the repo
                                        adminEmail: user?.email || "",
                                    });
                                navigate(`/app/groups/${g.id}`);
                            } else {
                                const g = repo.createGroup({
                                    name,
                                    emoji,
                                    color,
                                    adminId: "demo-user",
                                });
                                navigate(`/app/groups/${g.id}`);
                            }
                        } catch (error) {
                            console.error("Error creating group:", error);
                            alert("Failed to create group. Please try again.");
                        }
                    }}
                >
                    + Create Group
                </button>
            </div>
            {demo.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-text">
                        No groups yet. Click "Create Group" to get started.
                    </div>
                </div>
            ) : (
                <div className="groups-grid">
                    {demo.map((g, i) => (
                        <motion.div
                            key={g.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="group-card"
                        >
                            {/* Colored header bar with emoji */}
                            <div
                                className="group-card-header"
                                style={{ background: g.color }}
                            >
                                <span
                                    className="group-card-emoji"
                                    aria-hidden="true"
                                >
                                    {g.emoji}
                                </span>
                            </div>

                            <div className="group-card-content">
                                <div className="group-card-title">
                                    <h2>{g.name}</h2>
                                    {isUserAdminOfGroup(g.id) && (
                                        <span className="group-card-crown">
                                            👑
                                        </span>
                                    )}
                                </div>

                                <div className="group-card-members">
                                    <span>👥</span>
                                    <span>{g.members} members</span>
                                </div>

                                <div className="group-card-pizza-stats">
                                    <div className="group-card-pizza-number">
                                        {g.pizzas}
                                    </div>
                                    <div className="group-card-pizza-label">
                                        pizzas owed
                                    </div>
                                </div>

                                <button
                                    className="group-card-btn"
                                    onClick={() =>
                                        navigate(`/app/groups/${g.id}`)
                                    }
                                >
                                    View Group
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Create New Group Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * demo.length }}
                        className="create-new-group-card"
                        onClick={async () => {
                            const name = prompt("Group name:");
                            if (!name) return;
                            const emoji =
                                prompt("Emoji (e.g. 🍕):", "🍕") || "🍕";
                            const color =
                                prompt("Header color (hex):", "#f59e0b") ||
                                "#f59e0b";

                            try {
                                if (isFirebaseMode) {
                                    const g =
                                        await firebaseRealtimeRepo.createGroup({
                                            name,
                                            emoji,
                                            color,
                                            adminId: "current-user",
                                            adminEmail: user?.email || "",
                                        });
                                    navigate(`/app/groups/${g.id}`);
                                } else {
                                    const g = repo.createGroup({
                                        name,
                                        emoji,
                                        color,
                                        adminId: "demo-user",
                                    });
                                    navigate(`/app/groups/${g.id}`);
                                }
                            } catch (error) {
                                console.error("Error creating group:", error);
                                alert(
                                    "Failed to create group. Please try again."
                                );
                            }
                        }}
                    >
                        <div className="create-new-group-icon">
                            <span>+</span>
                        </div>
                        <h3>Create New Group</h3>
                        <p>Start tracking pizza debts</p>
                    </motion.div>
                </div>
            )}

            {/* Quick Stats Section */}
            <div className="quick-stats-section">
                <h2 className="quick-stats-title">Quick Stats</h2>
                <div className="quick-stats-grid">
                    <div className="quick-stat-card">
                        <div className="quick-stat-number">{demo.length}</div>
                        <div className="quick-stat-label">Total Groups</div>
                    </div>
                    <div className="quick-stat-card">
                        <div className="quick-stat-number">
                            {demo.reduce((total, g) => total + g.members, 0)}
                        </div>
                        <div className="quick-stat-label">Total Members</div>
                    </div>
                    <div className="quick-stat-card">
                        <div className="quick-stat-number">
                            {demo.reduce((total, g) => total + g.pizzas, 0)}
                        </div>
                        <div className="quick-stat-label">Pizzas Owed</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
