<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('todos', function (Blueprint $table) {
            $table->id();
            $table->string('titel');
            $table->text('beschreibung')->nullable();
            $table->enum('status', ['offen', 'erledigt'])->default('offen');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('completed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('completed_at')->nullable();
            $table->integer('prioritaet')->default(1); // 1 = niedrig, 2 = mittel, 3 = hoch
            $table->date('faelligkeitsdatum')->nullable();
            $table->timestamps();

            $table->index(['status', 'prioritaet']);
            $table->index(['created_by', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('todos');
    }
};
