import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDemo } from "../lib/demo";
import { useAuth } from "../lib/auth";
import { DEFAULT_FORMULA_PARAMS, slicesForMinutes } from "../lib/pizza";
import type { PizzaFormulaParams } from "../lib/pizza";
import { firebaseRealtimeRepo } from "../lib/firebaseRealtimeRepo";
import { Calculator, RefreshCw, UserPlus, Trash2 } from "lucide-react";
import "./SettingsPage.css";

export default function SettingsPage() {
    const { id: groupId } = useParams();
    const { state, isFirebaseMode } = useDemo();
    const { user } = useAuth();

    // Redirect if no group ID provided
    if (!groupId) {
        return (
            <div className="settings-page">
                <div className="settings-header">
                    <h1 className="settings-title">Error</h1>
                    <p className="settings-subtitle">
                        Settings are only available for specific groups. Please
                        navigate to a group first.
                    </p>
                </div>
            </div>
        );
    }

    // Formula parameters
    const [formulaParams, setFormulaParams] = useState<PizzaFormulaParams>(
        DEFAULT_FORMULA_PARAMS
    );
    const [loading, setLoading] = useState(false);

    // Admin email management
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [adminEmails, setAdminEmails] = useState<string[]>([]);

    // Get current group (required for group-specific settings)
    const currentGroup = state.groups.find((g) => g.id === groupId);

    if (!currentGroup) {
        return (
            <div className="settings-page">
                <div className="settings-header">
                    <h1 className="settings-title">Group Not Found</h1>
                    <p className="settings-subtitle">
                        The requested group could not be found.
                    </p>
                </div>
            </div>
        );
    }

    // Example calculation for preview
    const [previewMinutes, setPreviewMinutes] = useState(10);

    useEffect(() => {
        // Load group-specific settings
        const curveShift =
            currentGroup.settings?.curveShift ??
            DEFAULT_FORMULA_PARAMS.curveShift;
        const emails = currentGroup.settings?.adminEmails ?? [];
        setFormulaParams({ curveShift });
        setAdminEmails(emails);
    }, [currentGroup]);

    const updateParam = (key: keyof PizzaFormulaParams, value: number) => {
        // Check if user is admin for curve shift changes
        if (key === "curveShift" && !isCurrentUserAdmin()) {
            alert(
                "Only administrators can modify the logarithm shift parameter."
            );
            return;
        }

        setFormulaParams((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // Admin email management functions
    const isCurrentUserAdmin = () => {
        return user?.email && adminEmails.includes(user.email);
    };

    const addAdminEmail = async () => {
        if (!newAdminEmail.trim() || !isCurrentUserAdmin()) return;

        const email = newAdminEmail.trim().toLowerCase();
        if (adminEmails.includes(email)) {
            alert("This email is already an admin");
            return;
        }

        const updatedEmails = [...adminEmails, email];
        setAdminEmails(updatedEmails);
        setNewAdminEmail("");

        // Save to Firebase
        if (isFirebaseMode) {
            try {
                await firebaseRealtimeRepo.updateGroup(groupId, {
                    settings: {
                        ...currentGroup.settings,
                        adminEmails: updatedEmails,
                    },
                });
            } catch (error) {
                console.error("Failed to save admin emails:", error);
                alert("Failed to save admin emails. Please try again.");
                setAdminEmails(adminEmails); // Revert on error
            }
        }
    };

    const removeAdminEmail = async (emailToRemove: string) => {
        if (!isCurrentUserAdmin()) return;

        // Prevent removing the last admin
        if (adminEmails.length <= 1) {
            alert("Cannot remove the last admin");
            return;
        }

        // Prevent removing the group creator (first admin in the list)
        const groupCreatorEmail = adminEmails[0];
        if (emailToRemove === groupCreatorEmail) {
            alert(
                "Cannot remove the group creator from admin privileges. The group creator must always remain an admin."
            );
            return;
        }

        // Prevent non-admins from removing admins
        if (emailToRemove === user?.email) {
            const confirmed = confirm(
                "Are you sure you want to remove yourself as admin? You will lose admin privileges."
            );
            if (!confirmed) return;
        }

        const updatedEmails = adminEmails.filter(
            (email) => email !== emailToRemove
        );
        setAdminEmails(updatedEmails);

        // Save to Firebase
        if (isFirebaseMode) {
            try {
                await firebaseRealtimeRepo.updateGroup(groupId, {
                    settings: {
                        ...currentGroup.settings,
                        adminEmails: updatedEmails,
                    },
                });
            } catch (error) {
                console.error("Failed to save admin emails:", error);
                alert("Failed to save admin emails. Please try again.");
                setAdminEmails(adminEmails); // Revert on error
            }
        }
    };

    // Auto-save when formula parameters change (with debounce)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!isFirebaseMode) {
                console.log("Not in Firebase mode, skipping save");
                return;
            }

            setLoading(true);
            firebaseRealtimeRepo
                .updateGroup(groupId, {
                    settings: {
                        ...currentGroup.settings,
                        curveShift: formulaParams.curveShift,
                    },
                })
                .then(() => {
                    console.log("Settings saved to Firebase");
                })
                .catch((error) => {
                    console.error("Failed to save settings:", error);
                    alert("Failed to save settings. Please try again.");
                })
                .finally(() => {
                    setLoading(false);
                });
        }, 1000); // Save after 1 second of no changes

        return () => clearTimeout(timeoutId);
    }, [formulaParams, groupId, currentGroup, isFirebaseMode]);

    const resetToDefaults = () => {
        setFormulaParams(DEFAULT_FORMULA_PARAMS);
    };

    const previewSlices = slicesForMinutes(previewMinutes, formulaParams);

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1 className="settings-title">{currentGroup.name} Settings</h1>
                <p className="settings-subtitle">
                    Configure pizza debt calculation for this group
                    {loading ? " (saving...)" : ""}
                </p>
            </div>

            <div className="settings-grid">
                {/* Pizza Formula Settings */}
                <div className="settings-card">
                    <h2 className="settings-card-title">
                        <Calculator className="settings-card-icon" />
                        Pizza Slice Formula
                    </h2>

                    <div className="formula-section">
                        <h3>Current Formula</h3>
                        <div className="formula-display">
                            scale_factor = 1.0 / log(2 +{" "}
                            {formulaParams.curveShift})<br />
                            raw_value = scale_factor × log(minutes +{" "}
                            {formulaParams.curveShift})<br />
                            slices = ceil(raw_value)
                        </div>
                    </div>

                    {/* Curve Shift Parameter - Admin Only */}
                    {isCurrentUserAdmin() ? (
                        <div className="parameter-control">
                            <label className="parameter-label">
                                Logarithm shift:{" "}
                                <span className="parameter-value">
                                    {formulaParams.curveShift}
                                </span>
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="3"
                                step="0.1"
                                value={formulaParams.curveShift}
                                onChange={(e) =>
                                    updateParam(
                                        "curveShift",
                                        parseFloat(e.target.value)
                                    )
                                }
                                className="parameter-input"
                            />
                            <p className="parameter-description">
                                Curve shift parameter - lower values create
                                steeper curves, higher values create gentler
                                curves
                            </p>
                        </div>
                    ) : (
                        <div className="parameter-control admin-readonly">
                            <label className="parameter-label">
                                Logarithm shift:{" "}
                                <span className="parameter-value">
                                    {formulaParams.curveShift}
                                </span>
                                <span className="admin-only-badge">
                                    (Admin Only)
                                </span>
                            </label>
                            <div className="readonly-slider">
                                <div className="readonly-track">
                                    <div
                                        className="readonly-thumb"
                                        style={{
                                            left: `${
                                                ((formulaParams.curveShift -
                                                    0.1) /
                                                    (3 - 0.1)) *
                                                100
                                            }%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <p className="parameter-description">
                                Only administrators can modify the curve shift
                                parameter
                            </p>
                        </div>
                    )}

                    <div className="formula-section">
                        <h3>Preview</h3>
                        <div className="parameter-control">
                            <label className="parameter-label">
                                Test with{" "}
                                <span className="parameter-value">
                                    {previewMinutes}
                                </span>{" "}
                                minutes
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="30"
                                step="1"
                                value={previewMinutes}
                                onChange={(e) =>
                                    setPreviewMinutes(parseInt(e.target.value))
                                }
                                className="parameter-input"
                            />
                            <p className="parameter-description">
                                Result: <strong>{previewSlices} slices</strong>{" "}
                                would be added
                            </p>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button
                            className="action-btn action-btn-secondary"
                            onClick={resetToDefaults}
                        >
                            <RefreshCw size={16} />
                            Reset to Defaults
                        </button>
                    </div>
                </div>

                {/* Admin Email Management */}
                {isCurrentUserAdmin() && (
                    <div className="settings-card">
                        <h2 className="settings-card-title">
                            <UserPlus className="settings-card-icon" />
                            Admin Management
                        </h2>

                        <div className="admin-section">
                            <div className="admin-emails-list">
                                <h3>Current Admins</h3>
                                {adminEmails.length > 0 ? (
                                    <ul className="admin-list">
                                        {adminEmails.map((email, index) => {
                                            const isGroupCreator = index === 0;
                                            return (
                                                <li
                                                    key={index}
                                                    className="admin-item"
                                                >
                                                    <div className="admin-info">
                                                        <span className="admin-email">
                                                            {email}
                                                        </span>
                                                        {isGroupCreator && (
                                                            <span className="creator-badge">
                                                                Group Creator
                                                            </span>
                                                        )}
                                                    </div>
                                                    {adminEmails.length > 1 &&
                                                        !isGroupCreator && (
                                                            <button
                                                                onClick={() =>
                                                                    removeAdminEmail(
                                                                        email
                                                                    )
                                                                }
                                                                className="remove-admin-btn"
                                                                title="Remove admin"
                                                            >
                                                                <Trash2
                                                                    size={16}
                                                                />
                                                            </button>
                                                        )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <p>No admins found</p>
                                )}
                            </div>

                            <div className="add-admin-section">
                                <h3>Add New Admin</h3>
                                <div className="add-admin-form">
                                    <input
                                        type="email"
                                        value={newAdminEmail}
                                        onChange={(e) =>
                                            setNewAdminEmail(e.target.value)
                                        }
                                        placeholder="Enter email address"
                                        className="admin-email-input"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                addAdminEmail();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={addAdminEmail}
                                        className="add-admin-btn"
                                        disabled={!newAdminEmail.trim()}
                                    >
                                        <UserPlus size={16} />
                                        Add Admin
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
