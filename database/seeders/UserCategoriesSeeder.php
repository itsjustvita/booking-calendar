<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserCategory;
use Illuminate\Database\Seeder;

class UserCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        if (!$admin) {
            $admin = User::factory()->create(['role' => 'admin']);
        }

        $categories = [
            [
                'name' => 'Familie',
                'color' => '#3B82F6',
                'description' => 'Familienmitglieder und Verwandte',
            ],
            [
                'name' => 'Freunde',
                'color' => '#10B981',
                'description' => 'Freunde und Bekannte',
            ],
            [
                'name' => 'Geschäftlich',
                'color' => '#F59E0B',
                'description' => 'Geschäftspartner und Kunden',
            ],
            [
                'name' => 'VIP',
                'color' => '#8B5CF6',
                'description' => 'Wichtige Gäste und VIPs',
            ],
            [
                'name' => 'Regulär',
                'color' => '#6B7280',
                'description' => 'Reguläre Benutzer',
            ],
        ];

        foreach ($categories as $categoryData) {
            UserCategory::create([
                ...$categoryData,
                'created_by' => $admin->id,
            ]);
        }
    }
}
