FROM php:8.2-cli

WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates git unzip libzip-dev libpq-dev \
    && docker-php-ext-install pdo_mysql zip bcmath \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install --no-dev --optimize-autoloader \
    && php artisan package:discover --ansi \
    && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache \
    && php artisan storage:link \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 10000

CMD sh -c "mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache; php artisan storage:link --force; php artisan optimize:clear; php artisan migrate --force --path=database/migrations/2026_04_13_120000_add_membership_columns_to_users_table.php; php artisan migrate --force --path=database/migrations/2026_04_13_120100_backfill_membership_from_members_to_users.php; php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"