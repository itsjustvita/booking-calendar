import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

interface Todo {
    id: number;
    titel: string;
    beschreibung?: string;
    prioritaet: number;
    faelligkeitsdatum?: string;
}

interface Props {
    todo: Todo;
}

export default function TodosEdit({ todo }: Props) {
    const [formData, setFormData] = useState({
        titel: '',
        beschreibung: '',
        prioritaet: '2',
        faelligkeitsdatum: '',
    });

    useEffect(() => {
        setFormData({
            titel: todo.titel,
            beschreibung: todo.beschreibung || '',
            prioritaet: todo.prioritaet.toString(),
            faelligkeitsdatum: todo.faelligkeitsdatum || '',
        });
    }, [todo]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(`/todos/${todo.id}`, formData);
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.get('/todos')}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Zurück
                    </Button>
                    <Heading
                        title="To-Do bearbeiten"
                        description="Bearbeiten Sie die Details der Aufgabe"
                    />
                </div>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                        <CardTitle className="text-white">To-Do Details</CardTitle>
                        <CardDescription className="text-white/70">
                            Bearbeiten Sie die Felder und speichern Sie die Änderungen
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="titel" className="text-white">Titel *</Label>
                                <Input
                                    id="titel"
                                    value={formData.titel}
                                    onChange={(e) => setFormData({ ...formData, titel: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                    placeholder="Titel der Aufgabe"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="beschreibung" className="text-white">Beschreibung</Label>
                                <Textarea
                                    id="beschreibung"
                                    value={formData.beschreibung}
                                    onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                    placeholder="Optionale Beschreibung"
                                    rows={4}
                                />
                            </div>
                            <div>
                                <Label htmlFor="prioritaet" className="text-white">Priorität *</Label>
                                <Select value={formData.prioritaet} onValueChange={(value) => setFormData({ ...formData, prioritaet: value })}>
                                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/10 border-white/20">
                                        <SelectItem value="1">Niedrig</SelectItem>
                                        <SelectItem value="2">Mittel</SelectItem>
                                        <SelectItem value="3">Hoch</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="faelligkeitsdatum" className="text-white">Fälligkeitsdatum</Label>
                                <Input
                                    id="faelligkeitsdatum"
                                    type="date"
                                    value={formData.faelligkeitsdatum}
                                    onChange={(e) => setFormData({ ...formData, faelligkeitsdatum: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white"
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.get('/todos')}
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    Abbrechen
                                </Button>
                                <Button type="submit" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                                    Änderungen speichern
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
