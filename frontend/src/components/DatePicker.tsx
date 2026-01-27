/**
 * DatePicker Component
 * 
 * @description
 * Custom calendar widget for date selection in appointment forms.
 * Features include month/year navigation via arrows or dropdowns,
 * automatic disabling of past dates and weekends, and local timezone support.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
 *
 */
import { useState, useRef, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

function DatePicker({ value, onChange, placeholder = "Select date", className = "" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Parse the selected date string (YYYY-MM-DD) correctly as local time
  let selectedDate: Date | undefined = undefined;
  if (value) {
    const [year, month, day] = value.split('-').map(Number);
    selectedDate = new Date(year, month - 1, day);
  }

  // Set today with time zeroed out for minDate
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Format display date for input
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-left bg-white hover:border-gray-400 transition"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
      </button>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-120">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date: Date | undefined) => {
              if (date) {
                // Format as YYYY-MM-DD
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                onChange(`${year}-${month}-${day}`);
                setIsOpen(false);
              }
            }}
            disabled={(date: Date) => {
              // Disable weekends and days before today
              const dayOfWeek = date.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              // Zero out time for comparison
              const compareDate = new Date(date);
              compareDate.setHours(0, 0, 0, 0);
              return isWeekend || compareDate < today;
            }}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}

export default DatePicker;
