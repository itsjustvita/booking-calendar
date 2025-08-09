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
    onDeleted?: () => void;
}

export function BookingDeleteModal({ isOpen, onClose, booking, onDeleted }: BookingDeleteModalProps) {
    const { delete: deleteBooking, processing } = useForm();

    const handleDelete = () => {
        if (!booking) return;

        deleteBooking(`/bookings/${booking.id}`, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onSuccess: () => {
                onClose();
                if (onDeleted) onDeleted();
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
            <DialogContent className="border-white/20 bg-white/10 text-white backdrop-blur-xl sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-300">
                        <AlertTriangle className="h-5 w-5" />
                        Buchung löschen
                    </DialogTitle>
                    <DialogDescription className="text-white/80">
                        Sind Sie sicher, dass Sie diese Buchung unwiderruflich löschen möchten?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4">
                        <div className="flex items-start gap-3">
                            <CalendarDays className="mt-0.5 h-5 w-5 text-red-300" />
                            <div className="space-y-2">
                                <h4 className="font-semibold text-red-200">{booking.titel}</h4>
                                <div className="text-sm text-red-200/80">
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

                    <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-300" />
                            <div className="text-sm text-amber-200/90">
                                <p>
                                    <strong>Warnung:</strong> Diese Aktion kann nicht rückgängig gemacht werden. Die Buchung wird permanent gelöscht.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={processing}
                        className="border-white/30 text-white hover:bg-white/10"
                    >
                        Abbrechen
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={processing}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                    >
                        <Trash2 className="h-4 w-4" />
                        {processing ? 'Wird gelöscht...' : 'Buchung löschen'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
