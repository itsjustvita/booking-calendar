<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Todo extends Model
{
    use HasFactory;
    protected $fillable = [
        'titel',
        'beschreibung',
        'status',
        'created_by',
        'completed_by',
        'completed_at',
        'prioritaet',
        'faelligkeitsdatum',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'faelligkeitsdatum' => 'date',
        'prioritaet' => 'integer',
    ];

    // Beziehungen
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TodoComment::class)
            ->topLevel()
            ->with(['replies.user', 'user'])
            ->orderBy('created_at', 'desc');
    }

    public function allComments(): HasMany
    {
        return $this->hasMany(TodoComment::class)
            ->with(['replies.user', 'user'])
            ->orderBy('created_at', 'desc');
    }

    // Scopes
    public function scopeOffen($query)
    {
        return $query->where('status', 'offen');
    }

    public function scopeErledigt($query)
    {
        return $query->where('status', 'erledigt');
    }

    public function scopeByPrioritaet($query, $prioritaet)
    {
        return $query->where('prioritaet', $prioritaet);
    }

    // Accessors
    public function getPrioritaetNameAttribute(): string
    {
        return match ($this->prioritaet) {
            1 => 'Niedrig',
            2 => 'Mittel',
            3 => 'Hoch',
            default => 'Unbekannt'
        };
    }

    public function getPrioritaetColorAttribute(): string
    {
        return match ($this->prioritaet) {
            1 => 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            2 => 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            3 => 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            default => 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        };
    }

    public function getStatusNameAttribute(): string
    {
        return match ($this->status) {
            'offen' => 'Offen',
            'erledigt' => 'Erledigt',
            default => 'Unbekannt'
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'offen' => 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            'erledigt' => 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            default => 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        };
    }

    public function getFormattedFaelligkeitsdatumAttribute(): ?string
    {
        return $this->faelligkeitsdatum?->format('d.m.Y');
    }

    public function getFormattedCompletedAtAttribute(): ?string
    {
        return $this->completed_at?->format('d.m.Y H:i');
    }

    public function getIsOverdueAttribute(): bool
    {
        if (! $this->faelligkeitsdatum || $this->status === 'erledigt') {
            return false;
        }

        return $this->faelligkeitsdatum->isPast();
    }

    // Methods
    public function markAsCompleted(User $user): void
    {
        $this->update([
            'status' => 'erledigt',
            'completed_by' => $user->id,
            'completed_at' => now(),
        ]);
    }

    public function markAsOpen(): void
    {
        $this->update([
            'status' => 'offen',
            'completed_by' => null,
            'completed_at' => null,
        ]);
    }

    public function isCompleted(): bool
    {
        return $this->status === 'erledigt';
    }

    public function isOpen(): bool
    {
        return $this->status === 'offen';
    }
}
