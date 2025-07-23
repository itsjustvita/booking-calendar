<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with calendar and statistics
     */
    public function index(Request $request): Response
    {
        $year = $request->get('year', Carbon::now()->year);
        $month = $request->get('month', Carbon::now()->month);
        
        $selectedDate = Carbon::createFromDate($year, $month, 1);
        $monthStart = $selectedDate->copy()->startOfMonth();
        $monthEnd = $selectedDate->copy()->endOfMonth();

        // Get bookings for the current month with user information
        $bookings = Booking::with('user')
            ->whereBetween('start_datum', [$monthStart, $monthEnd])
            ->orWhere(function ($query) use ($monthStart, $monthEnd) {
                $query->where('start_datum', '<', $monthStart)
                      ->where('end_datum', '>=', $monthStart);
            })
            ->orWhere(function ($query) use ($monthStart, $monthEnd) {
                $query->where('start_datum', '<=', $monthEnd)
                      ->where('end_datum', '>', $monthEnd);
            })
            ->confirmed()
            ->orderBy('start_datum')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'titel' => $booking->titel,
                    'beschreibung' => $booking->beschreibung,
                    'start_datum' => $booking->start_datum->format('Y-m-d'),
                    'end_datum' => $booking->end_datum->format('Y-m-d'),
                    'gast_anzahl' => $booking->gast_anzahl,
                    'status' => $booking->status->value,
                    'status_name' => $booking->status_name,
                    'duration' => $booking->duration,
                    'date_range' => $booking->date_range,
                    'user' => [
                        'id' => $booking->user->id,
                        'name' => $booking->user->name,
                        'email' => $booking->user->email,
                    ],
                    // Berechtigungen: Admin kann alles, Gäste nur ihre eigenen Buchungen
                    'can_edit' => auth()->user()->role === 'admin' || $booking->user_id === auth()->id(),
                    'can_delete' => auth()->user()->role === 'admin' || $booking->user_id === auth()->id(),
                ];
            });

        // Generate calendar data
        $calendarData = $this->generateCalendarData($monthStart, $monthEnd, $bookings);

        // Calculate statistics
        $totalBookings = $bookings->count();
        $totalGuests = $bookings->sum('gast_anzahl');
        $upcomingBookings = $bookings->filter(function ($booking) {
            return Carbon::parse($booking['start_datum'])->isFuture();
        })->count();

        $dashboardData = [
            'currentMonth' => $selectedDate->locale('de')->monthName . ' ' . $year,
            'currentYear' => $year,
            'calendarData' => $calendarData,
            'statistics' => [
                'totalBookings' => $totalBookings,
                'totalGuests' => $totalGuests,
                'upcomingBookings' => $upcomingBookings,
                'monthlyRevenue' => 0, // Kann später implementiert werden
            ],
        ];

        return Inertia::render('dashboard', [
            'dashboardData' => $dashboardData,
        ]);
    }

    /**
     * Generate calendar data for the dashboard mini-calendar
     */
    private function generateCalendarData(Carbon $monthStart, Carbon $monthEnd, $bookings): array
    {
        $calendarDays = [];
        
        // Nur die tatsächlichen Tage des Monats
        $startDate = $monthStart->copy();
        $endDate = $monthEnd->copy();

        $currentDay = $startDate->copy();

        while ($currentDay <= $endDate) {
            $dayBookings = $bookings->filter(function ($booking) use ($currentDay) {
                $start = Carbon::parse($booking['start_datum']);
                $end = Carbon::parse($booking['end_datum']);
                
                return $currentDay->between($start, $end);
            });

            $isArrivalDay = $bookings->some(function ($booking) use ($currentDay) {
                return Carbon::parse($booking['start_datum'])->isSameDay($currentDay);
            });

            $isDepartureDay = $bookings->some(function ($booking) use ($currentDay) {
                return Carbon::parse($booking['end_datum'])->isSameDay($currentDay);
            });

            $isFullyOccupied = $dayBookings->count() > 0 && !$isArrivalDay && !$isDepartureDay;

            // Determine left and right half states
            $leftHalf = 'free';
            $rightHalf = 'free';

            if ($dayBookings->count() > 0) {
                if ($isArrivalDay && $isDepartureDay) {
                    // Same day arrival and departure - komplett belegt
                    $leftHalf = 'occupied';
                    $rightHalf = 'occupied';
                } elseif ($isArrivalDay) {
                    // Arrival day: erste Hälfte frei, zweite Hälfte belegt
                    $leftHalf = 'free';
                    $rightHalf = 'occupied';
                } elseif ($isDepartureDay) {
                    // Departure day: erste Hälfte belegt, zweite Hälfte frei
                    $leftHalf = 'occupied';
                    $rightHalf = 'free';
                } else {
                    // Fully occupied day (between arrival and departure)
                    $leftHalf = 'occupied';
                    $rightHalf = 'occupied';
                }
            }

            $calendarDays[] = [
                'date' => $currentDay->format('Y-m-d'),
                'day' => $currentDay->day,
                'dayName' => $currentDay->locale('de')->shortDayName,
                'isCurrentMonth' => true,
                'isToday' => $currentDay->isToday(),
                'isWeekend' => $currentDay->isWeekend(),
                'bookings' => $dayBookings->values(),
                'hasBookings' => $dayBookings->count() > 0,
                'isArrivalDay' => $isArrivalDay,
                'isDepartureDay' => $isDepartureDay,
                'isFullyOccupied' => $isFullyOccupied,
                'leftHalf' => $leftHalf,
                'rightHalf' => $rightHalf,
            ];

            $currentDay->addDay();
        }

        return [
            'days' => $calendarDays,
            'weekdays' => ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
        ];
    }
}
