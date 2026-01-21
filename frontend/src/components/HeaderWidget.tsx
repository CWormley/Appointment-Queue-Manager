/**
 * Header Widget
 * 
 * @description
 * Display navigation and option for sign-in sign-out functionality
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
 *
 */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SignInModal from "./SignInModal";

interface HeaderWidgetProps {
  isSignedIn?: boolean;
  onSignIn?: (email: string, id: string, name?: string) => void;
  onSignOut?: () => void;
  triggerSignIn?: boolean;
  onSignInHandled?: () => void;
}

const HeaderWidget: React.FC<HeaderWidgetProps> = ({ isSignedIn = false, onSignIn, onSignOut, triggerSignIn = false, onSignInHandled }) => {
  const [showSignInModal, setShowSignInModal] = useState(false);

  // Open modal when triggerSignIn becomes true
  React.useEffect(() => {
    if (triggerSignIn) {
      setShowSignInModal(true);
      if (onSignInHandled) {
        onSignInHandled();
      }
    }
  }, [triggerSignIn, onSignInHandled]);

  const handleSignIn = (email: string, id: string, name?: string) => {
    setShowSignInModal(false);
    if (onSignIn) {
      onSignIn(email, id, name);
    }
  };

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
  };

  return (
    <header className="w-full flex justify-center px-6 py-4 bg-gray-50">
      <nav className="w-full max-w-4xl flex items-center justify-between bg-white rounded-2xl shadow-md px-8 py-4">
        
        {/* Left: Logo */}
        <Link to="/">
          <div className="flex items-center">
            <span className="text-3xl font-petit tracking-wider text-emerald-700">Scheduler</span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-10 text-gray-700 font-medium">
          <NavItem label="New Appointment" path="/schedule" />
          <NavItem label="Calendar" path="/calendar" />
        </div>

        {/* Right: Auth Actions */}
        <div className="flex items-center gap-6">
          {isSignedIn ? (
            <button
              onClick={handleSignOut}
              className="text-emerald-700 font-medium hover:underline"
            >
              Sign out
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowSignInModal(true)}
                className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
              >
                Sign in <span aria-hidden>→</span>
              </button>

              <button
                onClick={() => setShowSignInModal(true)}
                className="bg-emerald-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {showSignInModal && (
          <SignInModal onSignIn={handleSignIn} onClose={() => setShowSignInModal(false)} />
        )}
      </nav>
    </header>
  );
};

interface NavItemProps {
  label: string;
  path: string;
}

const NavItem: React.FC<NavItemProps> = ({ label, path }) => {
  const navigate = useNavigate();
  
  return (
    <button 
      onClick={() => navigate(path)}
      className="flex items-center gap-1 hover:text-emerald-700 transition bg-white cursor-pointer font-extralight"
    >
      <span>{label}</span>
    </button>
  );
};

export default HeaderWidget;
