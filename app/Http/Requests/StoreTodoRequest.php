<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTodoRequest extends FormRequest
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
            'prioritaet' => 'required|integer|in:1,2,3',
            'faelligkeitsdatum' => 'nullable|date|after_or_equal:today',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'titel.required' => 'Der Titel ist erforderlich.',
            'titel.max' => 'Der Titel darf maximal 255 Zeichen lang sein.',
            'beschreibung.max' => 'Die Beschreibung darf maximal 1000 Zeichen lang sein.',
            'prioritaet.required' => 'Die Priorität ist erforderlich.',
            'prioritaet.in' => 'Die Priorität muss 1, 2 oder 3 sein.',
            'faelligkeitsdatum.date' => 'Das Fälligkeitsdatum muss ein gültiges Datum sein.',
            'faelligkeitsdatum.after_or_equal' => 'Das Fälligkeitsdatum muss heute oder in der Zukunft liegen.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'titel' => 'Titel',
            'beschreibung' => 'Beschreibung',
            'prioritaet' => 'Priorität',
            'faelligkeitsdatum' => 'Fälligkeitsdatum',
        ];
    }
}
