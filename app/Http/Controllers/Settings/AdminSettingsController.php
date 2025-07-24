<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingsController extends Controller
{
    /**
     * Show the admin settings page.
     */
    public function edit(Request $request): Response
    {
        $weatherLocation = Cache::get('weather_location', [
            'city' => 'Doren',
            'country' => 'Österreich',
            'coordinates' => [
                'lat' => 47.4500,
                'lon' => 9.8833
            ]
        ]);

        return Inertia::render('settings/admin', [
            'weatherLocation' => $weatherLocation,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the weather location settings.
     */
    public function updateWeatherLocation(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'city' => ['required', 'string', 'max:100'],
            'country' => ['required', 'string', 'max:100'],
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lon' => ['required', 'numeric', 'between:-180,180'],
        ], [
            'city.required' => 'Die Stadt ist erforderlich.',
            'city.max' => 'Der Stadtname darf nicht länger als 100 Zeichen sein.',
            'country.required' => 'Das Land ist erforderlich.',
            'country.max' => 'Der Ländername darf nicht länger als 100 Zeichen sein.',
            'lat.required' => 'Der Breitengrad ist erforderlich.',
            'lat.numeric' => 'Der Breitengrad muss eine Zahl sein.',
            'lat.between' => 'Der Breitengrad muss zwischen -90 und 90 liegen.',
            'lon.required' => 'Der Längengrad ist erforderlich.',
            'lon.numeric' => 'Der Längengrad muss eine Zahl sein.',
            'lon.between' => 'Der Längengrad muss zwischen -180 und 180 liegen.',
        ]);

        $weatherLocation = [
            'city' => $validated['city'],
            'country' => $validated['country'],
            'coordinates' => [
                'lat' => $validated['lat'],
                'lon' => $validated['lon']
            ]
        ];

        // Cache the weather location for 1 year
        Cache::put('weather_location', $weatherLocation, 60 * 24 * 365);

        return to_route('admin.settings.edit')->with('status', 'Wetterstandort erfolgreich aktualisiert.');
    }
} 