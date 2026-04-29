-- phpMyAdmin SQL Dump for Local Development
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Database: gym (LOCAL)
-- Generation Time: April 27, 2026
-- Server version: 8.0.45
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Create Database for Local Development
--

DROP DATABASE IF EXISTS `quanlygym`;
CREATE DATABASE IF NOT EXISTS `quanlygym` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quanlygym`;

-- --------------------------------------------------------

--
-- Table structure for table `booking_classes`
--

DROP TABLE IF EXISTS `booking_classes`;
CREATE TABLE IF NOT EXISTS `booking_classes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `class_id` bigint UNSIGNED DEFAULT NULL,
  `schedule` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_classes_user_class_schedule_unique` (`user_id`,`class_id`,`schedule`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(9, 8, 5, 'thứ 7 | 19:00', 'confirmed', '2026-01-22 04:57:25', '2026-01-22 04:57:25');

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
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `booking_trainers`
--

INSERT INTO `booking_trainers` (`id`, `user_id`, `trainer_id`, `schedule_info`, `status`, `created_at`, `updated_at`) VALUES
(1, 8, 7, '22/01/2026 | 21:00 (Tối)', 'rejected', '2026-01-22 03:04:24', '2026-01-22 03:51:51'),
(2, 8, 7, '22/01/2026 | 19:30 (Tối)', 'confirmed', '2026-01-22 03:10:51', '2026-01-22 03:51:41'),
(3, 8, 2, '22/01/2026 | 21:00 (Tối)', 'confirmed', '2026-01-22 04:17:19', '2026-01-22 04:17:35'),
(4, 8, 7, '28/01/2026 | 09:00 (Sáng)', 'confirmed', '2026-01-22 04:52:58', '2026-01-22 04:53:09'),
(5, 8, 7, '31/01/2026 | 19:30 (Tối)', 'confirmed', '2026-01-22 04:55:16', '2026-01-22 04:55:37'),
(6, 8, 7, '30/01/2026 | 15:00 (Chiều)', 'confirmed', '2026-01-22 04:57:57', '2026-01-22 04:58:08'),
(7, 8, 7, '28/01/2026 | 16:30 (Chiều)', 'confirmed', '2026-01-22 05:01:09', '2026-01-22 05:01:14'),
(8, 8, 7, '28/01/2026 | 13:30 (Chiều)', 'confirmed', '2026-01-22 05:04:42', '2026-01-22 05:05:39'),
(9, 8, 7, '28/01/2026 | 21:00 (Tối)', 'pending', '2026-01-22 05:13:23', NULL),
(10, 8, 2, '31/01/2026 | 21:00 (Tối)', 'confirmed', '2026-01-22 05:39:56', '2026-01-22 05:40:59');

-- --------------------------------------------------------

--
-- Table structure for table `gym_classes`
--

DROP TABLE IF EXISTS `gym_classes`;
CREATE TABLE IF NOT EXISTS `gym_classes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trainer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `time` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `days` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int NOT NULL,
  `registered` int DEFAULT '0',
  `price` decimal(10,0) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gym_classes`
--

INSERT INTO `gym_classes` (`id`, `name`, `trainer_name`, `time`, `duration`, `days`, `location`, `capacity`, `registered`, `price`, `created_at`, `updated_at`) VALUES
(1, 'Boxing', 'Nguyễn Văn A', '06:00', '60 phút', 'Thứ 2, 4, 6', 'Phòng 1', 20, 13, 100000, '2026-01-22 08:38:17', '2026-01-22 08:38:17'),
(2, 'Yoga', 'Nguyễn Thị B', '07:00', '75 phút', 'Thứ 2, 3, 5', 'Phòng 2', 25, 21, 80000, '2026-01-22 08:38:17', '2026-01-22 08:38:17'),
(3, 'Strength Training', 'Trần Văn C', '18:00', '90 phút', 'Thứ 3, 5, 7', 'Phòng 3', 15, 11, 150000, '2026-01-22 08:38:17', '2026-01-22 08:38:17'),
(5, 'Wrestling & MMA', 'Hoàng Văn E', '19:00', '90 phút', 'Thứ 4, 6, 7', 'Phòng 5', 12, 6, 180000, '2026-01-22 08:38:17', '2026-01-22 08:38:17'),
(6, 'Gym & Fitness', 'Võ Thị F', '09:00', '60 phút', 'Thứ 2-7', 'Phòng 1', 40, 36, 90000, '2026-01-22 08:38:17', '2026-01-22 08:38:17'),
(7, 'a', 'a', '06:00 AM', '1', '2', 'a', 3, 1, 2, '2026-01-22 02:49:42', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
CREATE TABLE IF NOT EXISTS `members` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pack` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `end` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,0) DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`id`, `name`, `email`, `phone`, `pack`, `duration`, `start`, `end`, `price`, `status`, `created_at`, `updated_at`) VALUES
(9, 'abc', 'abc@gmail.com', '0123456789', 'VIP', '12', '2026-01-22', '2027-01-22', 3800000, 'active', '2026-01-22 02:21:16', '2026-01-22 02:21:16'),
(10, 'Thành viên 5', 'member5@gmail.com', NULL, 'Standard', '3', '2026-01-22', '2026-04-22', 1200000, 'active', '2026-01-22 02:50:27', '2026-01-22 02:50:27');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(34, '2026_04_27_000014_create_booking_trainers_table_if_missing', 1);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'info',
  `related_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_id` bigint DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_foreign` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `related_type`, `related_id`, `is_read`, `created_at`, `updated_at`) VALUES
(1, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Lê Văn A đã xác nhận lịch hẹn của bạn. Lịch: 22/01/2026 | 19:30 (Tối)', 'booking', 'trainer', 2, 1, '2026-01-22 03:51:41', '2026-01-22 05:41:29'),
(2, 8, 'Đặt lịch bị từ chối', 'Huấn luyện viên Lê Văn A đã từ chối lịch hẹn của bạn. Lịch: 22/01/2026 | 21:00 (Tối)', 'booking', 'trainer', 1, 1, '2026-01-22 03:51:51', '2026-01-22 05:41:29'),
(3, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Nguyễn Thị B đã xác nhận lịch hẹn của bạn. Lịch: 22/01/2026 | 21:00 (Tối)', 'booking', 'trainer', 3, 1, '2026-01-22 04:17:35', '2026-01-22 05:41:29'),
(4, 8, 'Đặt lớp thành công', 'Boxing • thứ 2 | 06:00', 'success', 'class', 1, 1, '2026-01-22 04:28:57', '2026-01-22 05:41:29'),
(5, 8, 'Đặt lớp thành công', 'Yoga • thứ 2 | 07:00', 'success', 'class', 2, 1, '2026-01-22 04:28:57', '2026-01-22 05:41:29'),
(6, 8, 'Đặt lớp thành công', 'Yoga • thứ 3 | 07:00', 'success', 'class', 2, 1, '2026-01-22 04:28:57', '2026-01-22 05:41:29'),
(7, 8, 'Đặt lớp thành công', 'Yoga • thứ 5 | 07:00', 'success', 'class', 2, 1, '2026-01-22 04:28:57', '2026-01-22 05:41:29'),
(8, 8, 'Đặt lớp thành công', 'Strength Training • thứ 3 | 18:00', 'success', 'class', 3, 1, '2026-01-22 04:28:57', '2026-01-22 05:41:29'),
(9, 8, 'Đặt lớp thành công', 'Strength Training • thứ 5 | 18:00', 'success', 'class', 3, 1, '2026-01-22 04:28:57', '2026-01-22 05:41:29'),
(10, 8, 'Đặt lớp thành công', 'Strength Training • thứ 7 | 18:00', 'success', 'class', 3, 1, '2026-01-22 04:28:57', '2026-01-22 05:41:29'),
(11, 8, 'Đặt lớp thành công', 'Gym & Fitness • thứ 2-7 | 09:00', 'success', 'class', 6, 1, '2026-01-22 04:52:01', '2026-01-22 05:41:29'),
(12, 8, 'Yêu cầu thuê HLV đã tạo', 'HLV Lê Văn A • 28/01/2026 | 09:00 (Sáng)', 'booking', 'trainer', 7, 1, '2026-01-22 04:52:58', '2026-01-22 05:41:29'),
(13, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Lê Văn A đã xác nhận lịch hẹn của bạn. Lịch: 28/01/2026 | 09:00 (Sáng)', 'booking', 'trainer', 4, 1, '2026-01-22 04:53:09', '2026-01-22 05:41:29'),
(14, 8, 'Yêu cầu thuê HLV đã tạo', 'HLV Lê Văn A • 31/01/2026 | 19:30 (Tối)', 'booking', 'trainer', 7, 1, '2026-01-22 04:55:16', '2026-01-22 05:41:29'),
(15, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Lê Văn A đã xác nhận lịch hẹn của bạn. Lịch: 31/01/2026 | 19:30 (Tối)', 'booking', 'trainer', 5, 1, '2026-01-22 04:55:37', '2026-01-22 05:41:29'),
(16, 8, 'Đặt lớp thành công', 'Wrestling & MMA • thứ 7 | 19:00', 'success', 'class', 5, 1, '2026-01-22 04:57:25', '2026-01-22 05:41:29'),
(17, 8, 'Yêu cầu thuê HLV đã tạo', 'HLV Lê Văn A • 30/01/2026 | 15:00 (Chiều)', 'booking', 'trainer', 7, 1, '2026-01-22 04:57:57', '2026-01-22 05:41:29'),
(18, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Lê Văn A đã xác nhận lịch hẹn của bạn. Lịch: 30/01/2026 | 15:00 (Chiều)', 'booking', 'trainer', 6, 1, '2026-01-22 04:58:08', '2026-01-22 05:41:29'),
(19, 8, 'Yêu cầu thuê HLV đã tạo', 'HLV Lê Văn A • 28/01/2026 | 16:30 (Chiều)', 'booking', 'trainer', 7, 1, '2026-01-22 05:01:09', '2026-01-22 05:41:29'),
(20, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Lê Văn A đã xác nhận lịch hẹn của bạn. Lịch: 28/01/2026 | 16:30 (Chiều)', 'booking', 'trainer', 7, 1, '2026-01-22 05:01:14', '2026-01-22 05:41:29'),
(21, 8, 'Yêu cầu thuê HLV đã tạo', 'HLV Lê Văn A • 28/01/2026 | 13:30 (Chiều)', 'booking', 'trainer', 7, 1, '2026-01-22 05:04:42', '2026-01-22 05:41:29'),
(22, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Lê Văn A đã xác nhận lịch hẹn của bạn. Lịch: 28/01/2026 | 13:30 (Chiều)', 'booking', 'trainer', 8, 1, '2026-01-22 05:05:39', '2026-01-22 05:41:29'),
(23, 8, 'Yêu cầu thuê HLV đã tạo', 'HLV Lê Văn A • 28/01/2026 | 21:00 (Tối)', 'booking', 'trainer', 7, 1, '2026-01-22 05:13:23', '2026-01-22 05:41:29'),
(24, 8, 'Yêu cầu thuê HLV đã tạo', 'HLV Nguyễn Thị B • 31/01/2026 | 21:00 (Tối)', 'booking', 'trainer', 2, 1, '2026-01-22 05:39:56', '2026-01-22 05:41:29'),
(25, 8, 'Đặt lịch được xác nhận', 'Huấn luyện viên Nguyễn Thị B đã xác nhận lịch hẹn của bạn. Lịch: 31/01/2026 | 21:00 (Tối)', 'booking', 'trainer', 10, 1, '2026-01-22 05:40:59', '2026-01-22 05:41:29');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `total_amount` decimal(10,0) NOT NULL,
  `payment_method` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_user_id_foreign` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `payment_method`, `status`, `created_at`, `updated_at`) VALUES
(1, 8, 308000, 'bank_transfer', 'completed', '2026-01-22 03:04:24', '2026-01-22 03:04:24'),
(2, 8, 308000, 'bank_transfer', 'completed', '2026-01-22 03:10:51', '2026-01-22 03:10:51'),
(3, 8, 330000, 'bank_transfer', 'completed', '2026-01-22 03:16:49', '2026-01-22 03:16:49'),
(4, 8, 264000, 'bank_transfer', 'completed', '2026-01-22 03:23:38', '2026-01-22 03:23:38'),
(5, 8, 495000, 'bank_transfer', 'completed', '2026-01-22 04:15:09', '2026-01-22 04:15:09'),
(6, 8, 275000, 'credit_card', 'completed', '2026-01-22 04:17:19', '2026-01-22 04:17:19'),
(7, 8, 99000, 'bank_transfer', 'completed', '2026-01-22 04:52:01', '2026-01-22 04:52:01'),
(8, 8, 308000, 'bank_transfer', 'completed', '2026-01-22 04:52:58', '2026-01-22 04:52:58'),
(9, 8, 308000, 'bank_transfer', 'completed', '2026-01-22 04:55:16', '2026-01-22 04:55:16'),
(10, 8, 198000, 'bank_transfer', 'completed', '2026-01-22 04:57:25', '2026-01-22 04:57:25'),
(11, 8, 308000, 'bank_transfer', 'completed', '2026-01-22 04:57:57', '2026-01-22 04:57:57'),
(12, 8, 308000, 'bank_transfer', 'completed', '2026-01-22 05:01:09', '2026-01-22 05:01:09'),
(13, 8, 308000, 'bank_transfer', 'completed', '2026-01-22 05:04:42', '2026-01-22 05:04:42'),
(14, 8, 308000, 'bank_transfer', 'completed', '2026-01-22 05:13:23', '2026-01-22 05:13:23'),
(15, 8, 275000, 'bank_transfer', 'completed', '2026-01-22 05:39:56', '2026-01-22 05:39:56');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `item_id` bigint NOT NULL,
  `item_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,0) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(15, 15, 2, 'HLV Nguyễn Thị B', 'trainer', 250000, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
CREATE TABLE IF NOT EXISTS `packages` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,0) NOT NULL,
  `old_price` decimal(10,0) DEFAULT NULL,
  `benefits` int DEFAULT '0',
  `benefits_text` text COLLATE utf8mb4_unicode_ci,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'blue',
  `is_popular` tinyint(1) DEFAULT '0',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
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
-- Table structure for table `pending_registrations`
--

DROP TABLE IF EXISTS `pending_registrations`;
CREATE TABLE IF NOT EXISTS `pending_registrations` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verification_code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens` (Token sample - for development only)
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'auth_token', '75419db3c93ef6d89ba49e074fd7aed865a2e82dac1a1079e791526cb962f40c', '[\"*\"]', '2026-01-22 01:40:03', NULL, '2026-01-22 01:38:43', '2026-01-22 01:40:03');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

INSERT INTO `working_hours` (`id`, `trainer_id`, `day_of_week`, `start_time`, `end_time`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 16, 0, '09:00:00', '17:00:00', 1, NOW(), NOW());

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
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `description` text COLLATE utf8mb4_unicode_ci,
  `approved_by` bigint UNSIGNED DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `approved_at` timestamp NULL DEFAULT NULL,
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
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `focus_areas` json DEFAULT NULL,
  `performance` int DEFAULT NULL,
  `next_focus` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `session_notes_booking_idx` (`booking_id`),
  KEY `session_notes_trainer_idx` (`trainer_id`),
  KEY `session_notes_member_idx` (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `workout_plans`
--

DROP TABLE IF EXISTS `workout_plans`;
CREATE TABLE IF NOT EXISTS `workout_plans` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `trainer_id` bigint UNSIGNED NOT NULL,
  `member_id` bigint UNSIGNED NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` int DEFAULT NULL,
  `difficulty` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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

INSERT INTO `trainer_earnings` (`id`, `trainer_id`, `total_earnings`, `completed_sessions`, `pending_sessions`, `cancelled_sessions`, `withdrawal_balance`, `commission_rate`, `created_at`, `updated_at`) VALUES
(1, 16, 0.00, 0, 0, 0, 0.00, 20.00, NOW(), NOW()),
(2, 3, 0.00, 0, 0, 0, 0.00, 20.00, NOW(), NOW());

-- --------------------------------------------------------

--
-- Table structure for table `waitlist_entries`
--

DROP TABLE IF EXISTS `waitlist_entries`;
CREATE TABLE IF NOT EXISTS `waitlist_entries` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `member_id` bigint UNSIGNED NOT NULL,
  `item_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
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
-- Table structure for table `membership_freezes`
--

DROP TABLE IF EXISTS `membership_freezes`;
CREATE TABLE IF NOT EXISTS `membership_freezes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `member_id` bigint UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','active','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approved_by` bigint UNSIGNED DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
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
  `card_number` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qr_code` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `member_cards_member_unique` (`member_id`),
  UNIQUE KEY `member_cards_number_unique` (`card_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_cancellations`
--

DROP TABLE IF EXISTS `booking_cancellations`;
CREATE TABLE IF NOT EXISTS `booking_cancellations` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `booking_id` bigint UNSIGNED NOT NULL,
  `member_id` bigint UNSIGNED NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `cancelled_at` timestamp NOT NULL,
  `penalty` decimal(10,2) DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','approved','rejected','processed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vouchers`
--

DROP TABLE IF EXISTS `vouchers`;
CREATE TABLE IF NOT EXISTS `vouchers` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` enum('percentage','fixed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `max_uses` int DEFAULT NULL,
  `used_count` int NOT NULL DEFAULT '0',
  `min_order_amount` decimal(10,2) DEFAULT NULL,
  `valid_from` date NOT NULL,
  `valid_until` date NOT NULL,
  `applicable_to` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vouchers_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `push_campaigns`
--

DROP TABLE IF EXISTS `push_campaigns`;
CREATE TABLE IF NOT EXISTS `push_campaigns` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_audience` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `send_at` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `status` enum('draft','scheduled','sent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
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
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `requested_amount` decimal(10,2) NOT NULL,
  `approved_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','approved','rejected','processed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approved_by` bigint UNSIGNED DEFAULT NULL,
  `refund_method` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `details` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transaction_reports_date_type_idx` (`date`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trainers`
--

DROP TABLE IF EXISTS `trainers`;
CREATE TABLE IF NOT EXISTS `trainers` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `spec` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exp` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` decimal(2,1) DEFAULT '5.0',
  `availability` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,0) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trainers` (Trainer images removed for local compatibility)
--

INSERT INTO `trainers` (`id`, `name`, `email`, `phone`, `image`, `spec`, `exp`, `rating`, `availability`, `price`, `created_at`, `updated_at`) VALUES
(2, 'Nguyễn Thị B', 'trainer2@gmail.com', NULL, NULL, 'Yoga & Pilates', '6 năm', 4.8, 'Sáng, Chiều, Tối', 250000, '2026-01-22 08:38:17', '2026-01-22 08:38:17'),
(7, 'Lê Văn A', 'trainer1@gmail.com', '', NULL, 'Gym & Fitness', '7 năm', 5.0, 'Sáng, Chiều, Tối', 280000, '2026-01-22 02:42:12', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `avatar`, `role`, `phone`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Quản Trị Viên', 'admin@gmail.com', '2026-01-22 08:38:17', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'admin', NULL, NULL, '2026-01-22 08:38:17', '2026-01-22 08:38:17'),
(3, 'Nguyễn Thị B', 'trainer2@gmail.com', '2026-01-22 08:38:17', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'trainer', NULL, NULL, '2026-01-22 08:38:17', '2026-01-22 08:38:17'),
(8, 'Thành viên 1', 'member1@gmail.com', '2026-01-22 08:38:17', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'user', NULL, NULL, '2026-01-22 08:38:17', '2026-01-22 08:38:17'),
(9, 'Thành viên 2', 'member2@gmail.com', '2026-01-22 08:38:17', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'user', NULL, NULL, '2026-01-22 08:38:17', '2026-01-22 08:38:17'),
(16, 'Lê Văn A', 'trainer1@gmail.com', NULL, '$2y$12$H2Q1sc21ZRVrQ6N1nnyZCOeomq/1jmlIsYYzQiRtW4E4UOIJy3l2C', NULL, 'trainer', '', NULL, '2026-01-22 02:42:12', '2026-01-22 02:42:12');

-- --------------------------------------------------------

--
-- Table structure for table `workout_schedules`
--

DROP TABLE IF EXISTS `workout_schedules`;
CREATE TABLE IF NOT EXISTS `workout_schedules` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `time` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- ========================================================
-- IMPORT INSTRUCTIONS FOR LOCAL DEVELOPMENT
-- ========================================================
--
-- To import this file to your local MySQL database:
--
-- Option 1: Using MySQL Command Line
-- ================================
-- mysql -u root -p < quanlygym_local.sql
--
-- Option 2: Using phpMyAdmin
-- =========================
-- 1. Open phpMyAdmin (usually http://localhost/phpmyadmin)
-- 2. Click "Import" tab
-- 3. Select this file (quanlygym_local.sql)
-- 4. Click "Go" to import
--
-- Option 3: Using Laravel Artisan
-- ==============================
-- After importing, update .env file:
-- DB_CONNECTION=mysql
-- DB_HOST=127.0.0.1
-- DB_PORT=3306
-- DB_DATABASE=gym
-- DB_USERNAME=root
-- DB_PASSWORD=
--
-- Then run: php artisan migrate --seed
--
-- ========================================================
-- TEST ACCOUNT CREDENTIALS (Password: 123456)
-- ========================================================
-- Admin: admin@gmail.com
-- Trainer 1: trainer1@gmail.com
-- Trainer 2: trainer2@gmail.com
-- Member 1: member1@gmail.com
-- Member 2: member2@gmail.com
--

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
