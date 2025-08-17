<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserCategoryRequest;
use App\Http\Requests\Admin\UpdateUserCategoryRequest;
use App\Models\UserCategory;
use Inertia\Inertia;
use Inertia\Response;

class UserCategoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('admin');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $categories = UserCategory::with(['creator', 'users'])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/categories/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserCategoryRequest $request)
    {
        UserCategory::create([
            ...$request->validated(),
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Kategorie erfolgreich erstellt.');
    }

    /**
     * Display the specified resource.
     */
    public function show(UserCategory $category): Response
    {
        $category->load(['creator', 'users']);

        return Inertia::render('admin/categories/show', [
            'category' => $category,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UserCategory $category): Response
    {
        return Inertia::render('admin/categories/edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserCategoryRequest $request, UserCategory $category)
    {
        $category->update($request->validated());

        return redirect()->route('admin.categories.index')
            ->with('success', 'Kategorie erfolgreich aktualisiert.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserCategory $category)
    {
        // Prüfe, ob Kategorie noch Benutzer hat
        if ($category->users()->count() > 0) {
            return redirect()->route('admin.categories.index')
                ->with('error', 'Kategorie kann nicht gelöscht werden, da sie noch Benutzern zugewiesen ist.');
        }

        $category->delete();

        return redirect()->route('admin.categories.index')
            ->with('success', 'Kategorie erfolgreich gelöscht.');
    }
}
