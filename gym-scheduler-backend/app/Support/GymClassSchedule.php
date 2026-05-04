<?php

namespace App\Support;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class GymClassSchedule
{
    public static function parseDateString(?string $value): ?Carbon
    {
        $value = trim((string) $value);
        if ($value === '') {
            return null;
        }

        if (preg_match('/^(\d{4})-(\d{1,2})-(\d{1,2})$/', $value, $matches)) {
            return Carbon::create((int) $matches[1], (int) $matches[2], (int) $matches[3])->startOfDay();
        }

        if (preg_match('/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/', $value, $matches)) {
            return Carbon::create((int) $matches[3], (int) $matches[2], (int) $matches[1])->startOfDay();
        }

        try {
            return Carbon::parse($value)->startOfDay();
        } catch (\Throwable $th) {
            return null;
        }
    }

    public static function parseTimeString(?string $value): ?array
    {
        $value = trim((string) $value);
        if ($value === '') {
            return null;
        }

        if (!preg_match('/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i', $value, $matches)) {
            return null;
        }

        $hour = (int) $matches[1];
        $minute = (int) $matches[2];
        $meridiem = strtoupper($matches[3] ?? '');

        if ($meridiem === 'AM') {
            if ($hour === 12) {
                $hour = 0;
            }
        } elseif ($meridiem === 'PM' && $hour < 12) {
            $hour += 12;
        }

        if ($hour > 23 || $minute > 59) {
            return null;
        }

        return [$hour, $minute];
    }

    public static function durationMinutes($duration): int
    {
        if (is_numeric($duration)) {
            return max(0, (int) $duration);
        }

        if (preg_match('/\d+/', (string) $duration, $matches)) {
            return max(0, (int) $matches[0]);
        }

        return 0;
    }

    public static function occurrenceWindow(string $dateStr, string $timeStr, $duration, ?Carbon $now = null): ?array
    {
        $date = self::parseDateString($dateStr);
        $time = self::parseTimeString($timeStr);
        $minutes = self::durationMinutes($duration);

        if (!$date || !$time || $minutes <= 0) {
            return null;
        }

        $start = $date->copy()->setTime($time[0], $time[1], 0);
        $end = $start->copy()->addMinutes($minutes);

        return [$start, $end];
    }

    public static function isOccurrenceActive(string $dateStr, string $timeStr, $duration, ?Carbon $now = null): bool
    {
        $window = self::occurrenceWindow($dateStr, $timeStr, $duration, $now);
        if (!$window) {
            return false;
        }

        [$start, $end] = $window;
        $now = $now ?: now();

        return $now->lt($end);
    }

    public static function activeDays(?string $days, string $timeStr, $duration, ?Carbon $now = null): array
    {
        $now = $now ?: now();
        $items = array_filter(array_map('trim', explode(',', (string) $days)));
        $active = [];

        foreach ($items as $item) {
            if (self::isOccurrenceActive($item, $timeStr, $duration, $now)) {
                $date = self::parseDateString($item);
                $active[] = $date ? $date->format('d-m-Y') : $item;
            }
        }

        return array_values(array_unique($active));
    }

    public static function cleanupExpiredClasses(?Carbon $now = null): int
    {
        $now = $now ?: now();
        $deleted = 0;
        $classes = DB::table('gym_classes')->get();

        foreach ($classes as $class) {
            $activeDays = self::activeDays($class->days ?? '', $class->time ?? '', $class->duration ?? 0, $now);

            if (empty($activeDays)) {
                DB::table('gym_classes')->where('id', $class->id)->delete();
                $deleted++;
                continue;
            }

            $normalizedDays = implode(', ', $activeDays);
            if (($class->days ?? '') !== $normalizedDays) {
                DB::table('gym_classes')
                    ->where('id', $class->id)
                    ->update([
                        'days' => $normalizedDays,
                        'updated_at' => $now,
                    ]);
            }
        }

        return $deleted;
    }
}