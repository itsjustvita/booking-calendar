<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class GuestUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $guestUsers = [
            [
                'name' => 'Familie Müller',
                'email' => 'mueller@example.com',
                'password' => Hash::make('password'),
                'role' => UserRole::GUEST,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Andreas Schmidt',
                'email' => 'schmidt@example.com',
                'password' => Hash::make('password'),
                'role' => UserRole::GUEST,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Lisa Weber',
                'email' => 'weber@example.com',
                'password' => Hash::make('password'),
                'role' => UserRole::GUEST,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Familie Fischer',
                'email' => 'fischer@example.com',
                'password' => Hash::make('password'),
                'role' => UserRole::GUEST,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Thomas Bauer',
                'email' => 'bauer@example.com',
                'password' => Hash::make('password'),
                'role' => UserRole::GUEST,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Sabine Wagner',
                'email' => 'wagner@example.com',
                'password' => Hash::make('password'),
                'role' => UserRole::GUEST,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Familie Hoffmann',
                'email' => 'hoffmann@example.com',
                'password' => Hash::make('password'),
                'role' => UserRole::GUEST,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Markus Klein',
                'email' => 'klein@example.com',
                'password' => Hash::make('password'),
                'role' => UserRole::GUEST,
                'email_verified_at' => now(),
            ],
        ];

        foreach ($guestUsers as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        $this->command->info('Gast-User erstellt: ' . count($guestUsers) . ' Benutzer');
    }
}
