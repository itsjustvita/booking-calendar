import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { CalendarDays, Clock, FileText, Users } from 'lucide-react';
import React from 'react';

interface BookingFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate?: string;
    initialTime?: 'morning' | 'afternoon';
}

export function BookingFormModal({ isOpen, onClose, initialDate = '', initialTime = 'afternoon' }: BookingFormModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        titel: '',
        beschreibung: '',
        start_datum: initialDate,
        end_datum: '',
        gast_anzahl: 1,
        anreise_zeit: initialTime,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('Submitting booking form with data:', data); // Debug

        post('/bookings', {
            onSuccess: () => {
                console.log('Booking created successfully'); // Debug
                reset();
                onClose();
            },
            onError: (errors) => {
                console.log('Booking creation failed:', errors); // Debug
            },
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    // Update form data when modal opens with initial values
    React.useEffect(() => {
        if (isOpen && initialDate) {
            console.log('Setting initial date:', initialDate, 'time:', initialTime); // Debug
            setData({
                titel: '',
                beschreibung: '',
                start_datum: initialDate,
                end_datum: '',
                gast_anzahl: 1,
                anreise_zeit: initialTime,
            });
        }
    }, [isOpen, initialDate, initialTime, setData]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="border-white/20 bg-white/10 text-white backdrop-blur-xl sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <CalendarDays className="h-5 w-5" />
                        Neue Buchung erstellen
                    </DialogTitle>
                    <DialogDescription className="text-white/80">
                        Erstellen Sie eine neue Hüttenbuchung. Alle Felder sind erforderlich.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-5">
                        {/* Titel */}
                        <div>
                            <Label htmlFor="titel" className="mb-1 flex items-center gap-2 text-white">
                                <FileText className="h-4 w-4 text-white/70" />
                                Titel der Buchung
                            </Label>
                            <Input
                                id="titel"
                                value={data.titel}
                                onChange={(e) => setData('titel', e.target.value)}
                                placeholder="z.B. Familienwochenende, Geburtstagsfeier..."
                                className={errors.titel ? 'border-red-500' : ''}
                            />
                            {errors.titel && <p className="mt-1 text-sm text-red-500">{errors.titel}</p>}
                        </div>

                        {/* Beschreibung */}
                        <div>
                            <Label htmlFor="beschreibung" className="mb-1 text-white">
                                Beschreibung (optional)
                            </Label>
                            <Textarea
                                id="beschreibung"
                                value={data.beschreibung}
                                onChange={(e) => setData('beschreibung', e.target.value)}
                                placeholder="Zusätzliche Informationen zur Buchung..."
                                rows={3}
                                className={cn(
                                    errors.beschreibung ? 'border-red-500' : '',
                                    'border-white/20 bg-white/5 text-white placeholder:text-white/60',
                                )}
                            />
                            {errors.beschreibung && <p className="mt-1 text-sm text-red-500">{errors.beschreibung}</p>}
                        </div>

                        {/* Datum-Bereich */}
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <Label htmlFor="start_datum" className="mb-1 flex items-center gap-2 text-white">
                                    <CalendarDays className="h-4 w-4 text-white/70" />
                                    Anreisedatum
                                </Label>
                                <Input
                                    id="start_datum"
                                    type="date"
                                    value={data.start_datum}
                                    onChange={(e) => setData('start_datum', e.target.value)}
                                    className={errors.start_datum ? 'border-red-500' : ''}
                                />
                                {errors.start_datum && <p className="mt-1 text-sm text-red-500">{errors.start_datum}</p>}
                            </div>

                            <div>
                                <Label htmlFor="end_datum" className="mb-1 text-white">
                                    Abreisedatum
                                </Label>
                                <Input
                                    id="end_datum"
                                    type="date"
                                    value={data.end_datum}
                                    onChange={(e) => setData('end_datum', e.target.value)}
                                    className={cn(errors.end_datum ? 'border-red-500' : '')}
                                />
                                {errors.end_datum && <p className="mt-1 text-sm text-red-500">{errors.end_datum}</p>}
                            </div>
                        </div>

                        {/* Anreisezeit und Gästeanzahl */}
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <Label htmlFor="anreise_zeit" className="mb-1 flex items-center gap-2 text-white">
                                    <Clock className="h-4 w-4 text-white/70" />
                                    Anreisezeit
                                </Label>
                                <select
                                    id="anreise_zeit"
                                    value={data.anreise_zeit}
                                    onChange={(e) => setData('anreise_zeit', e.target.value as 'morning' | 'afternoon')}
                                    className="flex h-10 w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="afternoon">Nachmittags (Standard)</option>
                                    <option value="morning">Vormittags</option>
                                </select>
                                {errors.anreise_zeit && <p className="mt-1 text-sm text-red-500">{errors.anreise_zeit}</p>}
                            </div>

                            <div>
                                <Label htmlFor="gast_anzahl" className="mb-1 flex items-center gap-2 text-white">
                                    <Users className="h-4 w-4 text-white/70" />
                                    Anzahl Gäste
                                </Label>
                                <Input
                                    id="gast_anzahl"
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={data.gast_anzahl}
                                    onChange={(e) => setData('gast_anzahl', parseInt(e.target.value) || 1)}
                                    className={errors.gast_anzahl ? 'border-red-500' : ''}
                                />
                                {errors.gast_anzahl && <p className="mt-1 text-sm text-red-500">{errors.gast_anzahl}</p>}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                            className="border-white/30 text-white hover:bg-white/10"
                        >
                            Abbrechen
                        </Button>
                        <Button type="submit" disabled={processing} className="min-w-[120px]">
                            {processing ? 'Wird erstellt...' : 'Buchung erstellen'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
