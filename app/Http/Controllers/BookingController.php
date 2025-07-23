<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Models\Booking;
use App\Models\BookingStatus;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created booking
     */
    public function store(StoreBookingRequest $request): RedirectResponse
    {
        $validatedData = $request->validated();
        
        // Status basierend auf Benutzerrolle setzen
        $status = auth()->user()->role === 'admin' 
            ? BookingStatus::CONFIRMED 
            : BookingStatus::PENDING;

        $booking = Booking::create([
            'titel' => $validatedData['titel'],
            'beschreibung' => $validatedData['beschreibung'] ?? '',
            'start_datum' => $validatedData['start_datum'],
            'end_datum' => $validatedData['end_datum'],
            'gast_anzahl' => $validatedData['gast_anzahl'],
            'status' => $status,
            'user_id' => auth()->id(),
        ]);

        $message = $status === BookingStatus::CONFIRMED 
            ? 'Buchung wurde erfolgreich erstellt und bestätigt.'
            : 'Buchung wurde erfolgreich erstellt und wartet auf Bestätigung.';

        return redirect()->back()->with('success', $message);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
