<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $year = $request->get('year', now()->year);
        $month = $request->get('month', now()->month);

        $date = Carbon::createFromDate($year, $month, 1);
        $startOfMonth = $date->copy()->startOfMonth();
        $endOfMonth = $date->copy()->endOfMonth();

        // Debug
        \Log::info('Dashboard: Current date params', [
            'year' => $year,
            'month' => $month,
            'startOfMonth' => $startOfMonth->format('Y-m-d'),
            'endOfMonth' => $endOfMonth->format('Y-m-d')
        ]);

        // Get bookings for the month
        $bookings = Booking::with('user')
            ->whereBetween('start_datum', [$startOfMonth, $endOfMonth])
            ->orWhereBetween('end_datum', [$startOfMonth, $endOfMonth])
            ->orWhere(function ($query) use ($startOfMonth, $endOfMonth) {
                $query->where('start_datum', '<=', $startOfMonth)
                      ->where('end_datum', '>=', $endOfMonth);
            })
            ->get();

        // Debug
        \Log::info('Dashboard: Found bookings', [
            'count' => $bookings->count(),
            'bookings' => $bookings->pluck('titel', 'id')->toArray()
        ]);

        // Get statistics
        $totalBookings = Booking::whereYear('start_datum', $year)
            ->whereMonth('start_datum', $month)
            ->count();

        $totalGuests = Booking::whereYear('start_datum', $year)
            ->whereMonth('start_datum', $month)
            ->sum('gast_anzahl');

        $upcomingBookings = Booking::where('start_datum', '>=', now())
            ->where('start_datum', '<=', now()->addDays(30))
            ->count();

        // Create calendar days
        $calendarDays = $this->generateCalendarDays($startOfMonth, $endOfMonth, $bookings);

        // Debug
        $daysWithBookings = collect($calendarDays)->filter(function($day) {
            return $day['hasBookings'];
        });
        \Log::info('Dashboard: Calendar days with bookings', [
            'count' => $daysWithBookings->count(),
            'days' => $daysWithBookings->pluck('date')->toArray()
        ]);

        // Wetterstandort aus Cache abrufen
        $weatherLocation = Cache::get('weather_location', [
            'city' => 'Doren',
            'country' => 'Österreich',
            'coordinates' => [
                'lat' => 47.4500,
                'lon' => 9.8833
            ]
        ]);

        return Inertia::render('dashboard', [
            'dashboardData' => [
                'currentMonth' => $date->locale('de')->format('F Y'),
                'currentYear' => $year,
                'calendarData' => [
                    'days' => $calendarDays,
                    'weekdays' => ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
                ],
                'statistics' => [
                    'totalBookings' => $totalBookings,
                    'totalGuests' => $totalGuests,
                    'upcomingBookings' => $upcomingBookings,
                    'monthlyRevenue' => 0, // TODO: Calculate when pricing is implemented
                ],
            ],
            'weatherLocation' => $weatherLocation,
        ]);
    }

    private function generateCalendarDays($startOfMonth, $endOfMonth, $bookings)
    {
        $days = [];
        $current = $startOfMonth->copy();

        // Add days from previous month to fill the week
        $startOfCalendar = $current->copy()->startOfWeek(Carbon::MONDAY);
        $endOfCalendar = $endOfMonth->copy()->endOfWeek(Carbon::SUNDAY);

        $currentDay = $startOfCalendar->copy();

        while ($currentDay <= $endOfCalendar) {
            $dayBookings = $bookings->filter(function ($booking) use ($currentDay) {
                $arrivalDate = Carbon::parse($booking->start_datum);
                $departureDate = Carbon::parse($booking->end_datum);

                return $currentDay->between($arrivalDate, $departureDate) ||
                       $currentDay->isSameDay($arrivalDate) ||
                       $currentDay->isSameDay($departureDate);
            });

            $isArrivalDay = $bookings->contains(function ($booking) use ($currentDay) {
                return Carbon::parse($booking->start_datum)->isSameDay($currentDay);
            });

            $isDepartureDay = $bookings->contains(function ($booking) use ($currentDay) {
                return Carbon::parse($booking->end_datum)->isSameDay($currentDay);
            });

            $leftHalf = 'free';
            $rightHalf = 'free';

            if ($dayBookings->isNotEmpty()) {
                if ($isArrivalDay && $isDepartureDay) {
                    // Same day arrival and departure
                    $leftHalf = 'free';
                    $rightHalf = 'free';
                } elseif ($isArrivalDay) {
                    // Arrival day: morning free, afternoon/evening booked
                    $leftHalf = 'free';
                    $rightHalf = 'booked';
                } elseif ($isDepartureDay) {
                    // Departure day: morning booked, afternoon/evening free
                    $leftHalf = 'booked';
                    $rightHalf = 'free';
                } else {
                    // Fully booked day
                    $leftHalf = 'booked';
                    $rightHalf = 'booked';
                }
            }

            // Convert bookings to array with necessary data
            $bookingsArray = $dayBookings->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'titel' => $booking->titel,
                    'beschreibung' => $booking->beschreibung,
                    'start_datum' => $booking->start_datum->format('Y-m-d'),
                    'end_datum' => $booking->end_datum->format('Y-m-d'),
                    'gast_anzahl' => $booking->gast_anzahl,
                    'status' => $booking->status->value,
                    'status_name' => $booking->status_name,
                    'user' => [
                        'id' => $booking->user->id,
                        'name' => $booking->user->name,
                        'email' => $booking->user->email,
                    ],
                ];
            })->toArray();

            $days[] = [
                'date' => $currentDay->format('Y-m-d'),
                'day' => $currentDay->day,
                'dayName' => $currentDay->format('D'),
                'isCurrentMonth' => $currentDay->month === $startOfMonth->month,
                'isToday' => $currentDay->isToday(),
                'isWeekend' => $currentDay->isWeekend(),
                'bookings' => $bookingsArray,
                'hasBookings' => $dayBookings->isNotEmpty(),
                'isArrivalDay' => $isArrivalDay,
                'isDepartureDay' => $isDepartureDay,
                'isFullyOccupied' => $leftHalf === 'booked' && $rightHalf === 'booked',
                'leftHalf' => $leftHalf,
                'rightHalf' => $rightHalf,
            ];

            $currentDay->addDay();
        }

        return $days;
    }
}
