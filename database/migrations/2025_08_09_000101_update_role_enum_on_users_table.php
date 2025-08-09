<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Bestehende Werte angleichen
        DB::table('users')->where('role', 'guest')->update(['role' => 'user']);

        // Datenbank-spezifische Anpassung der Enum-Definition
        $driver = DB::getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'])) {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','user') NOT NULL DEFAULT 'user'");
        }
        // Für SQLite/Postgres keine Änderung nötig, da Laravel intern TEXT/CHECK verwendet;
        // die obenstehende Datenbereinigung reicht aus.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Werte zurücksetzen
        DB::table('users')->where('role', 'user')->update(['role' => 'guest']);

        $driver = DB::getDriverName();
        if (in_array($driver, ['mysql', 'mariadb'])) {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','guest') NOT NULL DEFAULT 'guest'");
        }
    }
};


