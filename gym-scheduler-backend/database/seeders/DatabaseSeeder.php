<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\Hash; 
use App\Models\User;


class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        
        User::create([
            'name' => 'Quản Trị Viên',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('123456'), 
            'role' => 'admin',
        ]);

        
        User::create([
            'name' => 'Hội Viên Mẫu',
            'email' => 'user@gmail.com',
            'password' => Hash::make('123456'),
            'role' => 'user',
        ]);

        
    }
}
