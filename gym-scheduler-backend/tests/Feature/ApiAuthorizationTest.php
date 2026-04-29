<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_admin_data_route(): void
    {
        $this->getJson('/api/admin/data')->assertStatus(401);
    }

    public function test_non_admin_user_cannot_access_admin_data_route(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/admin/data')->assertStatus(403);
    }

    public function test_admin_user_can_access_admin_data_route(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/data')
            ->assertStatus(200)
            ->assertJsonStructure([
                'classes',
                'trainers',
                'packages',
                'members',
                'available_users',
            ]);
    }

    public function test_member_can_save_expo_push_token(): void
    {
        $member = User::factory()->create([
            'role' => 'member',
        ]);

        Sanctum::actingAs($member);

        $this->postJson('/api/member/expo-token', [
            'expo_push_token' => 'ExponentPushToken[abc123xyz]',
        ])
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_normal_user_cannot_manage_trainer_bookings_route(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/bookings/pending')->assertStatus(403);
    }
}
