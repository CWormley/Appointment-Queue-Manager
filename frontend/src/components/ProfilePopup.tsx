/**
 * Profile Popup Component
 * 
 * @description
 * User profile popup displaying user information and sign-out option.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
 *
 */
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";

interface ProfilePopupProps{
    handleSignout: () => void;
    setShowProfilePopup: (show: boolean) => void;
}

function ProfilePopup ({handleSignout, setShowProfilePopup}: ProfilePopupProps) {
    const name = localStorage.getItem("userName") || "User";
    const email = localStorage.getItem("userEmail") || "";
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <Card className="w-full max-w-sm bg-white rounded-lg shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>User Profile</CardTitle>
                    <button
                        onClick={() => setShowProfilePopup(false)}
                        className="ml-4 text-gray-400 hover:text-gray-700 text-xl font-bold focus:outline-none"
                        aria-label="Close profile popup"
                    >
                        ×
                    </button>
                </CardHeader>
                <CardContent>
                    <p className = "mb-2"><strong>Name:</strong> {name}</p>
                    <p className = "mb-2"><strong>Email:</strong> {email}</p>
                    <button className = "mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    onClick={() => {
                        handleSignout();
                    }}>
                        Sign Out
                    </button>
                </CardContent>
            </Card>
        </div>

    );
}
export default ProfilePopup;