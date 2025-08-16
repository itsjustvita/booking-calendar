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
        $users = User::where('role', 'user')->get();
        
        if ($users->count() === 0) {
            $this->command->error('Keine Gast-User gefunden. Bitte zuerst GuestUsersSeeder ausführen.');
            return;
        }

        // Lösche alle bestehenden Buchungen
        Booking::truncate();
        $this->command->info('Alle bestehenden Buchungen gelöscht.');

        $bookings = [
            // Vergangene Buchungen - Februar
            [
                'user_email' => 'mueller@example.com',
                'titel' => 'Familienurlaub Ostern',
                'beschreibung' => 'Schöne Osterferien mit der ganzen Familie',
                'start_datum' => Carbon::now()->subMonths(2)->startOfMonth()->addDays(10),
                'end_datum' => Carbon::now()->subMonths(2)->startOfMonth()->addDays(17),
                'status' => 'gebucht',
            ],

            // März - nach der ersten Buchung
            [
                'user_email' => 'schmidt@example.com',
                'titel' => 'Männerwochenende',
                'beschreibung' => 'Entspanntes Wochenende mit den Jungs',
                'start_datum' => Carbon::now()->subMonths(1)->startOfMonth()->addDays(20),
                'end_datum' => Carbon::now()->subMonths(1)->startOfMonth()->addDays(22),
                'status' => 'gebucht',
            ],

            // Aktueller Monat - erste Woche
            [
                'user_email' => 'weber@example.com',
                'titel' => 'Wellness-Wochenende',
                'beschreibung' => 'Erholung und Entspannung in der Natur',
                'start_datum' => Carbon::now()->startOfMonth()->addDays(2),
                'end_datum' => Carbon::now()->startOfMonth()->addDays(4),
                'status' => 'gebucht',
            ],

            // Aktueller Monat - zweite Woche
            [
                'user_email' => 'fischer@example.com',
                'titel' => 'Kindergeburtstag',
                'beschreibung' => 'Tolle Geburtstagsfeier für unseren Sohn',
                'start_datum' => Carbon::now()->startOfMonth()->addDays(8),
                'end_datum' => Carbon::now()->startOfMonth()->addDays(10),
                'status' => 'gebucht',
            ],

            // Aktueller Monat - dritte Woche
            [
                'user_email' => 'bauer@example.com',
                'titel' => 'Kurzer Städtetrip',
                'beschreibung' => 'Basis für Ausflüge in die Umgebung',
                'start_datum' => Carbon::now()->startOfMonth()->addDays(15),
                'end_datum' => Carbon::now()->startOfMonth()->addDays(17),
                'status' => 'reserviert',
            ],

            // Aktueller Monat - vierte Woche
            [
                'user_email' => 'wagner@example.com',
                'titel' => 'Monatsende-Auszeit',
                'beschreibung' => 'Ruhe und Entspannung zum Monatsende',
                'start_datum' => Carbon::now()->endOfMonth()->subDays(3),
                'end_datum' => Carbon::now()->endOfMonth()->subDays(1),
                'status' => 'gebucht',
            ],

            // Nächster Monat - erste Woche
            [
                'user_email' => 'hoffmann@example.com',
                'titel' => 'Sommerferien Start',
                'beschreibung' => 'Begin der Sommerferien mit der Familie',
                'start_datum' => Carbon::now()->addMonth()->startOfMonth()->addDays(5),
                'end_datum' => Carbon::now()->addMonth()->startOfMonth()->addDays(12),
                'status' => 'gebucht',
            ],

            // Nächster Monat - dritte Woche
            [
                'user_email' => 'klein@example.com',
                'titel' => 'Business Retreat',
                'beschreibung' => 'Ruhiger Ort für wichtige Geschäftsmeetings',
                'start_datum' => Carbon::now()->addMonth()->startOfMonth()->addDays(20),
                'end_datum' => Carbon::now()->addMonth()->startOfMonth()->addDays(23),
                'status' => 'reserviert',
            ],

            // Nächster Monat - letzte Woche
            [
                'user_email' => 'mueller@example.com',
                'titel' => 'Hochzeitstag Feier',
                'beschreibung' => 'Romantisches Wochenende zum Hochzeitstag',
                'start_datum' => Carbon::now()->addMonth()->endOfMonth()->subDays(4),
                'end_datum' => Carbon::now()->addMonth()->endOfMonth()->subDays(2),
                'status' => 'gebucht',
            ],

            // Übernächster Monat - zweite Woche
            [
                'user_email' => 'weber@example.com',
                'titel' => 'Herbstspaziergang',
                'beschreibung' => 'Goldener Herbst in der Hütte genießen',
                'start_datum' => Carbon::now()->addMonths(2)->startOfMonth()->addDays(10),
                'end_datum' => Carbon::now()->addMonths(2)->startOfMonth()->addDays(13),
                'status' => 'reserviert',
            ],

            // Übernächster Monat - vierte Woche
            [
                'user_email' => 'fischer@example.com',
                'titel' => 'Jahresabschluss',
                'beschreibung' => 'Besinnliche Zeit zum Jahresende',
                'start_datum' => Carbon::now()->addMonths(2)->endOfMonth()->subDays(5),
                'end_datum' => Carbon::now()->addMonths(2)->endOfMonth()->subDays(2),
                'status' => 'reserviert',
            ],

            // Weit in der Zukunft - Dezember
            [
                'user_email' => 'bauer@example.com',
                'titel' => 'Weihnachtsferien',
                'beschreibung' => 'Besinnliche Weihnachtszeit in der Hütte',
                'start_datum' => Carbon::now()->addMonths(5)->startOfMonth()->addDays(20),
                'end_datum' => Carbon::now()->addMonths(5)->startOfMonth()->addDays(27),
                'status' => 'reserviert',
            ],

            // Eine stornierte Buchung - aktueller Monat
            [
                'user_email' => 'wagner@example.com',
                'titel' => 'Abgesagter Termin',
                'beschreibung' => 'Leider mussten wir stornieren',
                'start_datum' => Carbon::now()->startOfMonth()->addDays(25),
                'end_datum' => Carbon::now()->startOfMonth()->addDays(27),
                'status' => 'reserviert',
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
                    'status' => $bookingData['status'],
                ]);
            }
        }

        $totalBookings = Booking::count();
        $this->command->info("Buchungen erstellt. Gesamt: {$totalBookings} Buchungen in der Datenbank.");
        
        // Zeige eine Übersicht der Buchungen
        $this->command->info("\nBuchungsübersicht:");
        $bookings = Booking::orderBy('start_datum')->get();
        foreach ($bookings as $booking) {
            $this->command->line("- {$booking->titel}: {$booking->start_datum->format('d.m.Y')} - {$booking->end_datum->format('d.m.Y')} ({$booking->status->value})");
        }
    }
}