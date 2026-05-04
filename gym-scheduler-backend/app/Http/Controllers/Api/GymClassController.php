<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Support\GymClassSchedule;

class GymClassController extends Controller
{
    
    public function index()
    {
        GymClassSchedule::cleanupExpiredClasses();

        $classes = DB::table('gym_classes')
            ->orderBy('created_at', 'desc') 
            ->get();

        return response()->json($classes, 200);
    }

    
    public function show($id)
    {
        GymClassSchedule::cleanupExpiredClasses();

        $class = DB::table('gym_classes')->where('id', $id)->first();

        if (!$class) {
            return response()->json(['message' => 'Lớp học không tồn tại'], 404);
        }

        return response()->json($class, 200);
    }
}

