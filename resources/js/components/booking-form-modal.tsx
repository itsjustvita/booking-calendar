import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { CalendarDays, Clock, FileText } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface BookingFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate?: string;
    initialTime?: 'morning' | 'afternoon';
}

export default function BookingFormModal({ isOpen, onClose, initialDate = '', initialTime = 'afternoon' }: BookingFormModalProps) {
    const [formData, setFormData] = useState({
        titel: '',
        beschreibung: '',
        start_datum: initialDate,
        end_datum: '',
        anreise_zeit: initialTime,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setErrors({});

        console.log('Submitting booking form with data:', formData); // Debug

        try {
            await router.post('/bookings', formData, {
                onSuccess: () => {
                    console.log('Booking created successfully'); // Debug
                    resetForm();
                    onClose();
                },
                onError: (errors) => {
                    console.log('Booking creation failed:', errors); // Debug
                    setErrors(errors);
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setFormData({
            titel: '',
            beschreibung: '',
            start_datum: initialDate,
            end_datum: initialDate, // Setze Abreisedatum gleich Anreisedatum
            anreise_zeit: initialTime,
        });
        setErrors({});
        setIsProcessing(false);
    };

    // Update form data when modal opens with initial values
    useEffect(() => {
        if (isOpen && initialDate) {
            console.log('Setting initial date:', initialDate, 'time:', initialTime); // Debug
            setFormData({
                titel: '',
                beschreibung: '',
                start_datum: initialDate,
                end_datum: initialDate, // Setze Abreisedatum gleich Anreisedatum
                anreise_zeit: initialTime,
            });
        }
    }, [isOpen, initialDate, initialTime]);

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

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
                                value={formData.titel}
                                onChange={(e) => handleInputChange('titel', e.target.value)}
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
                                value={formData.beschreibung}
                                onChange={(e) => handleInputChange('beschreibung', e.target.value)}
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
                                    value={formData.start_datum}
                                    onChange={(e) => handleInputChange('start_datum', e.target.value)}
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
                                    value={formData.end_datum}
                                    onChange={(e) => handleInputChange('end_datum', e.target.value)}
                                    className={cn(errors.end_datum ? 'border-red-500' : '')}
                                />
                                {errors.end_datum && <p className="mt-1 text-sm text-red-500">{errors.end_datum}</p>}
                            </div>
                        </div>

                        {/* Anreisezeit */}
                        <div>
                            <Label htmlFor="anreise_zeit" className="mb-1 flex items-center gap-2 text-white">
                                <Clock className="h-4 w-4 text-white/70" />
                                Anreisezeit
                            </Label>
                            <select
                                id="anreise_zeit"
                                value={formData.anreise_zeit}
                                onChange={(e) => handleInputChange('anreise_zeit', e.target.value as 'morning' | 'afternoon')}
                                className="flex h-10 w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="afternoon">Nachmittags (Standard)</option>
                                <option value="morning">Vormittags</option>
                            </select>
                            {errors.anreise_zeit && <p className="mt-1 text-sm text-red-500">{errors.anreise_zeit}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isProcessing}
                            className="border-white/30 text-white hover:bg-white/10"
                        >
                            Abbrechen
                        </Button>
                        <Button type="submit" disabled={isProcessing} className="min-w-[120px]">
                            {isProcessing ? 'Wird erstellt...' : 'Buchung erstellen'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}