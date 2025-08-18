import BookingDetailsModal from '@/components/booking-details-modal';
import BookingFormModal from '@/components/booking-form-modal';
import { MiniCalendar } from '@/components/mini-calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, Clock, Cloud, MapPin, TrendingUp, Users } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { formatGermanNumber, formatGermanDate } from '@/lib/utils';

type HalfState = 'occupied' | 'free';

interface CalendarDayBooking {
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
    bookings: CalendarDayBooking[];
    hasBookings: boolean;
    isArrivalDay: boolean;
    isDepartureDay: boolean;
    isFullyOccupied: boolean;
    leftHalf: HalfState;
    rightHalf: HalfState;
}

interface UpcomingBooking {
    id: number;
    titel: string;

    status: string;
    status_name: string;
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
}

interface DashboardData {
    currentMonth: string;
    currentYear: number;
    calendarData: {
        days: CalendarDay[];
        weekdays: string[];
    };
    statistics: {
        totalBookings: number;

        upcomingBookings: number;
        monthlyRevenue: number;
    };
    upcomingList?: UpcomingBooking[];
}

interface WeatherLocation {
    city: string;
    country: string;
    coordinates: {
        lat: number;
        lon: number;
    };
}

interface WeatherForecastDay {
    date: string;
    dayName: string; // kurz (z.B. Mo., Di.)
    temperature: number;
    description: string;
}

interface WeatherData {
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
    location: string;
    forecast?: WeatherForecastDay[];
}

interface Props {
    dashboardData: DashboardData;
    weatherLocation: WeatherLocation;
    weatherData?: WeatherData;
}



// (helper entfernt; nicht genutzt)

// Wetter-Widget Komponente
const WeatherWidget = ({ weatherData }: { weatherData?: WeatherData }) => {
    if (!weatherData) {
        return (
            <Card className="glass-card">
                <CardHeader className="glass-card-header">
                    <CardTitle className="glass-card-title flex items-center gap-2">
                        <Cloud className="h-4 w-4" />
                        Wetter
                    </CardTitle>
                </CardHeader>
                <CardContent className="glass-card-content">
                    <div className="animate-pulse">
                        <div className="mb-2 h-8 rounded bg-white/20"></div>
                        <div className="h-4 rounded bg-white/20"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass-card">
            <CardHeader className="glass-card-header">
                <CardTitle className="glass-card-title flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    Aktuelles Wetter
                </CardTitle>
            </CardHeader>
            <CardContent className="glass-card-content">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-white/70" />
                        <span className="text-sm text-white/80">{weatherData.location}</span>
                    </div>
                    <div className="text-3xl font-bold">{weatherData.temperature}°C</div>
                    <p className="text-white/80">{weatherData.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-white/70">Luftfeuchtigkeit</span>
                            <div className="font-medium">{weatherData.humidity}%</div>
                        </div>
                        <div>
                            <span className="text-white/70">Wind</span>
                            <div className="font-medium">{weatherData.windSpeed} km/h</div>
                        </div>
                    </div>
                    {weatherData.forecast && weatherData.forecast.length > 0 && (
                        <div className="mt-2">
                            <div className="mb-2 text-sm font-medium text-white/80">Nächste 3 Tage</div>
                            <div className="grid grid-cols-3 gap-2">
                                {weatherData.forecast.map((day) => (
                                    <div key={day.date} className="glass-mini-card rounded-md p-2 text-center">
                                        <div className="text-xs text-white/70">{day.dayName}</div>
                                        <div className="text-lg font-semibold text-white">{day.temperature}°C</div>
                                        <div className="text-[10px] text-white/70">{day.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default function Dashboard({ dashboardData, weatherData }: Props) {
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<'morning' | 'afternoon'>('afternoon');

    // Memoized handlers for better performance
    const handleDayClick = useCallback((day: CalendarDay) => {
        console.log('Day clicked:', day); // Debug
        console.log('Has bookings:', day.hasBookings); // Debug
        console.log('Bookings:', Array.isArray(day.bookings) ? day.bookings : Object.values(day.bookings || {})); // Debug

        // Normalize bookings to array
        const normalizedBookings = Array.isArray(day.bookings) ? day.bookings : Object.values(day.bookings || {});

        // Normalize object and open modal
        const normalized: CalendarDay = {
            ...day,
            bookings: normalizedBookings as CalendarDayBooking[],
            hasBookings: normalizedBookings.length > 0,
            leftHalf: (day as unknown as { leftHalf?: HalfState }).leftHalf ?? 'occupied',
            rightHalf: (day as unknown as { rightHalf?: HalfState }).rightHalf ?? 'occupied',
        } as CalendarDay;
        setSelectedDay(normalized);
        setTimeout(() => setShowBookingModal(true), 0);
    }, []);

    const handleBookingFormOpen = useCallback((date: string, timeOfDay: 'morning' | 'afternoon') => {
        setSelectedDate(date);
        setSelectedTime(timeOfDay);
        setShowBookingForm(true);
    }, []);

    const handlePrevMonth = useCallback(() => {
        const currentMonth = new Date(dashboardData.currentMonth + ' 1, ' + dashboardData.currentYear);
        const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);

        router.get(
            '/dashboard',
            {
                year: prevMonth.getFullYear(),
                month: prevMonth.getMonth() + 1,
            },
            { preserveState: true },
        );
    }, [dashboardData.currentMonth, dashboardData.currentYear]);

    const handleNextMonth = useCallback(() => {
        const currentMonth = new Date(dashboardData.currentMonth + ' 1, ' + dashboardData.currentYear);
        const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

        router.get(
            '/dashboard',
            {
                year: nextMonth.getFullYear(),
                month: nextMonth.getMonth() + 1,
            },
            { preserveState: true },
        );
    }, [dashboardData.currentMonth, dashboardData.currentYear]);

    const handleEditBooking = useCallback((booking: CalendarDayBooking | UpcomingBooking) => {
        // TODO: Implementiere Bearbeitung
        console.log('Edit booking:', booking);
    }, []);

    const handleDeleteBooking = useCallback((booking: CalendarDayBooking | UpcomingBooking) => {
        // TODO: Implementiere Löschung
        console.log('Delete booking:', booking);
    }, []);

    // Polling für Live-Updates alle 30 Sekunden
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['dashboardData', 'weatherData'] });
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Note: Preloading removed for Inertia v2 compatibility
    // Prefetch functionality may not be available in this version

    // Memoized statistics display
    const statisticsDisplay = useMemo(() => {
        const statistics = dashboardData.statistics;
        
        return {
            totalBookings: (
                <>
                    <div className="text-2xl font-bold">{formatGermanNumber(statistics.totalBookings)}</div>
                    <p className="text-xs text-white/70">In diesem Monat</p>
                </>
            ),

            upcomingBookings: (
                <>
                    <div className="text-2xl font-bold">{formatGermanNumber(statistics.upcomingBookings)}</div>
                    <p className="text-xs text-white/70">Nächste 30 Tage</p>
                </>
            ),
            occupancy: (
                <>
                    <div className="text-2xl font-bold">
                        {statistics.totalBookings > 0 ? formatGermanNumber(Math.round((statistics.totalBookings / 30) * 100)) : '0'}%
                    </div>
                    <p className="text-xs text-white/70">Diesen Monat</p>
                </>
            ),
        };
    }, [dashboardData.statistics]);

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl">
                {/* Willkommenstext */}
                <div className="space-y-2">
                    <h1 className="glass-heading text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="glass-text">Überblick über Ihre Hüttenbuchungen im {dashboardData.currentMonth}</p>
                </div>

                {/* Statistiken mit deferred props */}
                <div className="grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="glass-card h-full">
                        <CardHeader className="glass-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="glass-card-title text-sm font-medium">Gesamtbuchungen</CardTitle>
                            <Calendar className="h-4 w-4 text-white/70" />
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            {statisticsDisplay.totalBookings}
                        </CardContent>
                    </Card>



                    <Card className="glass-card h-full">
                        <CardHeader className="glass-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="glass-card-title text-sm font-medium">Anstehende Buchungen</CardTitle>
                            <Clock className="h-4 w-4 text-white/70" />
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            {statisticsDisplay.upcomingBookings}
                        </CardContent>
                    </Card>

                    <Card className="glass-card h-full">
                        <CardHeader className="glass-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="glass-card-title text-sm font-medium">Auslastung</CardTitle>
                            <TrendingUp className="h-4 w-4 text-white/70" />
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            {statisticsDisplay.occupancy}
                        </CardContent>
                    </Card>
                </div>

                {/* Mini-Kalender und Wetter: je 50% Breite in Reihe 2 */}
                <div className="grid items-stretch gap-6 md:grid-cols-2">
                    <div className="flex w-full flex-col">
                        <MiniCalendar
                            currentMonth={dashboardData.currentMonth}
                            calendarData={dashboardData.calendarData}
                            onDayClick={(day) => handleDayClick(day as any)}
                            onPrevMonth={handlePrevMonth}
                            onNextMonth={handleNextMonth}
                            onBookingFormOpen={handleBookingFormOpen}
                        />
                    </div>

                    {/* Wetter-Widget */}
                    <div className="flex w-full flex-col">
                        <div className="flex h-full flex-col">
                            <WeatherWidget weatherData={weatherData} />
                        </div>
                    </div>
                </div>

                {/* Kommende Buchungen mit deferred props */}
                <Card className="glass-card">
                    <CardHeader className="glass-card-header">
                        <CardTitle className="glass-card-title">Kommende Buchungen</CardTitle>
                    </CardHeader>
                    <CardContent className="glass-card-content">
                        <div className="space-y-3">
                            {dashboardData.upcomingList && dashboardData.upcomingList.length > 0 ? (
                                dashboardData.upcomingList.map((b: UpcomingBooking) => (
                                    <button
                                        key={b.id}
                                        className="glass-mini-card flex w-full items-center justify-between p-3 text-left"
                                        onClick={() => {
                                            // Öffne Details-Modal analog zur Kalenderlogik
                                            const mockDay = {
                                                date: new Date().toISOString().slice(0, 10),
                                                bookings: [
                                                    {
                                                        id: b.id,
                                                        titel: b.titel,
                                                        beschreibung: '',
                                                        start_datum: new Date().toISOString().slice(0, 10),
                                                        end_datum: new Date().toISOString().slice(0, 10),

                                                        status: b.status,
                                                        status_name: b.status_name,
                                                        duration: 1,
                                                        date_range: b.date_range,
                                                        user: { id: b.user.id, name: b.user.name, email: b.user.email },
                                                        can_edit: false,
                                                        can_delete: false,
                                                    },
                                                ],
                                                hasBookings: true,
                                                isCurrentMonth: true,
                                                isToday: false,
                                                isWeekend: false,
                                                isArrivalDay: false,
                                                isDepartureDay: false,
                                                isFullyOccupied: false,
                                                leftHalf: 'occupied',
                                                rightHalf: 'occupied',
                                            } as CalendarDay;
                                            setSelectedDay(mockDay);
                                            setShowBookingModal(true);
                                        }}
                                    >
                                        <div>
                                            <p className="font-medium text-white">{b.titel}</p>
                                            <p className="text-sm text-white/70">{b.date_range}</p>
                                            <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
                                                <span className="font-medium text-white">Gebucht von:</span>
                                                <span>{b.user.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-white/70">
                                                <span className="font-medium text-white">E-Mail:</span>
                                                <a href={`mailto:${b.user.email}`} className="text-blue-300 hover:underline">
                                                    {b.user.email}
                                                </a>
                                            </div>
                                        </div>
                                        <div className="text-right">

                                            <p className="text-xs text-white/70">{b.status_name}</p>
                                        </div>
                                    </button>
                                ))
                            ) : dashboardData.upcomingList ? (
                                <p className="py-4 text-center text-white/70">Keine kommenden Buchungen</p>
                            ) : (
                                <div className="animate-pulse space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-20 rounded bg-white/20"></div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

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
            </div>
        </AppLayout>
    );
}
