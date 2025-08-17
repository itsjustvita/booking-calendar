import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, MessageSquare, User, Calendar, Clock, CheckCircle, Circle } from 'lucide-react';
import { formatGermanDate, formatGermanDateTime } from '@/lib/utils';

interface TodoComment {
    id: number;
    kommentar: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
}

interface Todo {
    id: number;
    titel: string;
    beschreibung?: string;
    status: 'offen' | 'erledigt';
    prioritaet: 1 | 2 | 3;
    faelligkeitsdatum?: string;
    created_at: string;
    completed_at?: string;
    is_overdue: boolean;
    creator: {
        id: number;
        name: string;
    };
    completed_by?: {
        id: number;
        name: string;
    };
    comments: TodoComment[];
}

interface Props {
    todo: Todo;
}

export default function TodosShow({ todo }: Props) {
    const [commentText, setCommentText] = useState('');

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/todos/${todo.id}/comments`, {
            kommentar: commentText,
        }, {
            onSuccess: () => {
                setCommentText('');
            },
        });
    };

    const handleCompleteTodo = () => {
        router.patch(`/todos/${todo.id}/complete`);
    };

    const handleReopenTodo = () => {
        router.patch(`/todos/${todo.id}/reopen`);
    };

    const handleDeleteTodo = () => {
        if (confirm('Möchten Sie dieses To-Do wirklich löschen?')) {
            router.delete(`/todos/${todo.id}`);
        }
    };

    const getPrioritaetColor = (prioritaet: number) => {
        switch (prioritaet) {
            case 1: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 2: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 3: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getPrioritaetName = (prioritaet: number) => {
        switch (prioritaet) {
            case 1: return 'Niedrig';
            case 2: return 'Mittel';
            case 3: return 'Hoch';
            default: return 'Unbekannt';
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
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
                            title={todo.titel}
                            description="Details der Aufgabe"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={() => todo.status === 'offen' ? handleCompleteTodo() : handleReopenTodo()}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                        >
                            {todo.status === 'offen' ? (
                                <>
                                    <Circle className="h-4 w-4 mr-2" />
                                    Als erledigt markieren
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Wieder öffnen
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={() => router.get(`/todos/${todo.id}/edit`)}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Bearbeiten
                        </Button>
                        <Button
                            onClick={handleDeleteTodo}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/20"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Löschen
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* To-Do Details */}
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                        <CardHeader>
                            <CardTitle className="text-white">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className={`text-lg font-medium ${todo.status === 'erledigt' ? 'text-white/50 line-through' : 'text-white'}`}>
                                    {todo.titel}
                                </h3>
                                {todo.beschreibung && (
                                    <p className={`mt-2 ${todo.status === 'erledigt' ? 'text-white/50' : 'text-white/70'}`}>
                                        {todo.beschreibung}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Badge className={getPrioritaetColor(todo.prioritaet)}>
                                    {getPrioritaetName(todo.prioritaet)}
                                </Badge>
                                <Badge className={todo.status === 'offen' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}>
                                    {todo.status === 'offen' ? 'Offen' : 'Erledigt'}
                                </Badge>
                                {todo.is_overdue && (
                                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                                        Überfällig
                                    </Badge>
                                )}
                            </div>

                            <Separator className="bg-white/20" />

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center space-x-2 text-white/70">
                                    <User className="h-4 w-4" />
                                    <span>Erstellt von: {todo.creator.name}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-white/70">
                                    <Clock className="h-4 w-4" />
                                    <span>Erstellt am: {formatGermanDateTime(todo.created_at)}</span>
                                </div>
                                {todo.faelligkeitsdatum && (
                                    <div className="flex items-center space-x-2 text-white/70">
                                        <Calendar className="h-4 w-4" />
                                        <span>Fällig am: {formatGermanDate(todo.faelligkeitsdatum)}</span>
                                    </div>
                                )}
                                {todo.completed_by && (
                                    <div className="flex items-center space-x-2 text-white/70">
                                        <User className="h-4 w-4" />
                                        <span>Erledigt von: {todo.completed_by.name}</span>
                                    </div>
                                )}
                                {todo.completed_at && (
                                    <div className="flex items-center space-x-2 text-white/70">
                                        <Clock className="h-4 w-4" />
                                        <span>Erledigt am: {formatGermanDateTime(todo.completed_at)}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Kommentare */}
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                        <CardHeader>
                            <CardTitle className="text-white">Kommentare</CardTitle>
                            <CardDescription className="text-white/70">
                                {todo.comments.length} Kommentar{todo.comments.length !== 1 ? 'e' : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Neuer Kommentar */}
                            <form onSubmit={handleAddComment} className="space-y-2">
                                <Label htmlFor="kommentar" className="text-white">Neuer Kommentar</Label>
                                <Textarea
                                    id="kommentar"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                    placeholder="Ihr Kommentar..."
                                    rows={3}
                                    required
                                />
                                <Button type="submit" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Kommentar hinzufügen
                                </Button>
                            </form>

                            <Separator className="bg-white/20" />

                            {/* Kommentare Liste */}
                            <div className="space-y-3">
                                {todo.comments.length === 0 ? (
                                    <p className="text-white/50 text-center py-4">Keine Kommentare vorhanden</p>
                                ) : (
                                    todo.comments.map((comment) => (
                                        <div key={comment.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-white">{comment.kommentar}</p>
                                                    <div className="flex items-center space-x-2 mt-2 text-xs text-white/50">
                                                        <User className="h-3 w-3" />
                                                        <span>{comment.user.name}</span>
                                                        <span>•</span>
                                                        <span>{formatGermanDateTime(comment.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
