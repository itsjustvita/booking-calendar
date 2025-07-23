<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

enum BookingStatus: string
{
    case PENDING = 'pending';
    case CONFIRMED = 'confirmed';
    case CANCELLED = 'cancelled';
}

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'titel',
        'beschreibung',
        'start_datum',
        'end_datum',
        'gast_anzahl',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'start_datum' => 'date',
            'end_datum' => 'date',
            'status' => BookingStatus::class,
            'gast_anzahl' => 'integer',
        ];
    }

    /**
     * Get the user that owns the booking
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the booking status in German
     */
    public function getStatusNameAttribute(): string
    {
        return match($this->status) {
            BookingStatus::PENDING => 'Ausstehend',
            BookingStatus::CONFIRMED => 'Bestätigt',
            BookingStatus::CANCELLED => 'Storniert',
        };
    }

    /**
     * Check if booking is confirmed
     */
    public function isConfirmed(): bool
    {
        return $this->status === BookingStatus::CONFIRMED;
    }

    /**
     * Check if booking is cancelled
     */
    public function isCancelled(): bool
    {
        return $this->status === BookingStatus::CANCELLED;
    }

    /**
     * Check if booking is pending
     */
    public function isPending(): bool
    {
        return $this->status === BookingStatus::PENDING;
    }

    /**
     * Get the duration of the booking in days
     */
    public function getDurationAttribute(): int
    {
        return $this->start_datum->diffInDays($this->end_datum) + 1;
    }

    /**
     * Get formatted date range
     */
    public function getDateRangeAttribute(): string
    {
        $start = $this->start_datum->format('d.m.Y');
        $end = $this->end_datum->format('d.m.Y');
        
        if ($start === $end) {
            return $start;
        }
        
        return "{$start} - {$end}";
    }

    /**
     * Check if this booking overlaps with given dates
     */
    public function overlapsWithDates(Carbon $startDate, Carbon $endDate): bool
    {
        return $this->start_datum <= $endDate && $this->end_datum >= $startDate;
    }

    /**
     * Scope to get bookings for a specific date range
     */
    public function scopeDateRange($query, Carbon $startDate, Carbon $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_datum', [$startDate, $endDate])
              ->orWhereBetween('end_datum', [$startDate, $endDate])
              ->orWhere(function ($q2) use ($startDate, $endDate) {
                  $q2->where('start_datum', '<=', $startDate)
                     ->where('end_datum', '>=', $endDate);
              });
        });
    }

    /**
     * Scope to get confirmed bookings only
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', BookingStatus::CONFIRMED);
    }
}
