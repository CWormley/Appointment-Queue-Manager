/**
 * Date Picker
 * 
 * @description
 * Pop-up calendar for selecting date in form field. 
 * Allows for navigation month by month as well as drop down month and year selection.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
 *
 */
import { useState, useRef, useEffect } from "react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

function DatePicker({ value, onChange, placeholder = "Select date", className = "", required = false }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
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

  // Initialize current month based on selected value
  useEffect(() => {
    if (value) {
      setCurrentMonth(new Date(value));
    }
  }, [value]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    // Parse YYYY-MM-DD format directly without timezone conversion
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleDateSelect = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    // Format date string directly to avoid timezone issues
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Parse the selected date string (YYYY-MM-DD) correctly as local time
  let selectedDate = null;
  if (value) {
    const [year, month, day] = value.split('-').map(Number);
    selectedDate = new Date(year, month - 1, day);
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate year range (10 years before to 10 years after current year)
  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const handleMonthChange = (newMonth: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), newMonth, 1));
  };

  const handleYearChange = (newYear: number) => {
    setCurrentMonth(new Date(newYear, currentMonth.getMonth(), 1));
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
        <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
          {/* Month/Year Header */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex gap-2 flex-1">
              {/* Month Dropdown */}
              <select
                value={month}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="flex-1 px-2 py-1 text-sm font-semibold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
              >
                {monthNames.map((monthName, index) => (
                  <option key={monthName} value={index}>
                    {monthName}
                  </option>
                ))}
              </select>

              {/* Year Dropdown */}
              <select
                value={year}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="px-2 py-1 text-sm font-semibold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
              >
                {yearRange.map((yearOption) => (
                  <option key={yearOption} value={yearOption}>
                    {yearOption}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dateObj = new Date(year, month, day);
              dateObj.setHours(0, 0, 0, 0);

              const isSelected = selectedDate && 
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;

              const isToday = today.getTime() === dateObj.getTime();
              const isPast = dateObj < today;
              const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6; // 0 = Sunday, 6 = Saturday
              const isDisabled = isPast || isWeekend;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !isDisabled && handleDateSelect(day)}
                  disabled={isDisabled}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition
                    ${isDisabled
                      ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                      : isSelected 
                      ? "bg-emerald-700 text-white hover:bg-emerald-800" 
                      : isToday
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
