import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users, Settings } from 'lucide-react';

interface UserCategory {
    id: number;
    name: string;
    color: string;
    description?: string;
    created_at: string;
    creator: {
        id: number;
        name: string;
    };
    users: Array<{
        id: number;
        name: string;
    }>;
    users_count: number;
}

interface Props {
    categories: UserCategory[];
}

export default function AdminSettings({ categories }: Props) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        color: '#3B82F6',
        description: '',
    });

    const resetForm = () => {
        setFormData({
            name: '',
            color: '#3B82F6',
            description: '',
        });
    };

    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/categories', formData, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                resetForm();
            },
        });
    };

    const handleDeleteCategory = (category: UserCategory) => {
        if (confirm(`Möchten Sie die Kategorie "${category.name}" wirklich löschen?`)) {
            router.delete(`/admin/categories/${category.id}`);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Heading>Admin-Einstellungen</Heading>
                        <p className="text-white/70 mt-2">Verwalten Sie System-Einstellungen und Kategorien</p>
                    </div>
                </div>

                {/* Kategorien Sektion */}
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-white">Benutzer-Kategorien</CardTitle>
                                <CardDescription className="text-white/70">
                                    Verwalten Sie Kategorien für Benutzer und deren Farben
                                </CardDescription>
                            </div>
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Neue Kategorie
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white/10 backdrop-blur-sm border-white/20">
                                    <DialogHeader>
                                        <DialogTitle className="text-white">Neue Kategorie erstellen</DialogTitle>
                                        <DialogDescription className="text-white/70">
                                            Erstellen Sie eine neue Benutzer-Kategorie
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateCategory} className="space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                                                Name *
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                placeholder="Kategorie-Name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="color" className="block text-sm font-medium text-white mb-2">
                                                Farbe *
                                            </label>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    id="color"
                                                    type="color"
                                                    value={formData.color}
                                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                    className="w-12 h-10 border border-white/20 rounded-md cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.color}
                                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                    placeholder="#3B82F6"
                                                    pattern="^#[0-9A-Fa-f]{6}$"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                                                Beschreibung
                                            </label>
                                            <textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                                                placeholder="Optionale Beschreibung"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsCreateDialogOpen(false)}
                                                className="border-white/20 text-white hover:bg-white/10"
                                            >
                                                Abbrechen
                                            </Button>
                                            <Button type="submit" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                                                Erstellen
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {categories.map((category) => (
                                <Card key={category.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-4 h-4 rounded-full border border-white/20"
                                                    style={{ backgroundColor: category.color }}
                                                />
                                                <CardTitle className="text-white text-sm">{category.name}</CardTitle>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => router.get(`/admin/categories/${category.id}/edit`)}
                                                    className="text-white/70 hover:text-white hover:bg-white/10"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteCategory(category)}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        {category.description && (
                                            <CardDescription className="text-white/70 text-xs">
                                                {category.description}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center space-x-2 text-white/70">
                                                <Users className="h-3 w-3" />
                                                <span>{category.users_count} Benutzer</span>
                                            </div>
                                            <Badge
                                                className="text-xs"
                                                style={{
                                                    backgroundColor: category.color,
                                                    color: category.text_color || '#ffffff',
                                                }}
                                            >
                                                {category.color}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {categories.length === 0 && (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 text-white/50 mx-auto mb-4" />
                                <p className="text-white/70">Keine Kategorien vorhanden</p>
                                <p className="text-white/50 text-sm mt-1">Erstellen Sie Ihre erste Kategorie</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Weitere Admin-Einstellungen können hier hinzugefügt werden */}
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                        <CardTitle className="text-white">System-Einstellungen</CardTitle>
                        <CardDescription className="text-white/70">
                            Weitere Admin-Funktionen werden hier verfügbar sein
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <Settings className="h-12 w-12 text-white/50 mx-auto mb-4" />
                            <p className="text-white/70">Weitere Einstellungen</p>
                            <p className="text-white/50 text-sm mt-1">Hier können weitere Admin-Funktionen hinzugefügt werden</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
