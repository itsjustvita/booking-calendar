<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $year = (int) $request->get('year', Carbon::now()->year);
        $month = (int) $request->get('month', Carbon::now()->month);

        // Ensure valid month and year
        if ($month < 1 || $month > 12) {
            $month = Carbon::now()->month;
        }
        if ($year < 2020 || $year > 2030) {
            $year = Carbon::now()->year;
        }

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

        $upcomingBookings = Booking::where('start_datum', '>=', Carbon::now())
            ->where('start_datum', '<=', Carbon::now()->addDays(30))
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

        // Wetterdaten via Open-Meteo (kein API-Key erforderlich). In Tests kein Netzwerkzugriff.
        $weatherData = Cache::remember(
            'weather:' . $weatherLocation['coordinates']['lat'] . ':' . $weatherLocation['coordinates']['lon'],
            now()->addMinutes(30),
            function () use ($weatherLocation) {
                if (App::environment('testing')) {
                    return null;
                }

                try {
                    $lat = $weatherLocation['coordinates']['lat'];
                    $lon = $weatherLocation['coordinates']['lon'];
                    $url = 'https://api.open-meteo.com/v1/forecast';
                    $params = [
                        'latitude' => $lat,
                        'longitude' => $lon,
                        'current' => 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
                        'daily' => 'weather_code,temperature_2m_max,temperature_2m_min',
                        'timezone' => 'auto',
                    ];

                    $response = Http::timeout(5)->retry(2, 200)->get($url, $params);
                    if (!$response->successful()) {
                        return null;
                    }
                    $data = $response->json();

                    $current = $data['current'] ?? null;
                    $daily = $data['daily'] ?? null;
                    if (!$current || !$daily) {
                        return null;
                    }

                    $location = $weatherLocation['city'] . ', ' . $weatherLocation['country'];

                    // Forecast: nächste 3 Tage ab morgen
                    $dates = $daily['time'] ?? [];
                    $codes = $daily['weather_code'] ?? [];
                    $tmax = $daily['temperature_2m_max'] ?? [];
                    $forecast = [];
                    for ($i = 1; $i <= 3; $i++) {
                        if (!isset($dates[$i])) {
                            break;
                        }
                        $date = Carbon::parse($dates[$i]);
                        $forecast[] = [
                            'date' => $date->format('Y-m-d'),
                            'dayName' => $date->locale('de')->shortDayName,
                            'temperature' => isset($tmax[$i]) ? (int) round($tmax[$i]) : null,
                            'description' => isset($codes[$i]) ? self::mapWeatherCodeToGerman($codes[$i]) : '',
                        ];
                    }

                    return [
                        'temperature' => isset($current['temperature_2m']) ? (int) round($current['temperature_2m']) : null,
                        'description' => isset($current['weather_code']) ? self::mapWeatherCodeToGerman($current['weather_code']) : '',
                        'humidity' => isset($current['relative_humidity_2m']) ? (int) $current['relative_humidity_2m'] : null,
                        'windSpeed' => isset($current['wind_speed_10m']) ? (int) round($current['wind_speed_10m']) : null,
                        'location' => $location,
                        'forecast' => $forecast,
                    ];
                } catch (\Throwable $e) {
                    \Log::warning('Wetterdaten konnten nicht geladen werden', ['error' => $e->getMessage()]);
                    return null;
                }
            }
        );

        // Liste kommender Buchungen (Titel, Gäste, Status) für das Dashboard
        $upcomingList = Booking::with('user')
            ->where('start_datum', '>=', Carbon::now())
            ->orderBy('start_datum')
            ->limit(5)
            ->get()
            ->map(function (Booking $b) {
                return [
                    'id' => $b->id,
                    'titel' => $b->titel,
                    'gast_anzahl' => $b->gast_anzahl,
                    'status' => $b->status->value,
                    'status_name' => $b->status_name,
                    'date_range' => $b->date_range,
                    'user' => [
                        'id' => $b->user->id,
                        'name' => $b->user->name,
                    ],
                ];
            });

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
                'upcomingList' => $upcomingList,
            ],
            'weatherLocation' => $weatherLocation,
            'weatherData' => $weatherData,
        ]);
    }

    private static function mapWeatherCodeToGerman(int $code): string
    {
        $map = [
            0 => 'Klar',
            1 => 'Überwiegend klar',
            2 => 'Teilweise bewölkt',
            3 => 'Bewölkt',
            45 => 'Nebel',
            48 => 'Reifiger Nebel',
            51 => 'Leichter Nieselregen',
            53 => 'Mäßiger Nieselregen',
            55 => 'Starker Nieselregen',
            56 => 'Leichter gefrierender Nieselregen',
            57 => 'Starker gefrierender Nieselregen',
            61 => 'Leichter Regen',
            63 => 'Mäßiger Regen',
            65 => 'Starker Regen',
            66 => 'Leichter gefrierender Regen',
            67 => 'Starker gefrierender Regen',
            71 => 'Leichter Schneefall',
            73 => 'Mäßiger Schneefall',
            75 => 'Starker Schneefall',
            77 => 'Schneekörner',
            80 => 'Leichte Regenschauer',
            81 => 'Mäßige Regenschauer',
            82 => 'Heftige Regenschauer',
            85 => 'Leichte Schneeschauer',
            86 => 'Starke Schneeschauer',
            95 => 'Gewitter',
            96 => 'Gewitter mit leichtem Hagel',
            99 => 'Gewitter mit starkem Hagel',
        ];

        return $map[$code] ?? 'Unbekannt';
    }

    private function generateCalendarDays($startOfMonth, $endOfMonth, $bookings)
    {
        $days = [];
        $current = $startOfMonth->copy();

        // Beginne am ersten Tag des Monats, nicht am Montag der Woche
        $startOfCalendar = $current->copy();
        $endOfCalendar = $endOfMonth->copy();

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

            // Initialisiere die Tageshälften
            $leftHalf = 'free';
            $rightHalf = 'free';

            // Korrigierte Logik für die Tageshälften
            if ($isArrivalDay && $isDepartureDay) {
                $leftHalf = 'occupied';
                $rightHalf = 'occupied';
            } elseif ($isArrivalDay) {
                $leftHalf = 'free';
                $rightHalf = 'occupied';
            } elseif ($isDepartureDay) {
                $leftHalf = 'occupied';
                $rightHalf = 'free';
            } elseif ($dayBookings->isNotEmpty()) {
                $leftHalf = 'occupied';
                $rightHalf = 'occupied';
            }

            // Convert bookings to array with necessary data
            $bookingsArray = $dayBookings->map(function ($booking) {
                $startDate = Carbon::parse($booking->start_datum);
                $endDate = Carbon::parse($booking->end_datum);
                $duration = $startDate->diffInDays($endDate) + 1;
                
                return [
                    'id' => $booking->id,
                    'titel' => $booking->titel,
                    'beschreibung' => $booking->beschreibung,
                    'start_datum' => $booking->start_datum->format('Y-m-d'),
                    'end_datum' => $booking->end_datum->format('Y-m-d'),
                    'gast_anzahl' => $booking->gast_anzahl,
                    'status' => $booking->status->value,
                    'status_name' => $booking->status_name,
                    'duration' => $duration,
                    'date_range' => $startDate->format('d.m.Y') . ' - ' . $endDate->format('d.m.Y'),
                    'user' => [
                        'id' => $booking->user->id,
                        'name' => $booking->user->name,
                        'email' => $booking->user->email,
                    ],
                    'can_edit' => auth()->user() ? auth()->user()->can('update', $booking) : false,
                    'can_delete' => auth()->user() ? auth()->user()->can('delete', $booking) : false,
                ];
            })->toArray();

            $days[] = [
                'date' => $currentDay->format('Y-m-d'),
                'day' => $currentDay->day,
                'dayName' => $currentDay->locale('de')->shortDayName,
                'isCurrentMonth' => $currentDay->month === $startOfMonth->month,
                'isToday' => $currentDay->isToday(),
                'isWeekend' => $currentDay->dayOfWeek === 6 || $currentDay->dayOfWeek === 0, // Samstag = 6, Sonntag = 0
                'bookings' => $bookingsArray,
                'hasBookings' => $dayBookings->isNotEmpty(),
                'isArrivalDay' => $isArrivalDay,
                'isDepartureDay' => $isDepartureDay,
                'isFullyOccupied' => $leftHalf === 'occupied' && $rightHalf === 'occupied',
                'leftHalf' => $leftHalf,
                'rightHalf' => $rightHalf,
            ];

            $currentDay->addDay();
        }

        return $days;
    }
}
