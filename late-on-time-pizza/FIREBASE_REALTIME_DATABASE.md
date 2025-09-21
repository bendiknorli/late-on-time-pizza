# Firebase Realtime Database Integration

This implementation provides comprehensive Firebase Realtime Database functionality for managing groups and their members, following the structure:

```
groups
  {unique_group_ID} // e.g., "-N_aBcDeFgHiJkLmNoPq"
    name: "Group Name"
    members:
      {memberName_1}: {score_1} // e.g., "Bendik": 2
      {memberName_2}: {score_2}
```

## Core Functions

### 1. Creating a New Group

```typescript
import { createGroup } from "../lib/realtimeDatabase";

// Create a new group
const groupId = await createGroup("My Pizza Group");
console.log("Group created with ID:", groupId);
```

### 2. Adding a Member to a Group

```typescript
import { addMemberToGroup } from "../lib/realtimeDatabase";

// Add a member with initial score
await addMemberToGroup(groupId, "Bendik", 2);
await addMemberToGroup(groupId, "Alice", 0);
```

### 3. Updating Group Name

```typescript
import { updateGroupName } from "../lib/realtimeDatabase";

// Update the group's name
await updateGroupName(groupId, "Updated Pizza Group");
```

### 4. Updating Member Score

```typescript
import { updateMemberScore } from "../lib/realtimeDatabase";

// Update a member's score
await updateMemberScore(groupId, "Bendik", 3);
```

### 5. Additional Helper Functions

```typescript
import { removeMemberFromGroup, deleteGroup } from "../lib/realtimeDatabase";

// Remove a member from the group
await removeMemberFromGroup(groupId, "Alice");

// Delete the entire group
await deleteGroup(groupId);
```

## React Hooks

### useGroups Hook

For managing all groups with real-time updates:

```typescript
import { useGroups } from "../lib/useGroups";

function GroupsList() {
    const {
        groups, // Array of all groups
        loading, // Loading state
        error, // Error message if any
        createGroup, // Function to create new group
        addMember, // Function to add member
        updateGroupName, // Function to update group name
        updateMemberScore, // Function to update member score
        removeMember, // Function to remove member
        deleteGroup, // Function to delete group
    } = useGroups();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {groups.map((group) => (
                <div key={group.id}>
                    <h3>{group.name}</h3>
                    <p>Members: {Object.keys(group.members).length}</p>
                </div>
            ))}
        </div>
    );
}
```

### useGroup Hook

For managing a single group with real-time updates:

```typescript
import { useGroup } from "../lib/useGroups";

function GroupDetail({ groupId }: { groupId: string }) {
    const { group, loading, error } = useGroup(groupId);

    if (loading) return <div>Loading group...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!group) return <div>Group not found</div>;

    return (
        <div>
            <h2>{group.name}</h2>
            <div>
                {Object.entries(group.members).map(([name, score]) => (
                    <div key={name}>
                        {name}: {score} points
                    </div>
                ))}
            </div>
        </div>
    );
}
```

## Example Usage in Components

```typescript
import React, { useState } from "react";
import { useGroups } from "../lib/useGroups";

function GroupManager() {
    const { groups, createGroup, addMember, updateMemberScore } = useGroups();
    const [newGroupName, setNewGroupName] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const handleCreateGroup = async () => {
        try {
            const groupId = await createGroup(newGroupName);
            setSelectedGroupId(groupId);
            setNewGroupName("");
        } catch (error) {
            console.error("Failed to create group:", error);
        }
    };

    const handleAddMember = async (memberName: string, score: number) => {
        if (!selectedGroupId) return;

        try {
            await addMember(selectedGroupId, memberName, score);
        } catch (error) {
            console.error("Failed to add member:", error);
        }
    };

    return (
        <div>
            {/* Create group form */}
            <input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name"
            />
            <button onClick={handleCreateGroup}>Create Group</button>

            {/* Groups list */}
            {groups.map((group) => (
                <div
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                >
                    <h3>{group.name}</h3>
                    <p>{Object.keys(group.members).length} members</p>
                </div>
            ))}
        </div>
    );
}
```

## Error Handling

All functions include comprehensive error handling:

```typescript
try {
    const groupId = await createGroup("Test Group");
    await addMemberToGroup(groupId, "John", 5);
} catch (error) {
    console.error("Operation failed:", error.message);
    // Handle error appropriately in your UI
}
```

## Data Structure Types

```typescript
interface Member {
    name: string;
    score: number;
}

interface Group {
    id: string;
    name: string;
    members: Record<string, number>;
}

interface GroupsData {
    [groupId: string]: {
        name: string;
        members: Record<string, number>;
    };
}
```

## Real-time Updates

The hooks automatically subscribe to real-time updates from Firebase, so your UI will automatically reflect changes made by other users or from other parts of your application.

## Firebase Configuration

Make sure your Firebase Realtime Database is properly configured and the `realtimeDb` instance is exported from your Firebase configuration file.

## Example Component

See `src/components/GroupManagerExample.tsx` for a complete working example that demonstrates all the functionality.
