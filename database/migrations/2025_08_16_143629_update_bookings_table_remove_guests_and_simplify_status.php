<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Zuerst den Index löschen
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'status']);
        });
        
        Schema::table('bookings', function (Blueprint $table) {
            // Dann die Spalten löschen
            $table->dropColumn('status');
            $table->dropColumn('gast_anzahl');
        });
        
        Schema::table('bookings', function (Blueprint $table) {
            // Neue status Spalte mit nur zwei Optionen hinzufügen
            $table->enum('status', ['reserviert', 'gebucht'])->default('reserviert')->after('end_datum');
        });
        
        // Index wieder hinzufügen
        Schema::table('bookings', function (Blueprint $table) {
            $table->index(['user_id', 'status']);
        });
        
        // Alle bestehenden Bookings aktualisieren
        DB::table('bookings')->update([
            'status' => 'reserviert'
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Index löschen
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'status']);
        });
        
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->integer('gast_anzahl')->default(1)->after('end_datum');
        });
        
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('pending')->after('gast_anzahl');
        });
        
        // Index wieder hinzufügen
        Schema::table('bookings', function (Blueprint $table) {
            $table->index(['user_id', 'status']);
        });
    }
};