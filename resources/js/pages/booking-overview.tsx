import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, Edit, Eye, Trash2, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Booking {
    id: number;
    titel: string;
    beschreibung: string;
    start_datum: string;
    end_datum: string;
    start_datum_formatted: string;
    end_datum_formatted: string;
    duration: number;
    gast_anzahl: number;
    status: string;
    status_name: string;
    user: User;
    created_at: string;
    updated_at: string;
    can_edit: boolean;
    can_delete: boolean;
}

interface Statistics {
    total_bookings: number;
    confirmed_bookings: number;
    pending_bookings: number;
    cancelled_bookings: number;
    total_guests: number;
    total_nights: number;
    average_stay: number;
    busiest_month: {
        month: number;
        month_name: string;
        booking_count: number;
    };
}

interface BookingOverviewProps {
    bookings: Booking[];
    statistics: Statistics;
    year: number;
    availableYears: number[];
    previousYear: number;
    nextYear: number;
}

export default function BookingOverview({ bookings, statistics, year, availableYears, previousYear, nextYear }: BookingOverviewProps) {
    const [selectedYear, setSelectedYear] = useState(year.toString());

    const breadcrumbs = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Buchungsübersicht', href: '#' },
    ];

    const handleYearChange = (newYear: string) => {
        setSelectedYear(newYear);
        router.get(route('booking-overview'), { year: newYear });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
            case 'cancelled':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Buchungsübersicht ${year}`} />

            <div className="space-y-6">
                {/* Header mit Jahr-Navigation */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="glass-heading text-3xl font-bold">Buchungsübersicht {year}</h1>
                        <p className="glass-text">Chronologische Übersicht aller Buchungen für das Jahr</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => handleYearChange(previousYear.toString())} className="glass-button">
                            <ChevronLeft className="h-4 w-4" />
                            {previousYear}
                        </Button>

                        <Select value={selectedYear} onValueChange={handleYearChange}>
                            <SelectTrigger className="glass-input w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-card">
                                {availableYears.map((availableYear) => (
                                    <SelectItem key={availableYear} value={availableYear.toString()}>
                                        {availableYear}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="sm" onClick={() => handleYearChange(nextYear.toString())} className="glass-button">
                            {nextYear}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Statistiken */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="glass-card">
                        <CardHeader className="glass-card-header pb-2">
                            <CardTitle className="glass-card-title flex items-center gap-2 text-sm font-medium">
                                <CalendarIcon className="h-4 w-4 text-white/70" />
                                Gesamt Buchungen
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            <div className="text-2xl font-bold text-white">{statistics.total_bookings}</div>
                            <div className="text-xs text-white/80">
                                {statistics.confirmed_bookings} bestätigt, {statistics.pending_bookings} ausstehend
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader className="glass-card-header pb-2">
                            <CardTitle className="glass-card-title flex items-center gap-2 text-sm font-medium">
                                <Users className="h-4 w-4 text-white/70" />
                                Gesamte Gäste
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            <div className="text-2xl font-bold text-white">{statistics.total_guests}</div>
                            <div className="text-xs text-white/80">Über alle Buchungen</div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader className="glass-card-header pb-2">
                            <CardTitle className="glass-card-title flex items-center gap-2 text-sm font-medium">
                                <Clock className="h-4 w-4 text-white/70" />
                                Übernachtungen
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            <div className="text-2xl font-bold text-white">{statistics.total_nights}</div>
                            <div className="text-xs text-white/80">Ø {statistics.average_stay} Tage pro Buchung</div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader className="glass-card-header pb-2">
                            <CardTitle className="glass-card-title flex items-center gap-2 text-sm font-medium">
                                <TrendingUp className="h-4 w-4 text-white/70" />
                                Aktivster Monat
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            <div className="text-2xl font-bold text-white">{statistics.busiest_month.month_name}</div>
                            <div className="text-xs text-white/80">{statistics.busiest_month.booking_count} Buchungen</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Buchungstabelle */}
                <Card className="glass-card">
                    <CardHeader className="glass-card-header">
                        <CardTitle className="glass-card-title">Alle Buchungen {year}</CardTitle>
                    </CardHeader>
                    <CardContent className="glass-card-content p-0">
                        {bookings.length === 0 ? (
                            <div className="p-8 text-center">
                                <CalendarIcon className="mx-auto mb-4 h-12 w-12 text-white/40" />
                                <h3 className="mb-2 text-lg font-medium text-white">Keine Buchungen gefunden</h3>
                                <p className="text-white/70">Für das Jahr {year} wurden keine Buchungen gefunden.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/20">
                                            <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-white/80 uppercase">
                                                Buchung
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-white/80 uppercase">
                                                Zeitraum
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-white/80 uppercase">Dauer</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-white/80 uppercase">Gäste</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-white/80 uppercase">Gast</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-white/80 uppercase">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-white/80 uppercase">
                                                Erstellt
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-medium tracking-wider text-white/80 uppercase">
                                                Aktionen
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {bookings.map((booking) => (
                                            <tr key={booking.id} className="transition-colors hover:bg-white/5">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-white">{booking.titel}</div>
                                                        {booking.beschreibung && (
                                                            <div className="max-w-xs truncate text-sm text-white/70">{booking.beschreibung}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-white">
                                                        {booking.start_datum_formatted} - {booking.end_datum_formatted}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-white">
                                                        {booking.duration} {booking.duration === 1 ? 'Tag' : 'Tage'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-white">{booking.gast_anzahl}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-white">{booking.user.name}</div>
                                                        <div className="text-sm text-white/70">{booking.user.email}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={getStatusColor(booking.status)}>{booking.status_name}</Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-white/70">{booking.created_at}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-white/70 hover:bg-white/10 hover:text-white"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {booking.can_edit && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-white/70 hover:bg-white/10 hover:text-white"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {booking.can_delete && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Zurück zum Dashboard */}
                <div className="flex justify-center">
                    <Link href={route('dashboard')}>
                        <Button className="glass-button">Zurück zum Dashboard</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
