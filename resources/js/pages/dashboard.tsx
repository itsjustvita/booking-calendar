import BookingDetailsModal from '@/components/booking-details-modal';
import { BookingFormModal } from '@/components/booking-form-modal';
import { MiniCalendar } from '@/components/mini-calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Calendar, Clock, Cloud, MapPin, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

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
const WeatherWidget = ({ weatherLocation, weatherData }: { weatherLocation: WeatherLocation; weatherData?: WeatherData }) => {
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

export default function Dashboard({ dashboardData, weatherLocation, weatherData }: Props) {
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
    console.log(
        'Days with bookings:',
        dashboardData.calendarData.days.filter((day) => day.hasBookings),
    );

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
    };

    const handleNextMonth = () => {
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
                <div className="grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="glass-card h-full">
                        <CardHeader className="glass-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="glass-card-title text-sm font-medium">Gesamtbuchungen</CardTitle>
                            <Calendar className="h-4 w-4 text-white/70" />
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            <div className="text-2xl font-bold">{dashboardData.statistics.totalBookings}</div>
                            <p className="text-xs text-white/70">In diesem Monat</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card h-full">
                        <CardHeader className="glass-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="glass-card-title text-sm font-medium">Gäste</CardTitle>
                            <Users className="h-4 w-4 text-white/70" />
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            <div className="text-2xl font-bold">{dashboardData.statistics.totalGuests}</div>
                            <p className="text-xs text-white/70">Gesamtanzahl</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card h-full">
                        <CardHeader className="glass-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="glass-card-title text-sm font-medium">Anstehende Buchungen</CardTitle>
                            <Clock className="h-4 w-4 text-white/70" />
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            <div className="text-2xl font-bold">{dashboardData.statistics.upcomingBookings}</div>
                            <p className="text-xs text-white/70">Nächste 30 Tage</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card h-full">
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

                {/* Mini-Kalender und Wetter: je 50% Breite in Reihe 2 */}
                <div className="grid items-stretch gap-6 md:grid-cols-2">
                    <div className="flex w-full flex-col">
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
                    <div className="flex w-full flex-col">
                        <div className="flex h-full flex-col">
                            <WeatherWidget weatherLocation={weatherLocation} weatherData={weatherData} />
                        </div>
                    </div>
                </div>

                {/* Kommende Buchungen */}
                <Card className="glass-card">
                    <CardHeader className="glass-card-header">
                        <CardTitle className="glass-card-title">Kommende Buchungen</CardTitle>
                    </CardHeader>
                    <CardContent className="glass-card-content">
                        <div className="space-y-3">
                            {dashboardData.upcomingList && dashboardData.upcomingList.length > 0 ? (
                                dashboardData.upcomingList.map((b) => (
                                    <button
                                        key={b.id}
                                        className="glass-mini-card flex w-full items-center justify-between p-3 text-left"
                                        onClick={() => {
                                            // Öffne Details-Modal analog zur Kalenderlogik
                                            const mockDay = {
                                                date: b.date_range.split(' - ')[0] || new Date().toISOString().slice(0, 10),
                                                bookings: [
                                                    {
                                                        id: b.id,
                                                        titel: b.titel,
                                                        beschreibung: '',
                                                        start_datum: '',
                                                        end_datum: '',
                                                        gast_anzahl: b.gast_anzahl,
                                                        status: b.status,
                                                        status_name: b.status_name,
                                                        duration: 1,
                                                        date_range: b.date_range,
                                                        user: { id: 0, name: '', email: '' },
                                                        can_edit: false,
                                                        can_delete: false,
                                                    },
                                                ],
                                                hasBookings: true,
                                            } as any;
                                            setSelectedDay(mockDay);
                                            setShowBookingModal(true);
                                        }}
                                    >
                                        <div>
                                            <p className="font-medium text-white">{b.titel}</p>
                                            <p className="text-sm text-white/70">{b.date_range}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-white">{b.gast_anzahl} Gäste</p>
                                            <p className="text-xs text-white/70">{b.status_name}</p>
                                        </div>
                                    </button>
                                ))
                            ) : (
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
