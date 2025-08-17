<?php

use App\Models\Todo;
use App\Models\TodoComment;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->admin = User::factory()->create(['role' => 'admin']);
});

it('zeigt die To-Do Liste für authentifizierte Benutzer', function () {
    $response = $this->actingAs($this->user)->get('/todos');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('todos/index')
        ->has('todos')
        ->has('statistics')
    );
});

it('erstellt ein neues To-Do', function () {
    $todoData = [
        'titel' => 'Test To-Do',
        'beschreibung' => 'Test Beschreibung',
        'prioritaet' => 2,
        'faelligkeitsdatum' => now()->addDays(7)->format('Y-m-d'),
    ];

    $response = $this->actingAs($this->user)->post('/todos', $todoData);

    $response->assertRedirect('/todos');
    $this->assertDatabaseHas('todos', [
        'titel' => 'Test To-Do',
        'created_by' => $this->user->id,
    ]);
});

it('validiert erforderliche Felder beim Erstellen', function () {
    $response = $this->actingAs($this->user)->post('/todos', []);

    $response->assertSessionHasErrors(['titel', 'prioritaet']);
});

it('markiert ein To-Do als erledigt', function () {
    $todo = Todo::factory()->create([
        'created_by' => $this->user->id,
        'status' => 'offen',
    ]);

    $response = $this->actingAs($this->user)->patch("/todos/{$todo->id}/complete");

    $response->assertRedirect();
    $this->assertDatabaseHas('todos', [
        'id' => $todo->id,
        'status' => 'erledigt',
        'completed_by' => $this->user->id,
    ]);
});

it('markiert ein To-Do wieder als offen', function () {
    $todo = Todo::factory()->create([
        'created_by' => $this->user->id,
        'status' => 'erledigt',
        'completed_by' => $this->user->id,
        'completed_at' => now(),
    ]);

    $response = $this->actingAs($this->user)->patch("/todos/{$todo->id}/reopen");

    $response->assertRedirect();
    $this->assertDatabaseHas('todos', [
        'id' => $todo->id,
        'status' => 'offen',
        'completed_by' => null,
        'completed_at' => null,
    ]);
});

it('verhindert das Löschen von To-Dos durch normale User', function () {
    $todo = Todo::factory()->create([
        'created_by' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)->delete("/todos/{$todo->id}");

    $response->assertForbidden();
    $this->assertDatabaseHas('todos', ['id' => $todo->id]);
});

it('erlaubt Admins das Löschen von To-Dos', function () {
    $todo = Todo::factory()->create([
        'created_by' => $this->user->id,
    ]);

    $response = $this->actingAs($this->admin)->delete("/todos/{$todo->id}");

    $response->assertRedirect('/todos');
    $this->assertDatabaseMissing('todos', ['id' => $todo->id]);
});

it('fügt einen Kommentar zu einem To-Do hinzu', function () {
    $todo = Todo::factory()->create([
        'created_by' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)->post("/todos/{$todo->id}/comments", [
        'kommentar' => 'Test Kommentar',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('todo_comments', [
        'todo_id' => $todo->id,
        'user_id' => $this->user->id,
        'kommentar' => 'Test Kommentar',
    ]);
});

it('validiert Kommentar-Inhalt', function () {
    $todo = Todo::factory()->create([
        'created_by' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)->post("/todos/{$todo->id}/comments", [
        'kommentar' => '',
    ]);

    $response->assertSessionHasErrors(['kommentar']);
});

it('fügt eine Antwort zu einem Kommentar hinzu', function () {
    $todo = Todo::factory()->create([
        'created_by' => $this->user->id,
    ]);
    
    $comment = TodoComment::factory()->create([
        'todo_id' => $todo->id,
        'user_id' => $this->admin->id,
    ]);

    $response = $this->actingAs($this->user)->post("/comments/{$comment->id}/reply", [
        'kommentar' => 'Test Antwort',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('todo_comments', [
        'todo_id' => $todo->id,
        'user_id' => $this->user->id,
        'parent_id' => $comment->id,
        'kommentar' => 'Test Antwort',
    ]);
});

it('verhindert Antworten auf Unterkommentare', function () {
    $todo = Todo::factory()->create([
        'created_by' => $this->user->id,
    ]);
    
    $parentComment = TodoComment::factory()->create([
        'todo_id' => $todo->id,
        'user_id' => $this->admin->id,
    ]);
    
    $reply = TodoComment::factory()->create([
        'todo_id' => $todo->id,
        'user_id' => $this->user->id,
        'parent_id' => $parentComment->id,
    ]);

    $response = $this->actingAs($this->admin)->post("/comments/{$reply->id}/reply", [
        'kommentar' => 'Test Antwort auf Antwort',
    ]);

    $response->assertStatus(400);
});

it('validiert Antwort-Inhalt', function () {
    $todo = Todo::factory()->create([
        'created_by' => $this->user->id,
    ]);
    
    $comment = TodoComment::factory()->create([
        'todo_id' => $todo->id,
        'user_id' => $this->admin->id,
    ]);

    $response = $this->actingAs($this->user)->post("/comments/{$comment->id}/reply", [
        'kommentar' => '',
    ]);

    $response->assertSessionHasErrors(['kommentar']);
});

it('löscht einen Kommentar als Ersteller', function () {
    $comment = TodoComment::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)->delete("/comments/{$comment->id}");

    $response->assertRedirect();
    $this->assertDatabaseMissing('todo_comments', ['id' => $comment->id]);
});

it('löscht einen Kommentar als Admin', function () {
    $comment = TodoComment::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->admin)->delete("/comments/{$comment->id}");

    $response->assertRedirect();
    $this->assertDatabaseMissing('todo_comments', ['id' => $comment->id]);
});

it('verhindert das Löschen von Kommentaren durch andere Benutzer', function () {
    $otherUser = User::factory()->create();
    $comment = TodoComment::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($otherUser)->delete("/comments/{$comment->id}");

    $response->assertForbidden();
    $this->assertDatabaseHas('todo_comments', ['id' => $comment->id]);
});

it('zeigt korrekte Statistiken', function () {
    // To-Dos mit verschiedenen Status erstellen
    Todo::factory()->create(['status' => 'offen', 'created_by' => $this->user->id]);
    Todo::factory()->create(['status' => 'offen', 'created_by' => $this->user->id]);
    Todo::factory()->create(['status' => 'erledigt', 'created_by' => $this->user->id]);

    $response = $this->actingAs($this->user)->get('/todos');

    $response->assertInertia(fn ($page) => $page
        ->has('statistics', fn ($stats) => $stats
            ->where('total', 3)
            ->where('offen', 2)
            ->where('erledigt', 1)
            ->has('ueberfaellig')
        )
    );
});
