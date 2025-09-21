// Firebase-based repository implementation
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import type { Group, Member, Meeting, Correction, Role } from "./types";

export class FirebaseRepo {
    private userId: string | null = null;

    constructor() {
        // Listen for auth state changes
        auth.onAuthStateChanged((user) => {
            this.userId = user?.uid || null;
        });
    }

    // Helper to get current user ID
    private getCurrentUserId(): string {
        if (!this.userId) {
            throw new Error("User not authenticated");
        }
        return this.userId;
    }

    // Groups
    async getGroups(): Promise<Group[]> {
        const userId = this.getCurrentUserId();
        const groupsRef = collection(db, "groups");
        const q = query(
            groupsRef,
            where("adminId", "==", userId), // Simplified - just get groups where user is admin
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(
            (doc) =>
                ({
                    id: doc.id,
                    ...doc.data(),
                } as Group)
        );
    }

    async createGroup(data: {
        name: string;
        emoji: string;
        color: string;
        adminId: string;
    }): Promise<Group> {
        const userId = this.getCurrentUserId();
        const groupsRef = collection(db, "groups");

        const groupData = {
            ...data,
            adminId: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            members: [
                {
                    id: userId,
                    displayName: auth.currentUser?.email || "Admin",
                    initials: (auth.currentUser?.email || "AD")
                        .substring(0, 2)
                        .toUpperCase(),
                    role: "admin" as Role,
                    totalPizzas: 0,
                    totalSlices: 0,
                },
            ],
            settings: {
                LOG_K: 0.5,
                allowEveryone: false,
            },
        };

        const docRef = await addDoc(groupsRef, groupData);
        return {
            id: docRef.id,
            ...groupData,
        } as Group;
    }

    async getGroup(groupId: string): Promise<Group | null> {
        const docRef = doc(db, "groups", groupId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
            } as Group;
        }
        return null;
    }

    async updateGroup(groupId: string, updates: Partial<Group>): Promise<void> {
        const docRef = doc(db, "groups", groupId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    }

    async deleteGroup(groupId: string): Promise<void> {
        const batch = writeBatch(db);

        // Delete the group
        const groupRef = doc(db, "groups", groupId);
        batch.delete(groupRef);

        // Delete all meetings for this group
        const meetingsRef = collection(db, "meetings");
        const meetingsQuery = query(
            meetingsRef,
            where("groupId", "==", groupId)
        );
        const meetingsSnapshot = await getDocs(meetingsQuery);
        meetingsSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Delete all corrections for this group
        const correctionsRef = collection(db, "corrections");
        const correctionsQuery = query(
            correctionsRef,
            where("groupId", "==", groupId)
        );
        const correctionsSnapshot = await getDocs(correctionsQuery);
        correctionsSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
    }

    // Members
    async addMember(
        groupId: string,
        memberData: {
            displayName: string;
            initials: string;
        }
    ): Promise<void> {
        const group = await this.getGroup(groupId);
        if (!group) throw new Error("Group not found");

        const newMember: Member = {
            id: `member_${Date.now()}`,
            displayName: memberData.displayName,
            initials: memberData.initials,
            role: "normal",
            totalPizzas: 0,
            totalSlices: 0,
        };

        const updatedMembers = [...group.members, newMember];
        await this.updateGroup(groupId, { members: updatedMembers });
    }

    async removeMember(groupId: string, memberId: string): Promise<void> {
        const group = await this.getGroup(groupId);
        if (!group) throw new Error("Group not found");

        const updatedMembers = group.members.filter((m) => m.id !== memberId);
        await this.updateGroup(groupId, { members: updatedMembers });
    }

    async setRole(
        groupId: string,
        memberId: string,
        role: Role
    ): Promise<void> {
        const group = await this.getGroup(groupId);
        if (!group) throw new Error("Group not found");

        const updatedMembers = group.members.map((m) =>
            m.id === memberId ? { ...m, role } : m
        );
        await this.updateGroup(groupId, { members: updatedMembers });
    }

    // Meetings
    async createMeeting(
        groupId: string,
        meetingData: Omit<Meeting, "id" | "groupId">
    ): Promise<Meeting> {
        const meetingsRef = collection(db, "meetings");
        const meeting = {
            ...meetingData,
            groupId,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(meetingsRef, meeting);

        // Update member totals
        await this.updateMemberTotals(groupId, meetingData.entries);

        return {
            id: docRef.id,
            ...meeting,
        } as Meeting;
    }

    async getMeetings(groupId: string): Promise<Meeting[]> {
        const meetingsRef = collection(db, "meetings");
        const q = query(
            meetingsRef,
            where("groupId", "==", groupId),
            orderBy("at", "desc")
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(
            (doc) =>
                ({
                    id: doc.id,
                    ...doc.data(),
                } as Meeting)
        );
    }

    // Corrections
    async correctMember(
        groupId: string,
        memberId: string,
        deltaSlices: number,
        adminId: string,
        reason?: string
    ): Promise<void> {
        const correctionsRef = collection(db, "corrections");
        const correction: Omit<Correction, "id"> = {
            groupId,
            memberId,
            deltaSlices,
            by: adminId,
            reason,
            at: new Date().toISOString(),
        };

        await addDoc(correctionsRef, correction);

        // Update member totals
        const group = await this.getGroup(groupId);
        if (group) {
            const updatedMembers = group.members.map((m) => {
                if (m.id === memberId) {
                    const newTotalSlices = Math.max(
                        0,
                        m.totalSlices + deltaSlices
                    );
                    const newTotalPizzas = Math.floor(newTotalSlices / 6);
                    return {
                        ...m,
                        totalSlices: newTotalSlices % 6,
                        totalPizzas: m.totalPizzas + newTotalPizzas,
                    };
                }
                return m;
            });
            await this.updateGroup(groupId, { members: updatedMembers });
        }
    }

    async getCorrections(groupId: string): Promise<Correction[]> {
        const correctionsRef = collection(db, "corrections");
        const q = query(
            correctionsRef,
            where("groupId", "==", groupId),
            orderBy("at", "desc")
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(
            (doc) =>
                ({
                    id: doc.id,
                    ...doc.data(),
                } as Correction)
        );
    }

    // Helper method to update member totals after a meeting
    private async updateMemberTotals(
        groupId: string,
        entries: Meeting["entries"]
    ): Promise<void> {
        const group = await this.getGroup(groupId);
        if (!group) return;

        const updatedMembers = group.members.map((member) => {
            const entry = entries.find((e) => e.memberId === member.id);
            if (entry) {
                const newTotalSlices = member.totalSlices + entry.slicesAwarded;
                const newTotalPizzas = Math.floor(newTotalSlices / 6);
                return {
                    ...member,
                    totalSlices: newTotalSlices % 6,
                    totalPizzas: member.totalPizzas + newTotalPizzas,
                };
            }
            return member;
        });

        await this.updateGroup(groupId, { members: updatedMembers });
    }

    // Settings
    async setGroupLogK(groupId: string, logK: number): Promise<void> {
        const group = await this.getGroup(groupId);
        if (!group) throw new Error("Group not found");

        await this.updateGroup(groupId, {
            settings: {
                ...group.settings,
                LOG_K: logK,
            },
        });
    }

    async setAllowEveryone(
        groupId: string,
        allowEveryone: boolean
    ): Promise<void> {
        const group = await this.getGroup(groupId);
        if (!group) throw new Error("Group not found");

        await this.updateGroup(groupId, {
            settings: {
                ...group.settings,
                allowEveryoneEnterMinutes: allowEveryone, // Changed to match the type
            },
        });
    }

    // Real-time subscriptions
    subscribeToGroups(callback: (groups: Group[]) => void): () => void {
        const userId = this.getCurrentUserId();
        const groupsRef = collection(db, "groups");
        const q = query(
            groupsRef,
            where("adminId", "==", userId), // Simplified - just get groups where user is admin
            orderBy("createdAt", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const groups = snapshot.docs.map(
                (doc) =>
                    ({
                        id: doc.id,
                        ...doc.data(),
                    } as Group)
            );
            callback(groups);
        });
    }

    subscribeToGroup(
        groupId: string,
        callback: (group: Group | null) => void
    ): () => void {
        const docRef = doc(db, "groups", groupId);

        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                callback({
                    id: doc.id,
                    ...doc.data(),
                } as Group);
            } else {
                callback(null);
            }
        });
    }
}

// Create a singleton instance
export const firebaseRepo = new FirebaseRepo();
