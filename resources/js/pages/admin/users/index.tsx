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
            <Badge variant="outline" className="border-purple-400/30 bg-purple-500/20 text-purple-300">
                Administrator
            </Badge>
        ) : (
            <Badge variant="outline" className="border-white/30 bg-white/20 text-white/80">
                Benutzer
            </Badge>
        );
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="outline" className="border-green-400/30 bg-green-500/20 text-green-300">
                <UserCheck className="mr-1 h-3 w-3" />
                Aktiv
            </Badge>
        ) : (
            <Badge variant="outline" className="border-white/30 bg-white/10 text-white/50">
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
                        <h1 className="glass-heading text-3xl font-bold tracking-tight">Benutzerverwaltung</h1>
                        <p className="glass-text">Verwalten Sie alle Benutzer und deren Berechtigungen</p>
                    </div>
                    <Link href="/admin/users/create">
                        <Button className="glass-button flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30">
                            <Plus className="h-4 w-4" />
                            Neuen Benutzer erstellen
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <Card className="glass-card">
                    <CardHeader className="glass-card-header">
                        <CardTitle className="glass-card-title flex items-center gap-2">
                            <Search className="h-5 w-5 text-white/70" />
                            Benutzer suchen
                        </CardTitle>
                        <CardDescription className="glass-card-description text-white">Suchen Sie nach Namen oder E-Mail-Adresse</CardDescription>
                    </CardHeader>
                    <CardContent className="glass-card-content">
                        <Input
                            placeholder="Name oder E-Mail eingeben..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-md border-white/30 bg-white/20 text-white placeholder:text-white/60"
                        />
                    </CardContent>
                </Card>

                {/* Users List */}
                <Card className="glass-card">
                    <CardHeader className="glass-card-header">
                        <CardTitle className="glass-card-title flex items-center gap-2">
                            <Users className="h-5 w-5 text-white/70" />
                            Benutzer ({filteredUsers.length} von {users.total})
                        </CardTitle>
                        <CardDescription className="glass-card-description text-white">Alle registrierten Benutzer des Systems</CardDescription>
                    </CardHeader>
                    <CardContent className="glass-card-content">
                        <div className="space-y-4">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <h3 className="font-semibold text-white">{user.name}</h3>
                                                {getRoleBadge(user.role)}
                                                {getStatusBadge(user.is_active)}
                                            </div>
                                            <p className="text-sm text-white/70">{user.email}</p>
                                            <div className="mt-2 flex items-center gap-4 text-xs text-white/50">
                                                <span>Erstellt: {new Date(user.created_at).toLocaleDateString('de-DE')}</span>
                                                <span>
                                                    {user.bookings_count} Buchung{user.bookings_count !== 1 ? 'en' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/admin/users/${user.id}`}>
                                            <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/20">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/admin/users/${user.id}/edit`}>
                                            <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/20">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleToggleActive(user.id)}
                                            className={
                                                user.is_active 
                                                    ? 'border-orange-400/30 text-orange-300 hover:bg-orange-500/20' 
                                                    : 'border-green-400/30 text-green-300 hover:bg-green-500/20'
                                            }
                                        >
                                            {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="border-red-400/30 text-red-300 hover:bg-red-500/20"
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
