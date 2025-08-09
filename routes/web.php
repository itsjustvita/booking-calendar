<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\BookingOverviewController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\YearCalendarController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/year-calendar', [YearCalendarController::class, 'index'])->name('year-calendar');
    Route::get('/booking-overview', [BookingOverviewController::class, 'index'])->name('booking-overview');

    // Booking routes mit Policy-Autorisierung in Controller-Methoden
    Route::resource('bookings', BookingController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
