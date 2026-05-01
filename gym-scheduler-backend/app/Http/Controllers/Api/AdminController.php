<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AdminController extends Controller
{
    private function parseDateFlexible($value)
    {
        if (!$value) return null;
        // Hỗ trợ cả dd/mm/YYYY và YYYY-mm-dd
        if (strpos($value, '-') !== false) {
            return Carbon::createFromFormat('Y-m-d', $value)->format('Y-m-d');
        }
        return Carbon::createFromFormat('d/m/Y', $value)->format('Y-m-d');
    }
    private function toPublicRelativePath($url)
    {
        if (!$url) return null;
        $pos = strpos($url, '/storage/');
        if ($pos === false) return null;
        return substr($url, $pos + strlen('/storage/'));
    }
    
    public function getData()
    {
        
        $classes = [];
        try {
            $classes = DB::table('gym_classes')->orderBy('id', 'desc')->get();
        } catch (\Exception $e) {}

        
        $trainers = [];
        try {
            $trainers = DB::table('trainers')->orderBy('id', 'desc')->get()->map(function ($t) {
                // If user_id is already set, we're good
                if (!empty($t->user_id)) {
                    if (empty($t->image_url) && !empty($t->image)) {
                        $t->image_url = $t->image;
                    }
                    return $t;
                }
                
                // Try to match with user by email
                if (!empty($t->email)) {
                    $user = DB::table('users')
                        ->where('email', $t->email)
                        ->where('role', 'trainer')
                        ->first();
                    if ($user) {
                        $t->user_id = $user->id;
                        if (empty($t->image_url) && !empty($t->image)) {
                            $t->image_url = $t->image;
                        }
                        return $t;
                    }
                }
                
                // Try to match with user by name
                if (!empty($t->name)) {
                    $user = DB::table('users')
                        ->where('name', $t->name)
                        ->where('role', 'trainer')
                        ->first();
                    if ($user) {
                        $t->user_id = $user->id;
                        $t->email = $user->email;
                        $t->phone = $user->phone ?? null;
                    }
                }
                
                // Đảm bảo image_url tồn tại để frontend hiển thị
                if (empty($t->image_url) && !empty($t->image)) {
                    $t->image_url = $t->image;
                }
                return $t;
            });
        } catch (\Exception $e) {}

        
        $packages = [];
        try {
            $packages = DB::table('packages')->orderBy('id', 'desc')->get();
        } catch (\Exception $e) {}

        
        $members = [];
        try {
            $members = DB::table('members')->orderBy('id', 'desc')->get()
                ->unique(function ($m) {
                    $email = trim((string) ($m->email ?? ''));
                    return $email !== '' ? strtolower($email) : 'member-' . $m->id;
                })
                ->values()
                ->map(function ($m) {
                // Nếu chưa có duration, thử lấy từ gói tập (packages.duration)
                $months = (int) filter_var($m->duration ?? '', FILTER_SANITIZE_NUMBER_INT);
                if ($months === 0 && !empty($m->pack)) {
                    $pkg = DB::table('packages')->where('name', $m->pack)->first();
                    if ($pkg && !empty($pkg->duration)) {
                        $months = (int) filter_var($pkg->duration, FILTER_SANITIZE_NUMBER_INT);
                        $m->duration = $pkg->duration;
                    }
                }

                // Nếu end trống, tính từ start + duration
                if (empty($m->end) && !empty($m->start) && $months > 0) {
                    $m->end = Carbon::parse($m->start)->addMonths($months)->format('Y-m-d');
                }
                return $m;
            });
        } catch (\Exception $e) {}

        $trainerSchedules = [];
        $query = DB::table('working_hours as wh')
            ->select([
                'wh.id',
                'wh.trainer_id',
                'wh.day_of_week',
                'wh.start_time',
                'wh.end_time',
                'wh.is_active',
                'trainer_user.name as trainer_name',
                'trainer_user.email as trainer_email',
                'trainer_user.phone as trainer_phone',
                't.id as trainer_record_id',
                't.spec',
            ])
            ->join('users as trainer_user', 'wh.trainer_id', '=', 'trainer_user.id')
            ->leftJoin('trainers as t', 'trainer_user.email', '=', 't.email')
            ->orderBy('wh.day_of_week', 'asc')
            ->orderBy('wh.start_time', 'asc');
        
        $trainerSchedules = $query->get();

        // Danh sách user chưa là member (dùng cho chọn nhanh khi tạo member)
        $availableUsers = [];
        try {
            $memberEmails = DB::table('members')->pluck('email')->filter()->all();
            $availableUsers = DB::table('users')
                ->whereNotIn('email', $memberEmails)
                ->whereIn('role', ['user', 'member'])
                ->orderBy('id', 'desc')
                ->get(['id', 'name', 'email', 'phone']);
        } catch (\Exception $e) {}

        $fetchTable = function (string $table, string $orderBy = 'created_at') {
            try {
                return DB::table($table)->orderBy($orderBy, 'desc')->get();
            } catch (\Exception $e) {
                return collect();
            }
        };

        $timeOffs = $fetchTable('time_offs');
        $sessionNotes = $fetchTable('session_notes');
        $workoutPlans = $fetchTable('workout_plans');
        $waitlistEntries = $fetchTable('waitlist_entries');
        $membershipFreezes = $fetchTable('membership_freezes');
        $memberCards = $fetchTable('member_cards');
        $bookingCancellations = $fetchTable('booking_cancellations');
        $vouchers = $fetchTable('vouchers');
        $pushCampaigns = $fetchTable('push_campaigns');
        $refundRequests = $fetchTable('refund_requests');
        $transactionReports = $fetchTable('transaction_reports');
        $pendingRegistrations = $fetchTable('pending_registrations');
        $trainerEarnings = $fetchTable('trainer_earnings');

        return response()->json([
            'classes' => $classes,
            'trainers' => $trainers,
            'packages' => $packages,
            'members' => $members,
            'trainer_schedules' => $trainerSchedules,
            'available_users' => $availableUsers,
            'time_offs' => $timeOffs,
            'session_notes' => $sessionNotes,
            'workout_plans' => $workoutPlans,
            'waitlist_entries' => $waitlistEntries,
            'membership_freezes' => $membershipFreezes,
            'member_cards' => $memberCards,
            'booking_cancellations' => $bookingCancellations,
            'vouchers' => $vouchers,
            'push_campaigns' => $pushCampaigns,
            'refund_requests' => $refundRequests,
            'transaction_reports' => $transactionReports,
            'pending_registrations' => $pendingRegistrations,
            'trainer_earnings' => $trainerEarnings,
        ]);
    }

    
    public function store(Request $request)
    {
        $type = $request->type;
        $id = $request->id;
        $data = $request->except(['type', 'id', 'image', 'remove_image']); 

        // Loại bỏ các field không cần thiết
        unset($data['id']);

        $tableMap = [
            'classes' => 'gym_classes',
            'trainers' => 'trainers',
            'packages' => 'packages',
            'members' => 'members'
        ];

        if (!isset($tableMap[$type])) return response()->json(['message' => 'Loại không hợp lệ'], 400);
        $table = $tableMap[$type];

        $existingTrainer = null;
        if ($type === 'trainers' && $id) {
            $existingTrainer = DB::table('trainers')->where('id', $id)->first();
        }

        
        
        
        if ($type === 'trainers') {
            $removeImage = $request->boolean('remove_image');

            if ($removeImage && $existingTrainer) {
                $old = $existingTrainer->image_url ?? $existingTrainer->image ?? null;
                if ($old) {
                    $rel = $this->toPublicRelativePath($old);
                    if ($rel) Storage::disk('public')->delete($rel);
                }
                $data['image'] = null;
                if (Schema::hasColumn('trainers', 'image_url')) {
                    $data['image_url'] = null;
                }
            }

            if ($request->hasFile('image')) {
                try {
                    $file = $request->file('image');
                    $filename = 'trainer_' . time() . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('trainers', $filename, 'public');
                   $relativePath = '/storage/' . $path;
                    $data['image'] = $relativePath;
                    if (Schema::hasColumn('trainers', 'image_url')) {
                        $data['image_url'] = $relativePath;
                    }

                    if ($existingTrainer) {
                        $old = $existingTrainer->image_url ?? $existingTrainer->image ?? null;
                        if ($old) {
                            $rel = $this->toPublicRelativePath($old);
                            if ($rel) Storage::disk('public')->delete($rel);
                        }
                    }
                } catch (\Exception $e) {
                    return response()->json(['message' => 'Lỗi khi upload hình ảnh: ' . $e->getMessage()], 400);
                }
            }
        }

        
        
        
        if ($type === 'members') {
            
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
            ];

            // Không cho trùng member theo email (trừ khi đang update chính record đó)
            if ($request->email) {
                $existingMember = DB::table('members')->where('email', $request->email)->first();
                if ($existingMember && (!$id || $existingMember->id != $id)) {
                    return response()->json(['message' => 'Email này đã được gắn với một thành viên khác!'], 400);
                }
            }

            // Chuẩn bị dữ liệu bảng members
            $packageInfo = DB::table('packages')->where('name', $request->pack)->first();
            $price = $packageInfo ? $packageInfo->price : 0;
            $startDate = $this->parseDateFlexible($request->start) ?? now()->format('Y-m-d');
            $durationStr = $request->duration ?? ($packageInfo->duration ?? '0');
            $durationMonths = is_numeric($durationStr) ? (int)$durationStr : (int) filter_var($durationStr, FILTER_SANITIZE_NUMBER_INT);

            $memberData = [
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'pack' => $request->pack,
                'duration' => $durationStr,
                'start' => $startDate,
                'end' => $this->parseDateFlexible($request->end),
                'price' => $price,
                'status' => $request->status ?? 'active',
            ];

            // Nếu end chưa có, tự tính từ start + duration (tháng)
            if (!$memberData['end'] && $durationMonths > 0) {
                $memberData['end'] = Carbon::parse($startDate)->addMonths($durationMonths)->format('Y-m-d');
            }

            // Lấy hoặc tạo user tương ứng (cho phép chọn user chưa là member)
            $existingUser = $request->email ? DB::table('users')->where('email', $request->email)->first() : null;
            if ($existingUser) {
                DB::table('users')->where('id', $existingUser->id)->update(array_merge([
                    'name' => $request->name,
                    'phone' => $request->phone,
                    'updated_at' => now()
                ], []));
            }
            
            if ($id) {
                
                DB::table('members')->where('id', $id)->update(array_merge($memberData, ['updated_at' => now()]));

                // Cập nhật user theo email (nếu có)
                DB::table('users')->where('email', $request->email)->update(array_merge($userData, ['updated_at' => now()]));
                $msg = 'Cập nhật thành viên thành công';
            } else {
                // Tạo user mới nếu chưa tồn tại
                if (!$existingUser) {
                    $userData['password'] = bcrypt(Str::random(16));
                    $userData['created_at'] = now();
                    $userData['role'] = 'member';
                    DB::table('users')->insertGetId($userData);
                }

                // Thêm member record
                DB::table('members')->insert(array_merge($memberData, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));

                $msg = 'Đã thêm hội viên mới thành công!';
            }
            return response()->json(['success' => true, 'message' => $msg]);
        }

        
        
        
        if ($type === 'trainers') {
            
            if (!$id && $request->email) {
                $exists = DB::table('users')->where('email', $request->email)->exists();
                if ($exists) {
                    return response()->json(['message' => 'Email này đã có người sử dụng!'], 400);
                }
            }
            
            $trainerEmail = $request->email;
            
            // Lọc bỏ các field không cần
            unset($data['email']);
            unset($data['remove_image']);
            unset($data['icon']); // Nếu form vẫn gửi icon, bỏ đi

            if ($id) {
                // Update existing trainer - chỉ update những field có giá trị
                $updateData = array_filter($data, function ($v, $key) {
                    if (in_array($key, ['image', 'image_url'])) {
                        return true; // Cho phép set null để xóa ảnh
                    }
                    return !is_null($v) && $v !== '';
                }, ARRAY_FILTER_USE_BOTH);
                if (count($updateData) > 0) {
                    DB::table($table)->where('id', $id)->update($updateData);
                }
                $msg = 'Cập nhật huấn luyện viên thành công';
            } else {
                // Insert new trainer - đảm bảo đủ field bắt buộc
                $data = array_filter($data, fn($v) => !is_null($v) && $v !== '');
                
                if (!isset($data['rating']) || $data['rating'] === '') {
                    $data['rating'] = 5.0;
                }
                if (!isset($data['name']) || $data['name'] === '') {
                    $data['name'] = 'Trainer';
                }
                if (!isset($data['spec']) || $data['spec'] === '') {
                    $data['spec'] = 'Training';
                }
                if (!isset($data['exp']) || $data['exp'] === '') {
                    $data['exp'] = '0 năm';
                }
                if (!isset($data['availability']) || $data['availability'] === '') {
                    $data['availability'] = 'Flexible';
                }
                if (!isset($data['price']) || $data['price'] === '') {
                    $data['price'] = 0;
                }
                
                if ($trainerEmail) {
                    DB::table('users')->insertGetId([
                        'name' => $request->name ?? 'Trainer',
                        'email' => $trainerEmail,
                        'password' => bcrypt(Str::random(16)),
                        'role' => 'trainer',
                        'phone' => $request->phone ?? '',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }

                $data['created_at'] = now();
                DB::table($table)->insert($data);
                
                $msg = 'Thêm huấn luyện viên thành công! Mật khẩu tạm thời đã được tạo ngẫu nhiên để đảm bảo an toàn.';
            }
            
            return response()->json(['success' => true, 'message' => $msg]);
        }

        
        
        
        if ($id) {
            DB::table($table)->where('id', $id)->update($data);
            $msg = 'Cập nhật thành công';
        } else {
            $data['created_at'] = now();
            DB::table($table)->insert($data);
            $msg = 'Thêm mới thành công';
        }

        return response()->json(['success' => true, 'message' => $msg]);
    }

    
    public function delete(Request $request)
    {
        try {
            $type = $request->type;
            $id = $request->id;

            $tableMap = [
                'classes' => 'gym_classes',
                'trainers' => 'trainers',
                'packages' => 'packages',
                'members' => 'members'
            ];

            if (!isset($tableMap[$type])) return response()->json(['message' => 'Loại dữ liệu không hợp lệ'], 400);

            if (!$id) return response()->json(['message' => 'Thiếu id'], 400);

            // Nếu xóa trainer: dọn phụ thuộc và file ảnh
            if ($type === 'trainers') {
                $trainer = DB::table('trainers')->where('id', $id)->first();
                if ($trainer) {
                    // Xóa booking liên quan để tránh lỗi khóa ngoại
                    try {
                        DB::table('booking_trainers')->where('trainer_id', $id)->delete();
                    } catch (\Exception $e) {}

                    // Xóa user trùng email (nếu có) để không còn tài khoản ghost
                    if (!empty($trainer->email)) {
                        try {
                            DB::table('users')->where('email', $trainer->email)->delete();
                        } catch (\Exception $e) {}
                    } else {
                        // Nếu bảng trainers không có email, thử khớp theo name + role trainer
                        try {
                            DB::table('users')
                                ->where('role', 'trainer')
                                ->where('name', $trainer->name)
                                ->delete();
                        } catch (\Exception $e) {}
                    }

                    // Dọn file ảnh
                    $imagePath = $trainer->image_url ?? $trainer->image ?? null;
                    if ($imagePath) {
                        $rel = $this->toPublicRelativePath($imagePath);
                        if ($rel) Storage::disk('public')->delete($rel);
                    }
                }
            }

            // Xóa bản ghi chính
            $deleted = DB::table($tableMap[$type])->where('id', $id)->delete();
            if ($deleted === 0) {
                return response()->json(['message' => 'Không tìm thấy bản ghi để xóa'], 404);
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể xóa mục này', 'error' => $e->getMessage()], 500);
        }
    }

    
    public function getTrainers()
    {
        try {
            // trainers table không còn user_id; bổ sung email/phone từ bảng users (role=trainer)
            $trainers = DB::table('trainers')
                ->orderBy('id', 'desc')
                ->get()
                ->map(function ($t) {
                    // Nếu cột email tồn tại và có giá trị, giữ nguyên
                    if (!empty($t->email)) {
                        // Đảm bảo image_url tồn tại để frontend hiển thị
                        if (empty($t->image_url) && !empty($t->image)) {
                            $t->image_url = $t->image;
                        }
                        return $t;
                    }
                    // Thử khớp theo name với user role trainer
                    $user = DB::table('users')
                        ->where('role', 'trainer')
                        ->where('name', $t->name)
                        ->first();
                    if ($user) {
                        $t->email = $user->email;
                        $t->phone = $user->phone ?? null;
                    }
                    // Đảm bảo image_url tồn tại để frontend hiển thị
                    if (empty($t->image_url) && !empty($t->image)) {
                        $t->image_url = $t->image;
                    }
                    return $t;
                });
            return response()->json($trainers);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi lấy dữ liệu huấn luyện viên'], 500);
        }
    }

    
    public function getPackages()
    {
        try {
            $packages = DB::table('packages')->orderBy('id', 'desc')->get();
            return response()->json($packages);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi lấy dữ liệu gói tập'], 500);
        }
    }

    // Đồng bộ: tạo hoặc cập nhật user cho tất cả trainer có email
    public function syncTrainersUsers(Request $request)
    {
        $password = $request->input('password', Str::random(16));
        $trainers = DB::table('trainers')
            ->whereNotNull('email')
            ->where('email', '<>', '')
            ->get();

        $created = 0;
        $updated = 0;

        foreach ($trainers as $t) {
            $user = DB::table('users')->where('email', $t->email)->first();
            if (!$user) {
                DB::table('users')->insert([
                    'name' => $t->name ?? 'Trainer',
                    'email' => $t->email,
                    'password' => bcrypt($password),
                    'role' => 'trainer',
                    'phone' => $t->phone ?? '',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                $created++;
            } else {
                $needsUpdate = false;
                $updateData = [];
                if ($user->role !== 'trainer') {
                    $updateData['role'] = 'trainer';
                    $needsUpdate = true;
                }
                if (!empty($t->name) && $t->name !== $user->name) {
                    $updateData['name'] = $t->name;
                    $needsUpdate = true;
                }
                if ($needsUpdate) {
                    $updateData['updated_at'] = now();
                    DB::table('users')->where('id', $user->id)->update($updateData);
                    $updated++;
                }
            }
        }

        return response()->json([
            'success' => true,
            'created' => $created,
            'updated' => $updated,
            'total_trainers_with_email' => $trainers->count()
        ]);
    }

    
    public function bookClassForMember(Request $request)
    {
        try {
            $userId = $request->user_id;
            $classId = $request->class_id;
            $userName = $request->user_name;
            $userEmail = $request->user_email;

            
            if (!$userId || !$classId) {
                return response()->json(['message' => 'Thiếu thông tin khách hàng hoặc lớp tập'], 400);
            }

            
            $existingBooking = DB::table('booking_classes')
                ->where('user_id', $userId)
                ->where('class_id', $classId)
                ->whereIn('status', ['pending', 'confirmed'])
                ->first();

            if ($existingBooking) {
                return response()->json(['message' => 'Khách hàng đã có lịch tập này (chưa thanh toán hoặc đã thanh toán)'], 400);
            }

            
            $gymClass = DB::table('gym_classes')->where('id', $classId)->first();
            if (!$gymClass) {
                return response()->json(['message' => 'Lớp tập không tồn tại'], 404);
            }

            
            $bookingId = DB::table('booking_classes')->insertGetId([
                'user_id' => $userId,
                'class_id' => $classId,
                'schedule' => 'Đặt bởi Admin - ' . now()->format('d/m/Y H:i'),
                'status' => 'pending', 
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'message' => 'Đã thêm lớp tập vào giỏ hàng của khách hàng',
                'booking_id' => $bookingId
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    
    public function bookTrainerForMember(Request $request)
    {
        try {
            $userId = $request->user_id;
            $trainerId = $request->trainer_id;
            $userName = $request->user_name;
            $userEmail = $request->user_email;

            
            if (!$userId || !$trainerId) {
                return response()->json(['message' => 'Thiếu thông tin khách hàng hoặc HLV'], 400);
            }

            
            $existingBooking = DB::table('booking_trainers')
                ->where('user_id', $userId)
                ->where('trainer_id', $trainerId)
                ->whereIn('status', ['pending', 'confirmed'])
                ->first();

            if ($existingBooking) {
                return response()->json(['message' => 'Khách hàng đã có lịch với HLV này'], 400);
            }

            
            $trainer = DB::table('trainers')->where('id', $trainerId)->first();
            if (!$trainer) {
                return response()->json(['message' => 'HLV không tồn tại'], 404);
            }

            
            $bookingId = DB::table('booking_trainers')->insertGetId([
                'user_id' => $userId,
                'trainer_id' => $trainerId,
                'schedule_info' => 'Đặt bởi Admin - ' . now()->format('d/m/Y H:i'),
                'status' => 'pending', 
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'message' => 'Đã thêm HLV vào giỏ hàng của khách hàng',
                'booking_id' => $bookingId
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}
