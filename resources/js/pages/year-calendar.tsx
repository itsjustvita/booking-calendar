import BookingDetailsModal from '@/components/booking-details-modal';
import { BookingFormModal } from '@/components/booking-form-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

interface Booking {
    id: number;
    titel: string;
    beschreibung?: string;
    start_datum: string;
    end_datum: string;
    gast_anzahl: number;
    status: string;
    status_name: string;
    duration: number;
    date_range: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    can_edit: boolean;
    can_delete: boolean;
}

interface CalendarDay {
    date: string;
    day: number;
    dayName: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    isWeekend: boolean;
    bookings: Booking[];
    hasBookings: boolean;
    isArrivalDay: boolean;
    isDepartureDay: boolean;
    isFullyOccupied: boolean;
    leftHalf: 'occupied' | 'free';
    rightHalf: 'occupied' | 'free';
}

interface CalendarData {
    days: CalendarDay[];
    weeks: CalendarDay[][];
    weekdays: string[];
}

interface MonthData {
    month: number;
    monthName: string;
    monthNameShort: string;
    year: number;
    startOfMonth: string;
    endOfMonth: string;
    bookings: Booking[];
    calendarData: CalendarData;
}

interface YearStats {
    totalBookings: number;
    totalGuests: number;
    occupiedDays: number;
    mostBusyMonth: {
        month: number;
        monthName: string;
        bookingCount: number;
    };
}

interface YearCalendarPageProps extends SharedData {
    year: number;
    monthsData: MonthData[];
    allBookings: Booking[];
    yearStats: YearStats;
    previousYear: number;
    nextYear: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Jahreskalender',
        href: '/year-calendar',
    },
];

export default function YearCalendar() {
    const { year, monthsData, allBookings, yearStats, previousYear, nextYear } = usePage<YearCalendarPageProps>().props;
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState<any>(null);

    // State für Buchungsformular
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<'morning' | 'afternoon'>('afternoon');

    const handleDayClick = (day: any) => {
        console.log('Year calendar day clicked:', day); // Debug
        if (day.hasBookings) {
            console.log('Setting selected day:', day); // Debug
            setSelectedDay(day);
            setShowBookingModal(true);
        }
    };

    const handleDayButtonClick = (day: any, event: React.MouseEvent<HTMLButtonElement>) => {
        // Bestimme basierend auf Klick-Position ob links oder rechts
        const rect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const buttonWidth = rect.width;
        const timeOfDay = clickX < buttonWidth / 2 ? 'morning' : 'afternoon';

        const isHalfFree = (timeOfDay === 'morning' && day.leftHalf === 'free') || (timeOfDay === 'afternoon' && day.rightHalf === 'free');

        if (isHalfFree && day.isCurrentMonth) {
            // Öffne Buchungsformular mit vorausgefülltem Datum
            setSelectedDate(day.date);
            setSelectedTime(timeOfDay);
            setShowBookingForm(true);
        } else if (day.hasBookings) {
            // Zeige bestehende Buchung
            handleDayClick(day);
        }
    };

    const handleEditBooking = (booking: Booking) => {
        console.log('Edit booking:', booking);
    };

    const handleDeleteBooking = (booking: Booking) => {
        console.log('Delete booking:', booking);
    };

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

    const getDayClasses = (day: CalendarDay) => {
        return cn('relative h-6 w-6 cursor-pointer border border-gray-200 transition-all hover:scale-110', {
            'opacity-40': !day.isCurrentMonth,
            'ring-2 ring-blue-500 ring-offset-1': day.isToday,
        });
    };

    const renderMonth = (monthData: MonthData) => {
        // Offset für Monatsanfang berechnen
        const weekdayOrder = ['Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.', 'So.'];
        const firstDayOfWeek = monthData.calendarData.days[0]?.dayName;
        const offset = weekdayOrder.indexOf(firstDayOfWeek);

        return (
            <Card key={monthData.month} className="glass-card p-4">
                <div className="space-y-3">
                    <h3 className="text-center text-lg font-semibold text-white">{monthData.monthName}</h3>

                    {/* Wochentage Header */}
                    <div className="mb-2 grid grid-cols-7 gap-1">
                        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((weekday) => (
                            <div key={weekday} className="p-1 text-center text-xs font-medium text-white/70">
                                {weekday}
                            </div>
                        ))}
                    </div>

                    {/* Monatstage */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Offset */}
                        {Array.from({ length: offset }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {/* Tage */}
                        {monthData.calendarData.days.map((day) => (
                            <button
                                key={day.date}
                                onClick={(e) => handleDayButtonClick(day, e)}
                                className={cn(
                                    'relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-white/20',
                                    day.isToday && 'ring-2 ring-white/60',
                                    day.isWeekend && 'bg-white/10',
                                )}
                                title={`${day.day}.${monthData.month}.${year} - ${day.dayName} - ${
                                    day.leftHalf === 'free' && day.rightHalf === 'free'
                                        ? 'Frei (klicken zum Buchen)'
                                        : day.leftHalf === 'free'
                                          ? 'Vormittag frei, Nachmittag belegt'
                                          : day.rightHalf === 'free'
                                            ? 'Vormittag belegt, Nachmittag frei'
                                            : 'Komplett belegt'
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
            </Card>
        );
    };

    console.log(
        'YearCalendar Januar:',
        monthsData[0].calendarData.days.slice(0, 7).map((d) => `${d.day}: ${d.dayName}`),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Jahreskalender ${year}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header with year navigation and stats */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Link href={`/year-calendar?year=${previousYear}`} className="rounded p-1 text-white hover:bg-white/20">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                            <h1 className="glass-heading text-3xl font-bold">Kalender {year}</h1>
                            <Link href={`/year-calendar?year=${nextYear}`} className="rounded p-1 text-white hover:bg-white/20">
                                <ChevronRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" asChild className="glass-button border-white/30 text-white hover:bg-white/20">
                            <Link href="/dashboard">
                                <Calendar className="mr-2 h-4 w-4" />
                                Zum Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Year Statistics */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="glass-card">
                        <CardHeader className="glass-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="glass-card-title text-sm font-medium">Buchungen {year}</CardTitle>
                            <Calendar className="h-4 w-4 text-white/70" />
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            <div className="text-2xl font-bold">{yearStats.totalBookings}</div>
                            <p className="text-xs text-white/70">{yearStats.totalBookings === 1 ? 'Buchung' : 'Buchungen'} bestätigt</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader className="glass-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="glass-card-title text-sm font-medium">Gäste gesamt</CardTitle>
                            <Users className="h-4 w-4 text-white/70" />
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            <div className="text-2xl font-bold">{yearStats.totalGuests}</div>
                            <p className="text-xs text-white/70">{yearStats.totalGuests === 1 ? 'Person' : 'Personen'} insgesamt</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader className="glass-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="glass-card-title text-sm font-medium">Belegte Tage</CardTitle>
                            <TrendingUp className="h-4 w-4 text-white/70" />
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            <div className="text-2xl font-bold">{yearStats.occupiedDays}</div>
                            <p className="text-xs text-white/70">von 365 Tagen belegt</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader className="glass-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="glass-card-title text-sm font-medium">Stärkster Monat</CardTitle>
                            <Badge variant="outline" className="border-white/30 text-white">
                                {yearStats.mostBusyMonth.bookingCount}
                            </Badge>
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            <div className="text-lg font-bold">{yearStats.mostBusyMonth.monthName}</div>
                            <p className="text-xs text-white/70">
                                {yearStats.mostBusyMonth.bookingCount} {yearStats.mostBusyMonth.bookingCount === 1 ? 'Buchung' : 'Buchungen'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Legend */}
                <Card className="glass-card">
                    <CardHeader className="glass-card-header">
                        <CardTitle className="glass-card-title text-lg">Legende</CardTitle>
                    </CardHeader>
                    <CardContent className="glass-card-content">
                        <div className="flex flex-wrap gap-4 text-sm text-white">
                            <div className="flex items-center gap-2">
                                <div className="relative h-5 w-5 border border-white/30">
                                    <div className="absolute top-0 left-0 h-full w-1/2 bg-transparent" />
                                    <div className="absolute top-0 right-0 h-full w-1/2 bg-blue-500" />
                                </div>
                                <span>Anreisetag (vormittags frei, nachmittags belegt)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 border border-white/30 bg-blue-500" />
                                <span>Voll belegt</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative h-5 w-5 border border-white/30">
                                    <div className="absolute top-0 left-0 h-full w-1/2 bg-blue-500" />
                                    <div className="absolute top-0 right-0 h-full w-1/2 bg-transparent" />
                                </div>
                                <span>Abreisetag (vormittags belegt, nachmittags frei)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 border border-white/30 bg-transparent" />
                                <span>Frei</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 border border-white/30 bg-blue-500" />
                                <span>An- und Abreise am selben Tag (komplett belegt)</span>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-white/70">
                            💡 Anreise ist nachmittags, Abreise ist vormittags - dadurch können sich Buchungen um einen halben Tag überschneiden.
                        </p>
                    </CardContent>
                </Card>

                {/* 12-Month Calendar Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{monthsData.map(renderMonth)}</div>
            </div>

            {/* Booking Form Modal */}
            <BookingFormModal
                isOpen={showBookingForm}
                onClose={() => setShowBookingForm(false)}
                initialDate={selectedDate}
                initialTime={selectedTime}
            />

            {/* Booking Details Modal */}
            <BookingDetailsModal
                isOpen={showBookingModal}
                onOpenChange={setShowBookingModal}
                selectedDay={selectedDay}
                onEditBooking={handleEditBooking}
                onDeleteBooking={handleDeleteBooking}
            />
        </AppLayout>
    );
}
