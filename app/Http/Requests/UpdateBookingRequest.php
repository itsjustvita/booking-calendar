<?php

namespace App\Http\Requests;

use App\Models\Booking;
use App\Models\BookingStatus;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
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
            'start_datum' => 'required|date|after_or_equal:today',
            'end_datum' => 'required|date|after:start_datum',
            'anreise_zeit' => 'required|in:morning,afternoon',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'titel.required' => 'Der Titel ist erforderlich.',
            'titel.max' => 'Der Titel darf maximal 255 Zeichen lang sein.',
            'beschreibung.max' => 'Die Beschreibung darf maximal 1000 Zeichen lang sein.',
            'start_datum.required' => 'Das Anreisedatum ist erforderlich.',
            'start_datum.date' => 'Das Anreisedatum muss ein gültiges Datum sein.',
            'start_datum.after_or_equal' => 'Das Anreisedatum muss heute oder in der Zukunft liegen.',
            'end_datum.required' => 'Das Abreisedatum ist erforderlich.',
            'end_datum.date' => 'Das Abreisedatum muss ein gültiges Datum sein.',
            'end_datum.after' => 'Das Abreisedatum muss nach dem Anreisedatum liegen.',
            'anreise_zeit.required' => 'Die Anreisezeit ist erforderlich.',
            'anreise_zeit.in' => 'Die Anreisezeit muss entweder "morning" oder "afternoon" sein.',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $startDate = Carbon::parse($this->start_datum);
            $endDate = Carbon::parse($this->end_datum);

            // Eigene Buchung beim Update ausschließen
            $bookingId = $this->route('booking')?->id;

            // Echt-Überschneidung (Grenzwerte erlaubt)
            $overlappingBookings = Booking::query()
                ->where('id', '!=', $bookingId)
                ->whereIn('status', [BookingStatus::RESERVIERT->value, BookingStatus::GEBUCHT->value])
                ->where(function ($q) use ($startDate, $endDate) {
                    $q->where('start_datum', '<', $endDate)
                      ->where('end_datum', '>', $startDate);
                })
                ->exists();

            if ($overlappingBookings) {
                $validator->errors()->add('start_datum', 'Für diesen Zeitraum liegt bereits eine Buchung vor. Überschneidungen sind nicht erlaubt.');
            }
        });
    }
}
