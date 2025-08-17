<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserCategory;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function __construct()
    {
        $this->middleware('admin');
    }

    /**
     * Display the admin settings page.
     */
    public function index(): Response
    {
        $categories = UserCategory::with(['creator', 'users'])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/settings/index', [
            'categories' => $categories,
        ]);
    }
}
