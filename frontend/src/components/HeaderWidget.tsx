/**
 * HeaderWidget Component
 * 
 * @description
 * Main navigation header with responsive menu and authentication controls.
 * Displays site logo, navigation links, and sign-in/sign-out buttons.
 * Manages sign-in modal trigger state for seamless authentication flow.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
 *
 */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FaUserCircle } from "react-icons/fa";
import SignInModal from "./SignInModal";
import ProfilePopup from "./ProfilePopup";

interface HeaderWidgetProps {
  isSignedIn?: boolean;
  onSignIn?: (email: string, id: string, name?: string) => void;
  onSignOut?: () => void;
  triggerSignIn?: boolean;
  onSignInHandled?: () => void;
}

const HeaderWidget: React.FC<HeaderWidgetProps> = ({ isSignedIn = false, onSignIn, onSignOut, triggerSignIn = false, onSignInHandled }) => {
  // Debug: log render
  console.log("HeaderWidget rendered");

  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  const profileNav = () => {
    setShowProfilePopup(!showProfilePopup);
  };

  return (
    <header className="relative w-full flex justify-center">
      <div className="absolute inset-0 bg-[url('./brand-bg-texture.avif')] bg-no-repeat bg-cover bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-l from-brand-green-light to-brand-green-dark opacity-75" />
      </div>

      <nav className="relative w-full bg-white rounded-b-3xl shadow-md z-20">
        <div className="mx-auto max-w-screen-2xl px-8 xl:px-40 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/">
          <div className="flex items-center">
            <span className="text-4xl font-petit tracking-wider text-brand-green">Scheduler</span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-10 text-gray-700 font-medium">
          <NavItem label="New Appointment" path="/schedule" />
          <NavItem label="Calendar" path="/calendar" />
          <NavItem label="Advocates" path="/advocates" />
        </div>

        {/* Right: Auth Actions */}
        <div className="hidden md:flex items-center gap-6">
          {isSignedIn ? (
            <>
              <button
                onClick={profileNav}
                className="flex items-center justify-center w-10 h-10 rounded-full transition"
                aria-label="User profile"
              >
                <Avatar>
                  <AvatarFallback>
                    <FaUserCircle/>
                  </AvatarFallback>
                </Avatar>
              </button>
              {showProfilePopup && onSignOut && (
                <ProfilePopup
                  handleSignout={() => {
                    onSignOut();
                    setShowProfilePopup(false);
                  }}
                  setShowProfilePopup={setShowProfilePopup}
                />
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setShowSignInModal(true)}
                className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
              >
                Sign in
              </button>

              <button
                onClick={() => setShowSignInModal(true)}
                className="bg-gradient-to-br hover:bg-gradient-to-tl from-brand-gold-light to-brand-gold text-black px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
              >
                Get Started <span aria-hidden>→</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile-Right: More Menu */}
        <div className="flex md:hidden">
          <button onClick={()=> setShowMobileMenu(!showMobileMenu)} className="text-gray-700 text-xl focus:outline-none">
            ...
          </button>
        </div>
        
          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
              <div className="absolute top-0 right-0">
              {isSignedIn ? (
                <>
                  <button
                    onClick={profileNav}
                    className="w-full text-left hover:bg-gray-100"
                  >
                    <Avatar>
                  <AvatarFallback>
                    <FaUserCircle/>
                  </AvatarFallback>
                </Avatar>
                  </button>
                  {showProfilePopup && onSignOut && (
                    <ProfilePopup
                      handleSignout={() => {
                        onSignOut();
                        setShowProfilePopup(false);
                      }}
                      setShowProfilePopup={setShowProfilePopup}
                    />
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowSignInModal(true)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Sign in
                  </button>
                </>
              )}
              </div>
              <div className="mt-4 mb-2">
              <NavItem label="Calendar" path="/calendar" />
              <NavItem label="New Appointment" path="/schedule" />
              <NavItem label="Advocates" path="/advocates" />
              </div>
            </div>
          )}


        {showSignInModal && (
          <SignInModal onSignIn={handleSignIn} onClose={() => setShowSignInModal(false)} />
        )}
      </div>
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
