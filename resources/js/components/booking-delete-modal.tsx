import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, CalendarDays, Trash2 } from 'lucide-react';

interface Booking {
    id: number;
    titel: string;
    beschreibung?: string;
    start_datum: string;
    end_datum: string;
    gast_anzahl: number;
    status: string;
    status_name: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface BookingDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
}

export function BookingDeleteModal({ isOpen, onClose, booking }: BookingDeleteModalProps) {
    const { delete: deleteBooking, processing } = useForm();

    const handleDelete = () => {
        if (!booking) return;

        deleteBooking(`/bookings/${booking.id}`, {
            onSuccess: () => {
                onClose();
            },
            onError: (errors) => {
                console.log('Booking deletion failed:', errors);
            },
        });
    };

    if (!booking) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Buchung löschen
                    </DialogTitle>
                    <DialogDescription>Sind Sie sicher, dass Sie diese Buchung unwiderruflich löschen möchten?</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                            <CalendarDays className="mt-0.5 h-5 w-5 text-red-600" />
                            <div className="space-y-2">
                                <h4 className="font-semibold text-red-800">{booking.titel}</h4>
                                <div className="text-sm text-red-700">
                                    <p>
                                        <strong>Zeitraum:</strong> {formatDate(booking.start_datum)} - {formatDate(booking.end_datum)}
                                    </p>
                                    <p>
                                        <strong>Gäste:</strong> {booking.gast_anzahl} Person{booking.gast_anzahl !== 1 ? 'en' : ''}
                                    </p>
                                    <p>
                                        <strong>Status:</strong> {booking.status_name}
                                    </p>
                                    {booking.beschreibung && (
                                        <p>
                                            <strong>Beschreibung:</strong> {booking.beschreibung}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                            <div className="text-sm text-amber-800">
                                <p>
                                    <strong>Warnung:</strong> Diese Aktion kann nicht rückgängig gemacht werden. Die Buchung wird permanent gelöscht.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                        Abbrechen
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={processing} className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        {processing ? 'Wird gelöscht...' : 'Buchung löschen'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
