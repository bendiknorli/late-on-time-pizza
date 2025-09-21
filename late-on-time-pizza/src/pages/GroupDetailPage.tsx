import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDemo } from "../lib/demo";
import { useAuth } from "../lib/auth";
import { firebaseRealtimeRepo } from "../lib/firebaseRealtimeRepo";
import { repo } from "../lib/repo";
import { slicesForMinutes } from "../lib/pizza";
import PizzaSliceDisplay from "../components/PizzaSliceDisplay";
import pizzaImage from "../assets/pizza.png";
import { useMemo, useState } from "react";
import { Trash2, Minus } from "lucide-react";
import "./GroupDetailPage.css";

export default function GroupDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, isFirebaseMode } = useDemo();
    const { user } = useAuth();
    const [minuteInputs, setMinuteInputs] = useState<Record<string, string>>(
        {}
    );
    const [feedbackMessages, setFeedbackMessages] = useState<
        Record<string, string>
    >({});

    const group = useMemo(
        () => state.groups.find((g) => g.id === id),
        [state, id]
    );
    const members = group?.members ?? [];

    // Check if current user is admin
    const isCurrentUserAdmin = () => {
        if (!user?.email || !group?.settings?.adminEmails) return false;
        return group.settings.adminEmails.includes(user.email);
    };

    const handleAddMember = async () => {
        if (!group || !id) return;

        // Check if current user is admin
        if (!isCurrentUserAdmin()) {
            alert("Only administrators can add members to this group.");
            return;
        }

        const memberName = prompt("Member name:");
        if (!memberName?.trim()) return;

        try {
            if (isFirebaseMode) {
                await firebaseRealtimeRepo.addMember(id, {
                    name: memberName.trim(),
                });
            } else {
                repo.addMember(id, {
                    displayName: memberName.trim(),
                    initials: memberName
                        .trim()
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase(),
                    role: "normal",
                });
            }
        } catch (error) {
            console.error("Error adding member:", error);
            alert("Failed to add member. Please try again.");
        }
    };

    const calculateSlicesFromMinutes = (minutes: number): number => {
        const curveShift = group?.settings?.curveShift ?? 0.3;
        const calculatedSlices = slicesForMinutes(minutes, { curveShift });
        // Ensure any minutes > 0 results in at least 1 slice
        return Math.max(1, calculatedSlices);
    };

    const handleAddMinutes = async (memberId: string, minutes: number) => {
        if (!group || !id || minutes <= 0) return;

        // Check if current user is admin
        if (!isCurrentUserAdmin()) {
            alert("Only administrators can add minutes to members.");
            return;
        }

        try {
            // Calculate pizza slices from minutes using the formula with ceiling
            const newSlices = calculateSlicesFromMinutes(minutes);

            // Get current member data
            const member = members.find((m) => m.id === memberId);
            if (!member) return;

            // Add slices to current total
            const updatedSlices = member.totalSlices + newSlices;

            if (isFirebaseMode) {
                await firebaseRealtimeRepo.updateMember(id, memberId, {
                    totalSlices: updatedSlices,
                });
            } else {
                // Update local repo (this will trigger a re-render via demo provider)
                repo.correctMember(
                    id,
                    memberId,
                    newSlices,
                    "demo-user",
                    `Added ${minutes} minutes late`
                );
            }
        } catch (error) {
            console.error("Error adding minutes:", error);
            alert("Failed to add minutes. Please try again.");
        }
    };

    const handleMinuteInputChange = (memberId: string, value: string) => {
        setMinuteInputs((prev) => ({
            ...prev,
            [memberId]: value,
        }));
    };

    const handleMinuteInputSubmit = (memberId: string, e: React.FormEvent) => {
        e.preventDefault();
        const minutesStr = minuteInputs[memberId] || "";
        const minutes = parseFloat(minutesStr); // Use parseFloat to allow decimals

        if (isNaN(minutes) || minutes <= 0) {
            alert("Please enter a valid positive number");
            return;
        }

        // Calculate slices that will be added
        const slicesToAdd = calculateSlicesFromMinutes(minutes);

        // Set feedback message on the card
        const sliceText = slicesToAdd === 1 ? "slice" : "slices";
        setFeedbackMessages((prev) => ({
            ...prev,
            [memberId]: `+${slicesToAdd} ${sliceText} for ${minutes} minutes`,
        }));

        // Clear feedback message after 3 seconds
        setTimeout(() => {
            setFeedbackMessages((prev) => ({
                ...prev,
                [memberId]: "",
            }));
        }, 3000);

        handleAddMinutes(memberId, minutes);

        // Clear the input after submission
        setMinuteInputs((prev) => ({
            ...prev,
            [memberId]: "",
        }));
    };

    // Admin-only functions
    const handleRemoveSlice = async (memberId: string) => {
        if (!group || !id || !isCurrentUserAdmin()) return;

        const member = members.find((m) => m.id === memberId);
        if (!member || member.totalSlices <= 0) return;

        const updatedSlices = Math.max(0, member.totalSlices - 1);

        try {
            if (isFirebaseMode) {
                await firebaseRealtimeRepo.updateMember(id, memberId, {
                    totalSlices: updatedSlices,
                });
            } else {
                repo.correctMember(
                    id,
                    memberId,
                    -1,
                    "admin-user",
                    "Admin removed 1 slice"
                );
            }

            // Show feedback
            setFeedbackMessages((prev) => ({
                ...prev,
                [memberId]: "-1 slice removed by admin",
            }));

            setTimeout(() => {
                setFeedbackMessages((prev) => ({
                    ...prev,
                    [memberId]: "",
                }));
            }, 3000);
        } catch (error) {
            console.error("Error removing slice:", error);
            alert("Failed to remove slice. Please try again.");
        }
    };

    const handleDeleteMember = async (memberId: string) => {
        if (!group || !id || !isCurrentUserAdmin()) return;

        const member = members.find((m) => m.id === memberId);
        if (!member) return;

        const confirmed = confirm(
            `Are you sure you want to delete "${member.displayName}" from this group? This action cannot be undone.`
        );
        if (!confirmed) return;

        try {
            if (isFirebaseMode) {
                await firebaseRealtimeRepo.removeMember(id, memberId);
            } else {
                // For demo mode, we'll need to add this functionality to the repo
                alert(
                    "Delete member functionality not implemented in demo mode"
                );
                return;
            }
        } catch (error) {
            console.error("Error deleting member:", error);
            alert("Failed to delete member. Please try again.");
        }
    };

    const handleDeleteGroup = async () => {
        if (!group || !id || !isCurrentUserAdmin()) return;

        const confirmed = confirm(
            `Are you sure you want to delete the entire group "${group.name}"? This action cannot be undone and will remove all members and data.`
        );
        if (!confirmed) return;

        try {
            if (isFirebaseMode) {
                await firebaseRealtimeRepo.deleteGroup(id);
                navigate("/app"); // Navigate back to groups list
            } else {
                alert(
                    "Delete group functionality not implemented in demo mode"
                );
            }
        } catch (error) {
            console.error("Error deleting group:", error);
            alert("Failed to delete group. Please try again.");
        }
    };

    if (!group) {
        return (
            <section className="group-detail-page">
                <div>Group not found</div>
            </section>
        );
    }

    return (
        <section className="group-detail-page">
            {/* Header */}
            <div className="group-header">
                <button
                    className="back-button"
                    onClick={() => navigate("/app")}
                    aria-label="Go back"
                >
                    ←
                </button>
                <div className="group-title-section">
                    <div className="group-emoji">{group.emoji}</div>
                    <div>
                        <h1 className="group-title">{group.name}</h1>
                        <p className="group-subtitle">
                            {members.length} members
                        </p>
                    </div>
                </div>
                <div className="group-actions">
                    {isCurrentUserAdmin() && (
                        <button
                            className="action-button secondary"
                            onClick={handleAddMember}
                        >
                            + Add Member
                        </button>
                    )}
                    {isCurrentUserAdmin() && (
                        <button
                            className="action-button danger"
                            onClick={handleDeleteGroup}
                            title="Delete Group"
                        >
                            <Trash2 size={16} />
                            Delete Group
                        </button>
                    )}
                </div>
                <button
                    className="settings-button"
                    aria-label="Settings"
                    onClick={() => navigate(`/app/groups/${id}/settings`)}
                >
                    ⚙️
                </button>
            </div>

            {/* Members Section */}
            <div className="members-section">
                <h2 className="members-title">Members</h2>
                <div className="members-grid">
                    {members.map((m, i) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="member-card"
                        >
                            <div className="member-avatar">{m.initials}</div>
                            <h3 className="member-name">{m.displayName}</h3>
                            <p className={`member-role ${m.role}`}>
                                {m.role === "admin" ? "Admin" : "Normal"}
                            </p>

                            <div className="pizza-display-container">
                                <PizzaSliceDisplay
                                    slices={m.totalSlices % 6}
                                    size={80}
                                />
                            </div>

                            {/* Whole pizzas display */}
                            {m.totalPizzas > 0 && (
                                <div className="whole-pizzas-container">
                                    <div className="whole-pizzas-label">
                                        Complete pizzas owed:
                                    </div>
                                    <div className="whole-pizzas-display">
                                        {Array.from(
                                            { length: m.totalPizzas },
                                            (_, index) => (
                                                <img
                                                    key={index}
                                                    src={pizzaImage}
                                                    alt={`Pizza ${index + 1}`}
                                                    className="whole-pizza-image"
                                                    style={{
                                                        width: "40px",
                                                        height: "40px",
                                                        margin: "2px",
                                                    }}
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Feedback message */}
                            {feedbackMessages[m.id] && (
                                <div className="feedback-message">
                                    {feedbackMessages[m.id]}
                                </div>
                            )}

                            {/* Minute Controls - Admin Only */}
                            {isCurrentUserAdmin() && (
                                <div className="minute-controls">
                                    <div className="minute-controls-label">
                                        Add minutes:
                                    </div>
                                    <form
                                        className="minute-input-form"
                                        onSubmit={(e) =>
                                            handleMinuteInputSubmit(m.id, e)
                                        }
                                    >
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Enter minutes"
                                            value={minuteInputs[m.id] || ""}
                                            onChange={(e) =>
                                                handleMinuteInputChange(
                                                    m.id,
                                                    e.target.value
                                                )
                                            }
                                            className="minute-input"
                                        />
                                        <button
                                            type="submit"
                                            className="minute-submit-btn"
                                        >
                                            Add
                                        </button>
                                    </form>
                                </div>
                            )}

                            <div className="member-bottom-section">
                                <div className="pizza-stats">
                                    <div className="pizza-stat">
                                        <div className="pizza-stat-number">
                                            {m.totalPizzas}
                                        </div>
                                        <div className="pizza-stat-label">
                                            Pizzas
                                        </div>
                                    </div>
                                    <div className="pizza-stat">
                                        <div className="pizza-stat-number">
                                            {m.totalSlices}/6
                                        </div>
                                        <div className="pizza-stat-label">
                                            Slices
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Controls */}
                                {isCurrentUserAdmin() && (
                                    <div className="admin-controls">
                                        <button
                                            className="admin-control-btn remove-slice"
                                            onClick={() =>
                                                handleRemoveSlice(m.id)
                                            }
                                            disabled={m.totalSlices <= 0}
                                            title="Remove 1 slice"
                                        >
                                            <Minus size={14} />
                                            Remove Slice
                                        </button>
                                        <button
                                            className="admin-control-btn delete-member"
                                            onClick={() =>
                                                handleDeleteMember(m.id)
                                            }
                                            title="Delete member from group"
                                        >
                                            <Trash2 size={14} />
                                            Delete Member
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
