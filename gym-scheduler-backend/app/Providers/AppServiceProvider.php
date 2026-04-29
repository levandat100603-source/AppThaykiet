<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema; 
use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends ServiceProvider
{
    
    public function register(): void
    {
        
    }

    
    public function boot(): void
    {
        Schema::defaultStringLength(191); 

        Gate::define('admin-access', function ($user) {
            return $user?->role === 'admin';
        });

        Gate::define('manage-trainer-bookings', function ($user) {
            return in_array($user?->role, ['admin', 'trainer'], true);
        });
    }
}

