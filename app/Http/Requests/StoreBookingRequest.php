<?php

namespace App\Http\Requests;

use App\Models\Booking;
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
            'gast_anzahl' => 'required|integer|min:1|max:20',
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
            
            'gast_anzahl.required' => 'Die Anzahl der Gäste ist erforderlich.',
            'gast_anzahl.integer' => 'Die Anzahl der Gäste muss eine ganze Zahl sein.',
            'gast_anzahl.min' => 'Es muss mindestens 1 Gast angegeben werden.',
            'gast_anzahl.max' => 'Es können maximal 20 Gäste angegeben werden.',
            
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
            'gast_anzahl' => 'Gästeanzahl',
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

            // Check for overlapping bookings (except for arrival/departure days)
            $overlappingBookings = Booking::confirmed()
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
        });
    }
}
