import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, MapPin, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface WeatherLocation {
    city: string;
    country: string;
    coordinates: {
        lat: number;
        lon: number;
    };
}

interface AdminSettingsProps {
    weatherLocation: WeatherLocation;
    status?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings/profile',
    },
    {
        title: 'Admin-Einstellungen',
        href: '/settings/admin',
    },
];

export default function AdminSettings({ weatherLocation, status }: AdminSettingsProps) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        city: weatherLocation.city,
        country: weatherLocation.country,
        lat: weatherLocation.coordinates.lat,
        lon: weatherLocation.coordinates.lon,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('admin.weather-location.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin-Einstellungen" />

            <SettingsLayout>
                <div className="space-y-8">
                    <HeadingSmall 
                        title="Admin-Einstellungen" 
                        description="Verwalte systemweite Einstellungen der Hüttenapp" 
                    />

                    {status && (
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="text-sm font-medium text-green-800">{status}</div>
                        </div>
                    )}

                    {/* Wetterstandort-Einstellungen */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">Wetterstandort</h3>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                            Konfiguriere den Standort für das Wetter-Widget im Dashboard.
                        </p>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="city">Stadt</Label>
                                    <Input
                                        id="city"
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="z.B. Doren"
                                        required
                                    />
                                    <InputError message={errors.city} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">Land</Label>
                                    <Input
                                        id="country"
                                        type="text"
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        placeholder="z.B. Österreich"
                                        required
                                    />
                                    <InputError message={errors.country} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="lat">Breitengrad</Label>
                                    <Input
                                        id="lat"
                                        type="number"
                                        step="0.0001"
                                        value={data.lat}
                                        onChange={(e) => setData('lat', parseFloat(e.target.value))}
                                        placeholder="z.B. 47.4500"
                                        required
                                    />
                                    <InputError message={errors.lat} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lon">Längengrad</Label>
                                    <Input
                                        id="lon"
                                        type="number"
                                        step="0.0001"
                                        value={data.lon}
                                        onChange={(e) => setData('lon', parseFloat(e.target.value))}
                                        placeholder="z.B. 9.8833"
                                        required
                                    />
                                    <InputError message={errors.lon} />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing} className="flex items-center gap-2">
                                    {processing ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Speichern
                                </Button>
                            </div>
                        </form>

                        <div className="rounded-md bg-blue-50 p-4">
                            <div className="text-sm text-blue-700">
                                <strong>Tipp:</strong> Du kannst Koordinaten auf{' '}
                                <a 
                                    href="https://www.latlong.net/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="underline hover:no-underline"
                                >
                                    latlong.net
                                </a>
                                {' '}oder Google Maps finden.
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
} 