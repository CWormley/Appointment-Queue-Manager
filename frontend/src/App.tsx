import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ScheduleAppointmentPage from "./pages/ScheduleAppointmentPage";
import ViewCalendarPage from "./pages/ViewCalendarPage";
import HeaderWidget from "./components/HeaderWidget";

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [triggerSignIn, setTriggerSignIn] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName");
    if (storedUserId) {
      setIsSignedIn(true);
      setUserId(storedUserId);
      setUserName(storedUserName || "");
    }
  }, []);

  const handleSignOut = () => {
    setIsSignedIn(false);
    setUserId("");
    setUserName("");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
  };

  const handleSignIn = (email: string, id: string, name?: string) => {
    setIsSignedIn(true);
    setUserId(id);
    setUserName(name || "");
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userId", id);
    localStorage.setItem("userName", name || "");
  };

  return (
    <Router>
      <div className="w-full h-screen flex flex-col">
        <div className="w-full h-10 bg-green-900"></div>
        <HeaderWidget 
          isSignedIn={isSignedIn} 
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          triggerSignIn={triggerSignIn}
          onSignInHandled={() => setTriggerSignIn(false)}
        />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<HomePage isSignedIn={isSignedIn} userId={userId} userName={userName} onTriggerSignIn={() => setTriggerSignIn(true)} />} />
            <Route path="/schedule" element={<ScheduleAppointmentPage />} />
            <Route path="/calendar" element={<ViewCalendarPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
