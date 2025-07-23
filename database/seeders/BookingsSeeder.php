<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BookingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'guest')->get();
        
        if ($users->count() === 0) {
            $this->command->error('Keine Gast-User gefunden. Bitte zuerst GuestUsersSeeder ausführen.');
            return;
        }

        $bookings = [
            // Vergangene Buchungen
            [
                'user_email' => 'mueller@example.com',
                'titel' => 'Familienurlaub Ostern',
                'beschreibung' => 'Schöne Osterferien mit der ganzen Familie',
                'start_datum' => Carbon::now()->subMonths(2)->startOfMonth()->addDays(10),
                'end_datum' => Carbon::now()->subMonths(2)->startOfMonth()->addDays(17),
                'gast_anzahl' => 5,
                'status' => 'confirmed',
            ],
            [
                'user_email' => 'schmidt@example.com',
                'titel' => 'Männerwochenende',
                'beschreibung' => 'Entspanntes Wochenende mit den Jungs',
                'start_datum' => Carbon::now()->subMonths(1)->startOfMonth()->addDays(5),
                'end_datum' => Carbon::now()->subMonths(1)->startOfMonth()->addDays(7),
                'gast_anzahl' => 4,
                'status' => 'confirmed',
            ],

            // Aktueller Monat
            [
                'user_email' => 'weber@example.com',
                'titel' => 'Wellness-Wochenende',
                'beschreibung' => 'Erholung und Entspannung in der Natur',
                'start_datum' => Carbon::now()->startOfMonth()->addDays(8),
                'end_datum' => Carbon::now()->startOfMonth()->addDays(10),
                'gast_anzahl' => 2,
                'status' => 'confirmed',
            ],
            [
                'user_email' => 'fischer@example.com',
                'titel' => 'Kindergeburtstag',
                'beschreibung' => 'Tolle Geburtstagsfeier für unseren Sohn',
                'start_datum' => Carbon::now()->addDays(3),
                'end_datum' => Carbon::now()->addDays(5),
                'gast_anzahl' => 8,
                'status' => 'confirmed',
            ],
            [
                'user_email' => 'bauer@example.com',
                'titel' => 'Kurzer Städtetrip',
                'beschreibung' => 'Basis für Ausflüge in die Umgebung',
                'start_datum' => Carbon::now()->addDays(12),
                'end_datum' => Carbon::now()->addDays(14),
                'gast_anzahl' => 2,
                'status' => 'pending',
            ],
            [
                'user_email' => 'wagner@example.com',
                'titel' => 'Monatsende-Auszeit',
                'beschreibung' => 'Ruhe und Entspannung zum Monatsende',
                'start_datum' => Carbon::now()->endOfMonth()->subDays(2),
                'end_datum' => Carbon::now()->endOfMonth(),
                'gast_anzahl' => 1,
                'status' => 'confirmed',
            ],

            // Nächster Monat
            [
                'user_email' => 'hoffmann@example.com',
                'titel' => 'Sommerferien Start',
                'beschreibung' => 'Begin der Sommerferien mit der Familie',
                'start_datum' => Carbon::now()->addMonth()->startOfMonth()->addDays(2),
                'end_datum' => Carbon::now()->addMonth()->startOfMonth()->addDays(9),
                'gast_anzahl' => 6,
                'status' => 'confirmed',
            ],
            [
                'user_email' => 'klein@example.com',
                'titel' => 'Business Retreat',
                'beschreibung' => 'Ruhiger Ort für wichtige Geschäftsmeetings',
                'start_datum' => Carbon::now()->addMonth()->startOfMonth()->addDays(15),
                'end_datum' => Carbon::now()->addMonth()->startOfMonth()->addDays(18),
                'gast_anzahl' => 3,
                'status' => 'pending',
            ],
            [
                'user_email' => 'mueller@example.com',
                'titel' => 'Hochzeitstag Feier',
                'beschreibung' => 'Romantisches Wochenende zum Hochzeitstag',
                'start_datum' => Carbon::now()->addMonth()->endOfMonth()->subDays(3),
                'end_datum' => Carbon::now()->addMonth()->endOfMonth()->subDays(1),
                'gast_anzahl' => 2,
                'status' => 'confirmed',
            ],

            // Weiter in der Zukunft
            [
                'user_email' => 'weber@example.com',
                'titel' => 'Herbstspaziergang',
                'beschreibung' => 'Goldener Herbst in der Hütte genießen',
                'start_datum' => Carbon::now()->addMonths(2)->startOfMonth()->addDays(12),
                'end_datum' => Carbon::now()->addMonths(2)->startOfMonth()->addDays(15),
                'gast_anzahl' => 4,
                'status' => 'pending',
            ],
            [
                'user_email' => 'fischer@example.com',
                'titel' => 'Jahresabschluss',
                'beschreibung' => 'Besinnliche Zeit zum Jahresende',
                'start_datum' => Carbon::now()->addMonths(5)->endOfMonth()->subDays(4),
                'end_datum' => Carbon::now()->addMonths(5)->endOfMonth()->subDays(1),
                'gast_anzahl' => 7,
                'status' => 'pending',
            ],

            // Eine stornierte Buchung
            [
                'user_email' => 'bauer@example.com',
                'titel' => 'Abgesagter Termin',
                'beschreibung' => 'Leider mussten wir stornieren',
                'start_datum' => Carbon::now()->addDays(20),
                'end_datum' => Carbon::now()->addDays(23),
                'gast_anzahl' => 3,
                'status' => 'cancelled',
            ],
        ];

        foreach ($bookings as $bookingData) {
            $user = User::where('email', $bookingData['user_email'])->first();
            
            if (!$user) {
                $this->command->warn("User mit E-Mail {$bookingData['user_email']} nicht gefunden.");
                continue;
            }

            // Prüfe ob Buchung bereits existiert (um doppelte zu vermeiden)
            $existingBooking = Booking::where('user_id', $user->id)
                ->where('titel', $bookingData['titel'])
                ->where('start_datum', $bookingData['start_datum'])
                ->first();

            if (!$existingBooking) {
                Booking::create([
                    'user_id' => $user->id,
                    'titel' => $bookingData['titel'],
                    'beschreibung' => $bookingData['beschreibung'],
                    'start_datum' => $bookingData['start_datum'],
                    'end_datum' => $bookingData['end_datum'],
                    'gast_anzahl' => $bookingData['gast_anzahl'],
                    'status' => $bookingData['status'],
                ]);
            }
        }

        $totalBookings = Booking::count();
        $this->command->info("Buchungen erstellt. Gesamt: {$totalBookings} Buchungen in der Datenbank.");
    }
}
