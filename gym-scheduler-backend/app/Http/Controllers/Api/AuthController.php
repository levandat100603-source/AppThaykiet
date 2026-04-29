<?php

namespace App\Http\Controllers\Api; 

use App\Http\Controllers\Controller; 
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\EmailVerificationCode;
use App\Models\PendingRegistration;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function updateAvatar(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ], [
            'avatar.required' => 'Vui lòng chọn ảnh đại diện',
            'avatar.image' => 'Tệp tải lên phải là ảnh',
            'avatar.max' => 'Ảnh đại diện không được vượt quá 2MB',
        ]);

        if ($user->avatar) {
            $oldPath = ltrim((string) $user->avatar, '/');
            if (str_starts_with($oldPath, 'storage/')) {
                $storagePath = substr($oldPath, strlen('storage/'));
                if ($storagePath !== '') {
                    Storage::disk('public')->delete($storagePath);
                }
            }
        }

        $storedPath = $request->file('avatar')->store('avatars', 'public');
        $publicPath = '/storage/' . $storedPath;

        $user->avatar = $publicPath;
        $user->save();

        return response()->json([
            'message' => 'Cập nhật ảnh đại diện thành công',
            'avatar' => $publicPath,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ], [
            'name.required' => 'Vui lòng nhập họ tên',
            'name.max' => 'Họ tên không được vượt quá 255 ký tự',
            'phone.max' => 'Số điện thoại không được vượt quá 20 ký tự',
        ]);

        $user->name = $validated['name'];
        $user->phone = $validated['phone'] ?? null;
        $user->save();

        return response()->json([
            'message' => 'Cập nhật hồ sơ thành công',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
        ]);
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string|min:6',
            'new_password' => 'required|string|min:6|different:current_password|confirmed',
        ], [
            'current_password.required' => 'Vui lòng nhập mật khẩu hiện tại',
            'new_password.required' => 'Vui lòng nhập mật khẩu mới',
            'new_password.min' => 'Mật khẩu mới phải có ít nhất 6 ký tự',
            'new_password.different' => 'Mật khẩu mới phải khác mật khẩu hiện tại',
            'new_password.confirmed' => 'Xác nhận mật khẩu mới không khớp',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Mật khẩu hiện tại không đúng',
            ], 422);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'message' => 'Đổi mật khẩu thành công',
        ]);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ], [
            'email.required' => 'Vui lòng nhập email',
            'email.email' => 'Email không đúng định dạng',
            'password.required' => 'Vui lòng nhập mật khẩu',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự',
        ]);

        
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại!'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        
        return response()->json([
            'message' => 'Đăng nhập thành công',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role, 
            ]
        ]);
    }
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ], [
            'email.unique' => 'Email đã được đăng ký',
            'name.required' => 'Vui lòng nhập họ tên',
            'email.required' => 'Vui lòng nhập email',
            'email.email' => 'Email không đúng định dạng',
            'password.required' => 'Vui lòng nhập mật khẩu',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự',
        ]);

        PendingRegistration::where('email', $request->email)
            ->whereNull('verified_at')
            ->delete();


        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $pendingUser = PendingRegistration::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'verification_code' => $code,
            'code_expires_at' => Carbon::now()->addMinutes(15),
        ]);

        try {
            $this->sendVerificationEmail($request->email, $request->name, $code);
        } catch (\Exception $e) {
            \Log::error('Failed to send verification email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản',
            'pending_id' => $pendingUser->id,
            'email' => $pendingUser->email,
        ], 201);
    }

    public function sendVerificationCode(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email|max:255',
        ]);

        $pendingUser = PendingRegistration::where('email', $request->email)
            ->whereNull('verified_at')
            ->first();

        if (!$pendingUser) {
            return response()->json([
                'message' => 'Không tìm thấy đăng ký chưa xác thực cho email này',
            ], 404);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $pendingUser->update([
            'verification_code' => $code,
            'code_expires_at' => Carbon::now()->addMinutes(15),
        ]);

        try {
            $this->sendVerificationEmail($pendingUser->email, $pendingUser->name, $code);
        } catch (\Exception $e) {
            \Log::error('Failed to send verification email: ' . $e->getMessage());
            return response()->json([
                'message' => 'Không thể gửi email. Vui lòng thử lại',
            ], 500);
        }

        return response()->json([
            'message' => 'Mã xác thực đã được gửi đến email của bạn',
        ]);
    }

    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'code' => 'required|string|size:6',
        ]);

        $pendingUser = PendingRegistration::where('email', $request->email)
            ->whereNull('verified_at')
            ->first();

        if (!$pendingUser || $pendingUser->verification_code !== $request->code) {
            if ($pendingUser) {
                $pendingUser->delete();
            }

            return response()->json([
                'message' => 'Mã xác thực không đúng hoặc đã hết hạn. Vui lòng đăng ký lại.',
            ], 422);
        }

        if ($pendingUser->isExpired()) {
            $pendingUser->delete();
            return response()->json([
                'message' => 'Mã xác thực đã hết hạn (quá 60 giây). Vui lòng đăng ký lại.',
            ], 422);
        }

        try {
            $userData = [
                'name' => $pendingUser->name,
                'email' => $pendingUser->email,
                'password' => $pendingUser->password,
                'role' => 'user',
                'email_verified_at' => Carbon::now(),
            ];

            // Legacy schemas imported from SQL may not include this column.
            if (Schema::hasColumn('users', 'email_verified')) {
                $userData['email_verified'] = true;
            }

            $user = User::create($userData);
        } catch (\Throwable $e) {
            Log::error('Verify email failed: ' . $e->getMessage(), [
                'email' => $pendingUser->email,
            ]);

            return response()->json([
                'message' => 'Có lỗi khi xác thực tài khoản. Vui lòng thử lại sau.',
            ], 500);
        }

        $pendingUser->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Xác thực email thành công',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }

    private function generateVerificationCode(User $user): EmailVerificationCode
    {
        EmailVerificationCode::where('user_id', $user->id)
            ->where('verified_at', null)
            ->delete();

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        return EmailVerificationCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => Carbon::now()->addMinutes(15),
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email|max:255',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email này không được đăng ký trong hệ thống.',
            ], 404);
        }

        $token = $this->generatePasswordResetCode();

        try {
            $passwordResetTable = $this->resolvePasswordResetTable();

            DB::table($passwordResetTable)->updateOrInsert(
                ['email' => $request->email],
                [
                    'token' => Hash::make($token),
                    'created_at' => Carbon::now(),
                ]
            );
        } catch (\Throwable $e) {
            Log::error('Failed to store password reset token: ' . $e->getMessage());
            return response()->json([
                'message' => 'Không thể tạo mã đặt lại mật khẩu. Vui lòng thử lại.',
            ], 500);
        }

        try {
            $message = "Xin chào {$user->name},\n\nBạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã 8 ký tự bên dưới để đặt lại mật khẩu:\n\nMã: {$token}\n\nMã này sẽ hết hạn sau 60 phút.\n\nNếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.";

            Mail::raw($message, function ($mail) use ($request, $user) {
                $mail->to($request->email)
                    ->subject('Đặt lại mật khẩu - FitZone Gym');
            });
        } catch (\Exception $e) {
            Log::error('Failed to send password reset email: ' . $e->getMessage());
            return response()->json([
                'message' => 'Không thể gửi email. Vui lòng thử lại.',
            ], 500);
        }

        return response()->json([
            'message' => 'Nếu email này tồn tại, bạn sẽ nhận được email với hướng dẫn đặt lại mật khẩu.',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email|max:255',
            'token' => 'required|string',
            'password' => ['required', 'string', 'min:8', 'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/', 'confirmed'],
        ], [
            'password.required' => 'Vui lòng nhập mật khẩu mới.',
            'password.min' => 'Mật khẩu mới phải có ít nhất 8 ký tự.',
            'password.regex' => 'Mật khẩu mới phải bao gồm cả chữ và số.',
            'password.confirmed' => 'Mật khẩu xác nhận không khớp.',
        ]);

        try {
            $passwordResetTable = $this->resolvePasswordResetTable();
        } catch (\Throwable $e) {
            Log::error('Failed to resolve password reset table: ' . $e->getMessage());
            return response()->json([
                'message' => 'Chưa sẵn sàng đặt lại mật khẩu. Vui lòng thử lại sau.',
            ], 500);
        }

        $resetRecord = DB::table($passwordResetTable)
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'message' => 'Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
            ], 422);
        }

        $submittedToken = strtoupper(preg_replace('/\s+/', '', (string) $request->token));

        if (!Hash::check($submittedToken, $resetRecord->token)) {
            return response()->json([
                'message' => 'Mã đặt lại mật khẩu không đúng.',
            ], 422);
        }

        if (Carbon::parse($resetRecord->created_at)->addMinutes(60)->isPast()) {
            DB::table($passwordResetTable)->where('email', $request->email)->delete();
            return response()->json([
                'message' => 'Mã đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.',
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email này không được đăng ký.',
            ], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        DB::table($passwordResetTable)->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.',
        ]);
    }

    private function resolvePasswordResetTable(): string
    {
        if (Schema::hasTable('password_reset_tokens')) {
            return 'password_reset_tokens';
        }

        if (Schema::hasTable('password_resets')) {
            return 'password_resets';
        }

        Schema::create('password_reset_tokens', function ($table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        return 'password_reset_tokens';
    }

    private function generatePasswordResetCode(int $length = 8): string
    {
        // Uppercase letters + digits to keep the code short and easy to type.
        $characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $maxIndex = strlen($characters) - 1;
        $code = '';

        for ($i = 0; $i < $length; $i++) {
            $code .= $characters[random_int(0, $maxIndex)];
        }

        return $code;
    }

    private function sendVerificationEmail(string $email, string $name, string $code): void
    {
        $message = "Xin chào {$name},\n\nMã xác thực của bạn là: {$code}\n\nMã này sẽ hết hạn sau 15 phút.";

        if (config('mail.mailer') !== 'log') {
            Mail::raw($message, function ($mail) use ($email, $name) {
                $mail->to($email)
                    ->subject('Xác thực email FitZone Gym');
            });
        }
    }
}
