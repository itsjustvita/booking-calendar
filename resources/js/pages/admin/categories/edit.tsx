import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface UserCategory {
    id: number;
    name: string;
    color: string;
    description?: string;
}

interface Props {
    category: UserCategory;
}

export default function CategoryEdit({ category }: Props) {
    const [formData, setFormData] = useState({
        name: category.name,
        color: category.color,
        description: category.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(`/admin/categories/${category.id}`, formData);
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.get('/admin/settings')}
                        className="border-white/30 text-white hover:bg-white/20"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zu Einstellungen
                    </Button>
                    <div>
                        <Heading>Kategorie bearbeiten</Heading>
                        <p className="text-white/70 mt-2">Bearbeiten Sie die Kategorie "{category.name}"</p>
                    </div>
                </div>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-2xl">
                    <CardHeader>
                        <CardTitle className="text-white">Kategorie-Daten</CardTitle>
                        <CardDescription className="text-white/70">
                            Bearbeiten Sie die Kategorie-Informationen
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                    onClick={() => router.get('/admin/settings')}
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    Abbrechen
                                </Button>
                                <Button type="submit" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                                    Aktualisieren
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
