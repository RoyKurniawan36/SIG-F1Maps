-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table db_f1maps.order_history
CREATE TABLE IF NOT EXISTS `order_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `subscription_id` int DEFAULT NULL,
  `order_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('subscription','upgrade','renewal') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `status` enum('pending','completed','failed','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `subscription_id` (`subscription_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_status` (`status`),
  CONSTRAINT `order_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_history_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_f1maps.order_history: ~0 rows (approximately)

-- Dumping structure for table db_f1maps.races
CREATE TABLE IF NOT EXISTS `races` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `full_title` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `location` varchar(255) NOT NULL,
  `country` varchar(100) NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `map_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_f1maps.races: ~24 rows (approximately)
INSERT INTO `races` (`id`, `title`, `full_title`, `date`, `location`, `country`, `latitude`, `longitude`, `map_url`) VALUES
	(10, 'Australian GP', 'Formula 1 Rolex Australian Grand Prix 2024', '2024-03-24', 'Melbourne', 'australia-flag', -37.8497000, 144.9680000, NULL),
	(11, 'Bahrain GP', 'Formula 1 Gulf Air Bahrain Grand Prix 2024', '2024-03-02', 'Sakhir', 'bahrain-flag', 26.0325000, 50.5106000, ''),
	(12, 'Saudi Arabian GP', 'Formula 1 STC Saudi Arabian Grand Prix 2024', '2024-03-09', 'Jeddah', 'saudi-arabia-flag', 21.6319000, 39.1044000, NULL),
	(13, 'Japanese GP', 'Formula 1 MSC Cruises Japanese Grand Prix 2024', '2024-04-07', 'Suzuka', 'japan-flag', 34.8431000, 136.5407000, NULL),
	(14, 'Chinese GP', 'Formula 1 Lenovo Chinese Grand Prix 2024', '2024-04-21', 'Shanghai', 'china-flag', 31.3389000, 121.2197000, NULL),
	(15, 'Miami GP', 'Formula 1 Crypto.com Miami Grand Prix 2024', '2024-05-05', 'Miami', 'united-states-flag', 25.9581000, -80.2389000, NULL),
	(16, 'Emilia Romagna GP', 'Formula 1 MSC Cruises Emilia Romagna Grand Prix 2024', '2024-05-19', 'Imola', 'italy-flag', 44.3439000, 11.7167000, NULL),
	(17, 'Monaco GP', 'Formula 1 Grand Prix de Monaco 2024', '2024-05-26', 'Monte Carlo', 'monaco-flag', 43.7347000, 7.4206000, NULL),
	(18, 'Canadian GP', 'Formula 1 AWS Grand Prix du Canada 2024', '2024-06-09', 'Montreal', 'canada-flag', 45.5000000, -73.5228000, NULL),
	(19, 'Spanish GP', 'Formula 1 AWS Gran Premio de España 2024', '2024-06-23', 'Barcelona', 'spain-flag', 41.5700000, 2.2611000, NULL),
	(20, 'Austrian GP', 'Formula 1 Qatar Airways Austrian Grand Prix 2024', '2024-06-30', 'Spielberg', 'austria-flag', 47.2197000, 14.7647000, NULL),
	(21, 'British GP', 'Formula 1 Aramco British Grand Prix 2024', '2024-07-07', 'Silverstone', 'united-kingdom-flag', 52.0786000, -1.0169000, NULL),
	(22, 'Hungarian GP', 'Formula 1 Qatar Airways Hungarian Grand Prix 2024', '2024-07-21', 'Budapest', 'hungary-flag', 47.5789000, 19.2486000, NULL),
	(23, 'Belgian GP', 'Formula 1 Rolex Belgian Grand Prix 2024', '2024-07-28', 'Spa-Francorchamps', 'belgium-flag', 50.4372000, 5.9714000, NULL),
	(24, 'Dutch GP', 'Formula 1 Heineken Dutch Grand Prix 2024', '2024-08-25', 'Zandvoort', 'netherlands-flag', 52.3883000, 4.5419000, NULL),
	(25, 'Italian GP', 'Formula 1 Pirelli Gran Premio d\'Italia 2024', '2024-09-01', 'Monza', 'italy-flag', 45.6181000, 9.2811000, NULL),
	(26, 'Azerbaijan GP', 'Formula 1 Qatar Airways Azerbaijan Grand Prix 2024', '2024-09-15', 'Baku', 'azerbaijan-flag', 40.3725000, 49.8533000, NULL),
	(27, 'Singapore GP', 'Formula 1 Singapore Airlines Singapore Grand Prix 2024', '2024-09-22', 'Marina Bay', 'singapore-flag', 1.2914000, 103.8644000, NULL),
	(28, 'United States GP', 'Formula 1 Aramco United States Grand Prix 2024', '2024-10-20', 'Austin', 'united-states-flag', 30.1328000, -97.6411000, NULL),
	(29, 'Mexico City GP', 'Formula 1 Gran Premio de la Ciudad de México 2024', '2024-10-27', 'Mexico City', 'mexico-flag', 19.4042000, -99.0907000, NULL),
	(30, 'Brazilian GP', 'Formula 1 Rolex Grande Prêmio de São Paulo 2024', '2024-11-03', 'São Paulo', 'brazil-flag', -23.7014000, -46.6997000, NULL),
	(31, 'Las Vegas GP', 'Formula 1 Heineken Silver Las Vegas Grand Prix 2024', '2024-11-23', 'Las Vegas', 'united-states-flag', 36.1147000, -115.1728000, NULL),
	(32, 'Qatar GP', 'Formula 1 Qatar Airways Qatar Grand Prix 2024', '2024-12-01', 'Lusail', 'qatar-flag', 25.4900000, 51.4542000, NULL),
	(33, 'Abu Dhabi GP', 'Formula 1 Etihad Airways Abu Dhabi Grand Prix 2024', '2024-12-08', 'Yas Marina', 'united-arab-emirates-flag', 24.4672000, 54.6031000, NULL),
	(36, 'Indonesian GP', 'FORMULA 1 PERTAMINA MANDALIKA GRAN PRIX', '2026-08-21', 'Lombok', 'indonesia-flag', -8.8951570, 116.3042280, 'https://www.google.com/maps/place/Pertamina+Mandalika+International+Circuit/@-8.8915775,116.2860016,14.25z/data=!4m6!3m5!1s0x2dcd071ecdcec477:0x44f271f670057e58!8m2!3d-8.8951575!4d116.304228!16s%2Fg%2F11qsjf5778!5m1!1e1?entry=ttu&g_ep=EgoyMDI1MDYyMy4yIKXMDSoASAFQAw%3D%3D'),
	(37, 'South African GP', 'FORMULA 1 NO WATER GRAND PRIX 2026', '2026-07-08', 'Kyalami', 'south-korea-flag', -25.9991540, 28.0688900, 'https://www.google.com/maps/place/Pertamina+Mandalika+International+Circuit/@-8.8915775,116.2860016,14.25z/data=!4m6!3m5!1s0x2dcd071ecdcec477:0x44f271f670057e58!8m2!3d-8.8951575!4d116.304228!16s%2Fg%2F11qsjf5778!5m1!1e1?entry=ttu&g_ep=EgoyMDI1MDYyMy4yIKXMDSoASAFQAw%3D%3D'),
	(38, 'Jakarta GP', 'FORMULA 1 SARINAH JAKARTA GRAND PRIX', '2024-06-14', 'Jakarta', 'indonesia-flag', -6.1184190, 106.8588870, '');

-- Dumping structure for table db_f1maps.race_polygons
CREATE TABLE IF NOT EXISTS `race_polygons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `race_id` int NOT NULL,
  `polygon_data` json NOT NULL,
  `color` varchar(7) NOT NULL DEFAULT '#e10600',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `race_id_unique` (`race_id`),
  CONSTRAINT `race_polygons_ibfk_1` FOREIGN KEY (`race_id`) REFERENCES `races` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_f1maps.race_polygons: ~0 rows (approximately)
INSERT INTO `race_polygons` (`id`, `race_id`, `polygon_data`, `color`, `created_at`, `updated_at`) VALUES
	(1, 36, '{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[116.303499, -8.901464], [116.302754, -8.901665], [116.301981, -8.901708], [116.301696, -8.901782], [116.301498, -8.90192], [116.301412, -8.902195], [116.301358, -8.90282], [116.301284, -8.903202], [116.301064, -8.903759], [116.300356, -8.905539], [116.300425, -8.90582], [116.300978, -8.906642], [116.303333, -8.905439], [116.304691, -8.904946], [116.305356, -8.904585], [116.306472, -8.903642], [116.306993, -8.903382], [116.30784, -8.903197], [116.308624, -8.902704], [116.30967, -8.90166], [116.309896, -8.899959], [116.30998, -8.898973], [116.309411, -8.898644], [116.30917, -8.898157], [116.309003, -8.89724], [116.309679, -8.894653], [116.309921, -8.89442], [116.310098, -8.894479], [116.310237, -8.894436], [116.310237, -8.893726], [116.309663, -8.893678], [116.309593, -8.893567], [116.309862, -8.892989], [116.311353, -8.891542], [116.312089, -8.891208], [116.312067, -8.890975], [116.311852, -8.890806], [116.311257, -8.89062], [116.310779, -8.890583], [116.308708, -8.890678], [116.30786, -8.890763], [116.306116, -8.891659], [116.306165, -8.891966], [116.305452, -8.892253], [116.305415, -8.892433], [116.304803, -8.892602], [116.304695, -8.892475], [116.304363, -8.892714], [116.303886, -8.89282], [116.302764, -8.893005], [116.301718, -8.893339], [116.301734, -8.893546], [116.3013, -8.893482], [116.300205, -8.893641], [116.300168, -8.893747], [116.299288, -8.89415], [116.29911, -8.894346], [116.298783, -8.894977], [116.298698, -8.895597], [116.299015, -8.896424], [116.299079, -8.896339], [116.299337, -8.896185], [116.299814, -8.896164], [116.299884, -8.896577], [116.299251, -8.896773], [116.299755, -8.89769], [116.300104, -8.897918], [116.299927, -8.8983], [116.300839, -8.898406], [116.300989, -8.898491], [116.301284, -8.899036], [116.301869, -8.899391], [116.301923, -8.899201], [116.303226, -8.899365], [116.303499, -8.901464]]]}, "properties": {}}]}', '#e10600', '2025-07-09 06:32:40', '2025-07-09 06:53:15'),
	(3, 11, '{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[50.510602, 26.03577], [50.510634, 26.036898], [50.510806, 26.03697], [50.511042, 26.036773], [50.51153, 26.036401], [50.512389, 26.036599], [50.512619, 26.036671], [50.512978, 26.036642], [50.518215, 26.035736], [50.518413, 26.03564], [50.518424, 26.035317], [50.51822, 26.035057], [50.517909, 26.034604], [50.51801, 26.034126], [50.518327, 26.033625], [50.518665, 26.032979], [50.518729, 26.032304], [50.518493, 26.031817], [50.518177, 26.03147], [50.518182, 26.031311], [50.518381, 26.030911], [50.518252, 26.030603], [50.517351, 26.029301], [50.516176, 26.02866], [50.514368, 26.027759], [50.512694, 26.026896], [50.510693, 26.025927], [50.510199, 26.026115], [50.510001, 26.027156], [50.510071, 26.028222], [50.510216, 26.0296], [50.510318, 26.031379], [50.510441, 26.033586], [50.510602, 26.03577]]]}, "properties": {}}]}', '#e10600', '2025-07-09 06:54:40', '2025-07-09 06:54:40');

-- Dumping structure for table db_f1maps.subscriptions
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` enum('basic','pro','ultimate') NOT NULL,
  `billing_cycle` enum('monthly','yearly') NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `start_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `next_billing_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_subscription` (`user_id`),
  CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_f1maps.subscriptions: ~4 rows (approximately)
INSERT INTO `subscriptions` (`id`, `user_id`, `type`, `billing_cycle`, `status`, `start_date`, `next_billing_date`) VALUES
	(31, 10, 'ultimate', 'monthly', 'active', '2025-07-08 12:46:24', '2025-08-08'),
	(32, 11, 'ultimate', 'monthly', 'active', '2025-07-08 14:46:13', '2025-08-08'),
	(34, 12, 'ultimate', 'monthly', 'active', '2025-07-08 21:48:47', '2025-08-08'),
	(37, 2, 'ultimate', 'monthly', 'active', '2025-07-09 14:16:29', '2025-08-09');

-- Dumping structure for table db_f1maps.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_f1maps.users: ~6 rows (approximately)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `updated_at`) VALUES
	(1, 'Kizui Tagahara', 'kizuitag@gmail.com', '$2y$10$.CHjxgLmAAwT7hfhGTFI0u02iC/cKzl2jtvA99dqAmz4x24Rpfx72', '2025-06-27 09:22:25', '2025-06-27 09:22:25'),
	(2, 'admin', 'admin@yahoo.com', '$2y$12$Xe4LCSaveu3lH9ZUlfJgaOp9WlJvjoqpHGTUUgxMHVT3BrgDo95Fe', '2025-06-27 09:25:25', '2025-07-05 09:13:00'),
	(9, 'Sucrose', 'gula@yahoo.com', '$2y$12$BOp2WRR1.HcP3tOxp2vXMOttNaG/.xFhA2Uz1ZTkgsGmKNVukPI76', '2025-07-02 07:21:47', '2025-07-08 13:52:15'),
	(10, 'Max Verstappen', 'verstappen@racing.com', '$2y$12$wk0sTabUqtocZ.szb8fxuu5WYt9a3gnn3JoH1IheD9A7np.0UnaM6', '2025-07-03 01:54:10', '2025-07-08 04:46:09'),
	(11, 'Kizui', 'hahahihi@gmail.com', '$2y$12$SjWQLs6.mKYfKQ5ZS1vgnOJ3aoglKwu733vpUGFgSCUbeKjEVLB5i', '2025-07-08 06:38:27', '2025-07-08 06:38:27'),
	(12, 'Manager', 'manager@manage.unud.ac.id', '$2y$12$upkWrPZuCgvJa5zBMkOsy.NIWhpIm7fsXTngIUl2CFIotcGz7UmAi', '2025-07-08 13:44:13', '2025-07-08 13:44:13');

-- Dumping structure for table db_f1maps.user_subscriptions
CREATE TABLE IF NOT EXISTS `user_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `subscription_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `subscription_id` (`subscription_id`),
  CONSTRAINT `user_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_subscriptions_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_f1maps.user_subscriptions: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
