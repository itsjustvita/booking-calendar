import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Edit, Eye, Plus, Search, Trash2, UserCheck, Users, UserX } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    is_active: boolean;
    created_at: string;
    bookings_count: number;
}

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function AdminUsersIndex({ users }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const { delete: deleteUser, patch } = useForm();

    const filteredUsers = users.data.filter(
        (user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleToggleActive = (userId: number) => {
        patch(`/admin/users/${userId}/toggle-active`);
    };

    const handleDeleteUser = (userId: number) => {
        if (confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?')) {
            deleteUser(`/admin/users/${userId}`);
        }
    };

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
                <UserCheck className="mr-1 h-3 w-3" />
                Aktiv
            </Badge>
        ) : (
            <Badge variant="outline" className="text-gray-500">
                <UserX className="mr-1 h-3 w-3" />
                Inaktiv
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title="Benutzerverwaltung" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Benutzerverwaltung</h1>
                        <p className="text-muted-foreground">Verwalten Sie alle Benutzer und deren Berechtigungen</p>
                    </div>
                    <Link href="/admin/users/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Neuen Benutzer erstellen
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Benutzer suchen
                        </CardTitle>
                        <CardDescription>Suchen Sie nach Namen oder E-Mail-Adresse</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Input
                            placeholder="Name oder E-Mail eingeben..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-md"
                        />
                    </CardContent>
                </Card>

                {/* Users List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Benutzer ({filteredUsers.length} von {users.total})
                        </CardTitle>
                        <CardDescription>Alle registrierten Benutzer des Systems</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <h3 className="font-semibold">{user.name}</h3>
                                                {getRoleBadge(user.role)}
                                                {getStatusBadge(user.is_active)}
                                            </div>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                                <span>Erstellt: {new Date(user.created_at).toLocaleDateString('de-DE')}</span>
                                                <span>
                                                    {user.bookings_count} Buchung{user.bookings_count !== 1 ? 'en' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/admin/users/${user.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/admin/users/${user.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleToggleActive(user.id)}
                                            className={
                                                user.is_active ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'
                                            }
                                        >
                                            {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
