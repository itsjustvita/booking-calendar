<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTodoCommentRequest;
use App\Http\Requests\StoreTodoReplyRequest;
use App\Http\Requests\UpdateTodoCommentRequest;
use App\Models\Todo;
use App\Models\TodoComment;

class TodoCommentController extends Controller
{
    /**
     * Store a newly created comment.
     */
    public function store(StoreTodoCommentRequest $request, Todo $todo)
    {
        $todo->comments()->create([
            'user_id' => auth()->id(),
            'kommentar' => $request->kommentar,
        ]);

        return redirect()->back()
            ->with('success', 'Kommentar erfolgreich hinzugefügt.');
    }

    /**
     * Store a reply to a comment.
     */
    public function reply(StoreTodoReplyRequest $request, TodoComment $comment)
    {
        // Prüfe, ob der Kommentar bereits eine Antwort hat (nur 2 Ebenen erlaubt)
        if ($comment->parent_id !== null) {
            abort(400, 'Unterkommentare können keine Antworten haben.');
        }

        $comment->replies()->create([
            'todo_id' => $comment->todo_id,
            'user_id' => auth()->id(),
            'kommentar' => $request->kommentar,
        ]);

        return redirect()->back()
            ->with('success', 'Antwort erfolgreich hinzugefügt.');
    }

    /**
     * Update the specified comment.
     */
    public function update(UpdateTodoCommentRequest $request, TodoComment $comment)
    {
        // Nur der Ersteller kann Kommentare bearbeiten
        if ($comment->user_id !== auth()->id()) {
            abort(403, 'Sie können nur Ihre eigenen Kommentare bearbeiten.');
        }

        // Nur Hauptkommentare können bearbeitet werden
        if ($comment->parent_id !== null) {
            abort(400, 'Unterkommentare können nicht bearbeitet werden.');
        }

        $comment->update([
            'kommentar' => $request->kommentar,
            'edited_at' => now(),
            'edited_by' => auth()->id(),
        ]);

        return redirect()->back()
            ->with('success', 'Kommentar erfolgreich bearbeitet.');
    }

    /**
     * Remove the specified comment.
     */
    public function destroy(TodoComment $comment)
    {
        // Nur der Ersteller oder ein Admin kann Kommentare löschen
        if ($comment->user_id !== auth()->id() && ! auth()->user()->isAdmin()) {
            abort(403);
        }

        $comment->delete();

        return redirect()->back()
            ->with('success', 'Kommentar erfolgreich gelöscht.');
    }
}
