// Firebase Realtime Database repository implementation
import { ref, onValue, off } from "firebase/database";
import { realtimeDb } from "./firebase";
import {
    createGroup as createRealtimeGroup,
    addMemberToGroup,
    updateGroupName,
    updateMemberScore,
    removeMemberFromGroup,
    deleteGroup,
} from "./realtimeDatabase";
import type { Group, Member, Meeting, Correction, Role } from "./types";

export class FirebaseRealtimeRepo {
    constructor() {
        // Auth state tracking can be added here when needed for user-specific filtering
    }

    // Helper method to validate admin permissions (client-side validation)
    private async validateAdminPermission(
        groupId: string,
        userEmail: string
    ): Promise<boolean> {
        try {
            const groups = await this.getGroups();
            const group = groups.find((g) => g.id === groupId);
            if (!group?.settings?.adminEmails) return false;
            return group.settings.adminEmails.includes(userEmail);
        } catch (error) {
            console.error("Error validating admin permission:", error);
            return false;
        }
    }

    // Groups
    async getGroups(): Promise<Group[]> {
        return new Promise((resolve, reject) => {
            const groupsRef = ref(realtimeDb, "groups");

            onValue(
                groupsRef,
                (snapshot) => {
                    try {
                        const data = snapshot.val();
                        if (!data) {
                            resolve([]);
                            return;
                        }

                        const groups: Group[] = Object.entries(data).map(
                            ([id, groupData]: [string, any]) => ({
                                id,
                                name: groupData.name,
                                emoji: groupData.emoji || "🍕",
                                color: groupData.color || "#f59e0b",
                                adminId: groupData.adminId || "demo-user",
                                createdAt:
                                    groupData.createdAt ||
                                    new Date().toISOString(),
                                settings: {
                                    curveShift:
                                        groupData.settings?.curveShift ?? 0.3,
                                    allowEveryoneEnterMinutes:
                                        groupData.settings
                                            ?.allowEveryoneEnterMinutes ??
                                        false,
                                    adminEmails:
                                        groupData.settings?.adminEmails ?? [],
                                },
                                members: Object.entries(
                                    groupData.members || {}
                                ).map(([memberName, score]: [string, any]) => ({
                                    id: memberName,
                                    displayName: memberName,
                                    initials: memberName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .substring(0, 2)
                                        .toUpperCase(),
                                    role: "normal" as Role,
                                    totalSlices:
                                        typeof score === "number" ? score : 0,
                                    totalPizzas: Math.floor(
                                        (typeof score === "number"
                                            ? score
                                            : 0) / 6
                                    ),
                                })),
                            })
                        );

                        resolve(groups);
                    } catch (error) {
                        reject(error);
                    }
                },
                {
                    onlyOnce: true,
                }
            );
        });
    }

    async createGroup(data: {
        name: string;
        emoji: string;
        color: string;
        adminId: string;
        adminEmail: string;
    }): Promise<Group> {
        const groupId = await createRealtimeGroup(data.name);

        // Add additional metadata to the group
        const groupRef = ref(realtimeDb, `groups/${groupId}`);
        const groupData = {
            name: data.name,
            emoji: data.emoji,
            color: data.color,
            adminId: data.adminId,
            createdAt: new Date().toISOString(),
            members: {},
            settings: {
                curveShift: 0.3, // Default curve shift value
                allowEveryoneEnterMinutes: false,
                adminEmails: [data.adminEmail], // Add creator's email as first admin
            },
        };

        // Update the group with additional data
        await import("firebase/database").then(({ update }) =>
            update(groupRef, groupData)
        );

        return {
            id: groupId,
            name: data.name,
            emoji: data.emoji,
            color: data.color,
            adminId: data.adminId,
            members: [],
            settings: {
                curveShift: 0.3,
                allowEveryoneEnterMinutes: false,
                adminEmails: [data.adminEmail],
            },
        };
    }

    async getGroup(id: string): Promise<Group | null> {
        return new Promise((resolve, reject) => {
            const groupRef = ref(realtimeDb, `groups/${id}`);

            onValue(
                groupRef,
                (snapshot) => {
                    try {
                        const data = snapshot.val();
                        if (!data) {
                            resolve(null);
                            return;
                        }

                        const group: Group = {
                            id,
                            name: data.name,
                            emoji: data.emoji || "🍕",
                            color: data.color || "#f59e0b",
                            adminId: data.adminId || "demo-user",
                            members: Object.entries(data.members || {}).map(
                                ([memberName, score]: [string, any]) => ({
                                    id: memberName,
                                    displayName: memberName,
                                    initials: memberName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .substring(0, 2)
                                        .toUpperCase(),
                                    role: "normal" as Role,
                                    totalSlices:
                                        typeof score === "number" ? score : 0,
                                    totalPizzas: Math.floor(
                                        (typeof score === "number"
                                            ? score
                                            : 0) / 6
                                    ),
                                })
                            ),
                        };
                        resolve(group);
                    } catch (error) {
                        reject(error);
                    }
                },
                {
                    onlyOnce: true,
                }
            );
        });
    }

    async updateGroup(id: string, updates: Partial<Group>): Promise<void> {
        if (updates.name) {
            await updateGroupName(id, updates.name);
        }

        // Handle other updates if needed
        if (updates.emoji || updates.color || updates.settings) {
            const { update } = await import("firebase/database");
            const groupRef = ref(realtimeDb, `groups/${id}`);
            const updateData: any = {};

            if (updates.emoji) updateData.emoji = updates.emoji;
            if (updates.color) updateData.color = updates.color;
            if (updates.settings) updateData.settings = updates.settings;

            await update(groupRef, updateData);
        }
    }

    async deleteGroup(id: string): Promise<void> {
        await deleteGroup(id);
    }

    // Members
    async addMember(
        groupId: string,
        member: {
            name: string;
            role?: Role;
        }
    ): Promise<Member> {
        // Add member with initial score of 0
        await addMemberToGroup(groupId, member.name, 0);

        return {
            id: member.name,
            displayName: member.name,
            initials: member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase(),
            role: member.role || "normal",
            totalSlices: 0,
            totalPizzas: 0,
        };
    }

    async updateMember(
        groupId: string,
        memberId: string,
        updates: Partial<Member>
    ): Promise<void> {
        if (updates.totalSlices !== undefined) {
            await updateMemberScore(groupId, memberId, updates.totalSlices);
        }
    }

    async removeMember(groupId: string, memberId: string): Promise<void> {
        await removeMemberFromGroup(groupId, memberId);
    }

    // Real-time subscriptions
    subscribeToGroups(callback: (groups: Group[]) => void): () => void {
        const groupsRef = ref(realtimeDb, "groups");

        const unsubscribe = onValue(groupsRef, (snapshot) => {
            try {
                const data = snapshot.val();
                if (!data) {
                    callback([]);
                    return;
                }

                const groups: Group[] = Object.entries(data).map(
                    ([id, groupData]: [string, any]) => ({
                        id,
                        name: groupData.name,
                        emoji: groupData.emoji || "🍕",
                        color: groupData.color || "#f59e0b",
                        adminId: groupData.adminId || "demo-user",
                        settings: {
                            curveShift: groupData.settings?.curveShift ?? 0.3,
                            allowEveryoneEnterMinutes:
                                groupData.settings?.allowEveryoneEnterMinutes ??
                                false,
                            adminEmails: groupData.settings?.adminEmails ?? [],
                        },
                        members: Object.entries(groupData.members || {}).map(
                            ([memberName, score]: [string, any]) => ({
                                id: memberName,
                                displayName: memberName,
                                initials: memberName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .substring(0, 2)
                                    .toUpperCase(),
                                role: "normal" as Role,
                                totalSlices:
                                    typeof score === "number" ? score : 0,
                                totalPizzas: Math.floor(
                                    (typeof score === "number" ? score : 0) / 6
                                ),
                            })
                        ),
                    })
                );

                callback(groups);
            } catch (error) {
                console.error("Error in groups subscription:", error);
                callback([]);
            }
        });

        return () => off(groupsRef, "value", unsubscribe);
    }

    subscribeToGroup(
        id: string,
        callback: (group: Group | null) => void
    ): () => void {
        const groupRef = ref(realtimeDb, `groups/${id}`);

        const unsubscribe = onValue(groupRef, (snapshot) => {
            try {
                const data = snapshot.val();
                if (!data) {
                    callback(null);
                    return;
                }

                const group: Group = {
                    id,
                    name: data.name,
                    emoji: data.emoji || "🍕",
                    color: data.color || "#f59e0b",
                    adminId: data.adminId || "demo-user",
                    members: Object.entries(data.members || {}).map(
                        ([memberName, score]: [string, any]) => ({
                            id: memberName,
                            displayName: memberName,
                            initials: memberName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase(),
                            role: "normal" as Role,
                            totalSlices: typeof score === "number" ? score : 0,
                            totalPizzas: Math.floor(
                                (typeof score === "number" ? score : 0) / 6
                            ),
                        })
                    ),
                };

                callback(group);
            } catch (error) {
                console.error("Error in group subscription:", error);
                callback(null);
            }
        });

        return () => off(groupRef, "value", unsubscribe);
    }

    // Placeholder methods for meetings and corrections
    // These would need to be implemented based on your meeting structure
    async getMeetings(_groupId: string): Promise<Meeting[]> {
        // TODO: Implement meetings in Realtime Database
        return [];
    }

    async createMeeting(
        _groupId: string,
        _meeting: Omit<Meeting, "id" | "createdAt">
    ): Promise<Meeting> {
        // TODO: Implement meeting creation
        throw new Error("Meetings not yet implemented for Realtime Database");
    }

    async getCorrections(_groupId: string): Promise<Correction[]> {
        // TODO: Implement corrections in Realtime Database
        return [];
    }

    async addCorrection(
        _groupId: string,
        _correction: Omit<Correction, "id" | "createdAt">
    ): Promise<Correction> {
        // TODO: Implement correction creation
        throw new Error(
            "Corrections not yet implemented for Realtime Database"
        );
    }

    // Subscribe methods for meetings and corrections would go here
    subscribeToMeetings(
        _groupId: string,
        _callback: (meetings: Meeting[]) => void
    ): () => void {
        // TODO: Implement real-time meetings subscription
        return () => {};
    }

    subscribeToCorrections(
        _groupId: string,
        _callback: (corrections: Correction[]) => void
    ): () => void {
        // TODO: Implement real-time corrections subscription
        return () => {};
    }
}

// Export a singleton instance
export const firebaseRealtimeRepo = new FirebaseRealtimeRepo();
