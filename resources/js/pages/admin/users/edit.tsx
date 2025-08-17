import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Lock, Mail, PencilLine, Shield, Tag } from 'lucide-react';

interface UserCategory {
    id: number;
    name: string;
    color: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    is_active: boolean;
    created_at: string;
    category?: UserCategory;
}

interface Props {
    user: User;
    categories: UserCategory[];
}

export default function AdminUsersEdit({ user, categories }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        category_id: user.category?.id?.toString() || '',
    });

    const {
        data: passwordData,
        setData: setPasswordData,
        patch: patchPassword,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPassword,
    } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patchPassword(`/admin/users/${user.id}/password`, {
            onSuccess: () => {
                resetPassword();
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Benutzer bearbeiten: ${user.name}`} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/users">
                        <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/20">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Zurück zur Übersicht
                        </Button>
                    </Link>
                    <div>
                        <h1 className="glass-heading text-3xl font-bold tracking-tight">Benutzer bearbeiten</h1>
                        <p className="glass-text">Bearbeiten Sie die Daten von {user.name}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* User Data Form */}
                    <Card className="glass-card">
                        <CardHeader className="glass-card-header">
                            <CardTitle className="glass-card-title flex items-center gap-2">
                                <PencilLine className="h-5 w-5 text-white/70" />
                                Benutzerdaten
                            </CardTitle>
                            <CardDescription className="glass-card-description">Bearbeiten Sie die grundlegenden Informationen des Benutzers</CardDescription>
                        </CardHeader>
                        <CardContent className="glass-card-content">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        E-Mail-Adresse
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                </div>

                                {/* Role */}
                                <div>
                                    <Label htmlFor="role" className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        Rolle
                                    </Label>
                                    <select
                                        id="role"
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value as 'user' | 'admin')}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="user">Benutzer</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                    {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
                                </div>

                                {/* Category */}
                                <div>
                                    <Label htmlFor="category_id" className="flex items-center gap-2">
                                        <Tag className="h-4 w-4" />
                                        Kategorie (optional)
                                    </Label>
                                    <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Kategorie auswählen..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Keine Kategorie</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: category.color }}
                                                        />
                                                        {category.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>}
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="is_active"
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <Label htmlFor="is_active">Benutzer ist aktiv</Label>
                                </div>

                                {/* Submit */}
                                <Button type="submit" disabled={processing} className="w-full">
                                    {processing ? 'Wird aktualisiert...' : 'Daten aktualisieren'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Password Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Passwort ändern
                            </CardTitle>
                            <CardDescription>Setzen Sie ein neues Passwort für diesen Benutzer</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                {/* New Password */}
                                <div>
                                    <Label htmlFor="new_password" className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        Neues Passwort
                                    </Label>
                                    <Input
                                        id="new_password"
                                        type="password"
                                        value={passwordData.password}
                                        onChange={(e) => setPasswordData('password', e.target.value)}
                                        placeholder="Neues Passwort"
                                        className={passwordErrors.password ? 'border-red-500' : ''}
                                    />
                                    {passwordErrors.password && <p className="mt-1 text-sm text-red-500">{passwordErrors.password}</p>}
                                </div>

                                {/* Password Confirmation */}
                                <div>
                                    <Label htmlFor="password_confirmation">Passwort bestätigen</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={passwordData.password_confirmation}
                                        onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                        placeholder="Passwort wiederholen"
                                        className={passwordErrors.password_confirmation ? 'border-red-500' : ''}
                                    />
                                    {passwordErrors.password_confirmation && (
                                        <p className="mt-1 text-sm text-red-500">{passwordErrors.password_confirmation}</p>
                                    )}
                                </div>

                                {/* Submit */}
                                <Button type="submit" disabled={passwordProcessing} className="w-full">
                                    {passwordProcessing ? 'Wird geändert...' : 'Passwort ändern'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* User Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Benutzerinformationen
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <div>
                                <span className="font-medium">Benutzer-ID:</span> {user.id}
                            </div>
                            <div>
                                <span className="font-medium">Erstellt am:</span> {new Date(user.created_at).toLocaleDateString('de-DE')}
                            </div>
                            <div>
                                <span className="font-medium">Aktueller Status:</span> {user.is_active ? 'Aktiv' : 'Inaktiv'}
                            </div>
                            <div>
                                <span className="font-medium">Aktuelle Rolle:</span> {user.role === 'admin' ? 'Administrator' : 'Benutzer'}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
