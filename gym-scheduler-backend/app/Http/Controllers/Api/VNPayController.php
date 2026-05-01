<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class VNPayController extends Controller
{
    protected $tmnCode;
    protected $hashKey;
    protected $apiUrl;
    protected $returnUrl;
    protected $notifyUrl;

    public function __construct()
    {
        $this->tmnCode = config('vnpay.tmn_code');
        $this->hashKey = config('vnpay.hash_key');
        $this->apiUrl = config('vnpay.api_url');
        $this->returnUrl = config('vnpay.return_url');
        $this->notifyUrl = config('vnpay.notify_url');
    }

    /**
     * Create VNPay payment URL.
     */
    public function createPaymentUrl(Request $request)
    {
        $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'app_return_url' => 'nullable|string|max:500',
        ]);

        $orderId = $request->input('order_id');
        $appReturnUrl = $request->input('app_return_url');
        $order = DB::table('orders')->find($orderId);

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Đơn hàng không tồn tại'], 404);
        }

        if ($order->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Không có quyền truy cập'], 403);
        }

        if (!empty($appReturnUrl)) {
            Cache::put('vnpay_app_return_url_' . $orderId, $appReturnUrl, now()->addHours(12));
        }

        return response()->json([
            'success' => true,
            'payment_url' => $this->generatePaymentUrl($order),
            'order_id' => $orderId,
        ]);
    }

    /**
     * Handle VNPay callback after payment.
     */
    public function handleCallback(Request $request)
    {
        $data = $request->all();

        $secureHash = $data['vnp_SecureHash'] ?? null;
        unset($data['vnp_SecureHash'], $data['vnp_SecureHashType']);

        ksort($data);

        $hashDataParts = [];
        foreach ($data as $key => $value) {
            if ($value !== null && $value !== '') {
                $hashDataParts[] = urlencode((string) $key) . '=' . urlencode((string) $value);
            }
        }

        $hashData = implode('&', $hashDataParts);
        $calculatedHash = hash_hmac('sha512', $hashData, $this->hashKey);

        if (!hash_equals($calculatedHash, (string) $secureHash)) {
            return $this->renderCallbackPage(false, 'Chữ ký không hợp lệ. Vui lòng kiểm tra lại giao dịch.');
        }

        $responseCode = $data['vnp_ResponseCode'] ?? null;
        $transactionId = $data['vnp_TransactionNo'] ?? null;
        $orderInfo = $data['vnp_OrderInfo'] ?? null;

        preg_match('/order_(\d+)/', (string) $orderInfo, $matches);
        $orderId = $matches[1] ?? null;

        if (!$orderId) {
            return $this->renderCallbackPage(false, 'Không xác định được mã đơn hàng.');
        }

        $cachedAppReturnUrl = Cache::get('vnpay_app_return_url_' . $orderId);
        $requestAppReturnUrl = $request->query('app_return_url');
        $appReturnUrl = $cachedAppReturnUrl ?: $requestAppReturnUrl;

        DB::beginTransaction();

        try {
            $order = DB::table('orders')->where('id', $orderId)->first();
            $orderItems = DB::table('order_items')->where('order_id', $orderId)->get();

            if (!$order) {
                throw new \Exception('Đơn hàng không tồn tại.');
            }

            if ($responseCode === '00') {
                $cart = $orderItems->map(function ($item) {
                    return [
                        'id' => $item->item_id,
                        'name' => $item->item_name,
                        'type' => $item->item_type,
                        'price' => $item->price,
                    ];
                })->toArray();

                app(OrderController::class)->fulfillOrder($orderId, $cart);

                DB::table('orders')->where('id', $orderId)->update([
                    'status' => 'completed',
                    'vnpay_transaction_id' => $transactionId,
                    'vnpay_response_code' => $responseCode,
                    'vnpay_response_message' => 'Thanh toán thành công',
                    'updated_at' => now(),
                ]);

                $this->createPaymentNotification((int) $order->user_id, (int) $orderId, (float) $order->total_amount, $orderItems->toArray(), true, $responseCode);

                DB::commit();

                return $this->renderCallbackPage(
                    true,
                    'Thanh toán thành công. Đơn hàng đã được xác nhận.',
                    $orderId,
                    $appReturnUrl
                );
            }

            DB::table('orders')->where('id', $orderId)->update([
                'status' => 'failed',
                'vnpay_transaction_id' => $transactionId,
                'vnpay_response_code' => $responseCode,
                'vnpay_response_message' => $this->getResponseMessage($responseCode),
                'updated_at' => now(),
            ]);

            $this->createPaymentNotification((int) $order->user_id, (int) $orderId, (float) $order->total_amount, $orderItems->toArray(), false, $responseCode);

            DB::commit();

            return $this->renderCallbackPage(
                false,
                $this->getResponseMessage($responseCode),
                $orderId,
                $appReturnUrl
            );
        } catch (\Exception $e) {
            DB::rollBack();

            DB::table('orders')->where('id', $orderId)->update([
                'status' => 'failed',
                'vnpay_response_code' => '99',
                'vnpay_response_message' => 'Lỗi xử lý: ' . $e->getMessage(),
                'updated_at' => now(),
            ]);

            return $this->renderCallbackPage(
                false,
                'Lỗi xử lý đơn hàng: ' . $e->getMessage(),
                $orderId,
                $appReturnUrl
            );
        }
    }

    /**
     * Render a simple HTML response and deeplink back into the Expo app.
     */
    protected function renderCallbackPage(bool $success, string $message, $orderId = null, ?string $preferredAppUrl = null)
    {
        $status = $success ? 'success' : 'error';
        $fallbackSchemeUrl = 'gymschedulerapp:///vnpay-callback?status=' . $status
            . ($orderId ? '&order_id=' . urlencode((string) $orderId) : '')
            . '&message=' . urlencode($message);

        $preferredTarget = null;
        if (!empty($preferredAppUrl)) {
            $normalizedPreferredAppUrl = (string) $preferredAppUrl;
            if (!str_contains($normalizedPreferredAppUrl, '://') && str_contains($normalizedPreferredAppUrl, '%3A%2F%2F')) {
                $normalizedPreferredAppUrl = urldecode($normalizedPreferredAppUrl);
            }

            $preferredTarget = $this->appendQueryParams($normalizedPreferredAppUrl, [
                'status' => $status,
                'message' => $message,
                'order_id' => $orderId,
            ]);
        }

        $targets = array_values(array_filter([$preferredTarget, $fallbackSchemeUrl]));
        $firstTarget = $targets[0] ?? $fallbackSchemeUrl;

        $title = $success ? 'Thanh toán thành công' : 'Thanh toán thất bại';
        $accent = $success ? '#16a34a' : '#dc2626';

        $html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . '</title><style>body{font-family:Arial,sans-serif;background:#f8fafc;color:#0f172a;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px}.card{max-width:520px;width:100%;background:#fff;border-radius:18px;padding:28px;box-shadow:0 10px 30px rgba(15,23,42,.12);text-align:center}.badge{width:72px;height:72px;border-radius:999px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:34px;color:#fff;background:' . $accent . '}.title{font-size:28px;font-weight:800;margin:0 0 12px}.message{font-size:16px;line-height:1.6;color:#475569;margin:0 0 18px}.link{display:inline-block;background:' . $accent . ';color:#fff;text-decoration:none;padding:14px 20px;border-radius:10px;font-weight:700;border:0;cursor:pointer}.meta{margin-top:16px;font-size:12px;color:#64748b;word-break:break-all}.countdown{margin-top:8px;font-size:13px;color:#334155}</style></head><body><div class="card"><div class="badge">' . ($success ? '✓' : '!' ) . '</div><h1 class="title">' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . '</h1><p class="message">' . htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . '</p><button id="openAppBtn" class="link" type="button">Quay lại ứng dụng</button><div class="countdown">Tự động quay lại app sau <span id="count">10</span>s</div><div class="meta">Nếu ứng dụng không tự mở, hãy bấm nút trên.</div></div><script>(function(){var targets=' . json_encode($targets) . ';var countEl=document.getElementById("count");var btn=document.getElementById("openAppBtn");var opening=false;function tryOpen(index){if(index>=targets.length){return;}var url=targets[index];window.location.assign(url);setTimeout(function(){tryOpen(index+1);},700);}function openApp(){if(opening){return;}opening=true;tryOpen(0);}btn.addEventListener("click",openApp);var remain=10;var timer=setInterval(function(){remain-=1;if(remain<=0){clearInterval(timer);countEl.textContent="0";openApp();return;}countEl.textContent=String(remain);},1000);})();</script></body></html>';

        return response($html, 200)->header('Content-Type', 'text/html; charset=UTF-8');
    }

    /**
     * Append query parameters to a URL safely.
     */
    protected function appendQueryParams(string $url, array $params): string
    {
        $separator = str_contains($url, '?') ? '&' : '?';

        $filtered = array_filter($params, function ($value) {
            return $value !== null && $value !== '';
        });

        return $url . $separator . http_build_query($filtered);
    }

    /**
     * Create in-app payment notification with amount and purchased items.
     */
    protected function createPaymentNotification(int $userId, int $orderId, float $amount, array $items, bool $success, ?string $responseCode = null): void
    {
        $itemNames = collect($items)
            ->pluck('item_name')
            ->filter()
            ->take(3)
            ->implode(', ');

        $itemSummary = $itemNames !== '' ? $itemNames : 'Sản phẩm trong giỏ hàng';
        $formattedAmount = number_format($amount, 0, ',', '.') . 'đ';

        $title = $success ? 'Thanh toán VNPay thành công' : 'Thanh toán VNPay thất bại';
        $statusText = $success ? 'thành công' : 'thất bại';
        $responseText = $responseCode ? (' (mã: ' . $responseCode . ')') : '';

        $message = 'Đơn #' . $orderId . ' thanh toán ' . $statusText . '. Số tiền: ' . $formattedAmount . '. Nội dung: ' . $itemSummary . $responseText . '.';

        DB::table('notifications')->insert([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $success ? 'success' : 'error',
            'related_type' => 'payment',
            'related_id' => $orderId,
            'is_read' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Check payment status.
     */
    public function checkStatus(Request $request)
    {
        $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
        ]);

        $orderId = $request->input('order_id');
        $order = DB::table('orders')->find($orderId);

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Đơn hàng không tồn tại'], 404);
        }

        if ($order->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Không có quyền truy cập'], 403);
        }

        return response()->json([
            'success' => true,
            'order_id' => $orderId,
            'status' => $order->status,
            'total_amount' => $order->total_amount,
            'payment_method' => $order->payment_method,
            'vnpay_transaction_id' => $order->vnpay_transaction_id,
            'vnpay_response_code' => $order->vnpay_response_code,
            'created_at' => $order->created_at,
        ]);
    }

    /**
     * Generate VNPay payment URL.
     */
    protected function generatePaymentUrl($order)
    {
        $inputData = [
            'vnp_Version' => '2.1.0',
            'vnp_TmnCode' => $this->tmnCode,
            'vnp_Amount' => (int) ($order->total_amount * 100),
            'vnp_Command' => 'pay',
            'vnp_CreateDate' => date('YmdHis'),
            'vnp_CurrCode' => 'VND',
            'vnp_IpAddr' => request()->ip(),
            'vnp_Locale' => 'vn',
            'vnp_OrderInfo' => 'order_' . $order->id,
            'vnp_OrderType' => 'gym_service',
            'vnp_ReturnUrl' => $this->returnUrl,
            'vnp_TxnRef' => $order->id . '_' . time(),
        ];

        ksort($inputData);

        $query = '';
        $hashParts = [];

        foreach ($inputData as $key => $value) {
            $encodedKey = urlencode($key);
            $encodedValue = urlencode((string) $value);

            $query .= ($query === '' ? '' : '&') . $encodedKey . '=' . $encodedValue;
            $hashParts[] = $encodedKey . '=' . $encodedValue;
        }

        $hashData = implode('&', $hashParts);
        $secureHash = hash_hmac('sha512', $hashData, $this->hashKey);

        return $this->apiUrl . '?' . $query . '&vnp_SecureHash=' . $secureHash;
    }

    /**
     * Get VNPay response message based on response code.
     */
    protected function getResponseMessage($code)
    {
        $messages = [
            '00' => 'Giao dịch thành công',
            '01' => 'Gọi API kết nối không thành công',
            '02' => 'Merchant kết nối không hợp lệ',
            '03' => 'Dữ liệu gửi sang VNPay không hợp lệ',
            '04' => 'Khởi tạo GD không thành công',
            '05' => 'Không có gateway nào khả dụng',
            '06' => 'Lỗi hệ thống',
            '07' => 'Giao dịch không thành công',
            '08' => 'Hủy giao dịch',
            '09' => 'Giao dịch bị từ chối',
            '10' => 'Thời gian chờ kết nối rồi',
            '99' => 'Người dùng hủy giao dịch',
        ];

        return $messages[$code] ?? 'Lỗi không xác định';
    }
}
