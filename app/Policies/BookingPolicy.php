<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Alle eingeloggten Nutzer dürfen die Liste (z. B. eigene Buchungen) sehen
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Booking $booking): bool
    {
        return $user->isAdmin() || $user->id === $booking->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true; // Alle authentifizierten User können Buchungen erstellen
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Booking $booking): bool
    {
        // Admin kann alle Buchungen bearbeiten
        if ($user->isAdmin()) {
            return true;
        }

        // User kann nur eigene Buchungen bearbeiten
        if ($user->id !== $booking->user_id) {
            return false;
        }

        // User kann eigene stornierte Buchungen nicht bearbeiten
        if ($booking->isCancelled()) {
            return false;
        }

        // User kann vergangene Buchungen nicht bearbeiten
        if ($booking->start_datum->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Booking $booking): bool
    {
        // Admin kann alle Buchungen löschen
        if ($user->isAdmin()) {
            return true;
        }

        // User kann nur eigene Buchungen löschen
        if ($user->id !== $booking->user_id) {
            return false;
        }

        // User kann stornierte Buchungen nicht löschen
        if ($booking->isCancelled()) {
            return false;
        }

        // User kann vergangene Buchungen nicht löschen
        if ($booking->start_datum->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Booking $booking): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Booking $booking): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can confirm the booking.
     */
    public function confirm(User $user, Booking $booking): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can cancel the booking.
     */
    public function cancel(User $user, Booking $booking): bool
    {
        // Admin kann alle Buchungen stornieren
        if ($user->isAdmin()) {
            return true;
        }

        // User kann eigene Buchungen stornieren (aber nicht bereits stornierte)
        return $user->id === $booking->user_id && !$booking->isCancelled();
    }
}
