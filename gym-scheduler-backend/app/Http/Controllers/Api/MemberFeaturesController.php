<?php

namespace App\Http\Controllers\Api;

use App\Models\WaitlistEntry;
use App\Models\MembershipFreeze;
use App\Models\MemberCard;
use App\Models\BookingCancellation;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MemberFeaturesController
{
    /**
     * Get waitlist for member
     */
    public function getWaitlist($memberId): JsonResponse
    {
        $waitlist = WaitlistEntry::where('member_id', $memberId)
            ->orderBy('position')
            ->get();
        return response()->json($waitlist);
    }

    /**
     * Join waitlist
     */
    public function joinWaitlist(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => 'required|integer|exists:users,id',
            'item_type' => 'required|string|in:class,trainer',
            'item_id' => 'required|integer',
        ]);

        // Check if already in waitlist
        $exists = WaitlistEntry::where([
            'member_id' => $validated['member_id'],
            'item_type' => $validated['item_type'],
            'item_id' => $validated['item_id'],
        ])->first();

        if ($exists) {
            return response()->json(['error' => 'Already in waitlist'], 422);
        }

        // Get next position
        $position = WaitlistEntry::where('item_type', $validated['item_type'])
            ->where('item_id', $validated['item_id'])
            ->max('position') + 1;

        $entry = WaitlistEntry::create([
            'member_id' => $validated['member_id'],
            'item_type' => $validated['item_type'],
            'item_id' => $validated['item_id'],
            'position' => $position,
        ]);

        return response()->json($entry, 201);
    }

    /**
     * Leave waitlist
     */
    public function leaveWaitlist($id): JsonResponse
    {
        WaitlistEntry::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Notify waitlist member (internal)
     */
    public function notifyWaitlistMember($id): JsonResponse
    {
        $entry = WaitlistEntry::findOrFail($id);
        $entry->update(['notified_at' => now()]);
        return response()->json(['notified' => true]);
    }

    /**
     * Get freeze requests for member
     */
    public function getFreezeRequests($memberId): JsonResponse
    {
        $freezes = MembershipFreeze::where('member_id', $memberId)
            ->orderBy('start_date', 'desc')
            ->get();
        return response()->json($freezes);
    }

    /**
     * Request membership freeze
     */
    public function requestFreeze(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => 'required|integer|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'reason' => 'required|string|in:vacation,medical,personal',
            'notes' => 'nullable|string',
        ]);

        $freeze = MembershipFreeze::create($validated);
        return response()->json($freeze, 201);
    }

    /**
     * Approve/reject freeze request (admin)
     */
    public function approveFreezeRequest($id, Request $request): JsonResponse
    {
        $freeze = MembershipFreeze::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'approved_by' => 'required|integer|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        $freeze->update($validated);
        return response()->json($freeze);
    }

    /**
     * Cancel freeze request
     */
    public function cancelFreezeRequest($id): JsonResponse
    {
        $freeze = MembershipFreeze::findOrFail($id);
        $freeze->update(['status' => 'cancelled']);
        return response()->json(['success' => true]);
    }

    /**
     * Get member's digital card
     */
    public function getMemberCard($memberId): JsonResponse
    {
        $card = MemberCard::where('member_id', $memberId)->first();
        
        if (!$card) {
            return response()->json(null);
        }

        return response()->json($card);
    }

    /**
     * Generate member card
     */
    public function generateMemberCard(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => 'required|integer|exists:users,id',
        ]);

        // Check if card already exists
        $existing = MemberCard::where('member_id', $validated['member_id'])->first();
        if ($existing) {
            return response()->json($existing);
        }

        // Generate unique card number
        $cardNumber = 'GYM' . date('Ymd') . str_pad($validated['member_id'], 8, '0', STR_PAD_LEFT);
        
        // Generate QR code (using simple encoding)
        $qrCode = "data:image/png;base64," . base64_encode($cardNumber);

        $card = MemberCard::create([
            'member_id' => $validated['member_id'],
            'card_number' => $cardNumber,
            'qr_code' => $qrCode,
            'is_active' => true,
        ]);

        return response()->json($card, 201);
    }

    /**
     * Check-in member at facility
     */
    public function checkInFacility(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => 'required|integer|exists:users,id',
            'qr_code' => 'required|string',
        ]);

        // Verify card exists and is active
        $card = MemberCard::where('member_id', $validated['member_id'])
            ->where('is_active', true)
            ->first();

        if (!$card) {
            return response()->json(['error' => 'Card not found or inactive'], 404);
        }

        // Verify QR code matches
        if ($card->card_number !== $validated['qr_code']) {
            return response()->json(['error' => 'Invalid QR code'], 422);
        }

        // Log check-in (create check_ins table for full implementation)
        
        return response()->json([
            'success' => true,
            'checkedInAt' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get check-in history
     */
    public function getCheckInHistory($memberId): JsonResponse
    {
        // Placeholder - integrate with check_ins table
        return response()->json([]);
    }

    /**
     * Get cancellation policy for booking
     */
    public function getCancellationPolicy($bookingId): JsonResponse
    {
        $booking = Booking::findOrFail($bookingId);

        // Default policy: 2 hours before = full refund, within 2 hours = no refund
        return response()->json([
            'booking_id' => $bookingId,
            'hours_before_cancellation' => 2,
            'refund_percentage' => 100,
            'penalty' => null,
        ]);
    }

    /**
     * Cancel booking
     */
    public function cancelBooking(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => 'required|integer|exists:users,id',
            'booking_id' => 'required|integer|exists:bookings,id',
            'reason' => 'required|string',
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);

        // Verify member owns booking
        if ((int) ($booking->user_id ?? 0) !== (int) $validated['member_id']) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Calculate refund based on cancellation time
        $hoursUntilBooking = now()->diffInHours($booking->start_time);
        $refundAmount = $booking->price ?? 0;
        $penalty = 0;

        if ($hoursUntilBooking < 2) {
            $refundAmount = 0;
            $penalty = ($booking->price ?? 0) * 0.1; // 10% penalty
        }

        // Create cancellation record
        $cancellation = BookingCancellation::create([
            'booking_id' => $validated['booking_id'],
            'member_id' => $validated['member_id'],
            'reason' => $validated['reason'],
            'cancelled_at' => now(),
            'refund_amount' => $refundAmount,
            'penalty' => $penalty,
            'status' => 'pending',
        ]);

        // Mark booking as cancelled
        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'refundAmount' => $refundAmount,
            'penalty' => $penalty,
            'cancellationId' => $cancellation->id,
        ]);
    }

    /**
     * Get cancellation history
     */
    public function getCancellations($memberId): JsonResponse
    {
        $cancellations = BookingCancellation::where('member_id', $memberId)
            ->orderBy('cancelled_at', 'desc')
            ->get();
        return response()->json($cancellations);
    }
}
