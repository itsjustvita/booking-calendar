<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use App\Models\Todo;
use Inertia\Inertia;
use Inertia\Response;

class TodoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $todos = Todo::with(['creator', 'completedBy', 'comments.user'])
            ->orderBy('prioritaet', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $statistics = [
            'total' => $todos->count(),
            'offen' => $todos->where('status', 'offen')->count(),
            'erledigt' => $todos->where('status', 'erledigt')->count(),
            'ueberfaellig' => $todos->where('status', 'offen')->filter(fn ($todo) => $todo->is_overdue)->count(),
        ];

        return Inertia::render('Todos/Index', [
            'todos' => $todos,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Todos/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTodoRequest $request)
    {
        $todo = Todo::create([
            ...$request->validated(),
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('todos.index')
            ->with('success', 'To-Do erfolgreich erstellt.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Todo $todo): Response
    {
        $todo->load(['creator', 'completedBy', 'comments.user']);

        return Inertia::render('Todos/Show', [
            'todo' => $todo,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Todo $todo): Response
    {
        return Inertia::render('Todos/Edit', [
            'todo' => $todo,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTodoRequest $request, Todo $todo)
    {
        $todo->update($request->validated());

        return redirect()->route('todos.index')
            ->with('success', 'To-Do erfolgreich aktualisiert.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Todo $todo)
    {
        $todo->delete();

        return redirect()->route('todos.index')
            ->with('success', 'To-Do erfolgreich gelöscht.');
    }

    /**
     * Mark todo as completed
     */
    public function complete(Todo $todo)
    {
        $todo->markAsCompleted(auth()->user());

        return redirect()->back()
            ->with('success', 'To-Do als erledigt markiert.');
    }

    /**
     * Mark todo as open
     */
    public function reopen(Todo $todo)
    {
        $todo->markAsOpen();

        return redirect()->back()
            ->with('success', 'To-Do wieder als offen markiert.');
    }
}
