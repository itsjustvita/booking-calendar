import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { CalendarDays, Users, FileText, Clock } from 'lucide-react';
import React, { useState } from 'react';

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
        start_datum: '',
        end_datum: '',
        gast_anzahl: 1,
        anreise_zeit: 'afternoon',
    });

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
    }, [isOpen, initialDate, initialTime]);

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

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        Neue Buchung erstellen
                    </DialogTitle>
                    <DialogDescription>Erstellen Sie eine neue Hüttenbuchung. Alle Felder sind erforderlich.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {/* Titel */}
                        <div>
                            <Label htmlFor="titel" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
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
                            <Label htmlFor="beschreibung">Beschreibung (optional)</Label>
                            <Textarea
                                id="beschreibung"
                                value={data.beschreibung}
                                onChange={(e) => setData('beschreibung', e.target.value)}
                                placeholder="Zusätzliche Informationen zur Buchung..."
                                rows={3}
                                className={errors.beschreibung ? 'border-red-500' : ''}
                            />
                            {errors.beschreibung && <p className="mt-1 text-sm text-red-500">{errors.beschreibung}</p>}
                        </div>

                        {/* Datum-Bereich */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="start_datum" className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
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
                                <Label htmlFor="end_datum">Abreisedatum</Label>
                                <Input
                                    id="end_datum"
                                    type="date"
                                    value={data.end_datum}
                                    onChange={(e) => setData('end_datum', e.target.value)}
                                    className={errors.end_datum ? 'border-red-500' : ''}
                                />
                                {errors.end_datum && <p className="mt-1 text-sm text-red-500">{errors.end_datum}</p>}
                            </div>
                        </div>

                        {/* Anreisezeit und Gästeanzahl */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="anreise_zeit" className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Anreisezeit
                                </Label>
                                <select
                                    id="anreise_zeit"
                                    value={data.anreise_zeit}
                                    onChange={(e) => setData('anreise_zeit', e.target.value as 'morning' | 'afternoon')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="afternoon">Nachmittags (Standard)</option>
                                    <option value="morning">Vormittags</option>
                                </select>
                                {errors.anreise_zeit && <p className="mt-1 text-sm text-red-500">{errors.anreise_zeit}</p>}
                            </div>

                            <div>
                                <Label htmlFor="gast_anzahl" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
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
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
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
