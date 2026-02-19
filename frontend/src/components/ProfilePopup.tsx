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
            <Card className="w-full max-w-sm bg-white rounded-lg shadow-lg relative">
                <button
                        onClick={() => setShowProfilePopup(false)}
                        className="ml-4 text-gray-400 hover:text-gray-700 text-xl font-bold focus:outline-none absolute top-1 right-1"
                        aria-label="Close profile popup"
                    >
                        ×
                    </button>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-brand-green-dark">User Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className = "mb-2 text-lg"><strong>Name:</strong> {name}</p>
                    <p className = "mb-2 text-lg"><strong>Email:</strong> {email}</p>
                    <button className = "mt-4 px-4 py-2 bg-brand-green hover:bg-brand-green-light text-white rounded-lg transition"
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