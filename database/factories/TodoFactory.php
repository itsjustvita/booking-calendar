<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Todo>
 */
class TodoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'titel' => fake()->sentence(3),
            'beschreibung' => fake()->paragraph(),
            'status' => fake()->randomElement(['offen', 'erledigt']),
            'prioritaet' => fake()->randomElement([1, 2, 3]),
            'faelligkeitsdatum' => fake()->optional()->dateTimeBetween('now', '+30 days'),
            'created_by' => User::factory(),
            'completed_by' => null,
            'completed_at' => null,
        ];
    }

    /**
     * Indicate that the todo is open.
     */
    public function offen(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'offen',
            'completed_by' => null,
            'completed_at' => null,
        ]);
    }

    /**
     * Indicate that the todo is completed.
     */
    public function erledigt(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'erledigt',
            'completed_by' => User::factory(),
            'completed_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    /**
     * Indicate that the todo is overdue.
     */
    public function ueberfaellig(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'offen',
            'faelligkeitsdatum' => fake()->dateTimeBetween('-30 days', '-1 day'),
            'completed_by' => null,
            'completed_at' => null,
        ]);
    }
}
