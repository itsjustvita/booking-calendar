<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\AdminSettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    // Admin-only settings
    Route::middleware('admin')->group(function () {
        Route::get('settings/admin', [AdminSettingsController::class, 'edit'])->name('admin.settings.edit');
        Route::patch('settings/admin/weather-location', [AdminSettingsController::class, 'updateWeatherLocation'])->name('admin.weather-location.update');
    });
});
