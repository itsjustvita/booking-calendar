<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TodoComment extends Model
{
    use HasFactory;
    protected $fillable = [
        'todo_id',
        'user_id',
        'kommentar',
    ];

    // Beziehungen
    public function todo(): BelongsTo
    {
        return $this->belongsTo(Todo::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Accessors
    public function getFormattedCreatedAtAttribute(): string
    {
        return $this->created_at->format('d.m.Y H:i');
    }
}
