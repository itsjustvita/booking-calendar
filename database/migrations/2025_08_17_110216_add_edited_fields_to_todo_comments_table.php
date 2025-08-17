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
        Schema::table('todo_comments', function (Blueprint $table) {
            $table->timestamp('edited_at')->nullable()->after('created_at');
            $table->foreignId('edited_by')->nullable()->after('edited_at')->constrained('users')->onDelete('set null');
            $table->index(['edited_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('todo_comments', function (Blueprint $table) {
            $table->dropForeign(['edited_by']);
            $table->dropIndex(['edited_at']);
            $table->dropColumn(['edited_at', 'edited_by']);
        });
    }
};
