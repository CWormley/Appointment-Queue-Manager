/**
 * Home Page
 * 
 * @description
 * Landing page, handling user auth and displaying contents for unauthorized users.
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
    <div className="w-full h-full flex flex-col bg-gray-50">
      {!isSignedIn && !userId ? (
        <div className="w-full h-full flex flex-col">
          {/* Hero Section */}
          <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center bg-gradient-to-b from-emerald-50 to-gray-50">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Appointment & Queue Manager
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl">
              Streamline your scheduling with our intuitive appointment management system. Save time, reduce no-shows, and keep your clients happy.
            </p>
          </section>

          {/* Features Section */}
          <section className="flex-1 flex flex-col items-center px-6 py-16 bg-white">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
              {/* Feature Card 1 */}
              <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Scheduling</h3>
                <p className="text-gray-600 text-center">
                  Simple, intuitive interface to schedule and manage appointments effortlessly.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">⏰</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Queue Management</h3>
                <p className="text-gray-600 text-center">
                  Organize and prioritize appointments with smart queue management tools.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Analytics</h3>
                <p className="text-gray-600 text-center">
                  Gain insights into your scheduling patterns and optimize your business.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 bg-gradient-to-b from-gray-50 to-emerald-50">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-gray-600 mb-12">Join thousands of users managing appointments better</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleNavigation("/schedule")}
                className="px-8 py-3 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition font-semibold"
              >
                Schedule an Appointment
              </button>
              <button
                onClick={() => handleNavigation("/calendar")}
                className="px-8 py-3 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition font-semibold border border-emerald-300"
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
  );
}

export default HomePage;