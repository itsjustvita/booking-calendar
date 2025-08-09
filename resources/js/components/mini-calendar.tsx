import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarDay {
    date: string;
    day: number;
    dayName: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    isWeekend: boolean;
    bookings: any[];
    hasBookings: boolean;
    isArrivalDay: boolean;
    isDepartureDay: boolean;
    isFullyOccupied: boolean;
    leftHalf: string;
    rightHalf: string;
}

interface MiniCalendarProps {
    currentMonth: string;
    calendarData: {
        days: CalendarDay[];
        weekdays: string[];
    };
    onDayClick: (day: CalendarDay, event: React.MouseEvent<HTMLButtonElement>) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onBookingFormOpen?: (date: string, timeOfDay: 'morning' | 'afternoon') => void;
}

// Deutsche Monatsnamen
const germanMonths: { [key: string]: string } = {
    January: 'Januar',
    February: 'Februar',
    March: 'März',
    April: 'April',
    May: 'Mai',
    June: 'Juni',
    July: 'Juli',
    August: 'August',
    September: 'September',
    October: 'Oktober',
    November: 'November',
    December: 'Dezember',
};

const getGermanMonth = (monthString: string): string => {
    // Extrahiere den englischen Monatsnamen aus dem String
    const monthName = monthString.split(' ')[0];
    return germanMonths[monthName] ? monthString.replace(monthName, germanMonths[monthName]) : monthString;
};

export function MiniCalendar({ currentMonth, calendarData, onDayClick, onPrevMonth, onNextMonth, onBookingFormOpen }: MiniCalendarProps) {
    console.log(
        'MiniCalendar Wochentage:',
        calendarData.days.slice(0, 7).map((d) => `${d.day}: ${d.dayName}`),
    );
    const getHalfDayClasses = (half: string, position: 'left' | 'right') => {
        const baseClasses = position === 'left' ? 'absolute top-0 left-0 w-1/2 h-full' : 'absolute top-0 right-0 w-1/2 h-full';

        switch (half) {
            case 'occupied':
                return cn(baseClasses, 'bg-blue-500'); // Blau für belegt
            case 'free':
            default:
                return cn(baseClasses, 'bg-transparent'); // Transparent für frei
        }
    };

    const handleDayButtonClick = (day: CalendarDay, event: React.MouseEvent<HTMLButtonElement>) => {
        // Bestimme basierend auf Klick-Position ob links oder rechts
        const rect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const buttonWidth = rect.width;
        const timeOfDay = clickX < buttonWidth / 2 ? 'morning' : 'afternoon';

        const isHalfFree = (timeOfDay === 'morning' && day.leftHalf === 'free') || (timeOfDay === 'afternoon' && day.rightHalf === 'free');

        if (isHalfFree && day.isCurrentMonth && onBookingFormOpen) {
            // Öffne Buchungsformular mit vorausgefülltem Datum
            onBookingFormOpen(day.date, timeOfDay);
        } else {
            // Rufe den ursprünglichen onDayClick für Buchungsdetails auf
            onDayClick(day, event);
        }
    };

    // Offset für Monatsanfang berechnen
    const firstDayOfWeek = calendarData.days[0]?.dayName;
    const weekdayOrder = ['Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.', 'So.'];
    const offset = weekdayOrder.indexOf(firstDayOfWeek);

    return (
        <div className="glass-card h-full rounded-lg p-4">
            {/* Header mit Navigation */}
            <div className="mb-4 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={onPrevMonth} className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:text-white">
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <h3 className="text-lg font-semibold text-white">{getGermanMonth(currentMonth)}</h3>

                <Button variant="ghost" size="sm" onClick={onNextMonth} className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:text-white">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Wochentage Header */}
            <div className="mb-2 grid grid-cols-7 gap-1">
                {calendarData.weekdays.map((weekday) => (
                    <div key={weekday} className="flex h-8 items-center justify-center text-xs font-medium text-white/80">
                        {weekday}
                    </div>
                ))}
            </div>

            {/* Kalender Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Offset */}
                {Array.from({ length: offset }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {/* Tage */}
                {calendarData.days.map((day) => (
                    <button
                        key={day.date}
                        onClick={(e) => handleDayButtonClick(day, e)}
                        className={cn(
                            'relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-white/20',
                            !day.isCurrentMonth && 'text-white/40 opacity-50',
                            day.isToday && 'ring-2 ring-white/60',
                            day.isWeekend && 'bg-white/10',
                        )}
                        title={`${day.day}. - ${day.dayName} - ${
                            day.leftHalf === 'free' && day.rightHalf === 'free'
                                ? 'Frei (klicken zum Buchen)'
                                : day.leftHalf === 'free'
                                  ? 'Vormittag frei, Nachmittag belegt'
                                  : day.rightHalf === 'free'
                                    ? 'Vormittag belegt, Nachmittag frei'
                                    : day.hasBookings
                                      ? 'Komplett belegt (klicken für Details)'
                                      : 'Frei'
                        }`}
                    >
                        {/* Left half - visuell */}
                        <div className={cn(getHalfDayClasses(day.leftHalf, 'left'), 'rounded-l-md')} />

                        {/* Right half - visuell */}
                        <div className={cn(getHalfDayClasses(day.rightHalf, 'right'), 'rounded-r-md')} />

                        {/* Day number - always on top */}
                        <span className="pointer-events-none relative z-10 text-xs font-semibold text-white">{day.day}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
