-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 02, 2026 at 09:50 AM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `quanlygym`
--

-- --------------------------------------------------------

--
-- Table structure for table `booking_cancellations`
--

DROP TABLE IF EXISTS `booking_cancellations`;
CREATE TABLE IF NOT EXISTS `booking_cancellations` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `booking_id` bigint UNSIGNED NOT NULL,
  `member_id` bigint UNSIGNED NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cancelled_at` timestamp NOT NULL,
  `penalty` decimal(10,2) DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','approved','rejected','processed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_classes`
--

DROP TABLE IF EXISTS `booking_classes`;
CREATE TABLE IF NOT EXISTS `booking_classes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `class_id` bigint UNSIGNED DEFAULT NULL,
  `schedule` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_classes_user_class_schedule_unique` (`user_id`,`class_id`,`schedule`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `booking_classes`
--

INSERT INTO `booking_classes` (`id`, `user_id`, `class_id`, `schedule`, `status`, `created_at`, `updated_at`) VALUES
(1, 8, 1, 'thứ 2 | 06:00', 'confirmed', '2026-01-22 03:16:49', NULL),
(2, 8, 2, 'thứ 2 | 07:00', 'confirmed', '2026-01-22 03:23:38', '2026-01-22 03:23:38'),
(3, 8, 2, 'thứ 3 | 07:00', 'confirmed', '2026-01-22 03:23:38', '2026-01-22 03:23:38'),
(4, 8, 2, 'thứ 5 | 07:00', 'confirmed', '2026-01-22 03:23:38', '2026-01-22 03:23:38'),
(5, 8, 3, 'thứ 3 | 18:00', 'confirmed', '2026-01-22 04:15:09', '2026-01-22 04:15:09'),
(6, 8, 3, 'thứ 5 | 18:00', 'confirmed', '2026-01-22 04:15:09', '2026-01-22 04:15:09'),
(7, 8, 3, 'thứ 7 | 18:00', 'confirmed', '2026-01-22 04:15:09', '2026-01-22 04:15:09'),
(8, 8, 6, 'thứ 2-7 | 09:00', 'confirmed', '2026-01-22 04:52:01', '2026-01-22 04:52:01'),
(9, 8, 5, 'thứ 7 | 19:00', 'confirmed', '2026-01-22 04:57:25', '2026-01-22 04:57:25'),
(10, 9, 1, 'thứ 2 | 06:00', 'confirmed', '2026-04-30 07:44:55', '2026-04-30 07:44:55');

-- --------------------------------------------------------

--
-- Table structure for table `booking_trainers`
--

DROP TABLE IF EXISTS `booking_trainers`;
CREATE TABLE IF NOT EXISTS `booking_trainers` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `trainer_id` bigint UNSIGNED DEFAULT NULL,
  `schedule_info` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `booking_trainers_user_id_index` (`user_id`),
  KEY `booking_trainers_trainer_id_index` (`trainer_id`),
  KEY `booking_trainers_status_index` (`status`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `booking_trainers`
--

INSERT INTO `booking_trainers` (`id`, `user_id`, `trainer_id`, `schedule_info`, `status`, `created_at`, `updated_at`) VALUES
(1, 8, 7, '01/05/2026 | 21:00 (Tối)', 'completed', '2026-05-01 04:00:54', '2026-05-01 04:01:54');

-- --------------------------------------------------------

--
-- Table structure for table `gym_classes`
--

DROP TABLE IF EXISTS `gym_classes`;
CREATE TABLE IF NOT EXISTS `gym_classes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `trainer_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `time` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `days` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int NOT NULL,
  `registered` int DEFAULT '0',
  `price` decimal(10,0) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gym_classes`
--

INSERT INTO `gym_classes` (`id`, `name`, `trainer_name`, `time`, `duration`, `days`, `location`, `capacity`, `registered`, `price`, `created_at`, `updated_at`) VALUES
(8, 'a', 'Lê Văn A', '06:00 AM', '1', '03-05-2026', 'a', 30, 1, 99999, '2026-05-01 10:15:43', NULL),
(9, 'b', 'Nguyễn Thị B', '00:30 AM', '60', '03-05-2026', 'b', 30, 0, 50000, '2026-05-01 10:38:28', NULL),
(10, 'c', 'Lê Văn A', '06:00 AM', '10', '03-05-2026', 'c', 40, 20, 20000, '2026-05-02 02:21:19', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
CREATE TABLE IF NOT EXISTS `members` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pack` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `end` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,0) DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`id`, `name`, `email`, `phone`, `pack`, `duration`, `start`, `end`, `price`, `status`, `created_at`, `updated_at`) VALUES
(9, 'abc', 'abc@gmail.com', '0123456789', 'VIP', '12', '2026-01-22', '2027-01-22', 3800000, 'active', '2026-01-22 02:21:16', '2026-01-22 02:21:16'),
(10, 'Thành viên 5', 'member5@gmail.com', NULL, 'Standard', '3', '2026-01-22', '2026-04-22', 1200000, 'active', '2026-01-22 02:50:27', '2026-01-22 02:50:27'),
(11, 'Thành viên 2', 'member2@gmail.com', 'Chưa cập nhật', 'VIP', '12 tháng', '2026-04-30', '2027-04-30', 3800000, 'active', '2026-04-30 07:38:26', '2026-04-30 07:38:26'),
(12, 'Thành viên 1', 'member1@gmail.com', 'Chưa cập nhật', 'VIP', 'VIP', '2026-04-30', '2026-05-30', 3800000, 'active', '2026-04-30 11:46:52', '2026-04-30 11:46:52'),
(13, 'Thành viên 1', 'member1@gmail.com', 'Chưa cập nhật', 'VIP', 'VIP', '2026-04-30', '2026-06-30', 3800000, 'active', '2026-04-30 11:48:50', '2026-04-30 11:48:50'),
(14, 'Thành viên 1', 'member1@gmail.com', 'Chưa cập nhật', 'VIP', 'VIP', '2026-04-30', '2026-07-30', 3800000, 'active', '2026-04-30 11:49:28', '2026-04-30 11:49:28'),
(21, 'Thành viên 1', 'member1@gmail.com', 'Chưa cập nhật', 'Premium', 'Premium', '2026-05-01', '2026-06-01', 2200000, 'active', '2026-05-01 04:00:54', '2026-05-01 08:40:57');

-- --------------------------------------------------------

--
-- Table structure for table `membership_freezes`
--

DROP TABLE IF EXISTS `membership_freezes`;
CREATE TABLE IF NOT EXISTS `membership_freezes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `member_id` bigint UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','active','expired') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approved_by` bigint UNSIGNED DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `member_cards`
--

DROP TABLE IF EXISTS `member_cards`;
CREATE TABLE IF NOT EXISTS `member_cards` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `member_id` bigint UNSIGNED NOT NULL,
  `card_number` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `qr_code` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `member_cards_member_unique` (`member_id`),
  UNIQUE KEY `member_cards_number_unique` (`card_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_11_16_124504_create_personal_access_tokens_table', 1),
(5, '2025_11_16_125248_add_role_and_phone_to_users_table', 1),
(6, '2025_11_16_130913_create_workout_schedules_table', 1),
(7, '2026_01_07_211708_add_role_to_users_table', 1),
(8, '2026_01_08_001923_create_gym_tables', 1),
(9, '2026_01_21_000001_create_booking_classes_table', 1),
(10, '2026_01_22_000000_add_email_verification_to_users', 1),
(11, '2026_01_22_000001_create_pending_registrations_table', 1),
(12, '2026_01_22_095957_add_schedule_info_to_booking_trainers_table', 1),
(13, '2026_01_22_100303_create_orders_and_order_items_tables', 1),
(14, '2026_01_22_101432_add_schedule_to_booking_classes_table', 1),
(15, '2026_01_22_101900_update_booking_classes_unique', 1),
(16, '2026_01_22_104444_add_email_phone_to_trainers_table', 1),
(17, '2026_01_22_104921_create_notifications_table', 1),
(18, '2026_04_13_120000_add_membership_columns_to_users_table', 1),
(19, '2026_04_13_120100_backfill_membership_from_members_to_users', 1),
(20, '2026_04_13_230000_create_password_reset_tokens_if_missing', 1),
(21, '2026_04_26_000001_create_working_hours_table', 1),
(22, '2026_04_26_000002_create_time_offs_table', 1),
(23, '2026_04_26_000003_create_session_notes_table', 1),
(24, '2026_04_26_000004_create_workout_plans_table', 1),
(25, '2026_04_26_000005_create_trainer_earnings_table', 1),
(26, '2026_04_26_000006_create_waitlist_entries_table', 1),
(27, '2026_04_26_000007_create_membership_freezes_table', 1),
(28, '2026_04_26_000008_create_member_cards_table', 1),
(29, '2026_04_26_000009_create_booking_cancellations_table', 1),
(30, '2026_04_26_000010_create_vouchers_table', 1),
(31, '2026_04_26_000011_create_push_campaigns_table', 1),
(32, '2026_04_26_000012_create_refund_requests_table', 1),
(33, '2026_04_26_000013_create_transaction_reports_table', 1),
(38, '2026_04_27_000014_create_booking_trainers_table_if_missing', 2),
(39, '2026_04_28_000016_create_withdrawal_requests_table', 3),
(40, '2026_04_29_add_user_id_to_trainers_table', 4),
(41, '2026_04_30_000001_fix_trainer_earnings_trainer_id_mapping', 4),
(42, '2026_04_30_add_vnpay_columns_to_orders', 4),
(43, '2026_05_01_000001_add_confirmation_images_to_withdrawal_requests_table', 5),
(44, '2026_01_22_000000_create_system_settings_table', 6);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'info',
  `related_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_id` bigint DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_foreign` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `related_type`, `related_id`, `is_read`, `created_at`, `updated_at`) VALUES
(1, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Lê Văn A đã xác nhận lịch hẹn của bạn. Lịch: 22/01/2026 | 19:30 (Tối)', 'booking', 'trainer', 2, 1, '2026-01-22 03:51:41', '2026-05-01 08:41:21'),
(2, 8, 'Đặt lịch bị từ chối', 'Huấn luyện viên Lê Văn A đã từ chối lịch hẹn của bạn. Lịch: 22/01/2026 | 21:00 (Tối)', 'booking', 'trainer', 1, 1, '2026-01-22 03:51:51', '2026-05-01 08:41:21'),
(3, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Nguyễn Thị B đã xác nhận lịch hẹn của bạn. Lịch: 22/01/2026 | 21:00 (Tối)', 'booking', 'trainer', 3, 1, '2026-01-22 04:17:35', '2026-05-01 08:41:21'),
(4, 8, 'Đặt lớp thành công', 'Boxing • thứ 2 | 06:00', 'success', 'class', 1, 1, '2026-01-22 04:28:57', '2026-05-01 08:41:21'),
(5, 8, 'Đặt lớp thành công', 'Yoga • thứ 2 | 07:00', 'success', 'class', 2, 1, '2026-01-22 04:28:57', '2026-05-01 08:41:21'),
(6, 8, 'Đặt lớp thành công', 'Yoga • thứ 3 | 07:00', 'success', 'class', 2, 1, '2026-01-22 04:28:57', '2026-05-01 08:41:21'),
(7, 8, 'Đặt lớp thành công', 'Yoga • thứ 5 | 07:00', 'success', 'class', 2, 1, '2026-01-22 04:28:57', '2026-05-01 08:41:21'),
(8, 8, 'Đặt lớp thành công', 'Strength Training • thứ 3 | 18:00', 'success', 'class', 3, 1, '2026-01-22 04:28:57', '2026-05-01 08:41:21'),
(9, 8, 'Đặt lớp thành công', 'Strength Training • thứ 5 | 18:00', 'success', 'class', 3, 1, '2026-01-22 04:28:57', '2026-05-01 08:41:21'),
(10, 8, 'Đặt lớp thành công', 'Strength Training • thứ 7 | 18:00', 'success', 'class', 3, 1, '2026-01-22 04:28:57', '2026-05-01 08:41:21'),
(11, 8, 'Đặt lớp thành công', 'Gym & Fitness • thứ 2-7 | 09:00', 'success', 'class', 6, 1, '2026-01-22 04:52:01', '2026-05-01 08:41:21'),
(12, 8, 'Yêu cầu thuê HLV đã tạo', 'HLV Lê Văn A • 28/01/2026 | 09:00 (Sáng)', 'booking', 'trainer', 7, 1, '2026-01-22 04:52:58', '2026-05-01 08:41:21'),
(13, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Lê Văn A đã xác nhận lịch hẹn của bạn. Lịch: 28/01/2026 | 09:00 (Sáng)', 'booking', 'trainer', 4, 1, '2026-01-22 04:53:09', '2026-05-01 08:41:21'),
(14, 8, 'Yêu cầu thuê HLV đã tạo', 'HLV Lê Văn A • 31/01/2026 | 19:30 (Tối)', 'booking', 'trainer', 7, 1, '2026-01-22 04:55:16', '2026-05-01 08:41:21'),
(15, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Lê Văn A đã xác nhận lịch hẹn của bạn. Lịch: 31/01/2026 | 19:30 (Tối)', 'booking', 'trainer', 5, 1, '2026-01-22 04:55:37', '2026-05-01 08:41:21'),
(16, 8, 'Đặt lớp thành công', 'Wrestling & MMA • thứ 7 | 19:00', 'success', 'class', 5, 1, '2026-01-22 04:57:25', '2026-05-01 08:41:21'),
(17, 8, 'Yêu cầu thuê HLV đã tạo', 'HLV Lê Văn A • 30/01/2026 | 15:00 (Chiều)', 'booking', 'trainer', 7, 1, '2026-01-22 04:57:57', '2026-05-01 08:41:21'),
(18, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Lê Văn A đã xác nhận lịch hẹn của bạn. Lịch: 30/01/2026 | 15:00 (Chiều)', 'booking', 'trainer', 6, 1, '2026-01-22 04:58:08', '2026-05-01 08:41:21'),
(19, 8, 'Yêu cầu thuê HLV đã tạo', 'HLV Lê Văn A • 28/01/2026 | 16:30 (Chiều)', 'booking', 'trainer', 7, 1, '2026-01-22 05:01:09', '2026-05-01 08:41:21'),
(20, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Lê Văn A đã xác nhận lịch hẹn của bạn. Lịch: 28/01/2026 | 16:30 (Chiều)', 'booking', 'trainer', 7, 1, '2026-01-22 05:01:14', '2026-05-01 08:41:21'),
(21, 8, 'Yêu cầu thuê HLV đã tạo', 'HLV Lê Văn A • 28/01/2026 | 13:30 (Chiều)', 'booking', 'trainer', 7, 1, '2026-01-22 05:04:42', '2026-05-01 08:41:21'),
(22, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Lê Văn A đã xác nhận lịch hẹn của bạn. Lịch: 28/01/2026 | 13:30 (Chiều)', 'booking', 'trainer', 8, 1, '2026-01-22 05:05:39', '2026-05-01 08:41:21'),
(23, 8, 'Yêu cầu thuê HLV đã tạo', 'HLV Lê Văn A • 28/01/2026 | 21:00 (Tối)', 'booking', 'trainer', 7, 1, '2026-01-22 05:13:23', '2026-05-01 08:41:21'),
(24, 8, 'Yêu cầu thuê HLV đã tạo', 'HLV Nguyễn Thị B • 31/01/2026 | 21:00 (Tối)', 'booking', 'trainer', 2, 1, '2026-01-22 05:39:56', '2026-05-01 08:41:21'),
(25, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Nguyễn Thị B đã xác nhận lịch hẹn của bạn. Lịch: 31/01/2026 | 21:00 (Tối)', 'booking', 'trainer', 10, 1, '2026-01-22 05:40:59', '2026-05-01 08:41:21'),
(26, 9, 'Đặt lớp thành công', 'Boxing • thứ 2 | 06:00', 'success', 'class', 1, 1, '2026-04-30 07:44:55', '2026-04-30 08:42:26'),
(27, 9, 'Yêu cầu thuê HLV đã tạo', 'HLV Lê Văn A • 01/05/2026 | 06:00 (Sáng)', 'booking', 'trainer', 7, 1, '2026-04-30 07:45:37', '2026-04-30 08:42:26'),
(28, 9, 'Đặt lịch được xác nhận', 'Huấn luyện viên Lê Văn A đã xác nhận lịch hẹn của bạn. Lịch: 01/05/2026 | 06:00 (Sáng)', 'booking', 'trainer', 11, 1, '2026-04-30 07:47:30', '2026-04-30 08:42:26'),
(29, 8, 'Lịch dạy đã hoàn thành', 'Huấn luyện viên Lê Văn A đã xác nhận check-in lịch: 22/01/2026 | 19:30 (Tối)', 'booking', 'trainer', 2, 1, '2026-04-30 07:47:46', '2026-05-01 08:41:21'),
(30, 8, 'Lịch dạy đã hoàn thành', 'Huấn luyện viên Lê Văn A đã xác nhận check-in lịch: 30/01/2026 | 15:00 (Chiều)', 'booking', 'trainer', 6, 1, '2026-04-30 07:47:53', '2026-05-01 08:41:21'),
(31, 8, 'Lịch dạy đã hoàn thành', 'Huấn luyện viên Lê Văn A đã xác nhận check-in lịch: 28/01/2026 | 13:30 (Chiều)', 'booking', 'trainer', 8, 1, '2026-04-30 07:52:50', '2026-05-01 08:41:21'),
(32, 8, 'Đặt lịch bị từ chối', 'Huấn luyện viên Lê Văn A đã từ chối lịch hẹn của bạn. Lịch: 28/01/2026 | 21:00 (Tối)', 'booking', 'trainer', 9, 1, '2026-04-30 07:52:58', '2026-05-01 08:41:21'),
(33, 8, 'Thanh toán VNPay thành công', 'Đơn #52 thanh toán thành công. Số tiền: 4.180.000đ. Nội dung: VIP (mã: 00).', 'success', 'payment', 52, 1, '2026-05-01 01:49:15', '2026-05-01 08:41:21'),
(34, 8, 'Thanh toán VNPay thành công', 'Đơn #57 thanh toán thành công. Số tiền: 4.180.000đ. Nội dung: VIP (mã: 00).', 'success', 'payment', 57, 1, '2026-05-01 03:00:37', '2026-05-01 08:41:21'),
(35, 8, 'Yêu cầu thuê HLV đã tạo', 'HLV Lê Văn A • 01/05/2026 | 21:00 (Tối)', 'booking', 'trainer', 7, 1, '2026-05-01 04:00:54', '2026-05-01 08:41:21'),
(36, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Lê Văn A đã xác nhận lịch hẹn của bạn. Lịch: 01/05/2026 | 21:00 (Tối)', 'booking', 'trainer', 1, 1, '2026-05-01 04:01:08', '2026-05-01 08:41:21'),
(37, 8, 'Lịch dạy đã hoàn thành', 'Huấn luyện viên Lê Văn A đã xác nhận check-in lịch: 01/05/2026 | 21:00 (Tối)', 'booking', 'trainer', 1, 1, '2026-05-01 04:01:54', '2026-05-01 08:41:21'),
(38, 16, 'Yêu cầu rút tiền đã được duyệt', 'Yêu cầu rút 672.000đ của bạn đã được admin xác nhận.', 'success', 'withdrawal', 1, 1, '2026-05-01 04:28:01', '2026-05-01 05:33:08'),
(39, 8, 'Thanh toán VNPay thành công', 'Đơn #59 thanh toán thành công. Số tiền: 4.180.000đ. Nội dung: VIP (mã: 00).', 'success', 'payment', 59, 1, '2026-05-01 08:36:22', '2026-05-01 08:41:21'),
(40, 8, 'Thanh toán VNPay thành công', 'Đơn #60 thanh toán thành công. Số tiền: 2.420.000đ. Nội dung: Premium (mã: 00).', 'success', 'payment', 60, 1, '2026-05-01 08:40:57', '2026-05-01 08:41:21');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `total_amount` decimal(10,0) NOT NULL,
  `payment_method` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `vnpay_transaction_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vnpay_response_code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vnpay_response_message` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_user_id_foreign` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `payment_method`, `vnpay_transaction_id`, `vnpay_response_code`, `vnpay_response_message`, `status`, `created_at`, `updated_at`) VALUES
(1, 8, 308000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-01-22 03:04:24', '2026-01-22 03:04:24'),
(2, 8, 308000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-01-22 03:10:51', '2026-01-22 03:10:51'),
(3, 8, 330000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-01-22 03:16:49', '2026-01-22 03:16:49'),
(4, 8, 264000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-01-22 03:23:38', '2026-01-22 03:23:38'),
(5, 8, 495000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-01-22 04:15:09', '2026-01-22 04:15:09'),
(6, 8, 275000, 'credit_card', NULL, NULL, NULL, 'completed', '2026-01-22 04:17:19', '2026-01-22 04:17:19'),
(7, 8, 99000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-01-22 04:52:01', '2026-01-22 04:52:01'),
(8, 8, 308000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-01-22 04:52:58', '2026-01-22 04:52:58'),
(9, 8, 308000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-01-22 04:55:16', '2026-01-22 04:55:16'),
(10, 8, 198000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-01-22 04:57:25', '2026-01-22 04:57:25'),
(11, 8, 308000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-01-22 04:57:57', '2026-01-22 04:57:57'),
(12, 8, 308000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-01-22 05:01:09', '2026-01-22 05:01:09'),
(13, 8, 308000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-01-22 05:04:42', '2026-01-22 05:04:42'),
(14, 8, 308000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-01-22 05:13:23', '2026-01-22 05:13:23'),
(15, 8, 275000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-01-22 05:39:56', '2026-01-22 05:39:56'),
(16, 9, 4180000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-04-30 07:38:26', '2026-04-30 07:38:26'),
(17, 9, 110000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-04-30 07:44:55', '2026-04-30 07:44:55'),
(18, 9, 308000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-04-30 07:45:37', '2026-04-30 07:45:37'),
(19, 9, 99000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 10:15:22', '2026-04-30 10:15:22'),
(20, 9, 176000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 10:16:23', '2026-04-30 10:16:23'),
(21, 9, 88000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 10:28:12', '2026-04-30 10:28:12'),
(22, 9, 88000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 10:29:57', '2026-04-30 10:29:57'),
(23, 9, 88000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 10:30:03', '2026-04-30 10:30:03'),
(24, 8, 2420000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 10:31:53', '2026-04-30 10:31:53'),
(25, 8, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 10:37:34', '2026-04-30 10:37:34'),
(26, 8, 1, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 10:38:41', '2026-04-30 10:38:41'),
(27, 9, 2420001, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 10:43:15', '2026-04-30 10:43:15'),
(28, 9, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 10:43:55', '2026-04-30 10:43:55'),
(29, 8, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 10:44:16', '2026-04-30 10:44:16'),
(30, 8, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 10:44:58', '2026-04-30 10:44:58'),
(31, 9, 2420000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 10:49:58', '2026-04-30 10:49:58'),
(32, 9, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 10:51:33', '2026-04-30 10:51:33'),
(33, 9, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 10:53:10', '2026-04-30 10:53:10'),
(34, 8, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 10:59:10', '2026-04-30 10:59:10'),
(35, 8, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 11:04:26', '2026-04-30 11:04:26'),
(36, 8, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 11:06:06', '2026-04-30 11:06:06'),
(37, 8, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 11:09:27', '2026-04-30 11:09:27'),
(38, 8, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 11:16:26', '2026-04-30 11:16:26'),
(39, 8, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 11:23:37', '2026-04-30 11:23:37'),
(40, 8, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 11:31:10', '2026-04-30 11:31:10'),
(41, 8, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 11:32:13', '2026-04-30 11:32:13'),
(42, 8, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 11:38:27', '2026-04-30 11:38:27'),
(43, 8, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-04-30 11:38:46', '2026-04-30 11:38:46'),
(44, 8, 4180000, 'vnpay', NULL, '99', 'Lỗi xử lý: Undefined array key \"schedule\"', 'failed', '2026-04-30 11:40:42', '2026-04-30 11:41:08'),
(45, 8, 4180000, 'vnpay', NULL, '99', 'Lỗi xử lý: Undefined array key \"schedule\"', 'failed', '2026-04-30 11:42:20', '2026-04-30 11:42:46'),
(46, 8, 4180000, 'vnpay', '15518499', '00', 'Thanh toán thành công', 'completed', '2026-04-30 11:46:24', '2026-04-30 11:46:52'),
(47, 8, 4180000, 'vnpay', '15518500', '00', 'Thanh toán thành công', 'completed', '2026-04-30 11:48:25', '2026-04-30 11:49:28'),
(48, 8, 4180000, 'vnpay', '15518791', '00', 'Thanh toán thành công', 'completed', '2026-05-01 01:19:50', '2026-05-01 01:22:16'),
(49, 8, 4180000, 'vnpay', '15518798', '00', 'Thanh toán thành công', 'completed', '2026-05-01 01:28:55', '2026-05-01 01:29:33'),
(50, 8, 1, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-05-01 01:30:49', '2026-05-01 01:30:49'),
(51, 8, 4180000, 'vnpay', '15518824', '00', 'Thanh toán thành công', 'completed', '2026-05-01 01:40:38', '2026-05-01 01:41:10'),
(52, 8, 4180000, 'vnpay', '15518838', '00', 'Thanh toán thành công', 'completed', '2026-05-01 01:48:50', '2026-05-01 01:49:15'),
(53, 8, 2420000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-05-01 02:48:25', '2026-05-01 02:48:25'),
(54, 8, 2420000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-05-01 02:48:57', '2026-05-01 02:48:57'),
(55, 8, 6600000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-05-01 02:51:26', '2026-05-01 02:51:26'),
(56, 8, 4180000, 'vnpay', NULL, NULL, NULL, 'pending', '2026-05-01 02:54:14', '2026-05-01 02:54:14'),
(57, 8, 4180000, 'vnpay', '15518915', '00', 'Thanh toán thành công', 'completed', '2026-05-01 03:00:11', '2026-05-01 03:00:37'),
(58, 8, 4488000, 'bank_transfer', NULL, NULL, NULL, 'completed', '2026-05-01 04:00:54', '2026-05-01 04:00:54'),
(59, 8, 4180000, 'vnpay', '15519120', '00', 'Thanh toán thành công', 'completed', '2026-05-01 08:35:39', '2026-05-01 08:36:22'),
(60, 8, 2420000, 'vnpay', '15519123', '00', 'Thanh toán thành công', 'completed', '2026-05-01 08:40:32', '2026-05-01 08:40:57');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `item_id` bigint NOT NULL,
  `item_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,0) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`)
) ENGINE=MyISAM AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `item_id`, `item_name`, `item_type`, `price`, `created_at`, `updated_at`) VALUES
(1, 1, 7, 'HLV Lê Văn A', 'trainer', 280000, NULL, NULL),
(2, 2, 7, 'HLV Lê Văn A', 'trainer', 280000, NULL, NULL),
(3, 3, 1, 'Boxing', 'class', 100000, NULL, NULL),
(4, 4, 2, 'Yoga', 'class', 80000, NULL, NULL),
(5, 5, 3, 'Strength Training', 'class', 150000, NULL, NULL),
(6, 6, 2, 'HLV Nguyễn Thị B', 'trainer', 250000, NULL, NULL),
(7, 7, 6, 'Gym & Fitness', 'class', 90000, NULL, NULL),
(8, 8, 7, 'HLV Lê Văn A', 'trainer', 280000, NULL, NULL),
(9, 9, 7, 'HLV Lê Văn A', 'trainer', 280000, NULL, NULL),
(10, 10, 5, 'Wrestling & MMA', 'class', 180000, NULL, NULL),
(11, 11, 7, 'HLV Lê Văn A', 'trainer', 280000, NULL, NULL),
(12, 12, 7, 'HLV Lê Văn A', 'trainer', 280000, NULL, NULL),
(13, 13, 7, 'HLV Lê Văn A', 'trainer', 280000, NULL, NULL),
(14, 14, 7, 'HLV Lê Văn A', 'trainer', 280000, NULL, NULL),
(15, 15, 2, 'HLV Nguyễn Thị B', 'trainer', 250000, NULL, NULL),
(16, 16, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(17, 17, 1, 'Boxing', 'class', 100000, NULL, NULL),
(18, 18, 7, 'HLV Lê Văn A', 'trainer', 280000, NULL, NULL),
(19, 19, 6, 'Gym & Fitness', 'class', 90000, NULL, NULL),
(20, 20, 2, 'Yoga', 'class', 80000, NULL, NULL),
(21, 21, 2, 'Yoga', 'class', 80000, NULL, NULL),
(22, 22, 2, 'Yoga', 'class', 80000, NULL, NULL),
(23, 23, 2, 'Yoga', 'class', 80000, NULL, NULL),
(24, 24, 3, 'Premium', 'membership', 2200000, NULL, NULL),
(25, 25, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(26, 26, 7, 'a', 'membership', 1, NULL, NULL),
(27, 27, 3, 'Premium', 'membership', 2200000, NULL, NULL),
(28, 27, 7, 'a', 'membership', 1, NULL, NULL),
(29, 28, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(30, 29, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(31, 30, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(32, 31, 3, 'Premium', 'membership', 2200000, NULL, NULL),
(33, 32, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(34, 33, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(35, 34, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(36, 35, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(37, 36, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(38, 37, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(39, 38, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(40, 39, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(41, 40, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(42, 41, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(43, 42, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(44, 43, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(45, 44, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(46, 45, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(47, 46, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(48, 47, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(49, 48, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(50, 49, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(51, 50, 7, 'a', 'membership', 1, NULL, NULL),
(52, 51, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(53, 52, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(54, 53, 3, 'Premium', 'membership', 2200000, NULL, NULL),
(55, 54, 3, 'Premium', 'membership', 2200000, NULL, NULL),
(56, 55, 3, 'Premium', 'membership', 2200000, NULL, NULL),
(57, 55, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(58, 56, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(59, 57, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(60, 58, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(61, 58, 7, 'HLV Lê Văn A', 'trainer', 280000, NULL, NULL),
(62, 59, 4, 'VIP', 'membership', 3800000, NULL, NULL),
(63, 60, 3, 'Premium', 'membership', 2200000, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
CREATE TABLE IF NOT EXISTS `packages` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,0) NOT NULL,
  `old_price` decimal(10,0) DEFAULT NULL,
  `benefits` int DEFAULT '0',
  `benefits_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'blue',
  `is_popular` tinyint(1) DEFAULT '0',
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`id`, `name`, `duration`, `price`, `old_price`, `benefits`, `benefits_text`, `color`, `is_popular`, `status`, `created_at`, `updated_at`) VALUES
(2, 'Standard', '3', 1200000, 1500000, 1, 'Tập 4 buổi/tuần, Tư vấn chi tiết, 2 lần check-up', 'green', 1, 'active', '2026-01-22 08:38:17', '2026-01-22 08:38:17'),
(3, 'Premium', '6', 2200000, 2700000, 1, 'Tập không giới hạn, Tư vấn toàn diện, 4 lần check-up, Cấp bằng', 'purple', 1, 'active', '2026-01-22 08:38:17', '2026-01-22 08:38:17'),
(4, 'VIP', '12', 3800000, 4500000, 1, 'Tất cả, Huấn luyện viên riêng, Lịch tập cá nhân, Hỗ trợ 24/7', 'purple', 0, 'active', '2026-01-22 08:38:17', '2026-01-22 08:38:17'),
(7, 'a', '2', 1, NULL, 4, '1\n1\n1\n1', 'green', 0, 'active', '2026-01-22 02:49:10', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pending_registrations`
--

DROP TABLE IF EXISTS `pending_registrations`;
CREATE TABLE IF NOT EXISTS `pending_registrations` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `verification_code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_expires_at` timestamp NOT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pending_registrations_email_unique` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'auth_token', '75419db3c93ef6d89ba49e074fd7aed865a2e82dac1a1079e791526cb962f40c', '[\"*\"]', '2026-01-22 01:40:03', NULL, '2026-01-22 01:38:43', '2026-01-22 01:40:03'),
(59, 'App\\Models\\User', 9, 'auth_token', '90b19a0d8290c7470543051775aa7dc7beec323682e5b29c26939ab22e0dc3b1', '[\"*\"]', '2026-04-30 07:39:45', NULL, '2026-04-30 07:38:14', '2026-04-30 07:39:45'),
(60, 'App\\Models\\User', 1, 'auth_token', '2cb97db82c8831a05fa51b3a3eb9f145716c8cb357e23e4cf49b1b5cb06bd165', '[\"*\"]', '2026-04-30 08:00:31', NULL, '2026-04-30 07:40:11', '2026-04-30 08:00:31'),
(61, 'App\\Models\\User', 9, 'auth_token', 'c1d72f363f243e83d6cdbee0594580cf2ba7049685ebf5186715387d2e949d7a', '[\"*\"]', '2026-04-30 07:46:41', NULL, '2026-04-30 07:44:31', '2026-04-30 07:46:41'),
(62, 'App\\Models\\User', 16, 'auth_token', 'd4e23bdbf20922dc1a7ce62d2b29291a58931943de66192661a45603afa0f02a', '[\"*\"]', '2026-04-30 07:53:04', NULL, '2026-04-30 07:47:06', '2026-04-30 07:53:04'),
(63, 'App\\Models\\User', 1, 'auth_token', '101b7900ec4cafa11189645fb07169a965d5b491efbd8b094da16bafc5a37431', '[\"*\"]', '2026-04-30 08:18:09', NULL, '2026-04-30 07:53:19', '2026-04-30 08:18:09'),
(64, 'App\\Models\\User', 1, 'auth_token', 'c1e4f556658785aa7a683e7c0e43c2b507d3c1a51d39acb93f3d570f00566343', '[\"*\"]', '2026-04-30 08:16:54', NULL, '2026-04-30 08:08:25', '2026-04-30 08:16:54'),
(65, 'App\\Models\\User', 1, 'test', 'be360fba2e0b6d6aab59f02538cd9bb57549cb09c98aa7076de2af15982bf946', '[\"*\"]', '2026-04-30 08:35:31', NULL, '2026-04-30 08:12:51', '2026-04-30 08:35:31'),
(66, 'App\\Models\\User', 1, 'auth_token', '7150fe9170dd8a035c8f5af389b7228dfe57ad7078b0956a6e5f01dbc0364ab2', '[\"*\"]', '2026-04-30 08:19:18', NULL, '2026-04-30 08:17:08', '2026-04-30 08:19:18'),
(67, 'App\\Models\\User', 3, 'auth_token', '33ad9513e5a6b4df86f0045334fed4b93a3c348b72ad21ed047dd630d1bbfe8e', '[\"*\"]', '2026-04-30 08:18:50', NULL, '2026-04-30 08:18:40', '2026-04-30 08:18:50'),
(68, 'App\\Models\\User', 16, 'auth_token', '6936bea6a53d8970f772bcb23f9b4b38fed03cb51e2f5700cc6f37661c2842eb', '[\"*\"]', '2026-04-30 08:22:21', NULL, '2026-04-30 08:19:01', '2026-04-30 08:22:21'),
(69, 'App\\Models\\User', 16, 'auth_token', '0a3cebfbb0ac7810caf007002552468df08e493c10215db0ab3dc06023886010', '[\"*\"]', '2026-04-30 08:24:03', NULL, '2026-04-30 08:19:33', '2026-04-30 08:24:03'),
(70, 'App\\Models\\User', 1, 'auth_token', 'f12ac8e9ddf8b9958ed586b0d553cbaf4d036d7a6b7f5aa66fb54623bb3e3a7c', '[\"*\"]', '2026-04-30 08:22:50', NULL, '2026-04-30 08:22:40', '2026-04-30 08:22:50'),
(71, 'App\\Models\\User', 8, 'auth_token', '6ed8100b1b91ff4857eb05b9927999b0834d25f3f0803b6b0110ef30f440a7df', '[\"*\"]', '2026-04-30 08:30:04', NULL, '2026-04-30 08:23:06', '2026-04-30 08:30:04'),
(72, 'App\\Models\\User', 1, 'auth_token', '9fec60a47f33a25b2bfc2ddb7b82413f99debb2accb5bee620446483ee7cbfcc', '[\"*\"]', '2026-04-30 08:24:38', NULL, '2026-04-30 08:24:18', '2026-04-30 08:24:38'),
(73, 'App\\Models\\User', 1, 'auth_token', '50636da4b4ee5f342f11f96421daa96f6de9c7a27eebc0b32b849d40ce610787', '[\"*\"]', '2026-04-30 08:31:09', NULL, '2026-04-30 08:24:48', '2026-04-30 08:31:09'),
(74, 'App\\Models\\User', 16, 'auth_token', 'cecf2da15ab6a7cde3fcac09f42c0384ff19be9bf6aefcbf8626a2e12aceca84', '[\"*\"]', '2026-04-30 08:30:50', NULL, '2026-04-30 08:30:29', '2026-04-30 08:30:50'),
(75, 'App\\Models\\User', 16, 'auth_token', 'a06dcca7c13f2f5d45f9d4dab7cde345878d7a91d601ad1d5a11d429187f01c9', '[\"*\"]', '2026-04-30 08:39:44', NULL, '2026-04-30 08:31:30', '2026-04-30 08:39:44'),
(76, 'App\\Models\\User', 1, 'auth_token', 'aa6c48a619110c6b3476b766425e3d7341c6cb76f89b6d0e0eb70e6580c06688', '[\"*\"]', '2026-04-30 08:42:05', NULL, '2026-04-30 08:32:14', '2026-04-30 08:42:05'),
(77, 'App\\Models\\User', 3, 'trainer-test', '4784168ebf047da76d202874c59683c5806e293a4015d6607a08a181b76740a2', '[\"*\"]', '2026-04-30 08:36:24', NULL, '2026-04-30 08:36:07', '2026-04-30 08:36:24'),
(78, 'App\\Models\\User', 16, 'trainer-one', 'f03ee18c8e7befa09e9941527b5b16d7e2d5f77521ddb078fbcd12d32d025514', '[\"*\"]', '2026-04-30 08:39:36', NULL, '2026-04-30 08:38:51', '2026-04-30 08:39:36'),
(79, 'App\\Models\\User', 16, 'auth_token', '40e8f136f8ff1981b83bc27301d22e78bc0f79862990e96703b24e739a5615fb', '[\"*\"]', '2026-04-30 08:41:24', NULL, '2026-04-30 08:40:14', '2026-04-30 08:41:24'),
(80, 'App\\Models\\User', 8, 'auth_token', '868ca84b36e300c5e15e59bb1b8d15c83c5fc84cffc59e28c1a9067b6f14bac1', '[\"*\"]', '2026-04-30 08:43:03', NULL, '2026-04-30 08:41:43', '2026-04-30 08:43:03'),
(81, 'App\\Models\\User', 9, 'auth_token', '36507259ae7c79fc69cbc62223abe2dcef19effa2f93c115e9c9ab341df4fdda', '[\"*\"]', '2026-04-30 10:14:23', NULL, '2026-04-30 08:42:23', '2026-04-30 10:14:23'),
(82, 'App\\Models\\User', 16, 'auth_token', '6ea9bcdca369168a495f29a8741b5b00d1099769cffb942cb1a00d1712e6a5a1', '[\"*\"]', '2026-04-30 10:36:06', NULL, '2026-04-30 08:43:22', '2026-04-30 10:36:06'),
(83, 'App\\Models\\User', 9, 'auth_token', '2377fb71ad2364f2699d85a69ec69b761b5529579cbdbdfc84c5110e82438a96', '[\"*\"]', '2026-04-30 10:30:42', NULL, '2026-04-30 10:14:43', '2026-04-30 10:30:42'),
(84, 'App\\Models\\User', 16, 'auth_token', 'e04a48211f505e52e435b493e8a2fcf79f8b5092b5e884d3721a74b1af4fe07f', '[\"*\"]', '2026-04-30 10:31:03', NULL, '2026-04-30 10:30:56', '2026-04-30 10:31:03'),
(85, 'App\\Models\\User', 8, 'auth_token', 'f79536420b4f55ff297a311e401a479b4cbd9e1fc27dfbe1a16fd7ae225ad503', '[\"*\"]', '2026-04-30 10:32:48', NULL, '2026-04-30 10:31:14', '2026-04-30 10:32:48'),
(86, 'App\\Models\\User', 9, 'auth_token', '253b9bf99f5d3fe117051755f55f9e2d385323bd91ac78161e24f9fce7ac1761', '[\"*\"]', '2026-04-30 10:43:30', NULL, '2026-04-30 10:35:00', '2026-04-30 10:43:30'),
(87, 'App\\Models\\User', 8, 'auth_token', '442f491eb69921980cb16e21c34c6060755df27212f9831fbf034a364b3be748', '[\"*\"]', '2026-04-30 10:36:48', NULL, '2026-04-30 10:36:17', '2026-04-30 10:36:48'),
(88, 'App\\Models\\User', 8, 'auth_token', '2260d1733345b05b6a82ce1e4c6bc06a85dac138c04dc73af75ddf7b75ca5700', '[\"*\"]', '2026-04-30 10:44:17', NULL, '2026-04-30 10:37:19', '2026-04-30 10:44:17'),
(89, 'App\\Models\\User', 9, 'auth_token', '7fde44bacaabbb050d665ce20b0dc5c3e45bdc54d1a6242d6bcb71aac72b4552', '[\"*\"]', '2026-05-01 04:00:22', NULL, '2026-04-30 10:43:40', '2026-05-01 04:00:22'),
(90, 'App\\Models\\User', 8, 'auth_token', '704cdbd63b21ee404fe1d65a15909832ff69f957001d1c794eddc783fa8a5c92', '[\"*\"]', '2026-04-30 10:49:12', NULL, '2026-04-30 10:44:46', '2026-04-30 10:49:12'),
(91, 'App\\Models\\User', 9, 'auth_token', '7a0c0a976e82b4f5c8344931277c13982f5e9bb50cd043139aeb0794b1395bf4', '[\"*\"]', '2026-04-30 10:56:48', NULL, '2026-04-30 10:49:39', '2026-04-30 10:56:48'),
(92, 'App\\Models\\User', 8, 'auth_token', 'b1cf69cb0e053faff4fc31bd5196b9bd61dfd7a8c8f4bddb3b2d56fdc7592ece', '[\"*\"]', '2026-04-30 11:02:58', NULL, '2026-04-30 10:58:58', '2026-04-30 11:02:58'),
(93, 'App\\Models\\User', 8, 'auth_token', '457cb3f9491603b09b659fe29d52b6ff94de1a8dd83abbb327d3fc7fe3c677fd', '[\"*\"]', '2026-04-30 11:05:38', NULL, '2026-04-30 11:03:58', '2026-04-30 11:05:38'),
(94, 'App\\Models\\User', 8, 'auth_token', '4b48382f84a50c73a1fac5f4aac2233a1befd9e44f340abc9fb39eda4f8a0cc6', '[\"*\"]', '2026-04-30 11:08:55', NULL, '2026-04-30 11:05:55', '2026-04-30 11:08:55'),
(95, 'App\\Models\\User', 8, 'auth_token', 'b5e4dcec23c249e5919499b811a5562eb4d23561a43d02ea0799bb545151a513', '[\"*\"]', '2026-04-30 11:23:13', NULL, '2026-04-30 11:09:16', '2026-04-30 11:23:13'),
(96, 'App\\Models\\User', 8, 'auth_token', '4a65dc32c912aa1bcd1cf799493ae1764ca085e925f4a46073b37e6ce1ad52f2', '[\"*\"]', '2026-04-30 11:31:53', NULL, '2026-04-30 11:23:27', '2026-04-30 11:31:53'),
(97, 'App\\Models\\User', 8, 'auth_token', '7c13c1176b6dcf14b71ed941c0916f08cd84d44ee622d46c4adba072ab70774c', '[\"*\"]', '2026-04-30 11:38:10', NULL, '2026-04-30 11:32:03', '2026-04-30 11:38:10'),
(98, 'App\\Models\\User', 8, 'auth_token', 'cc0d553b7b4d09bc80f53f7f81707f435257ccce14e6e5b0dd6f6f61c8048804', '[\"*\"]', '2026-04-30 11:40:20', NULL, '2026-04-30 11:38:20', '2026-04-30 11:40:20'),
(99, 'App\\Models\\User', 8, 'auth_token', 'e7c27991a6e5a96ef0196a6f2ea70da4db8df3584d7f66164a2b2780db7e8142', '[\"*\"]', '2026-04-30 11:41:58', NULL, '2026-04-30 11:40:33', '2026-04-30 11:41:58'),
(100, 'App\\Models\\User', 8, 'auth_token', 'cec8fa3dca43089760a22bc9c6fa732f04f12560cbbf9ebdac61cf133497657a', '[\"*\"]', '2026-04-30 11:42:20', NULL, '2026-04-30 11:42:09', '2026-04-30 11:42:20'),
(101, 'App\\Models\\User', 8, 'auth_token', '59ec5f922baa9de70d29163ff09dcdebced79da0bab4830e85f56369810f91e7', '[\"*\"]', '2026-04-30 11:48:07', NULL, '2026-04-30 11:46:12', '2026-04-30 11:48:07'),
(102, 'App\\Models\\User', 8, 'auth_token', '331b62c919feb9dab730e7945306bb5be5c6364813f2fe61d29043723c65190f', '[\"*\"]', '2026-04-30 11:52:43', NULL, '2026-04-30 11:48:17', '2026-04-30 11:52:43'),
(103, 'App\\Models\\User', 8, 'auth_token', 'e819202a27c022839981d1e08e982b94fede56ec576c542c27f8802061776c1e', '[\"*\"]', '2026-05-01 01:28:14', NULL, '2026-05-01 01:19:20', '2026-05-01 01:28:14'),
(104, 'App\\Models\\User', 8, 'auth_token', 'ae80f604307370356186939663a0fc8492e384804b65af6edb50a7bff6b18f54', '[\"*\"]', '2026-05-01 01:32:45', NULL, '2026-05-01 01:28:35', '2026-05-01 01:32:45'),
(105, 'App\\Models\\User', 8, 'auth_token', 'e1349bbfcc998cb24cccf49ce8f9f29072d7b1752ba97d960232b4ef573ed1dc', '[\"*\"]', '2026-05-01 01:40:01', NULL, '2026-05-01 01:33:30', '2026-05-01 01:40:01'),
(106, 'App\\Models\\User', 8, 'auth_token', '5ef2239f5a77d477f355d320bc2d3ccc0a05c8acf0fed24aaeead99851b47b53', '[\"*\"]', '2026-05-01 01:48:01', NULL, '2026-05-01 01:40:26', '2026-05-01 01:48:01'),
(107, 'App\\Models\\User', 8, 'auth_token', '717ca0f0420f6de235b354989b74e8dc9c48b0f13636d3a2e388efda4f8df524', '[\"*\"]', '2026-05-01 02:06:25', NULL, '2026-05-01 01:48:25', '2026-05-01 02:06:25'),
(108, 'App\\Models\\User', 8, 'auth_token', 'db0897d1b256ec51fa35771fba172ab84ca97729213881fc828ade1450fe2775', '[\"*\"]', '2026-05-01 02:50:14', NULL, '2026-05-01 02:46:24', '2026-05-01 02:50:14'),
(109, 'App\\Models\\User', 8, 'auth_token', '07e59b9addfff89b3b352575bdf970bbe7d477f05433d5a92ac489f78c8d71ed', '[\"*\"]', '2026-05-01 02:52:48', NULL, '2026-05-01 02:51:04', '2026-05-01 02:52:48'),
(110, 'App\\Models\\User', 8, 'auth_token', 'bc792fe6b039bdab0fae79fa56c9bc1af3817999bb7ae82b6ef4a972efb65155', '[\"*\"]', '2026-05-01 02:59:30', NULL, '2026-05-01 02:53:32', '2026-05-01 02:59:30'),
(111, 'App\\Models\\User', 8, 'auth_token', '25b734a5bfe2481516a560005543f62a4613b932c6a4f62fb69d8331cde6bd20', '[\"*\"]', '2026-05-01 03:02:47', NULL, '2026-05-01 02:59:54', '2026-05-01 03:02:47'),
(112, 'App\\Models\\User', 8, 'auth_token', '2653f1202eafcc1862c8c448bb991fce656b9620e650791cc7c10a90dc2c1a5c', '[\"*\"]', '2026-05-01 03:55:23', NULL, '2026-05-01 03:11:42', '2026-05-01 03:55:23'),
(113, 'App\\Models\\User', 3, 'auth_token', '3fc822281e7099def5358048e78cc2e6928089a92ec7654273c67881846b6b12', '[\"*\"]', '2026-05-01 03:56:21', NULL, '2026-05-01 03:55:51', '2026-05-01 03:56:21'),
(114, 'App\\Models\\User', 16, 'auth_token', 'e5f5b6d44bfba528e0e4101c0b1ce83019bd1cf757fa6a85968226e5d51e4993', '[\"*\"]', '2026-05-01 03:56:36', NULL, '2026-05-01 03:56:35', '2026-05-01 03:56:36'),
(115, 'App\\Models\\User', 3, 'auth_token', 'dafe2613c07f9a760bdc93c052b82e2c30558c06a6d9ad2596d21da587a5c6e6', '[\"*\"]', '2026-05-01 03:56:56', NULL, '2026-05-01 03:56:52', '2026-05-01 03:56:56'),
(116, 'App\\Models\\User', 16, 'auth_token', '80a3b8543d9da852bcdf3e7e114d52c172c736d07286b08f5474886c7f91bc4e', '[\"*\"]', '2026-05-01 03:57:33', NULL, '2026-05-01 03:57:13', '2026-05-01 03:57:33'),
(117, 'App\\Models\\User', 3, 'auth_token', 'f9808199983b70388d324038010d5abd0f4dcc66b422ea8e5c4e10b0452cb434', '[\"*\"]', '2026-05-01 03:58:00', NULL, '2026-05-01 03:57:57', '2026-05-01 03:58:00'),
(118, 'App\\Models\\User', 3, 'auth_token', '813493681af0d5cf51d22f2c7ddab068c909d7cb67a84ccc71992291f7e4c036', '[\"*\"]', '2026-05-01 03:58:24', NULL, '2026-05-01 03:58:13', '2026-05-01 03:58:24'),
(119, 'App\\Models\\User', 16, 'auth_token', '0a5efd0de811ec2534792e4e0f603516a0d7ef2727480e77a71d040cfa1ef1d0', '[\"*\"]', '2026-05-01 03:58:50', NULL, '2026-05-01 03:58:40', '2026-05-01 03:58:50'),
(120, 'App\\Models\\User', 1, 'auth_token', '65851d01639707884e8623dfdd83120f2adecd06a582baca28162b737131f826', '[\"*\"]', '2026-05-01 04:10:07', NULL, '2026-05-01 03:59:02', '2026-05-01 04:10:07'),
(121, 'App\\Models\\User', 8, 'auth_token', '4a4291900a4d01d733b99327c5ba71e627818bdc2918cc6f2f4627a798786a6d', '[\"*\"]', '2026-05-01 04:01:24', NULL, '2026-05-01 04:00:37', '2026-05-01 04:01:24'),
(122, 'App\\Models\\User', 16, 'auth_token', '8fb5b4db8f3e975c6fb6d18e33794a14edcc01995e92d52145270bd2d42884d9', '[\"*\"]', '2026-05-01 04:13:12', NULL, '2026-05-01 04:01:39', '2026-05-01 04:13:12'),
(123, 'App\\Models\\User', 1, 'auth_token', '84a46cf4cdb2f482e074a02564a194d67b22d62912579d15005c3dc8f96b3e1d', '[\"*\"]', '2026-05-01 04:14:56', NULL, '2026-05-01 04:10:35', '2026-05-01 04:14:56'),
(124, 'App\\Models\\User', 1, 'auth_token', '8ac9f193db88be85d70140deee4bae39934558b6c6f9216fbb526548a0062d3f', '[\"*\"]', '2026-05-01 08:34:59', NULL, '2026-05-01 04:13:21', '2026-05-01 08:34:59'),
(125, 'App\\Models\\User', 16, 'auth_token', '313c22c41a15cfa0682084ca52935d5a2ce2bba91b5032b5376adc60de201096', '[\"*\"]', '2026-05-01 05:35:02', NULL, '2026-05-01 05:33:00', '2026-05-01 05:35:02'),
(126, 'App\\Models\\User', 8, 'auth_token', 'd3af75967c6d97bd0b475f07454b5c7afa8061b51e6c5e8211e3d467dccd65bd', '[\"*\"]', '2026-05-01 05:37:59', NULL, '2026-05-01 05:35:28', '2026-05-01 05:37:59'),
(127, 'App\\Models\\User', 8, 'auth_token', 'df58cf8cc3013db2c3a6037437e5588ff50e424c4268dfcbb973b1d8d972f3ff', '[\"*\"]', '2026-05-01 05:39:47', NULL, '2026-05-01 05:38:36', '2026-05-01 05:39:47'),
(128, 'App\\Models\\User', 8, 'auth_token', 'b9953cb99c418df00fc76ee2bcbddcc5ab9e30a62beb86cb2475ea7e65e4158a', '[\"*\"]', '2026-05-01 05:41:32', NULL, '2026-05-01 05:40:29', '2026-05-01 05:41:32'),
(129, 'App\\Models\\User', 8, 'auth_token', '9da9826d1e199e1b31ec2428cc481e8d4e4777a1aab9de1e7cf36aa575863883', '[\"*\"]', '2026-05-01 08:33:55', NULL, '2026-05-01 05:55:42', '2026-05-01 08:33:55'),
(130, 'App\\Models\\User', 1, 'auth_token', '995ba03b113d06b5429ce0daca7c14844b61db8dbdcd24f0a6d37e4481a9bb9f', '[\"*\"]', '2026-05-01 08:35:08', NULL, '2026-05-01 08:34:07', '2026-05-01 08:35:08'),
(131, 'App\\Models\\User', 8, 'auth_token', 'efe579aad3b47e5a0dc20c5fe4580e28f845ac447e1e3524c10d16743e15328b', '[\"*\"]', '2026-05-01 08:37:14', NULL, '2026-05-01 08:35:22', '2026-05-01 08:37:14'),
(132, 'App\\Models\\User', 1, 'auth_token', '6fc5e657ac85a7d828d05e953760b1816f696b55a9535b47691059a183b8da04', '[\"*\"]', '2026-05-01 10:15:10', NULL, '2026-05-01 08:37:07', '2026-05-01 10:15:10'),
(133, 'App\\Models\\User', 8, 'auth_token', '3683b9407e6665d64270bb25f4a949324b4bfffc796b4be6f4f326d4a25dd948', '[\"*\"]', '2026-05-01 08:41:27', NULL, '2026-05-01 08:40:16', '2026-05-01 08:41:27'),
(134, 'App\\Models\\User', 1, 'auth_token', '3d6affbfa6d4c2123323c587bfdb58b022af7c94a80ee2c6dbd02cbd8f549f41', '[\"*\"]', '2026-05-01 08:49:42', NULL, '2026-05-01 08:42:17', '2026-05-01 08:49:42'),
(135, 'App\\Models\\User', 1, 'auth_token', '7ce3e88ffa9133b47e0b0f06cf65c8b862b3b845d620ec88ce8837d4b1beead8', '[\"*\"]', '2026-05-01 08:53:24', NULL, '2026-05-01 08:50:04', '2026-05-01 08:53:24'),
(136, 'App\\Models\\User', 1, 'auth_token', '693ae8d913b351a473a35e62cb3c748b5795c68e458aee9ad57d77ef07d671af', '[\"*\"]', '2026-05-01 08:55:29', NULL, '2026-05-01 08:53:38', '2026-05-01 08:55:29'),
(137, 'App\\Models\\User', 1, 'auth_token', '5004be3a650f175a7d34ddae679e41a81446c7e68e5701a9ac5f50d392aa84ac', '[\"*\"]', '2026-05-01 09:10:05', NULL, '2026-05-01 08:55:44', '2026-05-01 09:10:05'),
(138, 'App\\Models\\User', 1, 'auth_token', '6461cd7a71ae99175abc5af1ff295f534a06f3f24260891942d279c0ed03a98a', '[\"*\"]', '2026-05-01 09:14:44', NULL, '2026-05-01 09:10:24', '2026-05-01 09:14:44'),
(139, 'App\\Models\\User', 1, 'auth_token', '36e6e2b4a0f50f0cbe3757eb9068feabdec0b48b680159f4674546bc9a6760f2', '[\"*\"]', NULL, NULL, '2026-05-01 09:16:50', '2026-05-01 09:16:50'),
(140, 'App\\Models\\User', 1, 'auth_token', 'ef1daf1c960e6f3b4322cbf4b9c81f9d5d242726e7bb9b348dc00c63f51625ba', '[\"*\"]', NULL, NULL, '2026-05-01 09:17:50', '2026-05-01 09:17:50'),
(141, 'App\\Models\\User', 1, 'auth_token', 'ef28934258499f382774b60245117cd1fa4761e944701b17c27e85f904b34301', '[\"*\"]', '2026-05-01 09:26:52', NULL, '2026-05-01 09:18:34', '2026-05-01 09:26:52'),
(142, 'App\\Models\\User', 1, 'auth_token', '92ee734e81be439f911723072882178a5c1df2a41ebdf25a2b8463b3a2f67df4', '[\"*\"]', '2026-05-01 09:30:42', NULL, '2026-05-01 09:27:01', '2026-05-01 09:30:42'),
(143, 'App\\Models\\User', 1, 'auth_token', 'a7713f3a3ee5447f19ef9f6ff278b7a1745415f6c17b96e708578afaed546e1b', '[\"*\"]', '2026-05-01 09:32:19', NULL, '2026-05-01 09:30:56', '2026-05-01 09:32:19'),
(144, 'App\\Models\\User', 1, 'auth_token', '79bf16afea7925a8f9c027f141a956f2329684405ec0da860e1ebc565fed61ce', '[\"*\"]', '2026-05-01 09:33:16', NULL, '2026-05-01 09:33:13', '2026-05-01 09:33:16'),
(145, 'App\\Models\\User', 1, 'auth_token', '6edf6ec6f7e1cbdedf4eeb801208a6b3252136642821b4fd79b36ede67e96c21', '[\"*\"]', '2026-05-01 09:37:32', NULL, '2026-05-01 09:33:52', '2026-05-01 09:37:32'),
(146, 'App\\Models\\User', 1, 'auth_token', '11d6cdc768f7bdd8ba730b448c601620f595f7109bd47c42f4b1a7cd23a74775', '[\"*\"]', '2026-05-01 09:41:55', NULL, '2026-05-01 09:37:46', '2026-05-01 09:41:55'),
(147, 'App\\Models\\User', 1, 'auth_token', '00d2db7a8591405611c78c218be40ad01b1d2be8c0561b40186f5bcde14625f1', '[\"*\"]', '2026-05-01 09:46:58', NULL, '2026-05-01 09:42:11', '2026-05-01 09:46:58'),
(148, 'App\\Models\\User', 1, 'auth_token', '4e06e2926eb1d5c9f2b9ac4a6077c8a89f8d208d670b95cb4354938299eeb4b7', '[\"*\"]', '2026-05-01 10:01:08', NULL, '2026-05-01 09:47:29', '2026-05-01 10:01:08'),
(149, 'App\\Models\\User', 8, 'auth_token', 'eab6c5ed35cea811c08ecdaacdba1607e59480a2c7b1ccbebee81da7d2242d92', '[\"*\"]', '2026-05-01 10:03:39', NULL, '2026-05-01 10:01:18', '2026-05-01 10:03:39'),
(150, 'App\\Models\\User', 1, 'auth_token', 'e434161b66c79ded5ffb9c08a1f91e7cb598665ed6452b8f9991accca88b7276', '[\"*\"]', '2026-05-01 10:14:37', NULL, '2026-05-01 10:14:36', '2026-05-01 10:14:37'),
(151, 'App\\Models\\User', 1, 'auth_token', '9ab1443e23408e2c63064cd4a16af09f981eb816abdfb7a63ec5d57df06256d8', '[\"*\"]', '2026-05-01 10:50:42', NULL, '2026-05-01 10:15:24', '2026-05-01 10:50:42'),
(152, 'App\\Models\\User', 1, 'auth_token', 'ab7c2d461eb8f1a9e80f95a656cd002723d28d7ad5225c448e97dbe619990d9a', '[\"*\"]', '2026-05-02 02:27:07', NULL, '2026-05-02 02:19:58', '2026-05-02 02:27:07'),
(153, 'App\\Models\\User', 8, 'auth_token', 'efd98ffc4e2b95cc34fbe4f19e2719d713386bc61ca78635166330d6095283ac', '[\"*\"]', '2026-05-02 02:28:10', NULL, '2026-05-02 02:20:30', '2026-05-02 02:28:10'),
(154, 'App\\Models\\User', 1, 'auth_token', 'da30e17d98c69f1c8be91b0d8c79c16f63a473d2d11ba205a9531accb1ee3677', '[\"*\"]', '2026-05-02 02:42:10', NULL, '2026-05-02 02:28:29', '2026-05-02 02:42:10');

-- --------------------------------------------------------

--
-- Table structure for table `push_campaigns`
--

DROP TABLE IF EXISTS `push_campaigns`;
CREATE TABLE IF NOT EXISTS `push_campaigns` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_audience` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `send_at` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `status` enum('draft','scheduled','sent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `recipient_count` int DEFAULT NULL,
  `success_count` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `refund_requests`
--

DROP TABLE IF EXISTS `refund_requests`;
CREATE TABLE IF NOT EXISTS `refund_requests` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `booking_id` bigint UNSIGNED NOT NULL,
  `member_id` bigint UNSIGNED NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `requested_amount` decimal(10,2) NOT NULL,
  `approved_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','approved','rejected','processed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approved_by` bigint UNSIGNED DEFAULT NULL,
  `refund_method` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `session_notes`
--

DROP TABLE IF EXISTS `session_notes`;
CREATE TABLE IF NOT EXISTS `session_notes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `booking_id` bigint UNSIGNED NOT NULL,
  `trainer_id` bigint UNSIGNED NOT NULL,
  `member_id` bigint UNSIGNED NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `focus_areas` json DEFAULT NULL,
  `performance` int DEFAULT NULL,
  `next_focus` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `session_notes_booking_idx` (`booking_id`),
  KEY `session_notes_trainer_idx` (`trainer_id`),
  KEY `session_notes_member_idx` (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_settings_key_unique` (`key`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `key`, `value`, `type`, `created_at`, `updated_at`) VALUES
(1, 'monthly_revenue_target', '50000000', 'float', '2026-05-02 02:28:12', '2026-05-02 02:28:12');

-- --------------------------------------------------------

--
-- Table structure for table `time_offs`
--

DROP TABLE IF EXISTS `time_offs`;
CREATE TABLE IF NOT EXISTS `time_offs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `trainer_id` bigint UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `approved_by` bigint UNSIGNED DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trainers`
--

DROP TABLE IF EXISTS `trainers`;
CREATE TABLE IF NOT EXISTS `trainers` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `spec` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exp` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` decimal(2,1) DEFAULT '5.0',
  `availability` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,0) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `trainers_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trainers`
--

INSERT INTO `trainers` (`id`, `user_id`, `name`, `email`, `phone`, `image`, `spec`, `exp`, `rating`, `availability`, `price`, `created_at`, `updated_at`) VALUES
(2, 3, 'Nguyễn Thị B', 'trainer2@gmail.com', NULL, NULL, 'Yoga & Pilates', '6 năm', 4.8, 'Sáng, Chiều, Tối', 250000, '2026-01-22 08:38:17', '2026-01-22 08:38:17'),
(7, 16, 'Lê Văn A', 'trainer1@gmail.com', '', NULL, 'Gym & Fitness', '7 năm', 5.0, 'Sáng, Chiều, Tối', 280000, '2026-01-22 02:42:12', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `trainer_earnings`
--

DROP TABLE IF EXISTS `trainer_earnings`;
CREATE TABLE IF NOT EXISTS `trainer_earnings` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `trainer_id` bigint UNSIGNED NOT NULL,
  `total_earnings` decimal(15,2) NOT NULL DEFAULT '0.00',
  `completed_sessions` int NOT NULL DEFAULT '0',
  `pending_sessions` int NOT NULL DEFAULT '0',
  `cancelled_sessions` int NOT NULL DEFAULT '0',
  `withdrawal_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `commission_rate` decimal(5,2) NOT NULL DEFAULT '20.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `trainer_earnings_trainer_unique` (`trainer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trainer_earnings`
--

INSERT INTO `trainer_earnings` (`id`, `trainer_id`, `total_earnings`, `completed_sessions`, `pending_sessions`, `cancelled_sessions`, `withdrawal_balance`, `commission_rate`, `created_at`, `updated_at`) VALUES
(1, 16, 672000.00, 4, 0, 0, 0.00, 60.00, '2026-04-30 14:36:41', '2026-05-01 04:02:11'),
(2, 3, 0.00, 0, 0, 0, 0.00, 60.00, '2026-04-30 14:36:41', '2026-04-30 08:18:46');

-- --------------------------------------------------------

--
-- Table structure for table `transaction_reports`
--

DROP TABLE IF EXISTS `transaction_reports`;
CREATE TABLE IF NOT EXISTS `transaction_reports` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `member_id` bigint UNSIGNED DEFAULT NULL,
  `trainer_id` bigint UNSIGNED DEFAULT NULL,
  `type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `details` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transaction_reports_date_type_idx` (`date`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `avatar`, `role`, `phone`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Quản Trị Viên', 'admin@gmail.com', '2026-01-22 08:38:17', '$2y$12$Q7cYpclEI.CUOmMX.bzhWObnkXepmgu9jnAe1AKCHvFRBAaoe9B3.', '/storage/avatars/qyYRkHPLTwWnMVkTUpumeDPL86ebciezqWrMRPjZ.jpg', 'admin', NULL, NULL, '2026-01-22 08:38:17', '2026-05-01 09:57:49'),
(3, 'Nguyễn Thị B', 'trainer2@gmail.com', '2026-01-22 08:38:17', '$2y$12$nKr72U2yoG5CXZfaQwWBJOFq8USJHvDEsdNKhW5WsL3hqLZHCQvXW', NULL, 'trainer', NULL, NULL, '2026-01-22 08:38:17', '2026-05-01 03:56:11'),
(8, 'Thành viên 1', 'member1@gmail.com', '2026-01-22 08:38:17', '$2y$12$dAMen./CPslgrsnecfYmKuMXmdS0WmPffBYzhSlCJrFeVLW56ye/i', NULL, 'user', NULL, NULL, '2026-01-22 08:38:17', '2026-04-30 08:41:59'),
(9, 'Thành viên 2', 'member2@gmail.com', '2026-01-22 08:38:17', '$2y$12$bxBCtDkCv549AfUmx3BURO2DFEhFITamFoGruvyor7jyw1SgYMpqS', NULL, 'user', NULL, NULL, '2026-01-22 08:38:17', '2026-04-30 10:14:54'),
(16, 'Lê Văn A', 'trainer1@gmail.com', NULL, '$2y$12$13ZQX6nLlvTVazpcugn2zeQ1Zk.W95N.UGh.MvBkJyxA09PXYGqjC', NULL, 'trainer', '', NULL, '2026-01-22 02:42:12', '2026-04-30 08:31:49');

-- --------------------------------------------------------

--
-- Table structure for table `vouchers`
--

DROP TABLE IF EXISTS `vouchers`;
CREATE TABLE IF NOT EXISTS `vouchers` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` enum('percentage','fixed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `max_uses` int DEFAULT NULL,
  `used_count` int NOT NULL DEFAULT '0',
  `min_order_amount` decimal(10,2) DEFAULT NULL,
  `valid_from` date NOT NULL,
  `valid_until` date NOT NULL,
  `applicable_to` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vouchers_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `waitlist_entries`
--

DROP TABLE IF EXISTS `waitlist_entries`;
CREATE TABLE IF NOT EXISTS `waitlist_entries` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `member_id` bigint UNSIGNED NOT NULL,
  `item_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_id` bigint NOT NULL,
  `position` int NOT NULL DEFAULT '1',
  `notified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `waitlist_entries_unique` (`member_id`,`item_type`,`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `withdrawal_requests`
--

DROP TABLE IF EXISTS `withdrawal_requests`;
CREATE TABLE IF NOT EXISTS `withdrawal_requests` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `trainer_id` bigint UNSIGNED NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `method` enum('bank_transfer','wallet') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'bank_transfer',
  `bank_details` json DEFAULT NULL,
  `status` enum('pending','approved','rejected','processed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `confirmation_images` json DEFAULT NULL,
  `approved_by` bigint UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `withdrawal_requests_trainer_id_foreign` (`trainer_id`),
  KEY `withdrawal_requests_approved_by_foreign` (`approved_by`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `withdrawal_requests`
--

INSERT INTO `withdrawal_requests` (`id`, `trainer_id`, `amount`, `method`, `bank_details`, `status`, `notes`, `confirmation_images`, `approved_by`, `approved_at`, `created_at`, `updated_at`) VALUES
(1, 16, 672000.00, 'bank_transfer', '{\"bank_name\": \"acb\", \"account_holder\": \"avc\", \"account_number\": \"0011\"}', 'approved', 'ok', '[\"/storage/withdrawal-confirmations/rlLmhy97bWZHFvBNUWReoHsKKS6FCHGOGUm7pfcg.jpg\"]', 1, '2026-05-01 04:28:01', '2026-05-01 04:02:11', '2026-05-01 04:28:01');

-- --------------------------------------------------------

--
-- Table structure for table `working_hours`
--

DROP TABLE IF EXISTS `working_hours`;
CREATE TABLE IF NOT EXISTS `working_hours` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `trainer_id` bigint UNSIGNED NOT NULL,
  `day_of_week` int NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `working_hours_trainer_day_unique` (`trainer_id`,`day_of_week`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `working_hours`
--

INSERT INTO `working_hours` (`id`, `trainer_id`, `day_of_week`, `start_time`, `end_time`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 16, 0, '09:00:00', '17:00:00', 1, '2026-04-30 14:36:41', '2026-04-30 14:36:41');

-- --------------------------------------------------------

--
-- Table structure for table `workout_plans`
--

DROP TABLE IF EXISTS `workout_plans`;
CREATE TABLE IF NOT EXISTS `workout_plans` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `trainer_id` bigint UNSIGNED NOT NULL,
  `member_id` bigint UNSIGNED NOT NULL,
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` int DEFAULT NULL,
  `difficulty` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `workout_plans_trainer_idx` (`trainer_id`),
  KEY `workout_plans_member_idx` (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `workout_schedules`
--

DROP TABLE IF EXISTS `workout_schedules`;
CREATE TABLE IF NOT EXISTS `workout_schedules` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `time` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `trainers`
--
ALTER TABLE `trainers`
  ADD CONSTRAINT `trainers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
