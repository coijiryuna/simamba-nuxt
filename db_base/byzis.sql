/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `api_tokens`;
CREATE TABLE IF NOT EXISTS `api_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `last_used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `token` (`token`) USING BTREE,
  KEY `user_id` (`user_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `api_tokens`;
INSERT INTO `api_tokens` (`id`, `user_id`, `token`, `user_agent`, `ip_address`, `expires_at`, `last_used_at`, `created_at`) VALUES
	(1, 4, 'd29020b00a63469653e2d465874be36d7458befe0aa3164b4835ec7f550ad7c6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', '2026-02-11 13:41:53', NULL, '2026-01-12 13:41:53'),
	(2, 6, '07b209562751b8472b3912b88508211243e2c875ce517e003646a7da5ad8ac44', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '127.0.0.1', '2026-02-28 15:43:11', NULL, '2026-01-29 15:43:11'),
	(3, 1, '27fa6ce499be96aedf2a881e70117547a03a0779b1d105b00b1bac6dbf03e4f0', 'Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0', '127.0.0.1', '2026-03-02 06:26:17', NULL, '2026-01-31 06:26:17'),
	(4, 1, '8c91c8840c2fdc7d22e55df9972e69cd37fc1dfad1154be0086b3e216eea133b', 'Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0', '127.0.0.1', '2026-03-02 06:47:12', NULL, '2026-01-31 06:47:12'),
	(6, 2, '58be88b40bb9ac4bbc8e71b0901bd83bcefb3b5a29f2a58671333a7ec0d584b7', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36', '127.0.0.1', '2026-03-22 19:49:28', NULL, '2026-02-20 19:49:28'),
	(7, 3, 'b88610e617ebebf201ea501142aedbb3c77d9880639bb25603a9d1db5863afe1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '127.0.0.1', '2026-04-11 09:34:25', NULL, '2026-03-12 09:34:25'),
	(8, 4, '056b7184492f2e8f25a0f769c0b3809b96e09ebab577c480f7bf812f28981bfc', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '127.0.0.1', '2026-04-12 10:08:56', NULL, '2026-03-13 10:08:56');

DROP TABLE IF EXISTS `auth_groups_users`;
CREATE TABLE IF NOT EXISTS `auth_groups_users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `group` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `auth_groups_users_user_id_foreign` (`user_id`),
  CONSTRAINT `auth_groups_users_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `auth_groups_users`;
INSERT INTO `auth_groups_users` (`id`, `user_id`, `group`, `created_at`) VALUES
	(1, 3, 'user', '2025-12-10 11:16:19');

DROP TABLE IF EXISTS `auth_identities`;
CREATE TABLE IF NOT EXISTS `auth_identities` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `type` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `secret` varchar(255) NOT NULL,
  `secret2` varchar(255) DEFAULT NULL,
  `expires` datetime DEFAULT NULL,
  `extra` text DEFAULT NULL,
  `force_reset` tinyint(1) NOT NULL DEFAULT 0,
  `last_used_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_secret` (`type`,`secret`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `auth_identities_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `auth_identities`;
INSERT INTO `auth_identities` (`id`, `user_id`, `type`, `name`, `secret`, `secret2`, `expires`, `extra`, `force_reset`, `last_used_at`, `created_at`, `updated_at`) VALUES
	(1, 3, 'email_password', NULL, 'newcomputer300@gmail.com', '$2y$12$vRSbCytiL09Uw6pi7oVdBugIEr3h6JqEzEwwyXvtIs.Cy8JOPU/oi', NULL, NULL, 0, NULL, '2025-12-10 11:16:18', '2025-12-10 11:16:19'),
	(2, 3, 'access_token', 'google_login_web', '3c81dc2e70584ea0d58cfd2620a151fe2c98761eaee46fd30025fad54813b053', NULL, NULL, 'a:1:{i:0;s:1:"*";}', 0, NULL, '2025-12-10 11:16:19', '2025-12-10 11:16:19'),
	(3, 3, 'access_token', 'google_mobile_login', 'cece26d0772e1433758d960d757dc1e7239147772fc56dffdb1e323d39eea0f9', NULL, NULL, 'a:1:{i:0;s:1:"*";}', 0, NULL, '2025-12-10 11:23:48', '2025-12-10 11:23:48');

DROP TABLE IF EXISTS `auth_logins`;
CREATE TABLE IF NOT EXISTS `auth_logins` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(255) NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `id_type` varchar(255) NOT NULL,
  `identifier` varchar(255) NOT NULL,
  `user_id` int(11) unsigned DEFAULT NULL,
  `date` datetime NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_type_identifier` (`id_type`,`identifier`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `auth_logins`;

DROP TABLE IF EXISTS `auth_permissions_users`;
CREATE TABLE IF NOT EXISTS `auth_permissions_users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `permission` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `auth_permissions_users_user_id_foreign` (`user_id`),
  CONSTRAINT `auth_permissions_users_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `auth_permissions_users`;

DROP TABLE IF EXISTS `auth_remember_tokens`;
CREATE TABLE IF NOT EXISTS `auth_remember_tokens` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `selector` varchar(255) NOT NULL,
  `hashedValidator` varchar(255) NOT NULL,
  `user_id` int(11) unsigned NOT NULL,
  `expires` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `selector` (`selector`),
  KEY `auth_remember_tokens_user_id_foreign` (`user_id`),
  CONSTRAINT `auth_remember_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `auth_remember_tokens`;

DROP TABLE IF EXISTS `auth_token_logins`;
CREATE TABLE IF NOT EXISTS `auth_token_logins` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(255) NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `id_type` varchar(255) NOT NULL,
  `identifier` varchar(255) NOT NULL,
  `user_id` int(11) unsigned DEFAULT NULL,
  `date` datetime NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_type_identifier` (`id_type`,`identifier`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `auth_token_logins`;

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `version` varchar(255) NOT NULL,
  `class` varchar(255) NOT NULL,
  `group` varchar(255) NOT NULL,
  `namespace` varchar(255) NOT NULL,
  `time` int(11) NOT NULL,
  `batch` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `migrations`;
INSERT INTO `migrations` (`id`, `version`, `class`, `group`, `namespace`, `time`, `batch`) VALUES
	(5, '2025-12-01-214123', 'App\\Database\\Migrations\\CreateTestimoniTable', 'default', 'App', 1764626130, 1),
	(9, '2020-12-28-223112', 'CodeIgniter\\Shield\\Database\\Migrations\\CreateAuthTables', 'default', 'CodeIgniter\\Shield', 1764627603, 2),
	(10, '2021-07-04-041948', 'CodeIgniter\\Settings\\Database\\Migrations\\CreateSettingsTable', 'default', 'CodeIgniter\\Settings', 1764627603, 2),
	(11, '2021-11-14-143905', 'CodeIgniter\\Settings\\Database\\Migrations\\AddContextColumn', 'default', 'CodeIgniter\\Settings', 1764627604, 2),
	(12, '2025-12-02-053500', 'App\\Database\\Migrations\\CreateAplikasiTable', 'default', 'App', 1764628411, 3);

DROP TABLE IF EXISTS `settings`;
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(9) NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `type` varchar(31) NOT NULL DEFAULT 'string',
  `context` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `settings`;

DROP TABLE IF EXISTS `tbl_activities`;
CREATE TABLE IF NOT EXISTS `tbl_activities` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `campaign_id` int(10) unsigned NOT NULL,
  `category_id` int(10) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `activity_date` date NOT NULL,
  `cost_used` decimal(15,2) DEFAULT NULL,
  `attachment_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `tbl_activities_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `tbl_campaigns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_activities`;

DROP TABLE IF EXISTS `tbl_aplikasi`;
CREATE TABLE IF NOT EXISTS `tbl_aplikasi` (
  `id` int(5) unsigned NOT NULL AUTO_INCREMENT,
  `app_name` varchar(100) NOT NULL,
  `version` varchar(20) NOT NULL,
  `download_url` varchar(255) NOT NULL,
  `release_notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_aplikasi`;
INSERT INTO `tbl_aplikasi` (`id`, `app_name`, `version`, `download_url`, `release_notes`, `created_at`, `updated_at`) VALUES
	(1, 'BAZNAS Kab. Tangerang', '1.0.0', 'https://tesdonasi.rifacomputer.my.id/uploads/apk/byzis.apk', 'Rilis perdana aplikasi BAZNAS Kabupaten Tangerang.', '2025-12-01 22:33:51', '2025-12-01 22:33:51');

DROP TABLE IF EXISTS `tbl_campaigns`;
CREATE TABLE IF NOT EXISTS `tbl_campaigns` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(10) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `full_description` text DEFAULT NULL,
  `specifications` text DEFAULT NULL,
  `weight` text DEFAULT NULL,
  `age` text DEFAULT NULL,
  `health` text DEFAULT NULL,
  `cover_image_url` varchar(255) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `target_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `current_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `default_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` enum('active','closed','draft') NOT NULL DEFAULT 'draft',
  `default` int(11) NOT NULL DEFAULT 0,
  `available_slots` int(11) NOT NULL DEFAULT 0,
  `booked_slots` int(11) NOT NULL DEFAULT 0,
  `remaining_slots` int(11) NOT NULL DEFAULT 0,
  `unit` enum('paket','ekor') DEFAULT NULL,
  `is_multiple` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `tbl_campaigns_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `tbl_categories` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_campaigns`;
INSERT INTO `tbl_campaigns` (`id`, `category_id`, `title`, `slug`, `description`, `full_description`, `specifications`, `weight`, `age`, `health`, `cover_image_url`, `cover_image`, `image_url`, `image`, `target_amount`, `current_amount`, `default_amount`, `start_date`, `end_date`, `status`, `default`, `available_slots`, `booked_slots`, `remaining_slots`, `unit`, `is_multiple`, `created_at`, `updated_at`) VALUES
	(1, 5, 'Zakat Maal', 'zakat-maal', 'Mari tunaikan zakat Anda untuk memberi kebermanfaatan yang lebih luas.\r\nZakat maal merupakan zakat yang dikenakan atas segala jenis harta yang secara zat maupun substansi perolehannya tidak bertentangan dengan ketentuan agama.\r\nTujuan berzakat tidak hanya sekedar membantu sesama, namun juga untuk membersihkan harta dan ketentraman jiwa', '', '', '', '', '', 'https://simamba.baznastangerangkab.or.id/upload/donasi/campaigns/1765279802_e0834c60241ee0ccb585.jpg', NULL, NULL, NULL, 0.00, 0.00, 0.00, '2025-01-01 00:00:00', '2030-01-01 00:00:00', 'active', 1, 0, 0, 0, '', 0, '2025-12-09 11:30:02', '2025-12-09 11:31:16'),
	(2, 5, 'Zakat Penghasilan', 'zakat-penghasilan', 'Mari tunaikan zakat penghasilan Anda melalui BAZNAS.\r\nZakat penghasilan adalah zakat yang wajib dikeluarkan atas harta penghasilan yang diperoleh dari pekerjaan yang tidak melanggar syariah dan ditunaikan setiap bulan atau setahun sekali apabila sudah mencapai nishab senilai 85 gram emas dengan kadar zakat 2,5%.\r\nTujuan berzakat tidak hanya sekedar membantu sesama, namun juga untuk membersihkan harta dan ketentraman jiwa', '', '', '', '', '', 'https://simamba.baznastangerangkab.or.id/upload/donasi/campaigns/1765280014_f4611e57dc849ecebca9.jpg', NULL, NULL, NULL, 0.00, 0.00, 0.00, '2015-01-01 00:00:00', '2030-01-01 00:00:00', 'active', 0, 0, 0, 0, '', 0, '2025-12-09 11:33:34', '2025-12-09 11:33:34'),
	(3, 3, 'Bantu Korban Bencana di Seluruh Indonesia', 'bantu-korban-bencana-di-seluruh-indonesia', 'Mari terus dukung program ini dan bantu warga yang terdampak bencana di Indonesia dengan bersedekah ke Dompet Kebencanaan BAZNAS, karena kebaikan Anda sangat berarti untuk mereka semua.', '', '', '', '', '', 'https://simamba.baznastangerangkab.or.id/upload/donasi/campaigns/1765280161_88c4d7ab13061da917be.jpg', NULL, NULL, NULL, 0.00, 0.00, 0.00, '2025-01-01 00:00:00', '2030-01-01 00:00:00', 'active', 0, 0, 0, 0, '', 0, '2025-12-09 11:36:01', '2025-12-09 11:36:01'),
	(4, 9, 'Sedekah Subuh', 'sedekah-subuh', '“Tidak ada satu subuh pun yang dialami hamba-hamba Allah kecuali turun kepada mereka dua malaikat. Salah satu di antara keduanya berdoa, ‘Ya Allah, berikanlah ganti bagi orang yang berinfak’, sedangkan yang satunya lagi berdoa ‘Ya Allah, berikanlah kerusakan bagi orang yang menahan hartanya.” (HR. Bukhari).', '', '', '', '', '', 'https://simamba.baznastangerangkab.or.id/upload/donasi/campaigns/1765280392_35f566d206e78e118a21.jpg', NULL, NULL, NULL, 0.00, 0.00, 0.00, '2025-01-01 00:00:00', '2030-01-01 00:00:00', 'active', 1, 0, 0, 0, '', 0, '2025-12-09 11:39:52', '2025-12-10 03:38:44'),
	(5, 6, 'Dukung Cita-cita Anak Indonesia', 'dukung-cita-cita-anak-indonesia', '“Gapailah cita-citamu setinggi langit”\r\n\r\nItulah salah satu kata yang membuat anak-anak bangsa semangat dalam meraih cita-citanya. Namun pada kenyataannya, banyak dari mereka yang terpaksa harus berhenti sekolah karena terkendala oleh biaya. ', '', '', '', '', '', 'https://simamba.baznastangerangkab.or.id/upload/donasi/campaigns/1765281372_88683c2b5f8eac8f7acd.jpg', NULL, NULL, NULL, 0.00, 0.00, 0.00, '2024-12-31 17:00:00', '2029-12-31 17:00:00', 'active', 0, 0, 0, 0, NULL, 0, '2025-12-09 11:56:12', '2026-05-11 09:08:25'),
	(6, 2, 'Layanan Kesehatan Gratis untuk Dhuafa', 'layanan-kesehatan-gratis-untuk-dhuafa', 'Mari bantu masyarakat rentan hingga ke pelosok agar mendapatkan fasilitas dan layanan kesehatan gratis dan layak dengan bersedekah melalui Dompet Kesehatan BA', '', '', '', '', '', 'https://simamba.baznastangerangkab.or.id/upload/donasi/campaigns/1765328067_c826bb625494e2c59959.jpg', NULL, NULL, NULL, 0.00, 0.00, 0.00, '2025-01-01 00:00:00', '2030-01-01 00:00:00', 'active', 0, 0, 0, 0, '', 0, '2025-12-10 00:54:27', '2025-12-10 00:54:27'),
	(7, 9, 'Sedekah Untuk Memuliakan Yatim', 'sedekah-untuk-memuliakan-yatim', 'SEDEKAH YATIM\r\nMewujudkan masa depan, berikan kebahagiaan.\r\n\r\nSedekah kepada anak yatim tidak hanya membantu mereka secara materi, tetapi juga memberikan dukungan emosional dan psikologis, karena mereka merasa diperhatikan dan dihargai.\r\n\r\nKita dapat membantu anak-anak yatim untuk meraih masa depan yang lebih baik dan memberi mereka rasa aman dan kasih sayang yang sangat dibutuhkan dengan bersedekah.\r\n\r\n“Aku dan orang yang menanggung anak yatim (kedudukannya) di surga seperti ini," lalu beliau menunjuk jari telunjuk dan jari tengah serta merenggangkan keduanya."\r\n(HR. Bukhari)\r\n\r\nMari jadi bagian untuk mewujudkan masa depan terbaik untuk anak yatim di Indonesia dengan bersedekah melalui campaign Sedekah Yatim BAZNAS.', '', '', '', '', '', 'https://simamba.baznastangerangkab.or.id/upload/donasi/campaigns/1765433891_347f8ff9a423c40a4011.jpg', NULL, NULL, NULL, 0.00, 0.00, 0.00, '2025-12-12 00:00:00', '2030-01-01 00:00:00', 'active', 0, 0, 0, 0, '', 0, '2025-12-11 06:18:11', '2025-12-11 06:18:11'),
	(8, 9, 'Sedekah Jum\'at', 'sedekah-jum-at', '“Dan tidak ada matahari yang terbit dan terbenam pada suatu hari yang lebih utama dibanding hari Jumat. Bersedekah pada hari Jumat lebih besar pahalanya daripada semua hari lainnya.” (HR. Abdurrazaq dalam Al-Mushannaf)\r\n\r\nHari Jumat disebut sebagai sayyidul ayyam atau pemimpin hari-hari lainnya. Pada hari tersebut, Allah membuka pintu ampunan, doa yang terkabul dan amal baik yang berpahala besar.\r\n\r\nMari bersedekah. Sedekah ini akan mendukung operasional BAZNAS dalam menunjang berbagai program pengentasan kemiskinan di Indonesia. ', '', '', '', '', '', 'https://simamba.baznastangerangkab.or.id/upload/donasi/campaigns/1765434075_2a1546d89afb4c7c739e.jpg', NULL, NULL, NULL, 1000000000.00, 0.00, 0.00, '2025-12-12 00:00:00', '2013-12-12 00:00:00', 'active', 0, 0, 0, 0, '', 0, '2025-12-11 06:21:15', '2026-01-29 08:38:49');

DROP TABLE IF EXISTS `tbl_categories`;
CREATE TABLE IF NOT EXISTS `tbl_categories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `categories_type` enum('donasi','zakat_maal','zakat_fitrah','infaq','sedekah','kurban','program') DEFAULT NULL,
  `active` enum('1','0') DEFAULT '1',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_categories`;
INSERT INTO `tbl_categories` (`id`, `name`, `slug`, `categories_type`, `active`, `created_at`, `updated_at`) VALUES
	(1, 'Pendidikan', 'pendidikan', 'donasi', '1', '2025-11-01 09:20:52', '2025-12-03 01:50:30'),
	(2, 'Kesehatan', 'kesehatan', 'donasi', '1', '2025-11-01 09:20:52', '2025-12-03 01:50:32'),
	(3, 'Bencana Alam', 'bencana-alam', 'donasi', '1', '2025-11-01 09:20:52', '2025-12-03 01:50:33'),
	(4, 'Ekonomi', 'ekonomi', 'donasi', '1', '2025-11-01 09:20:52', '2025-12-08 11:39:13'),
	(5, 'Zakat Maal', 'zakat-maal', 'zakat_maal', '1', '2025-11-01 09:20:52', '2025-12-03 01:50:36'),
	(6, 'Infaq', 'infaq', 'infaq', '1', '2025-11-26 20:02:42', '2025-12-03 01:50:37'),
	(7, 'Zakat Fitrah', 'zakat-fitrah', 'zakat_fitrah', '1', '2025-11-26 20:20:04', '2025-12-03 01:50:39'),
	(8, 'Kurban', 'kurban', 'kurban', '1', '2025-11-26 21:04:47', '2025-12-03 01:50:40'),
	(9, 'Sedekah', 'sedekah', 'donasi', '1', '2025-12-09 11:39:09', '2026-05-11 10:40:33');

DROP TABLE IF EXISTS `tbl_donation_group_user`;
CREATE TABLE IF NOT EXISTS `tbl_donation_group_user` (
  `id_user` int(11) DEFAULT NULL,
  `donation_id` int(11) DEFAULT NULL,
  `donation_name` text DEFAULT NULL,
  `donation_phone` text DEFAULT NULL,
  `donation_email` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_donation_group_user`;

DROP TABLE IF EXISTS `tbl_donations`;
CREATE TABLE IF NOT EXISTS `tbl_donations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `campaign_id` int(10) unsigned NOT NULL,
  `transaction_id` varchar(256) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `admin_fee` decimal(15,2) DEFAULT 0.00,
  `donation_type` enum('donasi','zakat_maal','zakat_fitrah','infaq','kurban','sedekah') NOT NULL DEFAULT 'donasi',
  `zakat_calculation_details` longtext DEFAULT NULL CHECK (json_valid(`zakat_calculation_details`)),
  `donor_name` varchar(255) NOT NULL,
  `donor_email` varchar(255) NOT NULL,
  `donor_phone` varchar(20) NOT NULL,
  `donor_address` text NOT NULL,
  `donor_village` varchar(255) NOT NULL,
  `donor_district` varchar(255) NOT NULL,
  `donor_city` varchar(255) NOT NULL,
  `donor_province` varchar(255) NOT NULL,
  `donor_zip_code` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `is_anonymous` tinyint(1) NOT NULL DEFAULT 0,
  `midtrans_order_id` varchar(255) NOT NULL,
  `midtrans_transaction_id` varchar(255) DEFAULT NULL,
  `transaction_status` varchar(50) NOT NULL DEFAULT 'pending',
  `fraud_status` varchar(50) DEFAULT NULL,
  `payment_type` varchar(50) DEFAULT NULL,
  `signature_key` text DEFAULT NULL,
  `settlement_time` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `midtrans_order_id` (`midtrans_order_id`),
  UNIQUE KEY `midtrans_transaction_id` (`midtrans_transaction_id`),
  KEY `user_id` (`user_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `idx_transaction_status` (`transaction_status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_campaign_id` (`campaign_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_midtrans_order_id` (`midtrans_order_id`),
  KEY `idx_status_created` (`transaction_status`,`created_at`),
  CONSTRAINT `tbl_donations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tbl_donations_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `tbl_campaigns` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_donations`;
INSERT INTO `tbl_donations` (`id`, `user_id`, `campaign_id`, `transaction_id`, `amount`, `admin_fee`, `donation_type`, `zakat_calculation_details`, `donor_name`, `donor_email`, `donor_phone`, `donor_address`, `donor_village`, `donor_district`, `donor_city`, `donor_province`, `donor_zip_code`, `message`, `is_anonymous`, `midtrans_order_id`, `midtrans_transaction_id`, `transaction_status`, `fraud_status`, `payment_type`, `signature_key`, `settlement_time`, `created_at`, `updated_at`) VALUES
	(1, NULL, 1, NULL, 23009436.00, 0.00, 'donasi', NULL, 'Hamba Allah', 'fgh_a22@yahoo.com', '081210075003', 'Perumahan Legok Permai, Nomor : C1/E9 RT 01 RW 08 LEGOK LEGOK KOTA TANGERANG 15121 BANTEN INDONESIA', '', '', '', '', '', '-', 1, 'BAZTGN-1771484795-353', NULL, 'pending', NULL, 'qris', NULL, NULL, '2026-02-19 19:06:35', '2026-02-19 19:08:09'),
	(2, NULL, 1, NULL, 23009436.00, 4000.00, 'donasi', NULL, 'Hamba Allah', 'fgh_a22@yahoo.com', '081210075003', 'Perumahan Legok Permai, Nomor : C1/E9 RT 01 RW 08 LEGOK LEGOK KOTA TANGERANG 15121 BANTEN INDONESIA', '', '', '', '', '', '-', 1, 'BAZTGN-1771485020-147', NULL, 'pending', NULL, 'bri_va', NULL, NULL, '2026-02-19 19:10:20', '2026-02-19 19:10:20'),
	(3, NULL, 5, NULL, 10000.00, 0.00, 'donasi', NULL, 'Hamba Allah', 'contoh@email.com', '081310152142', 'Tangerang', '', '', '', '', '', '', 1, 'BAZTGN-1771610819-829', NULL, 'pending', NULL, 'qris', NULL, NULL, '2026-02-21 06:06:59', '2026-02-21 06:08:44'),
	(4, NULL, 4, NULL, 10000.00, 0.00, 'donasi', NULL, 'Yoga Hervianto', 'hervianto.yoga@gmail.com', '081281645932', 'Taman Borobudur 1', '', '', '', '', '', 'Sehat sekeluarga dan rezeki lancar', 1, 'BAZTGN-1773007048-250', NULL, 'pending', NULL, 'gopay', NULL, NULL, '2026-03-09 08:57:28', '2026-03-09 08:57:28'),
	(5, NULL, 4, NULL, 10000.00, 0.00, 'donasi', NULL, 'Yoga Hervianto', 'hervianto.yoga@gmail.com', '081281645932', 'Taman Borobudur 1', '', '', '', '', '', 'Sehat sekeluarga dan rezeki lancar', 1, 'BAZTGN-1773007053-559', NULL, 'pending', NULL, 'gopay', NULL, NULL, '2026-03-09 08:57:33', '2026-03-09 08:57:33'),
	(6, NULL, 4, NULL, 10000.00, 0.00, 'donasi', NULL, 'Yoga Hervianto', 'hervianto.yoga@gmail.com', '081281645932', 'Taman Borobudur 1', '', '', '', '', '', 'Sehat sekeluarga dan rezeki lancar', 1, 'BAZTGN-1773007065-509', NULL, 'pending', NULL, 'gopay', NULL, NULL, '2026-03-09 08:57:45', '2026-03-09 08:57:45'),
	(7, NULL, 2, NULL, 388167.00, 0.00, 'donasi', NULL, 'Donatur', 'donatur@gmail.com', '0987657586839', 'Alamat', '-', '-', '-', '-', '-', '', 1, 'BAZTGN-1778455216622-498', NULL, 'pending', NULL, 'gopay', NULL, NULL, '2026-05-11 10:20:16', '2026-05-11 10:20:16');

DROP TABLE IF EXISTS `tbl_payment_methods`;
CREATE TABLE IF NOT EXISTS `tbl_payment_methods` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `admin_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `icon` varchar(255) DEFAULT NULL,
  `icon_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_payment_methods`;
INSERT INTO `tbl_payment_methods` (`id`, `name`, `code`, `is_active`, `admin_fee`, `icon`, `icon_url`, `created_at`, `updated_at`) VALUES
	(1, 'GoPay', 'gopay', 1, 0.00, NULL, 'https://simamba.baznastangerangkab.or.id/upload/donasi/payment_methods/1765281774_3dfe55d81ed778efee07.png', '2025-11-01 09:20:52', '2025-12-09 12:02:54'),
	(2, 'Bank Transfer BCA', 'bca_va', 0, 2500.00, NULL, 'https://simamba.baznastangerangkab.or.id/upload/donasi/payment_methods/1765281789_0fb78b299e65338bb741.png', '2025-11-01 09:20:52', '2025-12-09 12:03:09'),
	(3, 'Bank Transfer Mandiri', 'mandiri_bill', 1, 4000.00, NULL, 'https://simamba.baznastangerangkab.or.id/upload/donasi/payment_methods/1765281802_b1e293bd80b8af597e00.png', '2025-11-01 09:20:52', '2025-12-10 03:42:31'),
	(4, 'Kartu Kredit / Debit', 'credit_card', 0, 0.00, NULL, 'https://simamba.baznastangerangkab.or.id/upload/donasi/payment_methods/1765281858_3b0040001723d59138a6.png', '2025-11-01 09:20:52', '2025-12-09 12:04:18'),
	(5, 'ShopeePay', 'shopeepay', 0, 0.00, NULL, 'https://simamba.baznastangerangkab.or.id/upload/donasi/payment_methods/1765281874_fdec2b4e57c94b1310d1.png', '2025-11-01 09:20:52', '2025-12-09 12:04:34'),
	(6, 'BRI', 'bri_va', 1, 4000.00, NULL, 'https://simamba.baznastangerangkab.or.id/upload/donasi/payment_methods/1765282040_479e97551941cd3b606f.png', '2025-12-09 12:07:20', '2025-12-10 03:42:19'),
	(7, 'Permata Virtual', 'permata_va', 1, 4000.00, NULL, 'https://simamba.baznastangerangkab.or.id/upload/donasi/payment_methods/1765282296_101e22dead784e9548c4.png', '2025-12-09 12:11:36', '2025-12-10 03:42:24'),
	(8, 'Qris', 'qris', 1, 0.00, NULL, 'https://simamba.baznastangerangkab.or.id/upload/donasi/payment_methods/1765282767_b4c3c9dcc96a9d59d464.png', '2025-12-09 12:19:27', '2025-12-09 12:19:27');

DROP TABLE IF EXISTS `tbl_testimoni`;
CREATE TABLE IF NOT EXISTS `tbl_testimoni` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL DEFAULT 0,
  `name` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `rating` int(1) NOT NULL DEFAULT 5,
  `avatar` varchar(255) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `avarat_url` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_testimoni`;

DROP TABLE IF EXISTS `tbl_users`;
CREATE TABLE IF NOT EXISTS `tbl_users` (
  `id` int(10) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  `social_provider` varchar(50) DEFAULT NULL,
  `social_id` varchar(255) DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `social_id` (`social_id`),
  CONSTRAINT `tbl_users_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_users`;
INSERT INTO `tbl_users` (`id`, `name`, `email`, `phone`, `address`, `city`, `province`, `zip_code`, `social_provider`, `social_id`, `last_login_at`, `refresh_token`, `created_at`, `updated_at`) VALUES
	(1, 'Rudi Yulianto', 'newcomputer300@gmail.com', NULL, NULL, NULL, NULL, NULL, 'google', '109123092499280265809', '2026-01-31 11:51:38', NULL, '2026-01-31 11:26:17', '2026-01-31 11:51:38'),
	(2, 'Rahmadi Dharmawan ', 'rahmadidharmawan18@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-21 00:49:28', '2026-02-21 00:49:28'),
	(3, 'Syaefulloh', 'saefulloh241090@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-12 13:34:25', '2026-03-12 13:34:25'),
	(4, 'Andri Cartawiguna', 'acartawiguna@gmail.com', NULL, NULL, NULL, NULL, NULL, 'google', '114939156022076412864', '2026-03-13 14:08:56', NULL, '2026-03-13 14:08:56', '2026-03-13 14:08:56');

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(30) DEFAULT NULL,
  `email` varchar(256) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `status_message` varchar(255) DEFAULT NULL,
  `reset_hash` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `force_pass_reset` tinyint(1) NOT NULL DEFAULT 0,
  `last_active` datetime DEFAULT NULL,
  `reset_at` datetime DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `users`;
INSERT INTO `users` (`id`, `username`, `email`, `status`, `password_hash`, `status_message`, `reset_hash`, `active`, `force_pass_reset`, `last_active`, `reset_at`, `reset_expires`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 'newcomputer3005658', 'newcomputer300@gmail.com', NULL, '$2y$10$QFbh3R59fKTlQyOtXOcTSefmXFUjibBkDY6.CEcKOgwaPeDGNzOTW', NULL, NULL, 1, 0, NULL, NULL, NULL, '2026-01-31 06:26:17', '2026-01-31 06:26:17', NULL),
	(2, 'rahmadidharmawan188047', 'rahmadidharmawan18@gmail.com', NULL, '$2y$10$izfZ1OKFg.yqp1ibOo6t6uLsbmj/S2ax0Vj0fgpNwdMXXmwyaOKFu', NULL, NULL, 1, 0, NULL, NULL, NULL, '2026-02-20 19:49:28', '2026-02-20 19:49:28', NULL),
	(3, 'saefulloh2410906426', 'saefulloh241090@gmail.com', NULL, '$2y$10$fVQUHQuuw/QtX4ByV07G5.mWMzk2d.sMYZgx3Q3MnBJR0O.Y4beKC', NULL, NULL, 1, 0, NULL, NULL, NULL, '2026-03-12 09:34:25', '2026-03-12 09:34:25', NULL),
	(4, 'acartawiguna6770', 'acartawiguna@gmail.com', NULL, '$2y$10$GwUwoa.CPQAdsu2C0vTNsux8F2p3OY0gqnXQfTDagFRilfMEukHby', NULL, NULL, 1, 0, NULL, NULL, NULL, '2026-03-13 10:08:56', '2026-03-13 10:08:56', NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
