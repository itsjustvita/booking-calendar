import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, Mail, User, Users } from 'lucide-react';

interface Booking {
    id: number;
    titel: string;
    start_datum: string;
    end_datum: string;
    status: string;
    status_name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    is_active: boolean;
    created_at: string;
    bookings: Booking[];
}

interface Props {
    user: User;
}

export default function AdminUsersShow({ user }: Props) {
    const getRoleBadge = (role: string) => {
        return role === 'admin' ? (
            <Badge variant="default" className="border-purple-200 bg-purple-100 text-purple-800">
                Administrator
            </Badge>
        ) : (
            <Badge variant="outline">Benutzer</Badge>
        );
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="default" className="border-green-200 bg-green-100 text-green-800">
                Aktiv
            </Badge>
        ) : (
            <Badge variant="outline" className="text-gray-500">
                Inaktiv
            </Badge>
        );
    };

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/users">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zur Übersicht
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                    <p className="text-muted-foreground">Benutzerdetails und Buchungshistorie</p>
                </div>
                <Link href={`/admin/users/${user.id}/edit`}>
                    <Button className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Bearbeiten
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* User Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Benutzerinformationen
                        </CardTitle>
                        <CardDescription>Grundlegende Informationen über den Benutzer</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Name:</span>
                            <span>{user.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span className="font-medium">E-Mail:</span>
                            <span>{user.email}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="font-medium">Rolle:</span>
                            {getRoleBadge(user.role)}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="font-medium">Status:</span>
                            {getStatusBadge(user.is_active)}
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Erstellt am:</span>
                            <span>{formatDate(user.created_at)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Statistiken
                        </CardTitle>
                        <CardDescription>Übersicht über die Benutzeraktivität</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg bg-blue-50 p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">{user.bookings.length}</div>
                                <div className="text-sm text-blue-600">Buchungen</div>
                            </div>
                            <div className="rounded-lg bg-green-50 p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {user.bookings.filter((b) => b.status === 'confirmed').length}
                                </div>
                                <div className="text-sm text-green-600">Bestätigt</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bookings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Buchungshistorie ({user.bookings.length})
                    </CardTitle>
                    <CardDescription>Alle Buchungen dieses Benutzers</CardDescription>
                </CardHeader>
                <CardContent>
                    {user.bookings.length > 0 ? (
                        <div className="space-y-4">
                            {user.bookings.map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{booking.titel}</h3>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(booking.start_datum)} - {formatDate(booking.end_datum)}
                                        </p>
                                    </div>
                                    <Badge variant="outline">{booking.status_name}</Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-gray-500">
                            <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                            <p>Keine Buchungen vorhanden</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
