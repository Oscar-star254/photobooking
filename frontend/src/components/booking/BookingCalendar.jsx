import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import api from "../../services/api";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const TIME_SLOTS = [
  { id: "07:00", label: "7:00 AM",  period: "Morning" },
  { id: "09:00", label: "9:00 AM",  period: "Morning" },
  { id: "11:00", label: "11:00 AM", period: "Morning" },
  { id: "13:00", label: "1:00 PM",  period: "Afternoon" },
  { id: "15:00", label: "3:00 PM",  period: "Afternoon" },
  { id: "17:00", label: "5:00 PM",  period: "Evening" },
];

export default function BookingCalendar({ onSelect, selectedDate, selectedTime }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear]   = useState(today.getFullYear());
  const [bookedDates, setBookedDates]   = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    api.get("/bookings/booked-dates")
      .then(r => setBookedDates(r.data.booked_dates))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const formatDate = (day) => {
    const m = String(currentMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${currentYear}-${m}-${d}`;
  };

  const isBooked = (day) => bookedDates.includes(formatDate(day));
  const isPast   = (day) => new Date(currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isToday  = (day) => formatDate(day) === today.toISOString().slice(0, 10);
  const isSelected = (day) => formatDate(day) === selectedDate;

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const handleDayClick = (day) => {
    if (isBooked(day) || isPast(day)) return;
    onSelect(formatDate(day), selectedTime);
  };

  const handleTimeClick = (time) => {
    if (!selectedDate) return;
    onSelect(selectedDate, time);
  };

  const daysInMonth  = getDaysInMonth(currentMonth, currentYear);
  const firstDay     = getFirstDayOfMonth(currentMonth, currentYear);
  const totalCells   = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="card">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-display text-lg font-semibold text-white">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-500" />
            <span className="text-gray-400 text-xs font-body">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-400 text-xs font-body">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-600" />
            <span className="text-gray-400 text-xs font-body">Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-400 text-xs font-body">Selected</span>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-body font-medium text-gray-500 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: totalCells }).map((_, i) => {
              const day = i - firstDay + 1;
              const valid = day >= 1 && day <= daysInMonth;

              if (!valid) return <div key={i} />;

              const booked   = isBooked(day);
              const past     = isPast(day);
              const today_   = isToday(day);
              const selected = isSelected(day);
              const disabled = booked || past;

              let classes = "relative w-full aspect-square rounded-lg flex items-center justify-center text-sm font-body transition-all duration-150 ";

              if (selected) {
                classes += "bg-green-500 text-white font-semibold shadow-lg shadow-green-500/30 ";
              } else if (booked) {
                classes += "bg-red-500/20 text-red-400 cursor-not-allowed ";
              } else if (past) {
                classes += "text-gray-600 cursor-not-allowed ";
              } else if (today_) {
                classes += "bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/50 cursor-pointer hover:bg-brand-500/30 ";
              } else {
                classes += "text-gray-300 cursor-pointer hover:bg-brand-500/20 hover:text-brand-400 ";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleDayClick(day)}
                  disabled={disabled}
                  className={classes}
                  title={booked ? "Already booked" : past ? "Past date" : "Available"}
                >
                  {day}
                  {booked && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selectedDate && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-brand-400 text-sm font-body font-medium text-center">
              📅 Selected: {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        )}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="card">
          <h3 className="font-display text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-400" />
            Select a Time Slot
          </h3>

          {["Morning", "Afternoon", "Evening"].map((period) => (
            <div key={period} className="mb-4">
              <p className="text-gray-500 text-xs font-body uppercase tracking-widest mb-2">{period}</p>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.filter(t => t.period === period).map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleTimeClick(slot.id)}
                    className={`py-2.5 px-3 rounded-lg text-sm font-body font-medium transition-all duration-150
                      ${selectedTime === slot.id
                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                        : "bg-dark-600 text-gray-300 hover:bg-brand-500/20 hover:text-brand-400 border border-white/5"
                      }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}