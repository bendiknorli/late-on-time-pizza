import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { repo, type RepoState } from "./repo";
import { firebaseRealtimeRepo } from "./firebaseRealtimeRepo";
import { useAuth } from "./auth";
import type { Group } from "./types";

type DemoCtx = {
    state: RepoState;
    seed: () => void;
    reset: () => void;
    isFirebaseMode: boolean;
};

const Ctx = createContext<DemoCtx | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const [state, setState] = useState<RepoState>(() => repo.getState());
    const [firebaseGroups, setFirebaseGroups] = useState<Group[]>([]);

    const isFirebaseMode = !!user;

    // Subscribe to Firebase groups when authenticated
    useEffect(() => {
        if (!user) return;

        const unsubscribe = firebaseRealtimeRepo.subscribeToGroups(
            (groups: Group[]) => {
                setFirebaseGroups(groups);
            }
        );

        return unsubscribe;
    }, [user]);

    // Create combined state for Firebase mode
    const firebaseState: RepoState = useMemo(
        () => ({
            groups: firebaseGroups,
            meetings: [], // TODO: Implement real-time meetings
            corrections: [], // TODO: Implement real-time corrections
        }),
        [firebaseGroups]
    );

    const value = useMemo<DemoCtx>(
        () => ({
            state: isFirebaseMode ? firebaseState : state,
            seed: () => {
                if (!isFirebaseMode) {
                    setState(repo.seedDemo());
                }
                // For Firebase mode, seeding would involve creating demo groups in Firebase
            },
            reset: () => {
                if (!isFirebaseMode) {
                    repo.resetDemo();
                    setState(repo.getState());
                }
                // For Firebase mode, reset would delete all user's groups
            },
            isFirebaseMode,
        }),
        [state, firebaseState, isFirebaseMode]
    );

    if (loading) {
        return <div>Loading...</div>; // You can customize this loading component
    }

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemo() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("DemoProvider missing");
    return ctx;
}
