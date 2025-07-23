import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CalendarDays, Clock, Mail, Pencil, Trash2, User, Users } from 'lucide-react';

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
    // Support both old and new formats for compatibility
    isPartiallyBooked?: boolean;
    isFullyBooked?: boolean;
    isFullyOccupied?: boolean;
    leftHalf?: 'arrival' | 'occupied' | 'free';
    rightHalf?: 'departure' | 'occupied' | 'free';
}

interface BookingDetailsModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedDay: CalendarDay | null;
    onEditBooking?: (booking: Booking) => void;
    onDeleteBooking?: (booking: Booking) => void;
}

export default function BookingDetailsModal({ isOpen, onOpenChange, selectedDay, onEditBooking, onDeleteBooking }: BookingDetailsModalProps) {
    if (!selectedDay || !selectedDay.hasBookings) {
        return null;
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        Buchungen am {formatDate(selectedDay.date)}
                    </DialogTitle>
                    <DialogDescription>
                        {selectedDay.bookings.length} Buchung{selectedDay.bookings.length !== 1 ? 'en' : ''}
                        {selectedDay.isArrivalDay && ' • Anreisetag'}
                        {selectedDay.isDepartureDay && ' • Abreisetag'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {selectedDay.bookings.map((booking, index) => (
                        <div key={booking.id} className="space-y-3 rounded-lg border p-4">
                            {/* Header with title and status */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{booking.titel}</h3>
                                    {booking.beschreibung && <p className="mt-1 text-sm text-gray-600">{booking.beschreibung}</p>}
                                </div>
                                <Badge variant="outline" className={cn('ml-2', getStatusColor(booking.status))}>
                                    {booking.status_name}
                                </Badge>
                            </div>

                            <Separator />

                            {/* Booking details */}
                            <div className="grid grid-cols-1 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Zeitraum:</span>
                                    <span>{booking.date_range}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Dauer:</span>
                                    <span>
                                        {booking.duration} Tag{booking.duration !== 1 ? 'e' : ''}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Anzahl Gäste:</span>
                                    <span>
                                        {booking.gast_anzahl} Person{booking.gast_anzahl !== 1 ? 'en' : ''}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Gebucht von:</span>
                                    <span>{booking.user.name}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">E-Mail:</span>
                                    <span className="text-blue-600">
                                        <a href={`mailto:${booking.user.email}`}>{booking.user.email}</a>
                                    </span>
                                </div>
                            </div>

                            {/* Action buttons */}
                            {(booking.can_edit || booking.can_delete) && (
                                <>
                                    <Separator />
                                    <div className="flex gap-2">
                                        {booking.can_edit && onEditBooking && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onEditBooking(booking)}
                                                className="flex items-center gap-1"
                                            >
                                                <Pencil className="h-3 w-3" />
                                                Bearbeiten
                                            </Button>
                                        )}
                                        {booking.can_delete && onDeleteBooking && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onDeleteBooking(booking)}
                                                className="flex items-center gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                Löschen
                                            </Button>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Separator between bookings */}
                            {index < selectedDay.bookings.length - 1 && (
                                <div className="mt-4">
                                    <Separator />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Schließen
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
