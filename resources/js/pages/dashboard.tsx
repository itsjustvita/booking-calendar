import BookingDetailsModal from '@/components/booking-details-modal';
import { BookingFormModal } from '@/components/booking-form-modal';
import { MiniCalendar } from '@/components/mini-calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Calendar, Clock, TrendingUp, Users } from 'lucide-react';
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

interface Props {
    dashboardData: DashboardData;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ dashboardData }: Props) {
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

    // State für Buchungsformular
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<'morning' | 'afternoon'>('afternoon');

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
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Überblick über Ihre Hüttenbuchungen im {dashboardData.currentMonth}</p>
                </div>

                {/* Statistiken */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gesamtbuchungen</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.statistics.totalBookings}</div>
                            <p className="text-xs text-muted-foreground">In diesem Monat</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gäste</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.statistics.totalGuests}</div>
                            <p className="text-xs text-muted-foreground">Gesamtanzahl</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Anstehende Buchungen</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.statistics.upcomingBookings}</div>
                            <p className="text-xs text-muted-foreground">Nächste 30 Tage</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Auslastung</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {dashboardData.statistics.totalBookings > 0 ? Math.round((dashboardData.statistics.totalBookings / 30) * 100) : 0}%
                            </div>
                            <p className="text-xs text-muted-foreground">Diesen Monat</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Mini-Kalender */}
                <div className="grid gap-6 md:grid-cols-2">
                    <MiniCalendar
                        currentMonth={dashboardData.currentMonth}
                        calendarData={dashboardData.calendarData}
                        onDayClick={handleDayClick}
                        onPrevMonth={handlePrevMonth}
                        onNextMonth={handleNextMonth}
                        onBookingFormOpen={handleBookingFormOpen}
                    />

                    {/* Kommende Buchungen */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Kommende Buchungen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {dashboardData.calendarData.days
                                    .filter((day) => day.hasBookings && new Date(day.date) >= new Date())
                                    .slice(0, 5)
                                    .map((day) => (
                                        <div key={day.date} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                            <div>
                                                <p className="font-medium">{day.bookings[0]?.titel || 'Buchung'}</p>
                                                <p className="text-sm text-gray-500">{day.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{day.bookings[0]?.gast_anzahl || 0} Gäste</p>
                                                <p className="text-xs text-gray-500">{day.bookings[0]?.status_name || 'Unbekannt'}</p>
                                            </div>
                                        </div>
                                    ))}
                                {dashboardData.calendarData.days.filter((day) => day.hasBookings && new Date(day.date) >= new Date()).length ===
                                    0 && <p className="py-4 text-center text-gray-500">Keine kommenden Buchungen</p>}
                            </div>
                        </CardContent>
                    </Card>
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
            </div>
        </AppLayout>
    );
}
