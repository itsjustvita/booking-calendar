<?php

namespace App\Http\Requests;

use App\Models\Booking;
use App\Models\BookingStatus;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
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
            'anreise_zeit' => 'nullable|in:morning,afternoon',
        ];
    }

    /**
     * Get custom validation messages in German
     */
    public function messages(): array
    {
        return [
            'titel.required' => 'Der Titel ist erforderlich.',
            'titel.string' => 'Der Titel muss ein Text sein.',
            'titel.max' => 'Der Titel darf maximal 255 Zeichen lang sein.',
            
            'beschreibung.string' => 'Die Beschreibung muss ein Text sein.',
            'beschreibung.max' => 'Die Beschreibung darf maximal 1000 Zeichen lang sein.',
            
            'start_datum.required' => 'Das Anreisedatum ist erforderlich.',
            'start_datum.date' => 'Das Anreisedatum muss ein gültiges Datum sein.',
            'start_datum.after_or_equal' => 'Das Anreisedatum darf nicht in der Vergangenheit liegen.',
            
            'end_datum.required' => 'Das Abreisedatum ist erforderlich.',
            'end_datum.date' => 'Das Abreisedatum muss ein gültiges Datum sein.',
            'end_datum.after' => 'Das Abreisedatum muss nach dem Anreisedatum liegen.',
            
            'anreise_zeit.in' => 'Die Anreisezeit muss vormittags oder nachmittags sein.',
        ];
    }

    /**
     * Get custom attribute names in German
     */
    public function attributes(): array
    {
        return [
            'titel' => 'Titel',
            'beschreibung' => 'Beschreibung',
            'start_datum' => 'Anreisedatum',
            'end_datum' => 'Abreisedatum',
            'anreise_zeit' => 'Anreisezeit',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $startDate = Carbon::parse($this->start_datum);
            $endDate = Carbon::parse($this->end_datum);

            // Strikte Überschneidungsprüfung: keinerlei Überschneidung erlaubt (inkl. gleicher An-/Abreisetag)
            // Bedingung für Überschneidung: existing.start <= new.end AND existing.end >= new.start
            // Überschneidung nur, wenn sich die Zeiträume echt schneiden (Grenzwerte gelten als erlaubt)
            // Overlap-Formel (echt): existing.start < new.end AND existing.end > new.start
            $overlappingBookings = Booking::query()
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
