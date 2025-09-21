import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import AppShell from "./App.tsx";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import MeetingEditorPage from "./pages/MeetingEditorPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import GroupManagerExample from "./components/GroupManagerExample";
import { DemoProvider } from "./lib/demo.tsx";
import { AuthProvider } from "./lib/auth.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />,
    },
    {
        path: "/app",
        element: <AppShell />,
        children: [
            { index: true, element: <GroupsPage /> },
            { path: "groups/:id", element: <GroupDetailPage /> },
            { path: "groups/:id/settings", element: <SettingsPage /> },
            {
                path: "groups/:id/meetings/:mid",
                element: <MeetingEditorPage />,
            },
            { path: "firebase-example", element: <GroupManagerExample /> },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <DemoProvider>
                <RouterProvider router={router} />
            </DemoProvider>
        </AuthProvider>
    </StrictMode>
);
