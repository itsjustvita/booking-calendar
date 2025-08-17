import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Lock, Mail, Shield, UserPlus, Tag } from 'lucide-react';

interface UserCategory {
    id: number;
    name: string;
    color: string;
}

interface Props {
    categories: UserCategory[];
}

export default function AdminUsersCreate({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        is_active: true,
        category_id: 'none',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submitData = {
            ...data,
            category_id: data.category_id === 'none' ? null : data.category_id,
        };
        post('/admin/users', { data: submitData });
    };

    return (
        <AppLayout>
            <Head title="Benutzer erstellen" />
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
                        <h1 className="glass-heading text-3xl font-bold tracking-tight">Neuen Benutzer erstellen</h1>
                        <p className="glass-text">Erstellen Sie einen neuen Benutzer für das System</p>
                    </div>
                </div>

                {/* Form */}
                <Card className="glass-card max-w-2xl">
                    <CardHeader className="glass-card-header">
                        <CardTitle className="glass-card-title flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-white/70" />
                            Benutzerdaten
                        </CardTitle>
                        <CardDescription className="glass-card-description">Füllen Sie alle erforderlichen Felder aus, um einen neuen Benutzer zu erstellen</CardDescription>
                    </CardHeader>
                    <CardContent className="glass-card-content">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <Label htmlFor="name" className="text-white">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Vollständiger Name"
                                    className={`border-white/30 bg-white/20 text-white placeholder:text-white/60 ${errors.name ? 'border-red-500' : ''}`}
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <Label htmlFor="email" className="flex items-center gap-2 text-white">
                                    <Mail className="h-4 w-4 text-white/70" />
                                    E-Mail-Adresse
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="benutzer@beispiel.de"
                                    className={`border-white/30 bg-white/20 text-white placeholder:text-white/60 ${errors.email ? 'border-red-500' : ''}`}
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <Label htmlFor="password" className="flex items-center gap-2 text-white">
                                    <Lock className="h-4 w-4 text-white/70" />
                                    Passwort
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Sicheres Passwort"
                                    className={`border-white/30 bg-white/20 text-white placeholder:text-white/60 ${errors.password ? 'border-red-500' : ''}`}
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                            </div>

                            {/* Password Confirmation */}
                            <div>
                                <Label htmlFor="password_confirmation" className="text-white">Passwort bestätigen</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Passwort wiederholen"
                                    className={`border-white/30 bg-white/20 text-white placeholder:text-white/60 ${errors.password_confirmation ? 'border-red-500' : ''}`}
                                />
                                {errors.password_confirmation && <p className="mt-1 text-sm text-red-400">{errors.password_confirmation}</p>}
                            </div>

                            {/* Role */}
                            <div>
                                <Label htmlFor="role" className="flex items-center gap-2 text-white">
                                    <Shield className="h-4 w-4 text-white/70" />
                                    Rolle
                                </Label>
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value as 'user' | 'admin')}
                                    className="flex h-10 w-full rounded-md border border-white/30 bg-white/20 px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="user">Benutzer</option>
                                    <option value="admin">Administrator</option>
                                </select>
                                {errors.role && <p className="mt-1 text-sm text-red-400">{errors.role}</p>}
                            </div>

                            {/* Category */}
                            <div>
                                <Label htmlFor="category_id" className="flex items-center gap-2 text-white">
                                    <Tag className="h-4 w-4 text-white/70" />
                                    Kategorie (optional)
                                </Label>
                                <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                    <SelectTrigger className="border-white/30 bg-white/20 text-white">
                                        <SelectValue placeholder="Kategorie auswählen..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 backdrop-blur-sm border-white/20">
                                        <SelectItem value="none">Keine Kategorie</SelectItem>
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
                                {errors.category_id && <p className="mt-1 text-sm text-red-400">{errors.category_id}</p>}
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center space-x-2">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-white/30 bg-white/20 text-white focus:ring-white/40"
                                />
                                <Label htmlFor="is_active" className="text-white">Benutzer ist aktiv</Label>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-4">
                                <Link href="/admin/users">
                                    <Button type="button" variant="outline" className="border-white/30 text-white hover:bg-white/20">
                                        Abbrechen
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing} className="glass-button flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30">
                                    <UserPlus className="h-4 w-4" />
                                    {processing ? 'Wird erstellt...' : 'Benutzer erstellen'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
