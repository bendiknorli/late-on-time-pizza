import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { realtimeDb } from "./firebase";
import {
    createGroup,
    addMemberToGroup,
    updateGroupName,
    updateMemberScore,
    removeMemberFromGroup,
    deleteGroup,
} from "./realtimeDatabase";

export interface Member {
    name: string;
    score: number;
}

export interface Group {
    id: string;
    name: string;
    members: Record<string, number>;
}

export interface GroupsData {
    [groupId: string]: {
        name: string;
        members: Record<string, number>;
    };
}

/**
 * React hook for managing groups with real-time updates
 */
export function useGroups() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const groupsRef = ref(realtimeDb, "groups");

        const unsubscribe = onValue(
            groupsRef,
            (snapshot) => {
                try {
                    const data = snapshot.val() as GroupsData | null;

                    if (data) {
                        const groupsList = Object.entries(data).map(
                            ([id, groupData]) => ({
                                id,
                                name: groupData.name,
                                members: groupData.members || {},
                            })
                        );
                        setGroups(groupsList);
                    } else {
                        setGroups([]);
                    }

                    setError(null);
                } catch (err) {
                    console.error("Error processing groups data:", err);
                    setError("Failed to load groups data");
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                console.error("Error listening to groups:", err);
                setError("Failed to connect to database");
                setLoading(false);
            }
        );

        // Cleanup subscription on unmount
        return () => off(groupsRef, "value", unsubscribe);
    }, []);

    // Helper functions that wrap the database functions
    const createNewGroup = async (groupName: string): Promise<string> => {
        try {
            setError(null);
            return await createGroup(groupName);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to create group";
            setError(errorMessage);
            throw err;
        }
    };

    const addMember = async (
        groupId: string,
        memberName: string,
        score: number = 0
    ): Promise<void> => {
        try {
            setError(null);
            await addMemberToGroup(groupId, memberName, score);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to add member";
            setError(errorMessage);
            throw err;
        }
    };

    const updateName = async (
        groupId: string,
        newName: string
    ): Promise<void> => {
        try {
            setError(null);
            await updateGroupName(groupId, newName);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to update group name";
            setError(errorMessage);
            throw err;
        }
    };

    const updateScore = async (
        groupId: string,
        memberName: string,
        newScore: number
    ): Promise<void> => {
        try {
            setError(null);
            await updateMemberScore(groupId, memberName, newScore);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to update member score";
            setError(errorMessage);
            throw err;
        }
    };

    const removeMember = async (
        groupId: string,
        memberName: string
    ): Promise<void> => {
        try {
            setError(null);
            await removeMemberFromGroup(groupId, memberName);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to remove member";
            setError(errorMessage);
            throw err;
        }
    };

    const removeGroup = async (groupId: string): Promise<void> => {
        try {
            setError(null);
            await deleteGroup(groupId);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to delete group";
            setError(errorMessage);
            throw err;
        }
    };

    return {
        groups,
        loading,
        error,
        createGroup: createNewGroup,
        addMember,
        updateGroupName: updateName,
        updateMemberScore: updateScore,
        removeMember,
        deleteGroup: removeGroup,
    };
}

/**
 * React hook for managing a single group with real-time updates
 */
export function useGroup(groupId: string | null) {
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!groupId) {
            setGroup(null);
            setLoading(false);
            return;
        }

        const groupRef = ref(realtimeDb, `groups/${groupId}`);

        const unsubscribe = onValue(
            groupRef,
            (snapshot) => {
                try {
                    const data = snapshot.val();

                    if (data) {
                        setGroup({
                            id: groupId,
                            name: data.name,
                            members: data.members || {},
                        });
                    } else {
                        setGroup(null);
                    }

                    setError(null);
                } catch (err) {
                    console.error("Error processing group data:", err);
                    setError("Failed to load group data");
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                console.error("Error listening to group:", err);
                setError("Failed to connect to database");
                setLoading(false);
            }
        );

        return () => off(groupRef, "value", unsubscribe);
    }, [groupId]);

    return {
        group,
        loading,
        error,
    };
}
