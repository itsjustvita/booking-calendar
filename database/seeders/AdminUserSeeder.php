<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder{
    /**
     * Run the database seeds.
     */
    public function run(): void  {
        // Create admin user if not exists
        User::firstOrCreate(
            ['email' => 'admin@huettenapp.de'],
            [
                'name' => 'Administrator',
                'email' => 'admin@huettenapp.de',
                'password' => Hash::make('password'),
                'role' => UserRole::ADMIN,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Admin user created: admin@huettenapp.de (password: password)');
    }
}
