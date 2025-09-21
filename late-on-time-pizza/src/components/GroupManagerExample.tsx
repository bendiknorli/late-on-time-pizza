import React, { useState } from "react";
import { useGroups, useGroup } from "../lib/useGroups";

/**
 * Example component demonstrating how to use Firebase Realtime Database
 * for managing groups and members
 */
export default function GroupManagerExample() {
    const {
        groups,
        loading,
        error,
        createGroup,
        addMember,
        updateGroupName,
        updateMemberScore,
        removeMember,
        deleteGroup,
    } = useGroups();

    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [newGroupName, setNewGroupName] = useState("");
    const [newMemberName, setNewMemberName] = useState("");
    const [newMemberScore, setNewMemberScore] = useState(0);
    const [editGroupName, setEditGroupName] = useState("");

    const selectedGroup = useGroup(selectedGroupId);

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;

        try {
            const groupId = await createGroup(newGroupName.trim());
            console.log("Created group with ID:", groupId);
            setNewGroupName("");
            setSelectedGroupId(groupId);
        } catch (error) {
            console.error("Failed to create group:", error);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGroupId || !newMemberName.trim()) return;

        try {
            await addMember(
                selectedGroupId,
                newMemberName.trim(),
                newMemberScore
            );
            console.log("Added member:", newMemberName);
            setNewMemberName("");
            setNewMemberScore(0);
        } catch (error) {
            console.error("Failed to add member:", error);
        }
    };

    const handleUpdateGroupName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGroupId || !editGroupName.trim()) return;

        try {
            await updateGroupName(selectedGroupId, editGroupName.trim());
            console.log("Updated group name to:", editGroupName);
            setEditGroupName("");
        } catch (error) {
            console.error("Failed to update group name:", error);
        }
    };

    const handleUpdateScore = async (memberName: string, newScore: number) => {
        if (!selectedGroupId) return;

        try {
            await updateMemberScore(selectedGroupId, memberName, newScore);
            console.log(`Updated ${memberName}'s score to:`, newScore);
        } catch (error) {
            console.error("Failed to update score:", error);
        }
    };

    const handleRemoveMember = async (memberName: string) => {
        if (!selectedGroupId) return;

        try {
            await removeMember(selectedGroupId, memberName);
            console.log("Removed member:", memberName);
        } catch (error) {
            console.error("Failed to remove member:", error);
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!confirm("Are you sure you want to delete this group?")) return;

        try {
            await deleteGroup(groupId);
            console.log("Deleted group:", groupId);
            if (selectedGroupId === groupId) {
                setSelectedGroupId(null);
            }
        } catch (error) {
            console.error("Failed to delete group:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-white">Loading groups...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">
                Group Manager Example
            </h1>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4">
                    Error: {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Panel - Groups List and Create */}
                <div className="space-y-6">
                    {/* Create Group Form */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-white mb-3">
                            Create New Group
                        </h2>
                        <form
                            onSubmit={handleCreateGroup}
                            className="space-y-3"
                        >
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) =>
                                    setNewGroupName(e.target.value)
                                }
                                placeholder="Enter group name"
                                className="w-full p-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/60"
                            />
                            <button
                                type="submit"
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded transition-colors"
                            >
                                Create Group
                            </button>
                        </form>
                    </div>

                    {/* Groups List */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-white mb-3">
                            Groups ({groups.length})
                        </h2>
                        <div className="space-y-2">
                            {groups.map((group) => (
                                <div
                                    key={group.id}
                                    className="flex items-center justify-between p-2 bg-white/5 rounded"
                                >
                                    <div>
                                        <div className="text-white font-medium">
                                            {group.name}
                                        </div>
                                        <div className="text-white/60 text-sm">
                                            {Object.keys(group.members).length}{" "}
                                            members
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                setSelectedGroupId(group.id)
                                            }
                                            className={`px-3 py-1 text-sm rounded transition-colors ${
                                                selectedGroupId === group.id
                                                    ? "bg-amber-500 text-white"
                                                    : "bg-white/20 text-white/80 hover:bg-white/30"
                                            }`}
                                        >
                                            Select
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteGroup(group.id)
                                            }
                                            className="px-3 py-1 text-sm bg-red-500/80 hover:bg-red-500 text-white rounded transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {groups.length === 0 && (
                                <div className="text-white/60 text-center py-4">
                                    No groups yet. Create one above!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Selected Group Details */}
                <div className="space-y-6">
                    {selectedGroupId && selectedGroup.group && (
                        <>
                            {/* Group Details */}
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                                <h2 className="text-lg font-semibold text-white mb-3">
                                    Group: {selectedGroup.group.name}
                                </h2>

                                {/* Update Group Name */}
                                <form
                                    onSubmit={handleUpdateGroupName}
                                    className="space-y-3 mb-4"
                                >
                                    <input
                                        type="text"
                                        value={editGroupName}
                                        onChange={(e) =>
                                            setEditGroupName(e.target.value)
                                        }
                                        placeholder="New group name"
                                        className="w-full p-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/60"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
                                    >
                                        Update Group Name
                                    </button>
                                </form>

                                {/* Add Member */}
                                <form
                                    onSubmit={handleAddMember}
                                    className="space-y-3"
                                >
                                    <input
                                        type="text"
                                        value={newMemberName}
                                        onChange={(e) =>
                                            setNewMemberName(e.target.value)
                                        }
                                        placeholder="Member name"
                                        className="w-full p-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/60"
                                    />
                                    <input
                                        type="number"
                                        value={newMemberScore}
                                        onChange={(e) =>
                                            setNewMemberScore(
                                                Number(e.target.value)
                                            )
                                        }
                                        placeholder="Initial score"
                                        className="w-full p-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/60"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors"
                                    >
                                        Add Member
                                    </button>
                                </form>
                            </div>

                            {/* Members List */}
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-white mb-3">
                                    Members
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(
                                        selectedGroup.group.members
                                    ).map(([memberName, score]) => (
                                        <div
                                            key={memberName}
                                            className="flex items-center justify-between p-2 bg-white/5 rounded"
                                        >
                                            <div className="text-white">
                                                <span className="font-medium">
                                                    {memberName}
                                                </span>
                                                <span className="text-white/60 ml-2">
                                                    Score: {score}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleUpdateScore(
                                                            memberName,
                                                            score + 1
                                                        )
                                                    }
                                                    className="px-2 py-1 text-xs bg-green-500/80 hover:bg-green-500 text-white rounded"
                                                >
                                                    +1
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleUpdateScore(
                                                            memberName,
                                                            score - 1
                                                        )
                                                    }
                                                    className="px-2 py-1 text-xs bg-orange-500/80 hover:bg-orange-500 text-white rounded"
                                                >
                                                    -1
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleRemoveMember(
                                                            memberName
                                                        )
                                                    }
                                                    className="px-2 py-1 text-xs bg-red-500/80 hover:bg-red-500 text-white rounded"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {Object.keys(selectedGroup.group.members)
                                        .length === 0 && (
                                        <div className="text-white/60 text-center py-4">
                                            No members yet. Add one above!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {!selectedGroupId && (
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8">
                            <div className="text-white/60 text-center">
                                Select a group to view and manage its members
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
