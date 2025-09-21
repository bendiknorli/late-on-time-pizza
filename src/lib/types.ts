export type Role = "admin" | "normal";

export type Member = {
    id: string;
    displayName: string;
    initials: string;
    role: Role;
    totalPizzas: number;
    totalSlices: number; // 0..5
};

export type GroupSettings = {
    allowEveryoneEnterMinutes?: boolean;
    curveShift?: number; // default 0.3
    adminEmails?: string[]; // emails of users who can admin this group
};

export type Group = {
    id: string;
    name: string;
    color: string;
    emoji: string;
    adminId: string;
    members: Member[];
    settings?: GroupSettings;
};

export type MeetingEntry = {
    memberId: string;
    minutesLate: number;
    slicesAwarded: number;
};

export type Meeting = {
    id: string;
    groupId: string;
    at: string; // ISO datetime
    entries: MeetingEntry[];
};

export type Correction = {
    id: string;
    groupId: string;
    memberId: string;
    deltaSlices: number;
    reason?: string;
    at: string;
    by: string; // user id
};

export type HistoryItem =
    | {
          type: "meeting";
          meetingId: string;
          at: string;
          entries: MeetingEntry[];
      }
    | {
          type: "correction";
          id: string;
          at: string;
          memberId: string;
          deltaSlices: number;
          reason?: string;
      };
