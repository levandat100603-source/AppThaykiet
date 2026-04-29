<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;

trait CreatesApplication
{
    public function createApplication()
    {
        // Force test-safe runtime env before config is loaded.
        putenv('APP_ENV=testing');
        putenv('APP_DEBUG=false');
        putenv('APP_CONFIG_CACHE=bootstrap/cache/testing-config.php');
        putenv('APP_ROUTES_CACHE=bootstrap/cache/testing-routes.php');
        putenv('APP_EVENTS_CACHE=bootstrap/cache/testing-events.php');
        putenv('APP_PACKAGES_CACHE=bootstrap/cache/testing-packages.php');
        putenv('APP_SERVICES_CACHE=bootstrap/cache/testing-services.php');
        putenv('CACHE_STORE=array');
        putenv('QUEUE_CONNECTION=sync');
        putenv('SESSION_DRIVER=array');
        putenv('DB_CONNECTION=sqlite');
        putenv('DB_DATABASE=:memory:');
        putenv('MAIL_MAILER=array');

        $_ENV['APP_ENV'] = 'testing';
        $_ENV['APP_DEBUG'] = 'false';
        $_ENV['APP_CONFIG_CACHE'] = 'bootstrap/cache/testing-config.php';
        $_ENV['APP_ROUTES_CACHE'] = 'bootstrap/cache/testing-routes.php';
        $_ENV['APP_EVENTS_CACHE'] = 'bootstrap/cache/testing-events.php';
        $_ENV['APP_PACKAGES_CACHE'] = 'bootstrap/cache/testing-packages.php';
        $_ENV['APP_SERVICES_CACHE'] = 'bootstrap/cache/testing-services.php';
        $_ENV['CACHE_STORE'] = 'array';
        $_ENV['QUEUE_CONNECTION'] = 'sync';
        $_ENV['SESSION_DRIVER'] = 'array';
        $_ENV['DB_CONNECTION'] = 'sqlite';
        $_ENV['DB_DATABASE'] = ':memory:';
        $_ENV['MAIL_MAILER'] = 'array';

        $_SERVER['APP_ENV'] = 'testing';
        $_SERVER['APP_DEBUG'] = 'false';
        $_SERVER['APP_CONFIG_CACHE'] = 'bootstrap/cache/testing-config.php';
        $_SERVER['APP_ROUTES_CACHE'] = 'bootstrap/cache/testing-routes.php';
        $_SERVER['APP_EVENTS_CACHE'] = 'bootstrap/cache/testing-events.php';
        $_SERVER['APP_PACKAGES_CACHE'] = 'bootstrap/cache/testing-packages.php';
        $_SERVER['APP_SERVICES_CACHE'] = 'bootstrap/cache/testing-services.php';
        $_SERVER['CACHE_STORE'] = 'array';
        $_SERVER['QUEUE_CONNECTION'] = 'sync';
        $_SERVER['SESSION_DRIVER'] = 'array';
        $_SERVER['DB_CONNECTION'] = 'sqlite';
        $_SERVER['DB_DATABASE'] = ':memory:';
        $_SERVER['MAIL_MAILER'] = 'array';

        $app = require __DIR__.'/../bootstrap/app.php';

        $app->make(Kernel::class)->bootstrap();

        return $app;
    }
}
