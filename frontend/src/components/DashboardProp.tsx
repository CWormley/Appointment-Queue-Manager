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
    <div className="relative z-10 flex flex-col bg-brand-white rounded-2xl mx-4 pt-6 px-6 pb-10 mb-20">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/schedule"
          className="group flex items-center justify-between rounded-2xl border border-slate-300 bg-white px-8 py-6 transition hover:border-slate-400"
        >
          <h2 className="font-serifDisplay text-2xl text-slate-900">
            Schedule{" "}
            <span className="text-brand-green font-medium">appointment</span>
          </h2>

          <span className="text-brand-green text-xl transition group-hover:translate-x-1">
            →
          </span>
        </Link>

        <Link
          to="/calendar"
          className="group flex items-center justify-between rounded-2xl border border-slate-300 bg-white px-8 py-6 transition hover:border-slate-400"
        >
          <h2 className="font-serifDisplay text-2xl text-slate-900">
            View <span className="text-brand-gold font-medium">calendar</span>
          </h2>

          <span className="text-brand-gold text-xl transition group-hover:translate-x-1">
            →
          </span>
        </Link>
        <Link
          to="/advocates"
          className="group flex items-center justify-between rounded-2xl border border-slate-300 bg-white px-8 py-6 transition hover:border-slate-400"
        >
          <h2 className="font-serifDisplay text-2xl text-slate-900">
            Find{" "}
            <span className="text-brand-green font-medium">advocates</span>
          </h2>

          <span className="text-brand-green text-xl transition group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
