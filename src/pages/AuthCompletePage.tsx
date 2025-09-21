import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCompletePage() {
    const navigate = useNavigate();

    useEffect(() => {
        // This page is no longer needed since we're using email/password + Google auth
        // Redirect to login page
        navigate("/login");
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
                <p className="text-white">Redirecting to login...</p>
            </div>
        </div>
    );
}
