<?php

use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserCategoryController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // User Management
    Route::resource('users', UserController::class);
    Route::patch('users/{user}/password', [UserController::class, 'updatePassword'])->name('users.update-password');
    Route::patch('users/{user}/toggle-active', [UserController::class, 'toggleActive'])->name('users.toggle-active');

    // Category Management
    Route::resource('categories', UserCategoryController::class);

    // Admin Settings
    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
}); 