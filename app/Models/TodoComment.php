<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TodoComment extends Model
{
    use HasFactory;
    protected $fillable = [
        'todo_id',
        'user_id',
        'parent_id',
        'kommentar',
        'edited_at',
        'edited_by',
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

    public function parent(): BelongsTo
    {
        return $this->belongsTo(TodoComment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(TodoComment::class, 'parent_id');
    }

    public function editedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'edited_by');
    }

    // Scopes
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeReplies($query)
    {
        return $query->whereNotNull('parent_id');
    }

    // Accessors
    public function getFormattedCreatedAtAttribute(): string
    {
        return $this->created_at->format('d.m.Y H:i');
    }

    public function getFormattedEditedAtAttribute(): string
    {
        return $this->edited_at?->format('d.m.Y H:i');
    }

    public function getIsReplyAttribute(): bool
    {
        return !is_null($this->parent_id);
    }

    public function getCanHaveRepliesAttribute(): bool
    {
        return is_null($this->parent_id);
    }

    public function getIsEditedAttribute(): bool
    {
        return !is_null($this->edited_at);
    }

    public function getCanBeEditedAttribute(): bool
    {
        return is_null($this->parent_id); // Nur Hauptkommentare können bearbeitet werden
    }
}
