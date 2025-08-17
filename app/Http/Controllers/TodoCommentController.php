<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTodoCommentRequest;
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
