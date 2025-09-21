import type { Group, Member, Meeting, Correction } from "./types";
import { slicesForMinutes, addSlices, adjustSlices } from "./pizza";

const KEY = "pizza-demo";

export type RepoState = {
    groups: Group[];
    meetings: Meeting[];
    corrections: Correction[];
};

function load(): RepoState {
    try {
        const s = localStorage.getItem(KEY);
        if (!s) throw new Error("empty");
        return JSON.parse(s);
    } catch {
        return { groups: [], meetings: [], corrections: [] };
    }
}

function save(state: RepoState) {
    localStorage.setItem(KEY, JSON.stringify(state));
}

export const repo = {
    seedDemo() {
        const demoMembers: Member[] = [
            {
                id: "m1",
                displayName: "Alex Doe",
                initials: "AD",
                role: "admin",
                totalPizzas: 0,
                totalSlices: 0,
            },
            {
                id: "m2",
                displayName: "Jamie Roe",
                initials: "JR",
                role: "normal",
                totalPizzas: 0,
                totalSlices: 0,
            },
            {
                id: "m3",
                displayName: "Sam Lee",
                initials: "SL",
                role: "normal",
                totalPizzas: 0,
                totalSlices: 0,
            },
        ];
        const groups: Group[] = [
            {
                id: "g1",
                name: "Design Crew",
                color: "#60a5fa",
                emoji: "🎨",
                adminId: "m1",
                members: demoMembers,
                settings: { curveShift: 0.3 },
            },
        ];
        const meetings: Meeting[] = [];
        const corrections: Correction[] = [];
        const state: RepoState = { groups, meetings, corrections };
        save(state);
        return state;
    },
    resetDemo() {
        save({ groups: [], meetings: [], corrections: [] });
    },
    getState(): RepoState {
        return load();
    },
    getGroup(id: string) {
        return load().groups.find((g) => g.id === id);
    },
    createGroup(input: {
        name: string;
        emoji: string;
        color: string;
        adminId: string;
    }) {
        const state = load();
        const group: Group = {
            id: `g_${Date.now()}`,
            name: input.name,
            emoji: input.emoji,
            color: input.color,
            adminId: input.adminId,
            members: [],
            settings: { curveShift: 0.3, allowEveryoneEnterMinutes: false },
        };
        state.groups.push(group);
        save(state);
        return group;
    },
    deleteGroup(id: string) {
        const state = load();
        state.groups = state.groups.filter((g) => g.id !== id);
        state.meetings = state.meetings.filter((m) => m.groupId !== id);
        state.corrections = state.corrections.filter((c) => c.groupId !== id);
        save(state);
    },
    addMember(
        groupId: string,
        m: { displayName: string; initials: string; role?: Member["role"] }
    ) {
        const state = load();
        const g = state.groups.find((x) => x.id === groupId);
        if (!g) throw new Error("Group not found");
        const member: Member = {
            id: `mem_${Date.now()}`,
            displayName: m.displayName,
            initials: m.initials,
            role: m.role ?? "normal",
            totalPizzas: 0,
            totalSlices: 0,
        };
        g.members.push(member);
        save(state);
        return member;
    },
    removeMember(groupId: string, memberId: string) {
        const state = load();
        const g = state.groups.find((x) => x.id === groupId);
        if (!g) throw new Error("Group not found");
        g.members = g.members.filter((m) => m.id !== memberId);
        save(state);
    },
    renameMember(
        groupId: string,
        memberId: string,
        displayName: string,
        initials?: string
    ) {
        const state = load();
        const g = state.groups.find((x) => x.id === groupId);
        if (!g) throw new Error("Group not found");
        const m = g.members.find((x) => x.id === memberId);
        if (!m) throw new Error("Member not found");
        m.displayName = displayName;
        if (initials) m.initials = initials;
        save(state);
    },
    setRole(groupId: string, memberId: string, role: Member["role"]) {
        const state = load();
        const g = state.groups.find((x) => x.id === groupId);
        if (!g) throw new Error("Group not found");
        const m = g.members.find((x) => x.id === memberId);
        if (!m) throw new Error("Member not found");
        m.role = role;
        save(state);
    },
    createMeeting(
        groupId: string,
        at: string,
        minutesById: Record<string, number>
    ) {
        const state = load();
        const group = state.groups.find((g) => g.id === groupId);
        if (!group) throw new Error("Group not found");
        const curveShift = group.settings?.curveShift ?? 0.3;
        const entries = group.members.map((m) => {
            const minutes = Math.max(0, Math.round(minutesById[m.id] ?? 0));
            const slices = slicesForMinutes(minutes, { curveShift });
            const updated = addSlices(m.totalPizzas, m.totalSlices, slices);
            m.totalPizzas = updated.totalPizzas;
            m.totalSlices = updated.totalSlices;
            return {
                memberId: m.id,
                minutesLate: minutes,
                slicesAwarded: slices,
            };
        });
        const meeting: Meeting = {
            id: `mtg_${Date.now()}`,
            groupId,
            at,
            entries,
        };
        state.meetings.push(meeting);
        save(state);
        return meeting;
    },
    correctMember(
        groupId: string,
        memberId: string,
        deltaSlices: number,
        by: string,
        reason?: string
    ) {
        const state = load();
        const g = state.groups.find((x) => x.id === groupId);
        if (!g) throw new Error("Group not found");
        const m = g.members.find((x) => x.id === memberId);
        if (!m) throw new Error("Member not found");
        const updated = adjustSlices(
            m.totalPizzas,
            m.totalSlices,
            Math.round(deltaSlices)
        );
        m.totalPizzas = updated.totalPizzas;
        m.totalSlices = updated.totalSlices;
        const corr: Correction = {
            id: `cor_${Date.now()}`,
            groupId,
            memberId,
            deltaSlices: Math.round(deltaSlices),
            reason,
            at: new Date().toISOString(),
            by: by,
        };
        state.corrections.push(corr);
        save(state);
        return corr;
    },
    setGroupCurveShift(groupId: string, curveShift: number) {
        const state = load();
        const g = state.groups.find((x) => x.id === groupId);
        if (!g) throw new Error("Group not found");
        g.settings = { ...(g.settings ?? {}), curveShift };
        save(state);
    },
    setAllowEveryone(groupId: string, allow: boolean) {
        const state = load();
        const g = state.groups.find((x) => x.id === groupId);
        if (!g) throw new Error("Group not found");
        g.settings = {
            ...(g.settings ?? {}),
            allowEveryoneEnterMinutes: allow,
        };
        save(state);
    },
};
