<?php

namespace Database\Seeders;

use App\Models\Todo;
use App\Models\TodoComment;
use App\Models\User;
use Illuminate\Database\Seeder;

class TodosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->info('Keine Benutzer gefunden. Bitte führen Sie zuerst den DatabaseSeeder aus.');

            return;
        }

        $todos = [
            [
                'titel' => 'Klopapier nachkaufen',
                'beschreibung' => 'Das Klopapier in den Badezimmern ist fast aufgebraucht. Neue Packungen besorgen und in den Schränken verstauen.',
                'prioritaet' => 3,
                'faelligkeitsdatum' => now()->addDays(2),
                'status' => 'offen',
            ],
            [
                'titel' => 'Bettwäsche waschen',
                'beschreibung' => 'Alle benutzten Bettwäsche-Sets sammeln und waschen. Neue Bettwäsche für die Betten bereitstellen.',
                'prioritaet' => 2,
                'faelligkeitsdatum' => now()->addDays(1),
                'status' => 'offen',
            ],
            [
                'titel' => 'Holz für Kamin nachlegen',
                'beschreibung' => 'Der Holzvorrat im Schuppen ist niedrig. Neues Brennholz besorgen und trocken lagern.',
                'prioritaet' => 2,
                'faelligkeitsdatum' => now()->addDays(3),
                'status' => 'offen',
            ],
            [
                'titel' => 'Kühlschrank reinigen',
                'beschreibung' => 'Den Kühlschrank gründlich reinigen und abgelaufene Lebensmittel entsorgen. Neue Vorräte organisieren.',
                'prioritaet' => 1,
                'faelligkeitsdatum' => now()->addDays(5),
                'status' => 'offen',
            ],
            [
                'titel' => 'Handtücher auffrischen',
                'beschreibung' => 'Alle Handtücher waschen und neue Handtücher für die Gäste bereitstellen.',
                'prioritaet' => 2,
                'faelligkeitsdatum' => now()->addDays(1),
                'status' => 'erledigt',
                'completed_at' => now()->subDays(1),
            ],
            [
                'titel' => 'Gartenpflege',
                'beschreibung' => 'Rasen mähen, Blumen gießen und Gartenmöbel reinigen. Terrasse fegen.',
                'prioritaet' => 1,
                'faelligkeitsdatum' => now()->addDays(7),
                'status' => 'offen',
            ],
            [
                'titel' => 'Spülmaschine reparieren',
                'beschreibung' => 'Die Spülmaschine macht seltsame Geräusche. Techniker kontaktieren und Reparatur vereinbaren.',
                'prioritaet' => 3,
                'faelligkeitsdatum' => now()->addDays(1),
                'status' => 'offen',
            ],
            [
                'titel' => 'Vorratskammer aufräumen',
                'beschreibung' => 'Die Vorratskammer ist unordentlich. Lebensmittel sortieren und abgelaufene Produkte entsorgen.',
                'prioritaet' => 1,
                'faelligkeitsdatum' => now()->addDays(4),
                'status' => 'offen',
            ],
            [
                'titel' => 'Badezimmer reinigen',
                'beschreibung' => 'Alle Badezimmer gründlich reinigen. Duschvorhänge waschen und neue Seife bereitstellen.',
                'prioritaet' => 2,
                'faelligkeitsdatum' => now()->addDays(2),
                'status' => 'offen',
            ],
            [
                'titel' => 'WLAN-Passwort ändern',
                'beschreibung' => 'Das WLAN-Passwort ist seit Monaten gleich. Aus Sicherheitsgründen ein neues Passwort setzen.',
                'prioritaet' => 2,
                'faelligkeitsdatum' => now()->addDays(3),
                'status' => 'offen',
            ],
            [
                'titel' => 'Gästebuch aktualisieren',
                'beschreibung' => 'Neue Seiten ins Gästebuch einlegen und alte Einträge digitalisieren.',
                'prioritaet' => 1,
                'faelligkeitsdatum' => now()->addDays(10),
                'status' => 'offen',
            ],
            [
                'titel' => 'Schlüssel organisieren',
                'beschreibung' => 'Alle Ersatzschlüssel sortieren und beschriften. Schlüsselbox überprüfen.',
                'prioritaet' => 1,
                'faelligkeitsdatum' => now()->addDays(6),
                'status' => 'offen',
            ],
        ];

        foreach ($todos as $todoData) {
            $creator = $users->random();
            $completedBy = null;

            if (isset($todoData['completed_at'])) {
                $completedBy = $users->random();
            }

            $todo = Todo::create([
                'titel' => $todoData['titel'],
                'beschreibung' => $todoData['beschreibung'],
                'prioritaet' => $todoData['prioritaet'],
                'faelligkeitsdatum' => $todoData['faelligkeitsdatum'],
                'status' => $todoData['status'],
                'created_by' => $creator->id,
                'completed_by' => $completedBy?->id,
                'completed_at' => $todoData['completed_at'] ?? null,
            ]);

            // Kommentare hinzufügen
            $commentCount = rand(0, 3);
            for ($i = 0; $i < $commentCount; $i++) {
                $commentUser = $users->random();
                TodoComment::create([
                    'todo_id' => $todo->id,
                    'user_id' => $commentUser->id,
                    'kommentar' => $this->getRandomHuettenComment(),
                ]);
            }
        }

        $this->command->info('Hüttenspezifische To-Dos erfolgreich erstellt!');
        $this->command->info('Erstellte To-Dos: '.count($todos));
        $this->command->info('Erstellte Kommentare: '.TodoComment::count());
    }

    private function getRandomHuettenComment(): string
    {
        $comments = [
            'Das ist wirklich wichtig für die Gäste!',
            'Sollte ich heute noch erledigen.',
            'Kann ich dabei helfen?',
            'Das ist bereits in Bearbeitung.',
            'Sehr wichtig für die Hütte.',
            'Sollte bis morgen fertig sein.',
            'Benötige weitere Informationen dazu.',
            'Perfekt, das ist genau was wir brauchen.',
            'Können wir das nächste Woche besprechen?',
            'Das ist ein guter Ansatz.',
            'Gäste werden das zu schätzen wissen.',
            'Sollte priorisiert werden.',
            'Ich kümmere mich darum.',
            'Das ist für die nächsten Gäste wichtig.',
            'Kann ich das morgen machen?',
        ];

        return $comments[array_rand($comments)];
    }
}
