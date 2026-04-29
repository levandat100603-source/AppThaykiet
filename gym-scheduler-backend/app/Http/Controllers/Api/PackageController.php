<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PackageController extends Controller
{
    
    public function index()
    {
        
        
        $packages = DB::table('packages')
            ->where('status', 'active')
            ->orderBy('price', 'asc')
            ->get();

        return response()->json($packages);
    }
}
