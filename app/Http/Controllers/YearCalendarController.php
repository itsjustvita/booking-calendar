<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class YearCalendarController extends Controller
{
    /**
     * Display the year calendar with all 12 months
     */
    public function index(Request $request): Response
    {
        $year = $request->get('year', Carbon::now()->year);
        $selectedYear = Carbon::createFromDate($year, 1, 1);

        // Get all bookings for the entire year
        $startOfYear = $selectedYear->copy()->startOfYear();
        $endOfYear = $selectedYear->copy()->endOfYear();

        $allBookings = Booking::with('user')
            ->whereBetween('start_datum', [$startOfYear, $endOfYear])
            ->orWhere(function ($query) use ($startOfYear, $endOfYear) {
                $query->where('start_datum', '<', $startOfYear)
                      ->where('end_datum', '>=', $startOfYear);
            })
            ->orWhere(function ($query) use ($startOfYear, $endOfYear) {
                $query->where('start_datum', '<=', $endOfYear)
                      ->where('end_datum', '>', $endOfYear);
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
                    'can_edit' => auth()->user()->can('update', $booking),
                    'can_delete' => auth()->user()->can('delete', $booking),
                ];
            });

        // Generate calendar data for all 12 months
        $monthsData = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthStart = Carbon::createFromDate($year, $month, 1);
            $monthEnd = $monthStart->copy()->endOfMonth();

            // Filter bookings for this month
            $monthBookings = $allBookings->filter(function ($booking) use ($monthStart, $monthEnd) {
                $bookingStart = Carbon::parse($booking['start_datum']);
                $bookingEnd = Carbon::parse($booking['end_datum']);
                
                return $bookingStart <= $monthEnd && $bookingEnd >= $monthStart;
            });

            $monthsData[] = [
                'month' => $month,
                'monthName' => $monthStart->locale('de')->monthName,
                'monthNameShort' => $monthStart->locale('de')->shortMonthName,
                'year' => $year,
                'startOfMonth' => $monthStart->format('Y-m-d'),
                'endOfMonth' => $monthEnd->format('Y-m-d'),
                'bookings' => $monthBookings->values(),
                'calendarData' => $this->generateMonthCalendarData($monthStart, $monthEnd, $monthBookings),
            ];
        }

        // Generate statistics for the year
        $yearStats = [
            'totalBookings' => $allBookings->count(),
            'totalGuests' => $allBookings->sum('gast_anzahl'),
            'occupiedDays' => $this->calculateOccupiedDays($allBookings),
            'mostBusyMonth' => $this->getMostBusyMonth($monthsData),
        ];

        return Inertia::render('year-calendar', [
            'year' => $year,
            'monthsData' => $monthsData,
            'allBookings' => $allBookings,
            'yearStats' => $yearStats,
            'previousYear' => $year - 1,
            'nextYear' => $year + 1,
        ]);
    }

    /**
     * Generate calendar data for a specific month with half-day visualization
     */
    private function generateMonthCalendarData(Carbon $monthStart, Carbon $monthEnd, $bookings): array
    {
        $calendarDays = [];
        
        // Nur die tatsächlichen Tage des Monats, keine Vor-/Nachmonatstage
        $startDate = $monthStart->copy(); // Erster Tag des Monats
        $endDate = $monthEnd->copy(); // Letzter Tag des Monats

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
                'isCurrentMonth' => true, // Alle Tage sind jetzt im aktuellen Monat
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
            'totalDays' => count($calendarDays),
            'weekdays' => ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
        ];
    }

    /**
     * Calculate total occupied days in the year
     */
    private function calculateOccupiedDays($bookings): int
    {
        $occupiedDays = collect();
        
        foreach ($bookings as $booking) {
            $start = Carbon::parse($booking['start_datum']);
            $end = Carbon::parse($booking['end_datum']);
            
            $current = $start->copy();
            while ($current <= $end) {
                $occupiedDays->push($current->format('Y-m-d'));
                $current->addDay();
            }
        }

        return $occupiedDays->unique()->count();
    }

    /**
     * Get the month with most bookings
     */
    private function getMostBusyMonth($monthsData): array
    {
        $mostBusy = collect($monthsData)->sortByDesc(function ($month) {
            return $month['bookings']->count();
        })->first();

        return [
            'month' => $mostBusy['month'],
            'monthName' => $mostBusy['monthName'],
            'bookingCount' => $mostBusy['bookings']->count(),
        ];
    }
}
