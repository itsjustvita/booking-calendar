<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingOverviewController extends Controller
{
    /**
     * Display the booking overview with chronological table for the year
     */
    public function index(Request $request): Response
    {
        $year = $request->get('year', Carbon::now()->year);
        $selectedYear = Carbon::createFromDate($year, 1, 1);

        // Get all bookings for the year, ordered chronologically
        $startOfYear = $selectedYear->copy()->startOfYear();
        $endOfYear = $selectedYear->copy()->endOfYear();

        $bookings = Booking::with('user')
            ->where(function ($query) use ($startOfYear, $endOfYear) {
                $query->whereBetween('start_datum', [$startOfYear, $endOfYear])
                      ->orWhereBetween('end_datum', [$startOfYear, $endOfYear])
                      ->orWhere(function ($q) use ($startOfYear, $endOfYear) {
                          $q->where('start_datum', '<', $startOfYear)
                            ->where('end_datum', '>=', $startOfYear);
                      })
                      ->orWhere(function ($q) use ($startOfYear, $endOfYear) {
                          $q->where('start_datum', '<=', $endOfYear)
                            ->where('end_datum', '>', $endOfYear);
                      });
            })
            ->orderBy('start_datum', 'asc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'titel' => $booking->titel,
                    'beschreibung' => $booking->beschreibung,
                    'start_datum' => $booking->start_datum->format('Y-m-d'),
                    'end_datum' => $booking->end_datum->format('Y-m-d'),
                    'start_datum_formatted' => $booking->start_datum->locale('de')->format('d.m.Y'),
                    'end_datum_formatted' => $booking->end_datum->locale('de')->format('d.m.Y'),
                    'duration' => $booking->start_datum->diffInDays($booking->end_datum) + 1,
                    'gast_anzahl' => $booking->gast_anzahl,
                    'status' => $booking->status->value,
                    'status_name' => $booking->status_name,
                    'user' => [
                        'id' => $booking->user->id,
                        'name' => $booking->user->name,
                        'email' => $booking->user->email,
                    ],
                    'created_at' => $booking->created_at->locale('de')->format('d.m.Y H:i'),
                    'updated_at' => $booking->updated_at->locale('de')->format('d.m.Y H:i'),
                    'can_edit' => auth()->user()->can('update', $booking),
                    'can_delete' => auth()->user()->can('delete', $booking),
                ];
            });

        // Generate year statistics
        $statistics = [
            'total_bookings' => $bookings->count(),
            'confirmed_bookings' => $bookings->where('status', 'confirmed')->count(),
            'pending_bookings' => $bookings->where('status', 'pending')->count(),
            'cancelled_bookings' => $bookings->where('status', 'cancelled')->count(),
            'total_guests' => $bookings->sum('gast_anzahl'),
            'total_nights' => $bookings->sum('duration'),
            'average_stay' => $bookings->count() > 0 ? round($bookings->avg('duration'), 1) : 0,
            'busiest_month' => $this->getBusiestMonth($bookings),
        ];

        // Available years for year selector
        $availableYears = Booking::selectRaw('strftime("%Y", start_datum) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->map(fn($year) => (int) $year)
            ->toArray();

        if (!in_array($year, $availableYears)) {
            $availableYears[] = $year;
            rsort($availableYears);
        }

        return Inertia::render('booking-overview', [
            'bookings' => $bookings,
            'statistics' => $statistics,
            'year' => $year,
            'availableYears' => $availableYears,
            'previousYear' => $year - 1,
            'nextYear' => $year + 1,
        ]);
    }

    /**
     * Get the busiest month of the year
     */
    private function getBusiestMonth($bookings): array
    {
        $monthCounts = [];
        
        foreach ($bookings as $booking) {
            $startMonth = Carbon::parse($booking['start_datum'])->month;
            $endMonth = Carbon::parse($booking['end_datum'])->month;
            
            // Count the booking for each month it spans
            for ($month = $startMonth; $month <= $endMonth; $month++) {
                if (!isset($monthCounts[$month])) {
                    $monthCounts[$month] = 0;
                }
                $monthCounts[$month]++;
            }
        }

        if (empty($monthCounts)) {
            return [
                'month' => 1,
                'month_name' => 'Januar',
                'booking_count' => 0,
            ];
        }

        $busiestMonth = array_keys($monthCounts, max($monthCounts))[0];
        $monthName = Carbon::create()->month($busiestMonth)->locale('de')->monthName;

        return [
            'month' => $busiestMonth,
            'month_name' => $monthName,
            'booking_count' => $monthCounts[$busiestMonth],
        ];
    }
} 