import BookingDetailsModal from '@/components/booking-details-modal';
import BookingFormModal from '@/components/booking-form-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

interface Booking {
    id: number;
    titel: string;
    beschreibung?: string;
    start_datum: string;
    end_datum: string;

    status: string;
    status_name: string;
    duration: number;
    date_range: string;
    user: {
        id: number;
        name: string;
        email: string;
        category?: {
            id: number;
            name: string;
            color: string;
        };
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



export default function YearCalendar() {
    const { year, monthsData, yearStats, previousYear, nextYear } = usePage<YearCalendarPageProps>().props;
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

    // State für Buchungsformular
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<'morning' | 'afternoon'>('afternoon');

    const handleDayClick = (day: CalendarDay) => {
        console.log('Year calendar day clicked:', day); // Debug
        if (day.hasBookings) {
            console.log('Setting selected day:', day); // Debug
            setSelectedDay(day);
            setShowBookingModal(true);
        }
    };

    const handleDayButtonClick = (day: CalendarDay, event: React.MouseEvent<HTMLButtonElement>) => {
        // Bestimme basierend auf Klick-Position ob links oder rechts
        const rect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const buttonWidth = rect.width;
        const timeOfDay = clickX < buttonWidth / 2 ? 'morning' : 'afternoon';

        const isHalfFree = (timeOfDay === 'morning' && day.leftHalf === 'free') || (timeOfDay === 'afternoon' && day.rightHalf === 'free');
        const isHalfOccupied = (timeOfDay === 'morning' && day.leftHalf === 'occupied') || (timeOfDay === 'afternoon' && day.rightHalf === 'occupied');

        // Debug-Info für besseres Verständnis
        console.log('Year calendar click:', {
            date: day.date,
            timeOfDay,
            leftHalf: day.leftHalf,
            rightHalf: day.rightHalf,
            isHalfFree,
            isHalfOccupied,
            hasBookings: day.hasBookings
        });

        if (isHalfFree && day.isCurrentMonth) {
            // Öffne Buchungsformular mit vorausgefülltem Datum (nur für freie Hälften)
            setSelectedDate(day.date);
            setSelectedTime(timeOfDay);
            setShowBookingForm(true);
        } else if (isHalfOccupied || day.hasBookings) {
            // Zeige bestehende Buchung (für belegte Hälften oder allgemein wenn Buchungen vorhanden)
            handleDayClick(day);
        }
    };

    const handleEditBooking = (booking: Booking) => {
        console.log('Edit booking:', booking);
    };

    const handleDeleteBooking = (booking: Booking) => {
        console.log('Delete booking:', booking);
    };

    const getHalfDayClasses = (half: string, position: 'left' | 'right', day: CalendarDay) => {
        const baseClasses = position === 'left' ? 'absolute top-0 left-0 w-1/2 h-full' : 'absolute top-0 right-0 w-1/2 h-full';

        switch (half) {
            case 'occupied':
                // Prüfe ob Buchungen mit Kategorien vorhanden sind
                if (day.bookings && day.bookings.length > 0) {
                    // Verwende die erste Buchung mit Kategorie-Farbe, falls vorhanden
                    const bookingWithCategory = day.bookings.find(booking => booking.user?.category);
                    if (bookingWithCategory?.user?.category?.color) {
                        return cn(baseClasses, 'border border-white/20');
                    }
                }
                return cn(baseClasses, 'bg-blue-500'); // Standard blau für belegt
            case 'free':
            default:
                return cn(baseClasses, 'bg-transparent'); // Transparent für frei
        }
    };

    const getHalfDayStyle = (half: string, position: 'left' | 'right', day: CalendarDay) => {
        if (half === 'occupied' && day.bookings && day.bookings.length > 0) {
            const bookingWithCategory = day.bookings.find(booking => booking.user?.category);
            if (bookingWithCategory?.user?.category?.color) {
                return {
                    backgroundColor: bookingWithCategory.user.category.color,
                };
            }
        }
        return {};
    };

    // Hinweis: getDayClasses aktuell ungenutzt – visuelle Klassen direkt im Button

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
                                <div 
                                    className={cn(getHalfDayClasses(day.leftHalf, 'left', day), 'rounded-l-md')} 
                                    style={getHalfDayStyle(day.leftHalf, 'left', day)}
                                />

                                {/* Right half - visuell */}
                                <div 
                                    className={cn(getHalfDayClasses(day.rightHalf, 'right', day), 'rounded-r-md')} 
                                    style={getHalfDayStyle(day.rightHalf, 'right', day)}
                                />

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
        <AppLayout>
            <Head title={`${year}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl">
                {/* Header with year navigation and stats */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Link href={`/year-calendar?year=${previousYear}`} className="rounded p-1 text-white hover:bg-white/20">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                            <h1 className="glass-heading text-3xl font-bold">{year}</h1>
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

                {/* Legend (nach unten verschoben) */}
                <Card className="glass-card order-last">
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
                                <span>Voll belegt (Standard)</span>
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
                        
                        {/* Kategorie-Legende */}
                        {(() => {
                            const categories = new Set();
                            monthsData.forEach(month => {
                                month.bookings.forEach(booking => {
                                    if (booking.user?.category) {
                                        categories.add(JSON.stringify(booking.user.category));
                                    }
                                });
                            });
                            
                            const uniqueCategories = Array.from(categories).map(cat => JSON.parse(cat as string));
                            
                            if (uniqueCategories.length > 0) {
                                return (
                                    <div className="mt-4">
                                        <h4 className="mb-2 text-sm font-medium text-white">Benutzer-Kategorien:</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {uniqueCategories.map((category) => (
                                                <div key={category.id} className="flex items-center gap-2">
                                                    <div 
                                                        className="h-4 w-4 rounded border border-white/20" 
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                    <span className="text-xs">{category.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
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
                onEditBooking={(booking: any) => handleEditBooking(booking)}
                onDeleteBooking={(booking: any) => handleDeleteBooking(booking)}
            />
        </AppLayout>
    );
}
