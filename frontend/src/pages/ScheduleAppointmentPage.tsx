/**
 * ScheduleAppointmentPage
 * 
 * @description
 * Appointment creation form with smart time slot selection.
 * Dynamically fetches available time slots from the API based on selected date,
 * prevents scheduling conflicts, and enforces business rules (no weekends/past dates).
 * Supports consecutive time slot selection for multi-hour appointments.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
 *
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentAPI } from "../services/api";
import DatePicker from "../components/DatePicker";

function ScheduleAppointmentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const userId = localStorage.getItem("userId");

  const [formData, setFormData] = useState({
    description: "",
    startDate: "",
    startTime: "",
    endTime: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.startDate) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const slots = await appointmentAPI.getAvailableSlots(formData.startDate);
        setAvailableSlots(slots);
      } catch (err) {
        console.error("Failed to fetch available slots:", err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
    // Reset start time when date changes
    setFormData((prev) => ({ ...prev, startTime: "", endTime: "" }));
  }, [formData.startDate]);

  // Reset end time when start time changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, endTime: "" }));
  }, [formData.startTime]);

  // Calculate valid end times based on start time and available slots
  const getValidEndTimes = (): string[] => {
    if (!formData.startTime || availableSlots.length === 0) {
      return [];
    }

    const startIndex = availableSlots.indexOf(formData.startTime);
    if (startIndex === -1) {
      return [];
    }

    const validEndTimes: string[] = [];
    
    // Convert time strings to minutes for easier comparison
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Convert minutes back to time string
    const minutesToTime = (minutes: number): string => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    let lastConsecutiveSlot = formData.startTime;

    // Check each subsequent slot
    for (let i = startIndex + 1; i < availableSlots.length; i++) {
      const currentSlotMinutes = timeToMinutes(availableSlots[i]);
      const previousSlotMinutes = timeToMinutes(availableSlots[i - 1]);

      // Check if there's a gap (more than 60 minutes between slots)
      if (currentSlotMinutes - previousSlotMinutes > 60) {
        // Stop at the first gap
        break;
      }

      validEndTimes.push(availableSlots[i]);
      lastConsecutiveSlot = availableSlots[i];
    }

    // Add one more hour after the last consecutive available slot
    if (lastConsecutiveSlot) {
      const lastSlotMinutes = timeToMinutes(lastConsecutiveSlot);
      const nextHourTime = minutesToTime(lastSlotMinutes + 60);
      validEndTimes.push(nextHourTime);
    }

    return validEndTimes;
  };

  const validEndTimes = getValidEndTimes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!userId) {
        setError("User ID not found. Please sign in again.");
        return;
      }

      if (!formData.description || !formData.startDate || !formData.startTime) {
        setError("Please fill in all required fields");
        return;
      }

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = formData.endTime 
        ? new Date(`${formData.startDate}T${formData.endTime}`)
        : new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default 1 hour duration

      if (endDateTime <= startDateTime) {
        setError("End time must be after start time");
        return;
      }

      await appointmentAPI.create(
        userId,
        startDateTime.toISOString(),
        endDateTime.toISOString(),
        formData.description
      );

      setSuccess(true);
      setFormData({
        description: "",
        startDate: "",
        startTime: "",
        endTime: "",
      });

      setTimeout(() => {
        navigate("/calendar");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Schedule an Appointment</h1>
          <p className="text-gray-600">Create a new appointment to manage your time efficiently</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✓ Appointment created successfully! Redirecting...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Appointment Title/Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g., Doctor's appointment, Team meeting, etc."
                className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={1}
              />
            </div>

            {/* Start Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Appointment Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  value={formData.startDate}
                  onChange={(date) => setFormData((prev) => ({ ...prev, startDate: date }))}
                  placeholder="Select appointment date"
                />
              </div>
            </div>

            {/* Start and End Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${!formData.startDate ? 'text-gray-400' : 'text-gray-900'}`}>
                  Start Time <span className="text-red-500">*</span>
                </label>
                {loadingSlots ? (
                  <div className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 text-sm">
                    Loading available slots...
                  </div>
                ) : (
                  <select
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    disabled={!formData.startDate || availableSlots.length === 0}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition ${
                      !formData.startDate || availableSlots.length === 0
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                    }`}
                  >
                    <option value="">
                      {!formData.startDate
                        ? "Select a date first"
                        : availableSlots.length === 0
                        ? "No available slots"
                        : "Select a time slot"}
                    </option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${!formData.startTime ? 'text-gray-400' : 'text-gray-900'}`}>
                  End Time <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <select
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  disabled={!formData.startTime || validEndTimes.length === 0}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition ${
                    !formData.startTime || validEndTimes.length === 0
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                  }`}
                >
                  <option value="">
                    {!formData.startTime
                      ? "Select start time first"
                      : validEndTimes.length === 0
                      ? "No available end times"
                      : "Select end time (default +1hr)"}
                  </option>
                  {validEndTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              If no end time is specified, a 1-hour duration will be used by default.
            </p>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Appointment"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/calendar")}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ScheduleAppointmentPage;