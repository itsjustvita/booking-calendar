<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserCategory>
 */
class UserCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $colors = [
            '#3B82F6', // Blau
            '#EF4444', // Rot
            '#10B981', // Grün
            '#F59E0B', // Orange
            '#8B5CF6', // Lila
            '#EC4899', // Pink
            '#06B6D4', // Cyan
            '#84CC16', // Lime
            '#F97316', // Orange
            '#6366F1', // Indigo
        ];

        return [
            'name' => fake()->unique()->words(2, true),
            'color' => fake()->randomElement($colors),
            'description' => fake()->optional()->sentence(),
            'created_by' => User::factory(),
        ];
    }
}
