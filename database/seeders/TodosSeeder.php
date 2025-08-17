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
                'titel' => 'Website-Design überarbeiten',
                'beschreibung' => 'Das aktuelle Design der Website sollte modernisiert werden. Neue Farbpalette und Layout-Struktur implementieren.',
                'prioritaet' => 3,
                'faelligkeitsdatum' => now()->addDays(7),
                'status' => 'offen',
            ],
            [
                'titel' => 'Datenbank-Backup erstellen',
                'beschreibung' => 'Regelmäßiges Backup der Datenbank für Sicherheitszwecke.',
                'prioritaet' => 2,
                'faelligkeitsdatum' => now()->addDays(3),
                'status' => 'offen',
            ],
            [
                'titel' => 'API-Dokumentation aktualisieren',
                'beschreibung' => 'Die API-Dokumentation ist veraltet und muss auf den neuesten Stand gebracht werden.',
                'prioritaet' => 2,
                'faelligkeitsdatum' => now()->addDays(14),
                'status' => 'offen',
            ],
            [
                'titel' => 'Unit-Tests schreiben',
                'beschreibung' => 'Für die neuen Features müssen entsprechende Unit-Tests erstellt werden.',
                'prioritaet' => 1,
                'faelligkeitsdatum' => now()->addDays(21),
                'status' => 'offen',
            ],
            [
                'titel' => 'Server-Monitoring einrichten',
                'beschreibung' => 'Monitoring-Tools für Server-Performance und -Sicherheit installieren.',
                'prioritaet' => 3,
                'faelligkeitsdatum' => now()->addDays(5),
                'status' => 'erledigt',
                'completed_at' => now()->subDays(2),
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
                    'kommentar' => $this->getRandomComment(),
                ]);
            }
        }

        $this->command->info('To-Dos erfolgreich erstellt!');
        $this->command->info('Erstellte To-Dos: '.count($todos));
        $this->command->info('Erstellte Kommentare: '.TodoComment::count());
    }

    private function getRandomComment(): string
    {
        $comments = [
            'Gute Idee! Das sollte priorisiert werden.',
            'Ich arbeite gerade daran.',
            'Kann ich dabei helfen?',
            'Das ist bereits in Bearbeitung.',
            'Sehr wichtig für das Projekt.',
            'Sollte bis Ende der Woche fertig sein.',
            'Benötige weitere Informationen dazu.',
            'Perfekt, das ist genau was wir brauchen.',
            'Können wir das nächste Woche besprechen?',
            'Das ist ein guter Ansatz.',
        ];

        return $comments[array_rand($comments)];
    }
}
