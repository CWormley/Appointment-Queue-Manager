/**
 * HomePage
 * 
 * @description
 * Application landing page with conditional rendering based on authentication state.
 * Displays marketing content and feature highlights for unauthenticated users,
 * or redirects authenticated users to their personalized dashboard.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
 *
 */
import { useNavigate } from "react-router-dom";
import Dashboard from "../components/DashboardProp";

interface HomePageProps {
  isSignedIn: boolean;
  userId: string;
  userName: string;
  onTriggerSignIn: () => void;
}

function HomePage({ isSignedIn, userId, userName, onTriggerSignIn }: HomePageProps) {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (!isSignedIn && !userId) {
      onTriggerSignIn();
    }
  };

  return (
    <div className="relative w-full min-h-screen">
           <div className="relative z-10 flex flex-col min-h-screen">
          {/* Hero Section */}
          <section className="flex-1 flex flex-col items-start justify-center px-40 py-40 text-left">
            <h1 className="text-5xl font-bold text-white mb-4">
              Appointment & Queue Manager
            </h1>
            <p className="text-xl text-white mb-12 max-w-2xl">
              Streamline your scheduling with our intuitive appointment management system. Save time, reduce no-shows, and keep your clients happy.
            </p>
          </section>
          {!isSignedIn && !userId ? (
          <div>
          {/* Features Section */}
          <section className="flex-1 flex flex-col items-center px-6 py-16 bg-brand-white rounded-3xl mx-4 z-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
              {/* Feature Card 1 */}
              <div className="w-80 h-80 flex flex-col items-center p-6 pt-10 bg-gradient-to-br from-brand-green via-brand-green-light to-brand-gold rounded-full border border-gray-200 hover:border-brand-green-light hover:shadow-lg transition">
                <div className="w-14 h-14 bg-brand-green-dark rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-brand-gold">1</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Easy Scheduling</h3>
                <p className="text-gray-200 text-center">
                  Simple, intuitive interface to schedule and manage appointments effortlessly.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="w-80 h-80 flex flex-col items-center p-6 pt-10 bg-gradient-to-br from-brand-green via-brand-green-light to-brand-gold rounded-full border border-gray-200 hover:border-brand-green-light hover:shadow-lg transition">
                <div className="w-14 h-14 bg-brand-green-dark rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-brand-gold">2</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Queue Management</h3>
                <p className="text-gray-200 text-center">
                  Organize and prioritize appointments with smart queue management tools.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="w-80 h-80 flex flex-col items-center p-6 pt-10 bg-gradient-to-br from-brand-green via-brand-green-light to-brand-gold rounded-full border border-gray-200 hover:border-brand-green-light hover:shadow-lg transition">
                <div className="w-14 h-14 bg-brand-green-dark rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-brand-gold">3</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Smart Analytics</h3>
                <p className="text-gray-200 text-center">
                  Gain insights into your scheduling patterns and optimize your business.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="flex-shrink flex flex-col items-center justify-center py-6 mx-40 my-10 border border-brand-gold rounded-3xl bg-gradient-to-br from-brand-green-light to-brand-green">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-white">Join thousands of users managing appointments better</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleNavigation("/schedule")}
                className="px-6 py-3 bg-gradient-to-br from-gray-200 to-gray-50 text-brand-green rounded-xl hover:bg-brand-green-light transition font-semibold hover:bg-gradient-to-tl"
              >
                Schedule an Appointment
              </button>
              <button
                onClick={() => handleNavigation("/calendar")}
                className="bg-gradient-to-br from-brand-gold-light to-brand-gold hover:bg-gradient-to-tl text-black px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
              >
                View Calendar
              </button>
            </div>
          </section>
        </div>
      ) : (
        <Dashboard 
          userName={userName} 
          userId={userId}
          onSignOut={() => {}} 
        />
      )}
      </div>
    </div>
  );
}

export default HomePage;