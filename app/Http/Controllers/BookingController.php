<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Models\Booking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('bookings/index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('bookings/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBookingRequest $request): RedirectResponse
    {
        $booking = Booking::create([
            'user_id' => auth()->id(),
            'titel' => $request->titel,
            'beschreibung' => $request->beschreibung,
            'start_datum' => $request->start_datum,
            'end_datum' => $request->end_datum,
            'gast_anzahl' => $request->gast_anzahl,
            'anreise_zeit' => $request->anreise_zeit,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Buchung erfolgreich erstellt!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Booking $booking): Response
    {
        $this->authorize('view', $booking);

        return Inertia::render('bookings/show', [
            'booking' => $booking->load('user'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Booking $booking): Response
    {
        $this->authorize('update', $booking);

        return Inertia::render('bookings/edit', [
            'booking' => $booking->load('user'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBookingRequest $request, Booking $booking): RedirectResponse
    {
        $this->authorize('update', $booking);

        $booking->update([
            'titel' => $request->titel,
            'beschreibung' => $request->beschreibung,
            'start_datum' => $request->start_datum,
            'end_datum' => $request->end_datum,
            'gast_anzahl' => $request->gast_anzahl,
            'anreise_zeit' => $request->anreise_zeit,
        ]);

        return redirect()->back()->with('success', 'Buchung erfolgreich aktualisiert!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Booking $booking): RedirectResponse
    {
        $this->authorize('delete', $booking);

        $booking->delete();

        return redirect()->back()->with('success', 'Buchung erfolgreich gelöscht!');
    }
}
