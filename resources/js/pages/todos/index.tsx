import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import  Heading  from '@/components/heading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Circle, Plus, MessageSquare, Calendar, User, Clock, Trash2, Edit, Eye } from 'lucide-react';
import { formatGermanDate, formatGermanDateTime } from '@/lib/utils';

interface TodoComment {
    id: number;
    kommentar: string;
    created_at: string;
    parent_id?: number;
    user: {
        id: number;
        name: string;
    };
    replies?: TodoComment[];
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

interface TodoStatistics {
    total: number;
    offen: number;
    erledigt: number;
    ueberfaellig: number;
}

interface Props {
    todos: Todo[];
    statistics: TodoStatistics;
}

export default function TodosIndex({ todos, statistics }: Props) {
    const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
    const [selectedComment, setSelectedComment] = useState<TodoComment | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
    const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        titel: '',
        beschreibung: '',
        prioritaet: '2',
        faelligkeitsdatum: '',
    });
    const [commentText, setCommentText] = useState('');
    const [replyText, setReplyText] = useState('');

    const resetForm = () => {
        setFormData({
            titel: '',
            beschreibung: '',
            prioritaet: '2',
            faelligkeitsdatum: '',
        });
    };

    const handleCreateTodo = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/todos', formData, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                resetForm();
            },
        });
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTodo) return;
        
        router.post(`/todos/${selectedTodo.id}/comments`, {
            kommentar: commentText,
        }, {
            onSuccess: () => {
                setIsCommentDialogOpen(false);
                setCommentText('');
                setSelectedTodo(null);
            },
        });
    };

    const handleAddReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedComment) return;
        
        router.post(`/comments/${selectedComment.id}/reply`, {
            kommentar: replyText,
        }, {
            onSuccess: () => {
                setIsReplyDialogOpen(false);
                setReplyText('');
                setSelectedComment(null);
            },
        });
    };

    const handleCompleteTodo = (todo: Todo) => {
        router.patch(`/todos/${todo.id}/complete`);
    };

    const handleReopenTodo = (todo: Todo) => {
        router.patch(`/todos/${todo.id}/reopen`);
    };

    const handleDeleteTodo = (todo: Todo) => {
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
                <Heading
                    title="To-Do Liste"
                    description="Verwalten Sie Ihre Aufgaben und Projekte"
                />

                {/* Statistiken */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-sm font-medium">Gesamt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-white text-2xl font-bold">{statistics.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-sm font-medium">Offen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-white text-2xl font-bold">{statistics.offen}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-sm font-medium">Erledigt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-white text-2xl font-bold">{statistics.erledigt}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-sm font-medium">Überfällig</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-white text-2xl font-bold">{statistics.ueberfaellig}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* To-Do Liste Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Aufgaben</h2>
                        <p className="text-white/70">Alle Ihre To-Dos auf einen Blick</p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                                <Plus className="h-4 w-4 mr-2" />
                                Neues To-Do
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white/10 backdrop-blur-sm border-white/20">
                            <DialogHeader>
                                <DialogTitle className="text-white">Neues To-Do erstellen</DialogTitle>
                                <DialogDescription className="text-white/70">
                                    Erstellen Sie eine neue Aufgabe
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateTodo} className="space-y-4">
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
                                        rows={3}
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

                {/* To-Do Liste */}
                <div className="space-y-4">
                    {todos.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 text-white/50 mx-auto mb-4" />
                            <p className="text-white/70">Keine To-Dos vorhanden</p>
                        </div>
                    ) : (
                        todos.map((todo) => (
                                    <div
                                        key={todo.id}
                                        className={`p-4 rounded-lg border backdrop-blur-md ${
                                            todo.status === 'erledigt'
                                                ? 'bg-white/20 border-white/30'
                                                : todo.is_overdue
                                                ? 'bg-red-500/20 border-red-500/40'
                                                : 'bg-white/20 border-white/30'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3 flex-1">
                                                <button
                                                    onClick={() => todo.status === 'offen' ? handleCompleteTodo(todo) : handleReopenTodo(todo)}
                                                    className="mt-1"
                                                >
                                                    {todo.status === 'offen' ? (
                                                        <Circle className="h-5 w-5 text-white/70 hover:text-white" />
                                                    ) : (
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                    )}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className={`font-medium ${todo.status === 'erledigt' ? 'text-white/50 line-through' : 'text-white'}`}>
                                                            {todo.titel}
                                                        </h3>
                                                        <Badge className={getPrioritaetColor(todo.prioritaet)}>
                                                            {getPrioritaetName(todo.prioritaet)}
                                                        </Badge>
                                                        {todo.is_overdue && (
                                                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                                                                Überfällig
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {todo.beschreibung && (
                                                        <p className={`text-sm mb-2 ${todo.status === 'erledigt' ? 'text-white/50' : 'text-white/70'}`}>
                                                            {todo.beschreibung}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center space-x-4 text-xs text-white/50">
                                                        <div className="flex items-center space-x-1">
                                                            <User className="h-3 w-3" />
                                                            <span>Erstellt von {todo.creator.name}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{formatGermanDateTime(todo.created_at)}</span>
                                                        </div>
                                                        {todo.faelligkeitsdatum && (
                                                            <div className="flex items-center space-x-1">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>Fällig: {formatGermanDate(todo.faelligkeitsdatum)}</span>
                                                            </div>
                                                        )}
                                                        {todo.completed_by && (
                                                            <div className="flex items-center space-x-1">
                                                                <User className="h-3 w-3" />
                                                                <span>Erledigt von {todo.completed_by.name}</span>
                                                            </div>
                                                        )}
                                                        {todo.comments.length > 0 && (
                                                            <div className="flex items-center space-x-1">
                                                                <MessageSquare className="h-3 w-3" />
                                                                <span>{todo.comments.length} Kommentar{todo.comments.length !== 1 ? 'e' : ''}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Kommentare anzeigen */}
                                                    {todo.comments.length > 0 && (
                                                        <div className="mt-3 space-y-2">
                                                            <div className="text-xs font-medium text-white/70">Kommentare:</div>
                                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                                {todo.comments.slice(0, 3).map((comment) => (
                                                                    <div key={comment.id} className="space-y-2">
                                                                        {/* Hauptkommentar */}
                                                                        <div className="p-2 bg-white/5 rounded border border-white/10">
                                                                            <p className="text-xs text-white/80">{comment.kommentar}</p>
                                                                            <div className="flex items-center justify-between mt-1">
                                                                                <div className="flex items-center space-x-2 text-xs text-white/50">
                                                                                    <User className="h-3 w-3" />
                                                                                    <span>{comment.user.name}</span>
                                                                                    <span>•</span>
                                                                                    <span>{formatGermanDateTime(comment.created_at)}</span>
                                                                                </div>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    onClick={() => {
                                                                                        setSelectedComment(comment);
                                                                                        setIsReplyDialogOpen(true);
                                                                                    }}
                                                                                    className="text-xs text-white/50 hover:text-white hover:bg-white/10"
                                                                                >
                                                                                    Antworten
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {/* Unterkommentare */}
                                                                        {comment.replies && comment.replies.length > 0 && (
                                                                            <div className="ml-4 space-y-1">
                                                                                {comment.replies.map((reply) => (
                                                                                    <div key={reply.id} className="p-2 bg-white/3 rounded border border-white/5">
                                                                                        <p className="text-xs text-white/70">{reply.kommentar}</p>
                                                                                        <div className="flex items-center space-x-2 mt-1 text-xs text-white/40">
                                                                                            <User className="h-3 w-3" />
                                                                                            <span>{reply.user.name}</span>
                                                                                            <span>•</span>
                                                                                            <span>{formatGermanDateTime(reply.created_at)}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                {todo.comments.length > 3 && (
                                                                    <div className="text-xs text-white/50 text-center">
                                                                        +{todo.comments.length - 3} weitere Kommentare
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setSelectedTodo(todo);
                                                        setIsCommentDialogOpen(true);
                                                    }}
                                                    className="text-white/70 hover:text-white hover:bg-white/10"
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => router.get(`/todos/${todo.id}/edit`)}
                                                    className="text-white/70 hover:text-white hover:bg-white/10"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteTodo(todo)}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                {/* Kommentar Dialog */}
                <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
                    <DialogContent className="bg-white/10 backdrop-blur-sm border-white/20">
                        <DialogHeader>
                            <DialogTitle className="text-white">Kommentar hinzufügen</DialogTitle>
                            <DialogDescription className="text-white/70">
                                Fügen Sie einen Kommentar zu "{selectedTodo?.titel}" hinzu
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddComment} className="space-y-4">
                            <div>
                                <Label htmlFor="kommentar" className="text-white">Kommentar</Label>
                                <Textarea
                                    id="kommentar"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                    placeholder="Ihr Kommentar..."
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCommentDialogOpen(false)}
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    Abbrechen
                                </Button>
                                <Button type="submit" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                                    Kommentar hinzufügen
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Reply Dialog */}
                <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
                    <DialogContent className="bg-white/10 backdrop-blur-sm border-white/20">
                        <DialogHeader>
                            <DialogTitle className="text-white">Antwort hinzufügen</DialogTitle>
                            <DialogDescription className="text-white/70">
                                Antworten Sie auf den Kommentar von {selectedComment?.user.name}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddReply} className="space-y-4">
                            <div>
                                <Label htmlFor="reply" className="text-white">Antwort</Label>
                                <Textarea
                                    id="reply"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                    placeholder="Ihre Antwort..."
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsReplyDialogOpen(false)}
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    Abbrechen
                                </Button>
                                <Button type="submit" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                                    Antwort hinzufügen
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
