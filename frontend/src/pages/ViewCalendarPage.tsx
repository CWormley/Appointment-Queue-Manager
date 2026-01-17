import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentAPI } from "../services/api";

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  date: string;
  endDate: string;
  status: string;
}

function ViewCalendarPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!userId) {
          setError("User ID not found. Please sign in again.");
          return;
        }
        const data = await appointmentAPI.getByUserId(userId);
        setAppointments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [userId]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAppointmentsForDate = (dateStr: string) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date).toLocaleDateString();
      return aptDate === new Date(dateStr).toLocaleDateString();
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleSelectDate = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day+1)
      .toISOString()
      .split("T")[0];
    setSelectedDate(dateStr);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Appointment Calendar</h1>
          <p className="text-gray-600">View and manage all your scheduled appointments</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600 text-lg">Loading calendar...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={handlePrevMonth}
                  className="px-4 py-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                >
                  ← Prev
                </button>
                <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
                <button
                  onClick={handleNextMonth}
                  className="px-4 py-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                >
                  Next →
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const dateStr = day
                    ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day+1)
                        .toISOString()
                        .split("T")[0]
                    : null;
                  const dayAppointments = dateStr ? getAppointmentsForDate(dateStr) : [];
                  const isSelected = selectedDate === dateStr;

                  return (
                    <button
                      key={index}
                      onClick={() => day && handleSelectDate(day)}
                      className={`aspect-square p-2 rounded-lg border transition text-sm ${
                        day
                          ? `cursor-pointer border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 ${
                              isSelected
                                ? "bg-emerald-100 border-emerald-500"
                                : "bg-white"
                            }`
                          : "bg-gray-50 border-gray-100 cursor-default"
                      }`}
                    >
                      {day && (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {dayAppointments.length > 0 && (
                            <div className="absolute top-1 left-1">
                              <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                            </div>
                          )}
                          <div className="font-semibold text-gray-900">{day}</div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar - Appointments */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })
                    : "Select a Date"}
                </h3>
                <p className="text-gray-600">
                  {selectedAppointments.length} appointment
                  {selectedAppointments.length !== 1 ? "s" : ""}
                </p>
              </div>

              {selectedDate && selectedAppointments.length > 0 ? (
                <div className="space-y-4">
                  {selectedAppointments.map((apt) => (
                    <div key={apt.id} className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">{apt.title}</p>
                      {apt.description && (
                        <p className="text-sm text-gray-600 mb-2">{apt.description}</p>
                      )}
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(apt.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(apt.endDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <span className="inline-block px-2 py-1 bg-emerald-200 text-emerald-800 text-xs rounded font-medium">
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : selectedDate ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No appointments scheduled for this date</p>
                  <button
                    onClick={() => navigate("/schedule")}
                    className="w-full px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition font-semibold"
                  >
                    Schedule One
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Select a date to view appointments</p>
                </div>
              )}

              {appointments.length === 0 && !selectedDate && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No appointments yet</p>
                  <button
                    onClick={() => navigate("/schedule")}
                    className="w-full px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition font-semibold"
                  >
                    Create First Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewCalendarPage;