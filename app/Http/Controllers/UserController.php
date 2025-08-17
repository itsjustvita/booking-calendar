<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    // Admin-Absicherung erfolgt in den Routen über die Middleware-Gruppe ('admin').

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $users = User::with(['category'])
            ->withCount('bookings')
            ->orderBy('name')
            ->paginate(15);

        $categories = UserCategory::orderBy('name')->get();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $categories = UserCategory::orderBy('name')->get();

        return Inertia::render('admin/users/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:user,admin',
            'is_active' => 'boolean',
            'category_id' => 'nullable|exists:user_categories,id',
        ], [
            'name.required' => 'Der Name ist erforderlich.',
            'email.required' => 'Die E-Mail-Adresse ist erforderlich.',
            'email.email' => 'Die E-Mail-Adresse muss gültig sein.',
            'email.unique' => 'Diese E-Mail-Adresse wird bereits verwendet.',
            'password.required' => 'Das Passwort ist erforderlich.',
            'password.confirmed' => 'Die Passwort-Bestätigung stimmt nicht überein.',
            'role.required' => 'Die Rolle ist erforderlich.',
            'role.in' => 'Die Rolle muss entweder "user" oder "admin" sein.',
            'category_id.exists' => 'Die ausgewählte Kategorie existiert nicht.',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_active' => $request->boolean('is_active', true),
            'category_id' => $request->category_id,
        ]);

        return redirect()->route('admin.users.index')->with('success', 'Benutzer erfolgreich erstellt!');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user): Response
    {
        $user->load(['bookings' => function ($query) {
            $query->orderBy('start_datum', 'desc');
        }]);

        return Inertia::render('admin/users/show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): Response
    {
        $categories = UserCategory::orderBy('name')->get();

        return Inertia::render('admin/users/edit', [
            'user' => $user,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:user,admin',
            'is_active' => 'boolean',
            'category_id' => 'nullable|exists:user_categories,id',
        ], [
            'name.required' => 'Der Name ist erforderlich.',
            'email.required' => 'Die E-Mail-Adresse ist erforderlich.',
            'email.email' => 'Die E-Mail-Adresse muss gültig sein.',
            'email.unique' => 'Diese E-Mail-Adresse wird bereits verwendet.',
            'role.required' => 'Die Rolle ist erforderlich.',
            'role.in' => 'Die Rolle muss entweder "user" oder "admin" sein.',
            'category_id.exists' => 'Die ausgewählte Kategorie existiert nicht.',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'is_active' => $request->boolean('is_active'),
            'category_id' => $request->category_id,
        ]);

        return redirect()->route('admin.users.index')->with('success', 'Benutzer erfolgreich aktualisiert!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        // Verhindere das Löschen des eigenen Accounts
        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users.index')->with('error', 'Sie können Ihren eigenen Account nicht löschen.');
        }

        // Verhindere das Löschen des letzten Admins
        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return redirect()->route('admin.users.index')->with('error', 'Der letzte Administrator kann nicht gelöscht werden.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'Benutzer erfolgreich gelöscht!');
    }

    /**
     * Update user password.
     */
    public function updatePassword(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'password.required' => 'Das Passwort ist erforderlich.',
            'password.confirmed' => 'Die Passwort-Bestätigung stimmt nicht überein.',
        ]);

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return redirect()->route('admin.users.edit', $user)->with('success', 'Passwort erfolgreich aktualisiert!');
    }

    /**
     * Toggle user active status.
     */
    public function toggleActive(User $user): RedirectResponse
    {
        // Verhindere das Deaktivieren des eigenen Accounts
        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users.index')->with('error', 'Sie können Ihren eigenen Account nicht deaktivieren.');
        }

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        $status = $user->is_active ? 'aktiviert' : 'deaktiviert';
        return redirect()->route('admin.users.index')->with('success', "Benutzer erfolgreich {$status}!");
    }
} 