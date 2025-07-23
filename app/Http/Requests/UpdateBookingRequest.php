<?php

namespace App\Http\Requests;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $booking = $this->route('booking');
        return auth()->check() && 
               (auth()->user()->isAdmin() || auth()->user()->id === $booking->user_id);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titel' => 'required|string|max:255',
            'beschreibung' => 'nullable|string|max:1000',
            'start_datum' => 'required|date',
            'end_datum' => 'required|date|after_or_equal:start_datum',
            'gast_anzahl' => 'required|integer|min:1|max:20',
            'status' => 'sometimes|in:pending,confirmed,cancelled',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'titel.required' => 'Der Titel ist erforderlich.',
            'titel.max' => 'Der Titel darf nicht länger als 255 Zeichen sein.',
            'beschreibung.max' => 'Die Beschreibung darf nicht länger als 1000 Zeichen sein.',
            'start_datum.required' => 'Das Startdatum ist erforderlich.',
            'start_datum.date' => 'Das Startdatum muss ein gültiges Datum sein.',
            'end_datum.required' => 'Das Enddatum ist erforderlich.',
            'end_datum.date' => 'Das Enddatum muss ein gültiges Datum sein.',
            'end_datum.after_or_equal' => 'Das Enddatum muss nach oder am Startdatum liegen.',
            'gast_anzahl.required' => 'Die Anzahl der Gäste ist erforderlich.',
            'gast_anzahl.integer' => 'Die Anzahl der Gäste muss eine Zahl sein.',
            'gast_anzahl.min' => 'Mindestens 1 Gast ist erforderlich.',
            'gast_anzahl.max' => 'Maximal 20 Gäste sind erlaubt.',
            'status.in' => 'Der Status ist ungültig.',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'titel' => 'Titel',
            'beschreibung' => 'Beschreibung',
            'start_datum' => 'Startdatum',
            'end_datum' => 'Enddatum',
            'gast_anzahl' => 'Anzahl Gäste',
            'status' => 'Status',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $booking = $this->route('booking');
            $startDate = Carbon::parse($this->start_datum);
            $endDate = Carbon::parse($this->end_datum);

            // Check for overlapping bookings (exclude current booking)
            $overlappingBookings = Booking::confirmed()
                ->where('id', '!=', $booking->id)
                ->where(function ($query) use ($startDate, $endDate) {
                    $query->where(function ($q) use ($startDate, $endDate) {
                        // Complete overlap
                        $q->where('start_datum', '<', $startDate)
                          ->where('end_datum', '>', $endDate);
                    })->orWhere(function ($q) use ($startDate, $endDate) {
                        // Start date conflict (but not on departure day)
                        $q->where('start_datum', '<=', $startDate)
                          ->where('end_datum', '>', $startDate);
                    })->orWhere(function ($q) use ($startDate, $endDate) {
                        // End date conflict (but not on arrival day)
                        $q->where('start_datum', '<', $endDate)
                          ->where('end_datum', '>=', $endDate);
                    });
                })
                ->exists();

            if ($overlappingBookings) {
                $validator->errors()->add('start_datum', 'Für diesen Zeitraum liegt bereits eine bestätigte Buchung vor.');
            }

            // Only admin can change status
            if ($this->has('status') && !auth()->user()->isAdmin()) {
                $validator->errors()->add('status', 'Sie haben keine Berechtigung, den Status zu ändern.');
            }

            // Don't allow changing past bookings (unless admin)
            if (!auth()->user()->isAdmin() && $startDate->isPast()) {
                $validator->errors()->add('start_datum', 'Vergangene Buchungen können nicht bearbeitet werden.');
            }
        });
    }
}
