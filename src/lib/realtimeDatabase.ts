import { ref, push, update, set } from "firebase/database";
import { realtimeDb } from "./firebase";

/**
 * Create a new group with a unique ID
 * @param groupName - The name of the group to create
 * @returns Promise<string> - The unique group ID that was generated
 */
export async function createGroup(groupName: string): Promise<string> {
    try {
        const groupsRef = ref(realtimeDb, "groups");
        const newGroupRef = push(groupsRef);

        if (!newGroupRef.key) {
            throw new Error("Failed to generate unique group ID");
        }

        await set(newGroupRef, {
            name: groupName,
            members: {},
        });

        return newGroupRef.key;
    } catch (error) {
        console.error("Error creating group:", error);
        throw new Error(
            `Failed to create group: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
}

/**
 * Add a member to an existing group
 * @param groupId - The unique group ID
 * @param memberName - The name of the member to add
 * @param score - The initial score for the member
 */
export async function addMemberToGroup(
    groupId: string,
    memberName: string,
    score: number
): Promise<void> {
    try {
        const membersRef = ref(realtimeDb, `groups/${groupId}/members`);

        await update(membersRef, {
            [memberName]: score,
        });
    } catch (error) {
        console.error("Error adding member to group:", error);
        throw new Error(
            `Failed to add member to group: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
}

/**
 * Update the name of an existing group
 * @param groupId - The unique group ID
 * @param newName - The new name for the group
 */
export async function updateGroupName(
    groupId: string,
    newName: string
): Promise<void> {
    try {
        const groupRef = ref(realtimeDb, `groups/${groupId}`);

        await update(groupRef, {
            name: newName,
        });
    } catch (error) {
        console.error("Error updating group name:", error);
        throw new Error(
            `Failed to update group name: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
}

/**
 * Update a member's score in a group
 * @param groupId - The unique group ID
 * @param memberName - The name of the member whose score to update
 * @param newScore - The new score for the member
 */
export async function updateMemberScore(
    groupId: string,
    memberName: string,
    newScore: number
): Promise<void> {
    try {
        const membersRef = ref(realtimeDb, `groups/${groupId}/members`);

        await update(membersRef, {
            [memberName]: newScore,
        });
    } catch (error) {
        console.error("Error updating member score:", error);
        throw new Error(
            `Failed to update member score: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
}

/**
 * Remove a member from a group
 * @param groupId - The unique group ID
 * @param memberName - The name of the member to remove
 */
export async function removeMemberFromGroup(
    groupId: string,
    memberName: string
): Promise<void> {
    try {
        const memberRef = ref(
            realtimeDb,
            `groups/${groupId}/members/${memberName}`
        );

        await set(memberRef, null);
    } catch (error) {
        console.error("Error removing member from group:", error);
        throw new Error(
            `Failed to remove member from group: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
}

/**
 * Delete an entire group
 * @param groupId - The unique group ID to delete
 */
export async function deleteGroup(groupId: string): Promise<void> {
    try {
        const groupRef = ref(realtimeDb, `groups/${groupId}`);

        await set(groupRef, null);
    } catch (error) {
        console.error("Error deleting group:", error);
        throw new Error(
            `Failed to delete group: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
}

// Example usage:
/*
// Create a new group
try {
    const groupId = await createGroup("My Pizza Group");
    console.log("Group created with ID:", groupId);
    
    // Add members to the group
    await addMemberToGroup(groupId, "Bendik", 2);
    await addMemberToGroup(groupId, "Alice", 0);
    await addMemberToGroup(groupId, "Bob", 1);
    
    // Update a member's score
    await updateMemberScore(groupId, "Bendik", 3);
    
    // Update group name
    await updateGroupName(groupId, "Updated Pizza Group");
    
} catch (error) {
    console.error("Error:", error.message);
}
*/
