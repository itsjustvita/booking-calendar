<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'color',
        'description',
        'created_by',
    ];

    // Beziehungen
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'category_id');
    }

    // Accessors
    public function getFormattedColorAttribute(): string
    {
        return $this->color;
    }

    public function getTextColorAttribute(): string
    {
        // Berechne die Helligkeit der Farbe für optimale Textfarbe
        $hex = ltrim($this->color, '#');
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));
        
        $brightness = (($r * 299) + ($g * 587) + ($b * 114)) / 1000;
        
        return $brightness > 128 ? '#000000' : '#ffffff';
    }

    public function getUsersCountAttribute(): int
    {
        return $this->users()->count();
    }
}
