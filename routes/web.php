<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\BookingOverviewController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TodoCommentController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\YearCalendarController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/year-calendar', [YearCalendarController::class, 'index'])->name('year-calendar');
    Route::get('/booking-overview', [BookingOverviewController::class, 'index'])->name('booking-overview');

    // Booking routes mit Policy-Autorisierung in Controller-Methoden
    Route::resource('bookings', BookingController::class);

    // Todo routes
    Route::resource('todos', TodoController::class);
    Route::patch('/todos/{todo}/complete', [TodoController::class, 'complete'])->name('todos.complete');
    Route::patch('/todos/{todo}/reopen', [TodoController::class, 'reopen'])->name('todos.reopen');

    // Todo comment routes
    Route::post('/todos/{todo}/comments', [TodoCommentController::class, 'store'])->name('todos.comments.store');
    Route::post('/comments/{comment}/reply', [TodoCommentController::class, 'reply'])->name('todos.comments.reply');
    Route::put('/comments/{comment}', [TodoCommentController::class, 'update'])->name('todos.comments.update');
    Route::delete('/comments/{comment}', [TodoCommentController::class, 'destroy'])->name('todos.comments.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
