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

export function MiniCalendar({ currentMonth, calendarData, onDayClick, onPrevMonth, onNextMonth, onBookingFormOpen }: MiniCalendarProps) {
    const getHalfDayClasses = (half: string, position: 'left' | 'right') => {
        const baseClasses = position === 'left' ? 'absolute top-0 left-0 w-1/2 h-full' : 'absolute top-0 right-0 w-1/2 h-full';

        switch (half) {
            case 'arrival':
                return cn(baseClasses, 'bg-blue-500'); // Blau für belegt
            case 'departure':
                return cn(baseClasses, 'bg-blue-500'); // Blau für belegt
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

    return (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
            {/* Header mit Navigation */}
            <div className="mb-4 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={onPrevMonth} className="h-8 w-8 p-0">
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <h3 className="text-lg font-semibold">{currentMonth}</h3>

                <Button variant="ghost" size="sm" onClick={onNextMonth} className="h-8 w-8 p-0">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Wochentage Header */}
            <div className="mb-2 grid grid-cols-7 gap-1">
                {calendarData.weekdays.map((weekday) => (
                    <div key={weekday} className="p-1 text-center text-xs font-medium text-gray-500">
                        {weekday}
                    </div>
                ))}
            </div>

            {/* Kalender Grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarData.days.map((day) => (
                    <button
                        key={day.date}
                        onClick={(e) => handleDayButtonClick(day, e)}
                        className={cn(
                            'relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-gray-50',
                            !day.isCurrentMonth && 'text-gray-400 opacity-50',
                            day.isToday && 'ring-2 ring-blue-500',
                            day.isWeekend && 'bg-gray-50',
                        )}
                        title={`${day.day}. - ${
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
                        <span className="pointer-events-none relative z-10 text-xs font-semibold text-gray-900">{day.day}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
