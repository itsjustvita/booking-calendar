import BookingDetailsModal from '@/components/booking-details-modal';
import { BookingFormModal } from '@/components/booking-form-modal';
import { MiniCalendar } from '@/components/mini-calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Calendar, Clock, Cloud, MapPin, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface DashboardData {
    currentMonth: string;
    currentYear: number;
    calendarData: {
        days: CalendarDay[];
        weekdays: string[];
    };
    statistics: {
        totalBookings: number;
        totalGuests: number;
        upcomingBookings: number;
        monthlyRevenue: number;
    };
}

interface WeatherLocation {
    city: string;
    country: string;
    coordinates: {
        lat: number;
        lon: number;
    };
}

interface WeatherData {
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
    location: string;
}

interface Props {
    dashboardData: DashboardData;
    weatherLocation: WeatherLocation;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Deutsche Datumsformatierung
const formatGermanDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

// Wetter-Widget Komponente
const WeatherWidget = ({ weatherLocation }: { weatherLocation: WeatherLocation }) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulation von Wetterdaten mit den Admin-konfigurierten Standortdaten
        // In der realen Anwendung würde hier eine API aufgerufen werden
        setTimeout(() => {
            setWeather({
                temperature: Math.round(Math.random() * 20 + 5), // 5-25°C
                description: ['Sonnig', 'Teilweise bewölkt', 'Bewölkt', 'Leichter Regen'][Math.floor(Math.random() * 4)],
                humidity: Math.round(Math.random() * 40 + 40), // 40-80%
                windSpeed: Math.round(Math.random() * 20 + 5), // 5-25 km/h
                location: `${weatherLocation.city}, ${weatherLocation.country}`,
            });
            setLoading(false);
        }, 1000);
    }, [weatherLocation]);

    if (loading) {
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

    if (!weather) return null;

    return (
        <Card className="glass-card">
            <CardHeader className="glass-card-header">
                <CardTitle className="glass-card-title flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    Aktuelles Wetter
                </CardTitle>
            </CardHeader>
            <CardContent className="glass-card-content">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-white/70" />
                        <span className="text-sm text-white/80">{weather.location}</span>
                    </div>
                    <div className="text-3xl font-bold">{weather.temperature}°C</div>
                    <p className="text-white/80">{weather.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-white/70">Luftfeuchtigkeit</span>
                            <div className="font-medium">{weather.humidity}%</div>
                        </div>
                        <div>
                            <span className="text-white/70">Wind</span>
                            <div className="font-medium">{weather.windSpeed} km/h</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function Dashboard({ dashboardData, weatherLocation }: Props) {
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

    // State für Buchungsformular
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<'morning' | 'afternoon'>('afternoon');

    // Debug-Logs
    console.log('Dashboard Data:', dashboardData);
    console.log('Calendar Days:', dashboardData.calendarData.days);
    console.log('Days with bookings:', dashboardData.calendarData.days.filter(day => day.hasBookings));

    const handleDayClick = (day: CalendarDay, event: React.MouseEvent<HTMLButtonElement>) => {
        console.log('Day clicked:', day); // Debug
        console.log('Has bookings:', day.hasBookings); // Debug
        console.log('Bookings:', day.bookings); // Debug

        if (day.hasBookings && day.bookings.length > 0) {
            console.log('Setting booking:', day.bookings[0]); // Debug
            setSelectedDay(day);
            setShowBookingModal(true);
        }
    };

    const handleBookingFormOpen = (date: string, timeOfDay: 'morning' | 'afternoon') => {
        setSelectedDate(date);
        setSelectedTime(timeOfDay);
        setShowBookingForm(true);
    };

    const handlePrevMonth = () => {
        const currentDate = new Date(dashboardData.currentYear, new Date(dashboardData.currentMonth + ' 1, 2024').getMonth() - 1);
        router.get(
            '/dashboard',
            {
                year: currentDate.getFullYear(),
                month: currentDate.getMonth() + 1,
            },
            { preserveState: true },
        );
    };

    const handleNextMonth = () => {
        const currentDate = new Date(dashboardData.currentYear, new Date(dashboardData.currentMonth + ' 1, 2024').getMonth() + 1);
        router.get(
            '/dashboard',
            {
                year: currentDate.getFullYear(),
                month: currentDate.getMonth() + 1,
            },
            { preserveState: true },
        );
    };

    const handleEditBooking = (booking: any) => {
        // TODO: Implementiere Bearbeitung
        console.log('Edit booking:', booking);
    };

    const handleDeleteBooking = (booking: any) => {
        // TODO: Implementiere Löschung
        console.log('Delete booking:', booking);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Willkommenstext */}
                <div className="space-y-2">
                    <h1 className="glass-heading text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="glass-text">Überblick über Ihre Hüttenbuchungen im {dashboardData.currentMonth}</p>
                </div>

                {/* Statistiken */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="glass-card">
                        <CardHeader className="glass-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="glass-card-title text-sm font-medium">Gesamtbuchungen</CardTitle>
                            <Calendar className="h-4 w-4 text-white/70" />
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            <div className="text-2xl font-bold">{dashboardData.statistics.totalBookings}</div>
                            <p className="text-xs text-white/70">In diesem Monat</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader className="glass-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="glass-card-title text-sm font-medium">Gäste</CardTitle>
                            <Users className="h-4 w-4 text-white/70" />
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            <div className="text-2xl font-bold">{dashboardData.statistics.totalGuests}</div>
                            <p className="text-xs text-white/70">Gesamtanzahl</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader className="glass-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="glass-card-title text-sm font-medium">Anstehende Buchungen</CardTitle>
                            <Clock className="h-4 w-4 text-white/70" />
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            <div className="text-2xl font-bold">{dashboardData.statistics.upcomingBookings}</div>
                            <p className="text-xs text-white/70">Nächste 30 Tage</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader className="glass-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="glass-card-title text-sm font-medium">Auslastung</CardTitle>
                            <TrendingUp className="h-4 w-4 text-white/70" />
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            <div className="text-2xl font-bold">
                                {dashboardData.statistics.totalBookings > 0 ? Math.round((dashboardData.statistics.totalBookings / 30) * 100) : 0}%
                            </div>
                            <p className="text-xs text-white/70">Diesen Monat</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Mini-Kalender und Wetter */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <MiniCalendar
                            currentMonth={dashboardData.currentMonth}
                            calendarData={dashboardData.calendarData}
                            onDayClick={handleDayClick}
                            onPrevMonth={handlePrevMonth}
                            onNextMonth={handleNextMonth}
                            onBookingFormOpen={handleBookingFormOpen}
                        />
                    </div>

                    {/* Wetter-Widget */}
                    <WeatherWidget weatherLocation={weatherLocation} />
                </div>

                {/* Kommende Buchungen */}
                <Card className="glass-card">
                    <CardHeader className="glass-card-header">
                        <CardTitle className="glass-card-title">Kommende Buchungen</CardTitle>
                    </CardHeader>
                    <CardContent className="glass-card-content">
                        <div className="space-y-3">
                            {dashboardData.calendarData.days
                                .filter((day) => day.hasBookings && new Date(day.date) >= new Date())
                                .slice(0, 5)
                                .map((day) => (
                                    <div key={day.date} className="glass-mini-card flex items-center justify-between p-3">
                                        <div>
                                            <p className="font-medium text-white">{day.bookings[0]?.titel || 'Buchung'}</p>
                                            <p className="text-sm text-white/70">{formatGermanDate(day.date)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-white">{day.bookings[0]?.gast_anzahl || 0} Gäste</p>
                                            <p className="text-xs text-white/70">{day.bookings[0]?.status_name || 'Unbekannt'}</p>
                                        </div>
                                    </div>
                                ))}
                            {dashboardData.calendarData.days.filter((day) => day.hasBookings && new Date(day.date) >= new Date()).length === 0 && (
                                <p className="py-4 text-center text-white/70">Keine kommenden Buchungen</p>
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
