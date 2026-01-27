/**
 * Dashboard Component
 * 
 * @description
 * Authenticated user dashboard displaying personalized appointment summary,
 * quick statistics, and navigation shortcuts for scheduling and viewing
 * appointments. Shows user greeting and upcoming appointment count.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
 *
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appointmentAPI } from "../services/api";

interface DashboardProps {
  userName: string;
  userId: string;
  onSignOut: () => void;
}

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  description: string;
  status: string;
}

function Dashboard({ userName, userId }: DashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentAPI.getByUserId(userId);
        setAppointments(data);
      } catch (err) {
        setError("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAppointments();
    }
  }, [userId]);

  const upcomingAppointments = appointments.filter((apt) => {
    return new Date(apt.startTime) > new Date();
  });

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center bg-gradient-to-b from-emerald-50 to-gray-50">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Appointment & Queue Manager
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl">
          Streamline your scheduling with our intuitive appointment management
          system. Save time, reduce no-shows, and keep your clients happy.
        </p>
      </section>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-0">
        {userName ? (
          <h2 className="text-2xl font-bold col-span-3 mb-4">
            Welcome, {userName}!
          </h2>
        ) : (
          <h2 className="text-2xl font-bold col-span-3 mb-4">Welcome!</h2>
        )}
        <p className="text-gray-700 col-span-3">
          What can we help you with today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/schedule"
          className="group flex items-center justify-between rounded-2xl border border-slate-300 bg-white px-8 py-6 transition hover:border-slate-400"
        >
          <h2 className="font-serifDisplay text-2xl text-slate-900">
            Schedule{" "}
            <span className="text-emerald-700 font-medium">appointment</span>
          </h2>

          <span className="text-emerald-700 text-xl transition group-hover:translate-x-1">
            →
          </span>
        </Link>

        <Link
          to="/calendar"
          className="group flex items-center justify-between rounded-2xl border border-slate-300 bg-white px-8 py-6 transition hover:border-slate-400"
        >
          <h2 className="font-serifDisplay text-2xl text-slate-900">
            View <span className="text-amber-600 font-medium">calendar</span>
          </h2>

          <span className="text-emerald-700 text-xl transition group-hover:translate-x-1">
            →
          </span>
        </Link>
        <Link
          to="/advocates"
          className="group flex items-center justify-between rounded-2xl border border-slate-300 bg-white px-8 py-6 transition hover:border-slate-400"
        >
          <h2 className="font-serifDisplay text-2xl text-slate-900">
            Find{" "}
            <span className="text-amber-600 font-medium">advocates</span>
          </h2>

          <span className="text-emerald-700 text-xl transition group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
