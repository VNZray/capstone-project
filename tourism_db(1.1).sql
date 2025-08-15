-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 15, 2025 at 05:28 PM
-- Server version: 11.8.3-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tourism_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `amenity`
--

CREATE TABLE `amenity` (
  `id` int(11) NOT NULL,
  `amenity` varchar(30) NOT NULL,
  `icon` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `amenity`
--

INSERT INTO `amenity` (`id`, `amenity`, `icon`) VALUES
(1, 'Parking', ''),
(2, 'Comfort Room', '');

-- --------------------------------------------------------

--
-- Table structure for table `barangay`
--

CREATE TABLE `barangay` (
  `id` int(11) NOT NULL,
  `barangay` varchar(30) NOT NULL,
  `municipality_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `barangay`
--

INSERT INTO `barangay` (`id`, `barangay`, `municipality_id`) VALUES
(1, 'Abella', 24),
(2, 'Bagumbayan Norte', 24),
(3, 'Bagumbayan Sur', 24),
(4, 'Balatas', 24),
(5, 'Calauag', 24),
(6, 'Cararayan', 24),
(7, 'Carolina', 24),
(8, 'Concepcion Grande', 24),
(9, 'Concepcion Pequeña', 24),
(10, 'Dayangdang', 24),
(11, 'Del Rosario', 24),
(12, 'Dinaga', 24),
(13, 'Igualdad Interior', 24),
(14, 'Lerma', 24),
(15, 'Liboton', 24),
(16, 'Mabolo', 24),
(17, 'Pacol', 24),
(18, 'Panicuason', 24),
(19, 'Peñafrancia', 24),
(20, 'Sabang', 24),
(21, 'San Felipe', 24),
(22, 'San Francisco', 24),
(23, 'San Isidro', 24),
(24, 'Santa Cruz', 24),
(25, 'Tabuco', 24),
(26, 'Tinago', 24),
(27, 'Triangulo', 24),
(28, 'Paniman', 11);

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `id` uuid NOT NULL DEFAULT uuid(),
  `pax` int(3) NOT NULL,
  `num_children` tinyint(3) NOT NULL DEFAULT 0,
  `num_adults` tinyint(3) NOT NULL DEFAULT 0,
  `foreign_counts` tinyint(3) NOT NULL DEFAULT 0,
  `domestic_counts` tinyint(3) NOT NULL DEFAULT 0,
  `overseas_counts` tinyint(3) NOT NULL DEFAULT 0,
  `local_counts` tinyint(3) NOT NULL DEFAULT 0,
  `trip_purpose` varchar(30) NOT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date NOT NULL,
  `total_price` float NOT NULL,
  `balance` float DEFAULT NULL,
  `booking_status` enum('Pending','Booked','Checked-In','checked-out','Cancellled','') NOT NULL,
  `business_id` uuid NOT NULL,
  `room_id` uuid NOT NULL,
  `tourist_id` uuid NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `business`
--

CREATE TABLE `business` (
  `id` uuid NOT NULL DEFAULT uuid(),
  `business_name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `email` varchar(40) NOT NULL,
  `contact_number` varchar(14) NOT NULL,
  `business_category_id` int(11) NOT NULL,
  `business_type_id` int(11) NOT NULL,
  `province_id` int(11) NOT NULL,
  `municipality_id` int(11) NOT NULL,
  `barangay_id` int(11) NOT NULL,
  `owner_id` uuid NOT NULL,
  `status` enum('Pending','Active','Inactive','Maintenance') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `business_amenities`
--

CREATE TABLE `business_amenities` (
  `id` int(11) NOT NULL,
  `business_id` uuid NOT NULL,
  `amenity_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `category` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `category`) VALUES
(1, 'Accommodation'),
(2, 'Shop'),
(3, 'Tourist Spot'),
(4, 'Event');

-- --------------------------------------------------------

--
-- Table structure for table `event`
--

CREATE TABLE `event` (
  `id` uuid NOT NULL DEFAULT uuid(),
  `event_name` varchar(50) NOT NULL,
  `category_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `event_start` datetime NOT NULL,
  `event_end` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `event`
--

INSERT INTO `event` (`id`, `event_name`, `category_id`, `type_id`, `event_start`, `event_end`) VALUES
('0847c3b3-6f7c-11f0-b16b-50ebf6492706', 'Cup of Joe Concert', 4, 7, '2025-08-02 07:20:00', '2025-08-04 20:20:00');

-- --------------------------------------------------------

--
-- Table structure for table `guests`
--

CREATE TABLE `guests` (
  `id` uuid NOT NULL,
  `name` varchar(60) NOT NULL,
  `booking_id` uuid NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `municipality`
--

CREATE TABLE `municipality` (
  `id` int(11) NOT NULL,
  `municipality` varchar(30) NOT NULL,
  `province_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `municipality`
--

INSERT INTO `municipality` (`id`, `municipality`, `province_id`) VALUES
(1, 'Baao', 20),
(2, 'Balatan', 20),
(3, 'Bato', 20),
(4, 'Bombon', 20),
(5, 'Buhi', 20),
(6, 'Bula', 20),
(7, 'Cabusao', 20),
(8, 'Calabanga', 20),
(9, 'Camaligan', 20),
(10, 'Canaman', 20),
(11, 'Caramoan', 20),
(12, 'Del Gallego', 20),
(13, 'Gainza', 20),
(14, 'Garchitorena', 20),
(15, 'Goa', 20),
(16, 'Iriga City', 20),
(17, 'Lagonoy', 20),
(18, 'Libmanan', 20),
(19, 'Lupi', 20),
(20, 'Magarao', 20),
(21, 'Milaor', 20),
(22, 'Minalabac', 20),
(23, 'Nabua', 20),
(24, 'Naga City', 20),
(25, 'Ocampo', 20),
(26, 'Pamplona', 20),
(27, 'Pasacao', 20),
(28, 'Pili', 20),
(29, 'Presentacion', 20),
(30, 'Ragay', 20),
(31, 'Sagnay', 20),
(32, 'San Fernando', 20),
(33, 'San Jose', 20),
(34, 'Sipocot', 20),
(35, 'Siruma', 20),
(36, 'Tigaon', 20),
(37, 'Tinambac', 20);

-- --------------------------------------------------------

--
-- Table structure for table `owner`
--

CREATE TABLE `owner` (
  `id` uuid NOT NULL DEFAULT uuid(),
  `first_name` varchar(30) NOT NULL,
  `middle_name` varchar(20) DEFAULT NULL,
  `last_name` varchar(30) NOT NULL,
  `age` int(2) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `gender` enum('Male','Female') DEFAULT NULL,
  `email` varchar(40) NOT NULL,
  `phone_number` varchar(13) NOT NULL,
  `business_type` enum('Shop','Accommodation','Both') NOT NULL,
  `province_id` int(11) DEFAULT NULL,
  `municipality_id` int(11) DEFAULT NULL,
  `barangay_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `owner`
--

INSERT INTO `owner` (`id`, `first_name`, `middle_name`, `last_name`, `age`, `birthday`, `gender`, `email`, `phone_number`, `business_type`, `province_id`, `municipality_id`, `barangay_id`, `created_at`) VALUES
('7a0d198d-6ecd-11f0-bb77-50ebf6492706', 'Rayven', NULL, 'Clores', NULL, NULL, NULL, 'rayventzy@gmail.com', '09876541234', 'Both', NULL, NULL, NULL, '2025-08-10 05:36:54');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `id` uuid NOT NULL DEFAULT uuid(),
  `payment_type` enum('Full Payment','Partial Payment') NOT NULL,
  `payment_method` enum('Gcash','Paymaya','Credit Card') NOT NULL,
  `amount` float NOT NULL,
  `status` enum('Paid','Pending Balance') DEFAULT NULL,
  `tourist_id` uuid NOT NULL,
  `booking_id` uuid NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `province`
--

CREATE TABLE `province` (
  `id` int(11) NOT NULL,
  `province` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `province`
--

INSERT INTO `province` (`id`, `province`) VALUES
(1, 'Abra'),
(2, 'Agusan del Norte'),
(3, 'Agusan del Sur'),
(4, 'Aklan'),
(5, 'Albay'),
(6, 'Antique'),
(7, 'Apayao'),
(8, 'Aurora'),
(9, 'Basilan'),
(10, 'Bataan'),
(11, 'Batanes'),
(12, 'Batangas'),
(13, 'Benguet'),
(14, 'Biliran'),
(15, 'Bohol'),
(16, 'Bukidnon'),
(17, 'Bulacan'),
(18, 'Cagayan'),
(19, 'Camarines Norte'),
(20, 'Camarines Sur'),
(21, 'Camiguin'),
(22, 'Capiz'),
(23, 'Catanduanes'),
(24, 'Cavite'),
(25, 'Cebu'),
(26, 'Compostela Valley'),
(27, 'Cotabato'),
(28, 'Davao del Norte'),
(29, 'Davao del Sur'),
(30, 'Davao Occidental'),
(31, 'Davao Oriental'),
(32, 'Dinagat Islands'),
(33, 'Eastern Samar'),
(34, 'Guimaras'),
(35, 'Ifugao'),
(36, 'Ilocos Norte'),
(37, 'Ilocos Sur'),
(38, 'Iloilo'),
(39, 'Isabela'),
(40, 'Kalinga'),
(41, 'La Union'),
(42, 'Laguna'),
(43, 'Lanao del Norte'),
(44, 'Lanao del Sur'),
(45, 'Leyte'),
(46, 'Maguindanao'),
(47, 'Marinduque'),
(48, 'Masbate'),
(49, 'Misamis Occidental'),
(50, 'Misamis Oriental'),
(51, 'Mountain Province'),
(52, 'Negros Occidental'),
(53, 'Negros Oriental'),
(54, 'Northern Samar'),
(55, 'Nueva Ecija'),
(56, 'Nueva Vizcaya'),
(57, 'Occidental Mindoro'),
(58, 'Oriental Mindoro'),
(59, 'Palawan'),
(60, 'Pampanga'),
(61, 'Pangasinan'),
(62, 'Quezon'),
(63, 'Quirino'),
(64, 'Rizal'),
(65, 'Romblon'),
(66, 'Samar'),
(67, 'Sarangani'),
(68, 'Siquijor'),
(69, 'Sorsogon'),
(70, 'South Cotabato'),
(71, 'Southern Leyte'),
(72, 'Sultan Kudarat'),
(73, 'Sulu'),
(74, 'Surigao del Norte'),
(75, 'Surigao del Sur'),
(76, 'Tarlac'),
(77, 'Tawi‑Tawi'),
(78, 'Zambales'),
(79, 'Zamboanga del Norte'),
(80, 'Zamboanga del Sur'),
(81, 'Zamboanga Sibugay'),
(82, 'Davao de Oro');

-- --------------------------------------------------------

--
-- Table structure for table `reply`
--

CREATE TABLE `reply` (
  `id` uuid NOT NULL,
  `review_and_rating_id` uuid NOT NULL,
  `reply` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `review_and_rating`
--

CREATE TABLE `review_and_rating` (
  `id` uuid NOT NULL DEFAULT uuid(),
  `reviewable_type` enum('Accommodation','Room','Shop','Event','Tourist Spot') NOT NULL,
  `reviewable_id` uuid NOT NULL,
  `rating` tinyint(1) NOT NULL,
  `comment` text NOT NULL,
  `touriat_id` uuid NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `review_and_rating`
--

INSERT INTO `review_and_rating` (`id`, `reviewable_type`, `reviewable_id`, `rating`, `comment`, `touriat_id`, `created_at`) VALUES
('e7e30493-6f78-11f0-b16b-50ebf6492706', 'Accommodation', 'aa925bd6-6b00-11f0-924c-50ebf6492706', 5, 'Good place', '8d3ee791-6ecb-11f0-bb77-50ebf6492706', '2025-08-02 08:15:52');

-- --------------------------------------------------------

--
-- Table structure for table `room`
--

CREATE TABLE `room` (
  `id` uuid NOT NULL DEFAULT uuid(),
  `business_id` uuid NOT NULL,
  `room_number` varchar(20) NOT NULL,
  `room_type` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `room_price` float NOT NULL,
  `room_image` varchar(255) DEFAULT NULL,
  `status` enum('Available','Occupied','Maintenance','Reserved') NOT NULL,
  `capacity` tinyint(3) NOT NULL,
  `room_photos` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_amenities`
--

CREATE TABLE `room_amenities` (
  `id` int(11) NOT NULL,
  `room_id` uuid NOT NULL,
  `amenity_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tourism`
--

CREATE TABLE `tourism` (
  `id` uuid NOT NULL DEFAULT uuid(),
  `first_name` varchar(30) NOT NULL,
  `middle_name` varchar(20) DEFAULT NULL,
  `last_name` varchar(30) NOT NULL,
  `position` varchar(20) DEFAULT NULL,
  `email` varchar(30) NOT NULL,
  `phone_number` varchar(14) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `tourism`
--

INSERT INTO `tourism` (`id`, `first_name`, `middle_name`, `last_name`, `position`, `email`, `phone_number`) VALUES
('38530bbf-75fe-11f0-b5b0-50ebf6492706', 'Emmanuel', 'V', 'Collao', 'Manager', 'emman@mail.com', '09870980987');

-- --------------------------------------------------------

--
-- Table structure for table `tourist`
--

CREATE TABLE `tourist` (
  `id` uuid NOT NULL DEFAULT uuid(),
  `first_name` varchar(30) NOT NULL,
  `middle_name` varchar(20) DEFAULT NULL,
  `last_name` varchar(30) NOT NULL,
  `ethnicity` enum('Bicolano','Non-Bicolano','Foreigner','Local') NOT NULL,
  `birthday` date NOT NULL,
  `age` int(2) NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `nationality` varchar(20) NOT NULL,
  `category` enum('Domestic','Overseas') NOT NULL,
  `contact_number` varchar(13) NOT NULL,
  `email` varchar(40) NOT NULL,
  `province_id` int(11) NOT NULL,
  `municipality_id` int(11) NOT NULL,
  `barangay_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `tourist`
--

INSERT INTO `tourist` (`id`, `first_name`, `middle_name`, `last_name`, `ethnicity`, `birthday`, `age`, `gender`, `nationality`, `category`, `contact_number`, `email`, `province_id`, `municipality_id`, `barangay_id`, `created_at`) VALUES
('8d3ee791-6ecb-11f0-bb77-50ebf6492706', 'Rayven', NULL, 'Clores', 'Bicolano', '2003-09-28', 22, 'Male', 'Filipino', 'Domestic', '09380417303', 'ray@gmail.com', 20, 24, 6, '2025-08-01 11:34:57');

-- --------------------------------------------------------

--
-- Table structure for table `tourist_spots`
--

CREATE TABLE `tourist_spots` (
  `id` uuid NOT NULL DEFAULT uuid(),
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `province_id` int(11) NOT NULL,
  `municipality_id` int(11) NOT NULL,
  `barangay_id` int(11) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `entry_fee` decimal(10,2) DEFAULT NULL,
  `spot_status` enum('pending','active','inactive') NOT NULL DEFAULT 'pending',
  `is_featured` tinyint(1) DEFAULT 0,
  `category_id` int(11) DEFAULT NULL,
  `type_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `tourist_spots`
--

INSERT INTO `tourist_spots` (`id`, `name`, `description`, `province_id`, `municipality_id`, `barangay_id`, `latitude`, `longitude`, `contact_phone`, `contact_email`, `website`, `entry_fee`, `spot_status`, `is_featured`, `category_id`, `type_id`, `created_at`, `updated_at`) VALUES
('e97ef867-79dc-11f0-9776-10ffe07a01e9', 'zzzzzzzzzzzzz', 'zzzzzzzzzzzzzzzz', 20, 24, 19, NULL, NULL, '09613636138', NULL, NULL, NULL, 'active', 0, 3, 3, '2025-08-15 13:36:56', '2025-08-15 14:29:35'),
('1acf492e-79dd-11f0-9776-10ffe07a01e9', 'aaaaaaaaaaazz', 'abcdefghijklmnopqrstuvwxyzzzzzzz', 20, 24, 19, NULL, NULL, '09613636138', NULL, NULL, NULL, 'active', 0, 3, 9, '2025-08-15 13:38:19', '2025-08-15 14:46:36'),
('b4337ed1-79e6-11f0-9776-10ffe07a01e9', 'c', 'd', 20, 24, 18, NULL, NULL, '09613636138', NULL, NULL, NULL, 'active', 0, 3, 9, '2025-08-15 14:47:02', '2025-08-15 15:21:32');

-- --------------------------------------------------------

--
-- Table structure for table `tourist_spot_edits`
--

CREATE TABLE `tourist_spot_edits` (
  `id` uuid NOT NULL DEFAULT uuid(),
  `tourist_spot_id` uuid NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `province_id` int(11) NOT NULL,
  `municipality_id` int(11) NOT NULL,
  `barangay_id` int(11) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `entry_fee` decimal(10,2) DEFAULT NULL,
  `spot_status` enum('pending','active','inactive') NOT NULL DEFAULT 'pending',
  `is_featured` tinyint(1) DEFAULT 0,
  `category_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `approval_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `remarks` varchar(255) NOT NULL,
  `submitted_at` timestamp NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `tourist_spot_edits`
--

INSERT INTO `tourist_spot_edits` (`id`, `tourist_spot_id`, `name`, `description`, `province_id`, `municipality_id`, `barangay_id`, `latitude`, `longitude`, `contact_phone`, `contact_email`, `website`, `entry_fee`, `spot_status`, `is_featured`, `category_id`, `type_id`, `approval_status`, `remarks`, `submitted_at`, `reviewed_at`) VALUES
('2042882e-79ec-11f0-9776-10ffe07a01e9', 'e97ef867-79dc-11f0-9776-10ffe07a01e9', 'zzzzzzzzzzzzzz', 'zzzzzzzzzzzzzzzzz', 20, 24, 19, NULL, NULL, '09613636138', NULL, NULL, NULL, 'active', 0, 3, 3, 'rejected', '', '2025-08-15 15:25:50', '2025-08-15 15:26:02');

-- --------------------------------------------------------

--
-- Table structure for table `tourist_spot_schedules`
--

CREATE TABLE `tourist_spot_schedules` (
  `id` uuid NOT NULL DEFAULT uuid(),
  `tourist_spot_id` uuid NOT NULL,
  `day_of_week` tinyint(4) NOT NULL,
  `open_time` time DEFAULT NULL,
  `close_time` time DEFAULT NULL,
  `is_closed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `type`
--

CREATE TABLE `type` (
  `id` int(11) NOT NULL,
  `type` varchar(30) NOT NULL,
  `category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `type`
--

INSERT INTO `type` (`id`, `type`, `category_id`) VALUES
(1, 'Hotel', 1),
(2, 'Souvenir Shop', 2),
(3, 'Museum', 3),
(4, 'Resort', 1),
(5, 'Homestay', 1),
(6, 'Tourist Inn', 1),
(7, 'Concert', 4),
(8, 'Festival', 4),
(9, 'natural', 3);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` uuid NOT NULL DEFAULT uuid(),
  `role` enum('Tourist','Owner','Tourism') NOT NULL,
  `email` varchar(40) NOT NULL,
  `phone_number` varchar(13) NOT NULL,
  `password` text NOT NULL,
  `tourist_id` uuid DEFAULT NULL,
  `owner_id` uuid DEFAULT NULL,
  `tourism_id` uuid DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `role`, `email`, `phone_number`, `password`, `tourist_id`, `owner_id`, `tourism_id`) VALUES
('a82743ac-7663-11f0-a980-10ffe07a01e9', 'Tourism', 'emman@gmail.com', '09613636138', '123', NULL, NULL, '38530bbf-75fe-11f0-b5b0-50ebf6492706'),
('06b567b2-75ac-11f0-b5b0-50ebf6492706', 'Owner', 'rayventzy@gmail.com', '09876541234', '$2b$10$STe7R0PW57tIVZNpa5waz.jOfYZ1qRhpcVzJ2EYjzSZ3z4AbI.v6a', NULL, '7a0d198d-6ecd-11f0-bb77-50ebf6492706', NULL),
('cfaa9d25-7461-11f0-be2e-50ebf6492706', 'Tourist', 'ray@gmail.com', '09523456789', '$2b$10$hK2Pc6XCmaCVW0LLOMDbmeCght7HKbkAVL6KPUWsJMco2vD/qPLzm', '8d3ee791-6ecb-11f0-bb77-50ebf6492706', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `amenity`
--
ALTER TABLE `amenity`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `barangay`
--
ALTER TABLE `barangay`
  ADD PRIMARY KEY (`id`),
  ADD KEY `municipality_id` (`municipality_id`);

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `tourist_id` (`tourist_id`);

--
-- Indexes for table `business`
--
ALTER TABLE `business`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `contact_number_2` (`contact_number`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `contact_number` (`contact_number`),
  ADD KEY `business_category_id` (`business_category_id`),
  ADD KEY `business_type_id` (`business_type_id`),
  ADD KEY `province_id` (`province_id`),
  ADD KEY `municipality_id` (`municipality_id`),
  ADD KEY `barangay_id` (`barangay_id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `business_amenities`
--
ALTER TABLE `business_amenities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `amenity_id` (`amenity_id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `type_id` (`type_id`);

--
-- Indexes for table `guests`
--
ALTER TABLE `guests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `municipality`
--
ALTER TABLE `municipality`
  ADD PRIMARY KEY (`id`),
  ADD KEY `province_id` (`province_id`);

--
-- Indexes for table `owner`
--
ALTER TABLE `owner`
  ADD PRIMARY KEY (`id`),
  ADD KEY `province_id` (`province_id`),
  ADD KEY `municipality_id` (`municipality_id`),
  ADD KEY `barangay_id` (`barangay_id`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tourist_id` (`tourist_id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `province`
--
ALTER TABLE `province`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reply`
--
ALTER TABLE `reply`
  ADD PRIMARY KEY (`id`),
  ADD KEY `review_and_rating_id` (`review_and_rating_id`);

--
-- Indexes for table `review_and_rating`
--
ALTER TABLE `review_and_rating`
  ADD PRIMARY KEY (`id`),
  ADD KEY `touriat_id` (`touriat_id`);

--
-- Indexes for table `room`
--
ALTER TABLE `room`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `room_amenities`
--
ALTER TABLE `room_amenities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `amenity_id` (`amenity_id`);

--
-- Indexes for table `tourism`
--
ALTER TABLE `tourism`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tourist`
--
ALTER TABLE `tourist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_contact_number` (`contact_number`),
  ADD UNIQUE KEY `unique_email` (`email`),
  ADD KEY `city_id` (`municipality_id`),
  ADD KEY `barangay_id` (`barangay_id`),
  ADD KEY `province_id` (`province_id`);

--
-- Indexes for table `tourist_spots`
--
ALTER TABLE `tourist_spots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_type` (`type_id`),
  ADD KEY `idx_province` (`province_id`),
  ADD KEY `idx_municipality` (`municipality_id`),
  ADD KEY `idx_barangay` (`barangay_id`);

--
-- Indexes for table `tourist_spot_edits`
--
ALTER TABLE `tourist_spot_edits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tourist_spot` (`tourist_spot_id`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_type` (`type_id`),
  ADD KEY `idx_province` (`province_id`),
  ADD KEY `idx_municipality` (`municipality_id`),
  ADD KEY `idx_barangay` (`barangay_id`);

--
-- Indexes for table `tourist_spot_schedules`
--
ALTER TABLE `tourist_spot_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tourist_spot` (`tourist_spot_id`);

--
-- Indexes for table `type`
--
ALTER TABLE `type`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_category_id` (`category_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone_number` (`phone_number`),
  ADD KEY `tourist_id` (`tourist_id`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `tourism_id` (`tourism_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `amenity`
--
ALTER TABLE `amenity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `barangay`
--
ALTER TABLE `barangay`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `business_amenities`
--
ALTER TABLE `business_amenities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `municipality`
--
ALTER TABLE `municipality`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `province`
--
ALTER TABLE `province`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `room_amenities`
--
ALTER TABLE `room_amenities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `type`
--
ALTER TABLE `type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `barangay`
--
ALTER TABLE `barangay`
  ADD CONSTRAINT `barangay_ibfk_1` FOREIGN KEY (`municipality_id`) REFERENCES `municipality` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`tourist_id`) REFERENCES `tourist` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `booking_ibfk_2` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `booking_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `room` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `business`
--
ALTER TABLE `business`
  ADD CONSTRAINT `business_ibfk_1` FOREIGN KEY (`province_id`) REFERENCES `province` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `business_ibfk_2` FOREIGN KEY (`municipality_id`) REFERENCES `municipality` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `business_ibfk_3` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `business_ibfk_4` FOREIGN KEY (`business_category_id`) REFERENCES `category` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `business_ibfk_5` FOREIGN KEY (`business_type_id`) REFERENCES `type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `business_ibfk_6` FOREIGN KEY (`owner_id`) REFERENCES `owner` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `business_amenities`
--
ALTER TABLE `business_amenities`
  ADD CONSTRAINT `business_amenities_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `business_amenities_ibfk_2` FOREIGN KEY (`amenity_id`) REFERENCES `amenity` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `event`
--
ALTER TABLE `event`
  ADD CONSTRAINT `event_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `event_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `type` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `guests`
--
ALTER TABLE `guests`
  ADD CONSTRAINT `guests_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `municipality`
--
ALTER TABLE `municipality`
  ADD CONSTRAINT `municipality_ibfk_1` FOREIGN KEY (`province_id`) REFERENCES `province` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `owner`
--
ALTER TABLE `owner`
  ADD CONSTRAINT `owner_ibfk_1` FOREIGN KEY (`province_id`) REFERENCES `province` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `owner_ibfk_2` FOREIGN KEY (`municipality_id`) REFERENCES `municipality` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `owner_ibfk_3` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `payment_ibfk_2` FOREIGN KEY (`tourist_id`) REFERENCES `tourist` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `review_and_rating`
--
ALTER TABLE `review_and_rating`
  ADD CONSTRAINT `review_and_rating_ibfk_1` FOREIGN KEY (`touriat_id`) REFERENCES `tourist` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `room`
--
ALTER TABLE `room`
  ADD CONSTRAINT `room_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `room_amenities`
--
ALTER TABLE `room_amenities`
  ADD CONSTRAINT `room_amenities_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `room` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `room_amenities_ibfk_2` FOREIGN KEY (`amenity_id`) REFERENCES `amenity` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tourist`
--
ALTER TABLE `tourist`
  ADD CONSTRAINT `tourist_ibfk_1` FOREIGN KEY (`municipality_id`) REFERENCES `municipality` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tourist_ibfk_2` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tourist_ibfk_3` FOREIGN KEY (`province_id`) REFERENCES `province` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tourist_spots`
--
ALTER TABLE `tourist_spots`
  ADD CONSTRAINT `fk_tourist_spots_barangay` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tourist_spots_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tourist_spots_municipality` FOREIGN KEY (`municipality_id`) REFERENCES `municipality` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tourist_spots_province` FOREIGN KEY (`province_id`) REFERENCES `province` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tourist_spots_type` FOREIGN KEY (`type_id`) REFERENCES `type` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tourist_spot_edits`
--
ALTER TABLE `tourist_spot_edits`
  ADD CONSTRAINT `fk_edit_barangay` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_edit_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_edit_municipality` FOREIGN KEY (`municipality_id`) REFERENCES `municipality` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_edit_province` FOREIGN KEY (`province_id`) REFERENCES `province` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_edit_tourist_spot` FOREIGN KEY (`tourist_spot_id`) REFERENCES `tourist_spots` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_edit_type` FOREIGN KEY (`type_id`) REFERENCES `type` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tourist_spot_schedules`
--
ALTER TABLE `tourist_spot_schedules`
  ADD CONSTRAINT `fk_tourist_spot` FOREIGN KEY (`tourist_spot_id`) REFERENCES `tourist_spots` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `type`
--
ALTER TABLE `type`
  ADD CONSTRAINT `type_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`tourist_id`) REFERENCES `tourist` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_ibfk_2` FOREIGN KEY (`owner_id`) REFERENCES `owner` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_ibfk_3` FOREIGN KEY (`tourism_id`) REFERENCES `tourism` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
