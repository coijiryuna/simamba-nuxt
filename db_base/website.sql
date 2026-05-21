/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

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
	(1, '2025-10-18-121651', 'App\\Database\\Migrations\\CreateSlidersTable', 'default', 'App', 1760789854, 1);

DROP TABLE IF EXISTS `tbl_applicant`;
CREATE TABLE IF NOT EXISTS `tbl_applicant` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `nik` char(16) DEFAULT NULL,
  `fullname` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone_number` text DEFAULT NULL,
  `email` text DEFAULT NULL,
  `village` text DEFAULT NULL,
  `district` text DEFAULT NULL,
  `city` text DEFAULT NULL,
  `province` text DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_applicant`;

DROP TABLE IF EXISTS `tbl_chats`;
CREATE TABLE IF NOT EXISTS `tbl_chats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(100) NOT NULL,
  `sender_role` enum('guest','admin') NOT NULL,
  `sender_name` varchar(100) DEFAULT NULL,
  `sender_contact` varchar(100) DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_chats`;

DROP TABLE IF EXISTS `tbl_commentmeta`;
CREATE TABLE IF NOT EXISTS `tbl_commentmeta` (
  `meta_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `comment_id` bigint(20) unsigned NOT NULL DEFAULT 0,
  `meta_key` varchar(255) DEFAULT NULL,
  `meta_value` longtext DEFAULT NULL,
  PRIMARY KEY (`meta_id`),
  KEY `comment_id` (`comment_id`),
  KEY `meta_key` (`meta_key`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

DELETE FROM `tbl_commentmeta`;

DROP TABLE IF EXISTS `tbl_comments`;
CREATE TABLE IF NOT EXISTS `tbl_comments` (
  `comment_ID` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `comment_post_ID` bigint(20) unsigned NOT NULL DEFAULT 0,
  `comment_author` tinytext NOT NULL,
  `comment_author_email` varchar(100) NOT NULL DEFAULT '',
  `comment_author_url` varchar(200) NOT NULL DEFAULT '',
  `comment_author_IP` varchar(100) NOT NULL DEFAULT '',
  `comment_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `comment_date_gmt` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `comment_content` text NOT NULL,
  `comment_karma` int(11) NOT NULL DEFAULT 0,
  `comment_approved` varchar(20) NOT NULL DEFAULT '1',
  `comment_agent` varchar(255) NOT NULL DEFAULT '',
  `comment_type` varchar(20) NOT NULL DEFAULT 'comment',
  `comment_parent` bigint(20) unsigned NOT NULL DEFAULT 0,
  `user_id` bigint(20) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`comment_ID`),
  KEY `comment_post_ID` (`comment_post_ID`),
  KEY `comment_approved_date_gmt` (`comment_approved`,`comment_date_gmt`),
  KEY `comment_date_gmt` (`comment_date_gmt`),
  KEY `comment_parent` (`comment_parent`),
  KEY `comment_author_email` (`comment_author_email`(10))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

DELETE FROM `tbl_comments`;

DROP TABLE IF EXISTS `tbl_downloads`;
CREATE TABLE IF NOT EXISTS `tbl_downloads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_url` text NOT NULL,
  `file_category` varchar(50) DEFAULT 'Laporan',
  `download_count` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_downloads`;

DROP TABLE IF EXISTS `tbl_galery`;
CREATE TABLE IF NOT EXISTS `tbl_galery` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(50) NOT NULL DEFAULT '0',
  `images` varchar(256) DEFAULT NULL,
  `images_url` varchar(256) DEFAULT NULL,
  `caption` text DEFAULT NULL,
  `slug` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_galery`;

DROP TABLE IF EXISTS `tbl_links`;
CREATE TABLE IF NOT EXISTS `tbl_links` (
  `link_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `link_url` varchar(255) NOT NULL DEFAULT '',
  `link_name` varchar(255) NOT NULL DEFAULT '',
  `link_category` varchar(100) NOT NULL DEFAULT 'Umum',
  `link_image` varchar(255) NOT NULL DEFAULT '',
  `link_image_url` varchar(255) NOT NULL DEFAULT '',
  `link_icon` varchar(255) NOT NULL DEFAULT '',
  `link_icon_url` varchar(255) NOT NULL DEFAULT '',
  `link_target` varchar(25) NOT NULL DEFAULT '',
  `link_description` varchar(255) NOT NULL DEFAULT '',
  `link_visible` varchar(20) NOT NULL DEFAULT 'Y',
  `link_owner` bigint(20) unsigned NOT NULL DEFAULT 1,
  `link_rating` int(11) NOT NULL DEFAULT 0,
  `link_updated` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `link_rel` varchar(255) NOT NULL DEFAULT '',
  `link_notes` mediumtext NOT NULL,
  `link_rss` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`link_id`),
  KEY `link_visible` (`link_visible`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

DELETE FROM `tbl_links`;
INSERT INTO `tbl_links` (`link_id`, `link_url`, `link_name`, `link_category`, `link_image`, `link_image_url`, `link_icon`, `link_icon_url`, `link_target`, `link_description`, `link_visible`, `link_owner`, `link_rating`, `link_updated`, `link_rel`, `link_notes`, `link_rss`) VALUES
	(5, 'https://donasi.baznastangerangkab.or.id/', 'Donasi', 'Navbar', '', '', '', '', '_blank', '', 'Y', 1, 0, '2025-10-18 18:31:46', '', '', '');

DROP TABLE IF EXISTS `tbl_messages`;
CREATE TABLE IF NOT EXISTS `tbl_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_messages`;

DROP TABLE IF EXISTS `tbl_options`;
CREATE TABLE IF NOT EXISTS `tbl_options` (
  `option_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `option_name` varchar(191) NOT NULL DEFAULT '',
  `option_value` longtext NOT NULL,
  `autoload` varchar(20) NOT NULL DEFAULT 'yes',
  PRIMARY KEY (`option_id`),
  UNIQUE KEY `option_name` (`option_name`),
  KEY `autoload` (`autoload`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

DELETE FROM `tbl_options`;
INSERT INTO `tbl_options` (`option_id`, `option_name`, `option_value`, `autoload`) VALUES
	(155, 'csrf_test_name', '362a7d299461bfd7801fa000d8cb7b51', 'yes'),
	(156, 'blogname', 'BAZNAS Kabupaten Tangerang', 'yes'),
	(157, 'blogdescription', 'Badan Amil Zakat Nasional (BAZNAS) merupakan badan resmi dan satu-satunya yang dibentuk oleh pemerintah berdasarkan Keputusan Presiden RI No. 8 Tahun 2001 yang memiliki tugas dan fungsi menghimpun dan menyalurkan zakat, infaq, dan sedekah (ZIS) pada tingkat nasional.', 'yes'),
	(158, 'admin_email', 'baznas.tangerangkab@gmail.com', 'yes'),
	(159, 'date_format', 'F j, Y', 'yes'),
	(160, 'time_format', 'g:i a', 'yes'),
	(161, 'meta_description', 'badan amil zakat nasional kabupaten tangerang menyejahterakan umat', 'yes'),
	(162, 'meta_keywords', 'baznas, zakat, infaq, sedekah, palu, menyejahterakan, umat, keren, gemilang', 'yes'),
	(163, 'site_logo', 'https://simamba.baznastangerangkab.or.id/upload/website/images/1765488634_c672e936473e3d4073ab.png', 'yes'),
	(164, 'site_favicon', 'https://simamba.baznastangerangkab.or.id/upload/website/images/1765856395_dfa49e2e3de8f858de46.png', 'yes'),
	(165, 'users_can_register', '0', 'yes'),
	(166, 'site_address', 'Jl. Islamic Center No.01 Citra Raya', 'yes'),
	(167, 'site_maps_url', 'https://goo.gl/maps/5cvpx9YQbnjjyb7V8', 'yes'),
	(168, 'site_phone', '', 'yes'),
	(169, 'site_facebook', 'https://www.facebook.com/baznaskabupatentangerang', 'yes'),
	(170, 'site_twitter', '', 'yes'),
	(171, 'site_instagram', 'https://www.instagram.com/baznaskabupatentangerang/', 'yes'),
	(172, 'google_analytics', '', 'yes'),
	(173, 'google_recaptcha', '', 'yes'),
	(174, 'google_recaptcha_secret', '', 'yes'),
	(175, 'google_recaptcha_site_key', '', 'yes'),
	(176, 'google_recaptcha_theme', '', 'yes'),
	(177, 'google_recaptcha_type', '', 'yes'),
	(178, 'google_sheet', '', 'yes'),
	(179, 'google_sheet_id', '', 'yes'),
	(180, 'google_drive', '', 'yes'),
	(181, 'vision', 'LEMBAGA UTAMA MENYEJAHTERAKAN UMAT', 'yes'),
	(182, 'mission', '<ol class="pr-2"><li class="mb-3">\r\n                Membangun BAZNAS yang kuat, terpercaya, dan modern \r\nsebagai lembaga pemerintah non-struktural yang berwenang dalam \r\npengelolaan zakat\r\n              </li><li class="mb-3">\r\n                Memaksimalkan literasi zakat nasional dan peningkatan pengumpulan ZIS-DSKL secara masif dan terukur\r\n              </li><li class="mb-3">\r\n                Memaksimalkan pendistribusian dan pendayagunaan ZIS-DSKL\r\n untuk mengentaskan kemiskinan, meningkatkan kesejahteraan umat, dan \r\nmengurangi kesenjangan sosial\r\n              </li><li class="mb-3">\r\n                Memperkuat kompetensi, profesionalisme, integritas, dan kesejahteraan amil zakat nasional secara berkelanjutan\r\n              </li><li class="mb-3">\r\n                Modernisasi dan digitalisasi pengelolaan zakat nasional \r\ndengan sistem manajemen berbasis data yang kokoh dan terukur\r\n              </li><li class="mb-3">\r\n                Memperkuat sistem perencanaan, pengendalian, pelaporan, \r\npertanggungjawaban, dan koordinasi pengelolaan zakat secara nasional\r\n              </li><li class="mb-3">\r\n                Membangun kemitraan antara muzaki dan mustahik dengan semangat tolong menolong dalam kebaikan dan ketakwaan\r\n              </li><li class="mb-3">\r\n                Meningkatkan sinergi dan kaloborasi seluruh pemangku kepentingan terkait untuk pembangunan zakat nasional dan\r\n              </li><li class="mb-3">\r\n                Berperan aktif dan menjadi referensi bagi gerakan zakat dunia\r\n              </li></ol><p></p>', 'yes'),
	(183, 'purpose', '<ol class="pr-2"><li class="mb-3">\r\n                Terwujudnya BAZNAS sebagai lembaga pengelola zakat yang kuat, terpercaya, dan modern\r\n              </li><li class="mb-3">\r\n                Terwujudnya pengumpulan zakat nasional yang optimal\r\n              </li><li class="mb-3">\r\n                Terwujudnya penyaluran ZIS-DSKL yang efektif dalam \r\npengentasan kemiskinan, peningkatan kesejahteraan umat, dan pengurangan \r\nkesenjangan sosial\r\n              </li><li class="mb-3">\r\n                Terwujudnya profesi amil zakat nasional yang kompeten, berintegritas, dan sejahtera\r\n              </li><li class="mb-3">\r\n                Terwujudnya sistem manajemen dan basis data pengelolaan zakat nasional yang mengadopsi teknologi mutakhir\r\n              </li><li class="mb-3">\r\n                Terwujudnya perencanaan, pengendalian, pelaporan, dan \r\npertanggungjawaban pengelolaan zakat dengan kelola yang baik dan \r\nterstandar\r\n              </li><li class="mb-3">\r\n                Terwujudnya hubungan saling tolong menolong dalam kebaikan dan ketakwaan antara muzaki dan mustahik\r\n              </li><li class="mb-3">\r\n                Terwujudnya sinergi dan kaloborasi seluruh pemangku kepentingan terkait dalam pembangunan zakat nasional\r\n              </li><li class="mb-3">\r\n                Terwujudnya Indonesia sebagai <i>center of excellence</i> pengelolaan zakat dunia\r\n              </li></ol><p></p>', 'yes'),
	(184, 'target', '<ol class="pr-2"><li class="mb-3">\r\n                Meningkatkan kualitas pelayanan kepada muzaki, mustahik, dan stakeholder lainnya\r\n              </li><li class="mb-3">\r\n                Meningkatkan kesadaran masyarakat untuk menunaikan zakat melalui UPZ resmi\r\n              </li><li class="mb-3">\r\n                Meningkatkan pertumbuhan pengumpulan zakat nasional\r\n              </li><li class="mb-3">\r\n                Meningkatkan kualitas pelayanan kepada mustahik dan penerima manfaat ZIS-DSKL\r\n              </li><li class="mb-3">\r\n                Meningkatkan manfaat ZIS-DSKL dalam upaya pengentasan \r\nkemiskinan, peningkatan kesejahteraan umat, dan pengurangan kesenjangan \r\nsosial\r\n              </li><li class="mb-3">\r\n                Meningkatkan kualitas dan pelaksanaan Standar Kompetensi Kerja Nasional Indonesia (SKK-NI) Sektor Zakat\r\n              </li><li class="mb-3">\r\n                Mendorong pembentukan dan pengembangan asosiasi profesi amil zakat Indonesia\r\n              </li><li class="mb-3">\r\n                Membangun <i>merit system</i> dalam pengelolaan SDM amil zakat pada OPZ\r\n              </li><li class="mb-3">\r\n                Mengembangkan sistem manajemen dan basis data pengelolaan zakat kabupaten</li><li class="mb-3">\r\n                Memperkuat infrastruktur teknologi informasi dalam menunjang operasional pelayanan UPZ</li><li class="mb-3">Memperkuat basis data muzaki, mustahik, dan amil zakat nasional dan kabupaten;</li><li class="mb-3">Mengembangkan sistem perencanaan zakat dengan tata kelola yang baik dan terstandar</li><li class="mb-3">Mengembangkan sistem pengendalian zakat dengan tata kelola yang baik dan terstandar</li><li class="mb-3">Mengembangkan sistem pelaporan dan pertanggungjawaban pengelolaan zakat dengan tata kelola yang baik dan terstandar</li><li class="mb-3">Mengembangkan program partisipasi muzaki dan mustahik dalam pengelolaan zakat</li><li class="mb-3">Mengembangkan sinergi dan kolaborasi UPZ dalam sosialisasi dan edukasi zakat</li><li class="mb-3">Mengembangkan sinergi dan kolaborasi UPZ dalam pendistribusian dan pendayagunaan zakat</li><li class="mb-3">Mengembangkan sinergi dan kolaborasi pengelolaan zakat dengan pemerintahan pusat, provinsi dan daerah</li><li class="mb-3">Mengembangkan sinergi dan kolaborasi pengelolaan zakat nasional dengan pihak swasta dan lembaga non-pemerintah</li><li class="mb-3">Meningkatkan pengakuan masyarakat atas pengelolaan zakat</li></ol><p></p>', 'yes'),
	(185, 'speech', '<p>sambutan&nbsp;</p>', 'yes'),
	(186, 'flyer_active', 'no', 'no'),
	(187, 'flyer_image', '', 'no'),
	(188, 'flyer_link', '', 'no'),
	(189, 'submission_enabled', 'yes', 'yes');

DROP TABLE IF EXISTS `tbl_postmeta`;
CREATE TABLE IF NOT EXISTS `tbl_postmeta` (
  `meta_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `post_id` bigint(20) unsigned NOT NULL DEFAULT 0,
  `meta_key` varchar(255) DEFAULT NULL,
  `meta_value` longtext DEFAULT NULL,
  PRIMARY KEY (`meta_id`),
  KEY `post_id` (`post_id`),
  KEY `meta_key` (`meta_key`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

DELETE FROM `tbl_postmeta`;

DROP TABLE IF EXISTS `tbl_posts`;
CREATE TABLE IF NOT EXISTS `tbl_posts` (
  `ID` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `post_author` bigint(20) unsigned NOT NULL DEFAULT 0,
  `post_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `post_date_gmt` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `post_content` longtext NOT NULL,
  `post_title` text NOT NULL,
  `post_excerpt` text NOT NULL,
  `post_status` varchar(20) NOT NULL DEFAULT 'publish',
  `comment_status` varchar(20) NOT NULL DEFAULT 'open',
  `ping_status` varchar(20) NOT NULL DEFAULT 'open',
  `post_password` varchar(255) NOT NULL DEFAULT '',
  `post_name` varchar(200) NOT NULL DEFAULT '',
  `to_ping` text NOT NULL,
  `pinged` text NOT NULL,
  `featured_image` text DEFAULT NULL,
  `featured_image_url` text DEFAULT NULL,
  `post_modified` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `post_modified_gmt` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `post_content_filtered` longtext NOT NULL,
  `post_parent` bigint(20) unsigned NOT NULL DEFAULT 0,
  `guid` varchar(255) NOT NULL DEFAULT '',
  `menu_order` int(11) NOT NULL DEFAULT 0,
  `post_views` int(11) NOT NULL DEFAULT 0,
  `post_type` varchar(20) NOT NULL DEFAULT 'post',
  `post_mime_type` varchar(100) NOT NULL DEFAULT '',
  `comment_count` bigint(20) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`),
  KEY `post_name` (`post_name`(191)),
  KEY `type_status_date` (`post_type`,`post_status`,`post_date`,`ID`),
  KEY `post_parent` (`post_parent`),
  KEY `post_author` (`post_author`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_posts`;
INSERT INTO `tbl_posts` (`ID`, `post_author`, `post_date`, `post_date_gmt`, `post_content`, `post_title`, `post_excerpt`, `post_status`, `comment_status`, `ping_status`, `post_password`, `post_name`, `to_ping`, `pinged`, `featured_image`, `featured_image_url`, `post_modified`, `post_modified_gmt`, `post_content_filtered`, `post_parent`, `guid`, `menu_order`, `post_views`, `post_type`, `post_mime_type`, `comment_count`) VALUES
	(11, 1, '2025-10-19 16:12:00', '0000-00-00 00:00:00', '<p align="justify"><b>Zakat adalah bagian tertentu dari harta yang wajib dikeluarkan oleh setiap muslim\r\n                                apabila telah mencapai syarat yang ditetapkan. Sebagai salah satu rukun Islam, Zakat\r\n                                ditunaikan untuk diberikan kepada golongan yang berhak menerimanya (asnaf).\r\n                            </b></p><p align="justify"><b><br></b></p><p class="mt-2 text-justify">\r\n                                Zakat berasal dari bentuk kata <i>"zaka"</i> yang berarti suci, baik, berkah, tumbuh,\r\n                                dan berkembang. Dinamakan zakat, karena di dalamnya terkandung harapan untuk memperoleh\r\n                                berkah, membersihkan jiwa dan memupuknya dengan berbagai kebaikan (Fikih Sunnah, Sayyid\r\n                                Sabiq: 5</p><p class="mt-2 text-justify">Makna tumbuh dalam arti zakat menunjukkan bahwa mengeluarkan zakat sebagai sebab adanya\r\n                                pertumbuhan dan perkembangan harta, pelaksanaan zakat itu mengakibatkan pahala menjadi\r\n                                banyak. Sedangkan makna suci menunjukkan bahwa zakat adalah mensucikan jiwa dari\r\n                                kejelekan, kebatilan, dan pensuci dari dosa-dosa.</p><p class="mt-2 text-justify">Dalam Al-Quran disebutkan, <i>“Ambillah zakat dari sebagian harta mereka, dengan zakat\r\n                                    itu kamu membersihkan dan menyucikan mereka”</i> (QS. at-Taubah [9]: 103).\r\n                            </p>\r\n\r\n                            <p class="text-justify">\r\n                                Menurut istilah dalam kitab al-Hâwî, al-Mawardi mendefinisikan zakat dengan nama\r\n                                pengambilan tertentu dari harta tertentu, menurut sifat-sifat tertentu dan untuk\r\n                                diberikan kepada golongan tertentu. Orang yang menunaikan zakat disebut Muzaki.\r\n                                Sedangkan orang yang menerima zakat disebut Mustahik.\r\n                            </p>\r\n\r\n                            <p class="text-justify">\r\n                                Sementara menurut Peraturan Menteri Agama No. 52 Tahun 2014, Zakat adalah harta yang\r\n                                wajib dikeluarkan oleh seorang muslim atau badan usaha yang dimiliki oleh orang Islam\r\n                                untuk diberikan kepada yang berhak menerimanya sesuai dengan syariat Islam.\r\n                            </p>\r\n\r\n                            <p class="text-justify">\r\n                                Zakat dikeluarkan dari harta yang dimiliki. Akan tetapi, tidak semua harta terkena\r\n                                kewajiban zakat. Syarat dikenakannya zakat atas harta di antaranya:\r\n                            </p>\r\n\r\n                            <ol class="pr-2"><li class="mb-3">\r\n                                    harta tersebut merupakan barang halal dan diperoleh dengan cara yang halal;\r\n                                </li><li class="mb-3">\r\n                                    harta tersebut dimiliki penuh oleh pemiliknya;\r\n                                </li><li class="mb-3">\r\n                                    harta tersebut merupakan harta yang dapat berkembang;\r\n                                </li><li class="mb-3">\r\n                                    harta tersebut mencapai nishab sesuai jenis hartanya;\r\n                                </li><li class="mb-3">\r\n                                    harta tersebut melewati haul; dan\r\n                                </li><li class="mb-3">\r\n                                    pemilik harta tidak memiliki hutang jangka pendek yang harus dilunasi.</li></ol><h5 class=""><br></h5><h5 class="">Asnaf (8 Golongan) Penerima Zakat</h5><p><br></p><p class="text-justify">\r\n                                Sebagai instrumen yang masuk dalam salah satu Rukun Islam, zakat tentu saja memiliki\r\n                                aturan mengikat dari segi ilmu fiqihnya, salah satu diantaranya adalah kepada siapa\r\n                                zakat diberikan.\r\n                            </p>\r\n\r\n                            <p class="text-justify">\r\n                                Dalam QS. At-Taubah ayat 60, Allah memberikan ketentuan ada delapan golongan orang yang\r\n                                menerima zakat yaitu sebagai berikut:\r\n                            </p>\r\n\r\n                            <ol class="pr-2"><li class="mb-3">\r\n                                    <b>Fakir</b>, mereka yang hampir tidak memiliki apa-apa sehingga tidak mampu\r\n                                    memenuhi kebutuhan pokok hidup.\r\n                                </li><li class="mb-3">\r\n                                    <b>Miskin</b>, mereka yang memiliki harta namun tidak cukup untuk memenuhi kebutuhan\r\n                                    dasar kehidupan.\r\n                                </li><li class="mb-3">\r\n                                    <b>Amil</b>, mereka yang mengumpulkan dan mendistribusikan zakat.\r\n                                </li><li class="mb-3">\r\n                                    <b>Mualaf</b>, mereka yang baru masuk Islam dan membutuhkan bantuan untuk menguatkan\r\n                                    dalam tauhid dan syariah.\r\n                                </li><li class="mb-3">\r\n                                    <b>Riqab</b>, budak atau hamba sahaya yang ingin memerdekakan dirinya.\r\n                                </li><li class="mb-3">\r\n                                    <b>Gharimin</b>, mereka yang berhutang untuk kebutuhan hidup dalam mempertahankan\r\n                                    jiwa dan izzahnya.\r\n                                </li><li class="mb-3">\r\n                                    <b>Fisabilillah</b>, mereka yang berjuang di jalan Allah dalam bentuk kegiatan\r\n                                    dakwah, jihad dan sebagainya.\r\n                                </li><li class="mb-3">\r\n                                    <b>Ibnu Sabil</b>, mereka yang kehabisan biaya di perjalanan dalam ketaatan kepada\r\n                                    Allah.\r\n                                </li></ol><h2 class="font-weight-bold mt-3"><br></h2><h5 class="">Jenis Zakat</h5><p><br></p><p class="text-justify">\r\n                                Secara umum zakat terbagi menjadi dua jenis, yakni <a href="https://baznas.go.id/zakatfitrah" class="font-weight-bold" target="_blank">zakat\r\n                                    fitrah</a> dan <a href="https://baznas.go.id/zakat-mal" target="_blank" class="font-weight-bold">zakat\r\n                                    mal</a>. Zakat Fitrah <i>(zakat al-fitr)</i> adalah zakat yang diwajibkan atas\r\n                                setiap jiwa baik lelaki dan perempuan muslim yang dilakukan pada bulan Ramadhan.\r\n                            </p>\r\n\r\n                            <p class="text-justify">\r\n                                Zakat mal adalah zakat yang dikenakan atas segala jenis harta, yang secara zat maupun\r\n                                substansi perolehannya, tidak bertentangan dengan ketentuan agama. Sebagai contoh, zakat\r\n                                mal terdiri atas uang, emas, surat berharga, penghasilan profesi, dan lain-lain,\r\n                                sebagaimana yang terdapat dalam UU No. 23/2011 tentang Pengelolaan Zakat, Peraturan\r\n                                Menteri Agama No. 52 Tahun 2014 yang telah diubah dua kali dengan perubahan kedua adalah\r\n                                Peraturan Menteri Agama No. 31/2019, dan pendapat Syaikh Dr. Yusuf Al-Qardhawi serta\r\n                                para ulama lainnya.\r\n                            </p>\r\n\r\n                            <p class="text-justify">\r\n                                <a href="https://baznas.go.id/zakat-mal" class="font-weight-bold" target="_blank">Zakat\r\n                                    mal</a> sebagaimana dimaksud pada paragraf di atas meliputi:\r\n                            </p>\r\n\r\n                            <table class="table table-borderless text-justify">\r\n                                <tbody>\r\n                                    <tr>\r\n                                        <td style="width: 10px;  text-align: center; "><b>1.</b></td>\r\n                                        <td><b>Zakat emas, perak, dan logam mulia lainnya</b></td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td><b></b><br></td>\r\n                                        <td>Adalah zakat yang dikenakan atas emas, perak, dan logam lainnya yang telah\r\n                                            mencapai nisab dan haul.\r\n                                        </td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td style="width: 5px;  text-align: center;"><b>2.</b></td>\r\n                                        <td> <b>Zakat atas uang dan surat berharga lainnya</b></td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td><b></b><br></td>\r\n                                        <td>Adalah zakat yang dikenakan atas uang, harta yang disetarakan dengan uang,\r\n                                            dan surat berharga lainnya yang telah mencapai nisab dan haul.\r\n                                        </td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td style="width: 5px;  text-align: center; "><b>3.</b></td>\r\n                                        <td> <b>Zakat perniagaan</b></td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td><b></b><br></td>\r\n                                        <td>Adalah zakat yang dikenakan atas usaha perniagaan yang telah mencapai nisab\r\n                                            dan haul.\r\n                                        </td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td style="width: 5px;  text-align: center; "><b>4.</b></td>\r\n                                        <td> <b>Zakat pertanian, perkebunan, dan kehutanan</b></td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td><b></b><br></td>\r\n                                        <td>Adalah zakat yang dikenakan atas hasil pertanian, perkebunan dan hasil hutan\r\n                                            pada saat panen.\r\n                                        </td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td style="width: 5px;  text-align: center; "><b>5.</b></td>\r\n                                        <td> <b>Zakat peternakan dan perikanan</b></td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td><b></b><br></td>\r\n                                        <td>Adalah zakat yang dikenakan atas binatang ternak dan hasil perikanan yang\r\n                                            telah mencapai nisab dan haul.\r\n                                        </td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td style="width: 5px;  text-align: center; "><b>6.</b></td>\r\n                                        <td> <b>Zakat pertambangan</b></td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td><b></b><br></td>\r\n                                        <td>Adalah zakat yang dikenakan atas hasil usaha pertambangan yang telah\r\n                                            mencapai nisab dan haul.\r\n                                        </td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td style="width: 5px;  text-align: center; "><b>7.</b></td>\r\n                                        <td> <b>Zakat perindustrian</b></td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td><b></b><br></td>\r\n                                        <td>Adalah zakat atas usaha yang bergerak dalam bidang produksi barang dan jasa.\r\n                                        </td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td style="width: 5px;  text-align: center; "><b>8.</b></td>\r\n                                        <td> <b>Zakat pendapatan dan jasa</b></td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td><b></b><br></td>\r\n                                        <td>Adalah zakat yang dikeluarkan dari penghasilan yang diperoleh dari hasil\r\n                                            profesi pada saat menerima pembayaran, zakat ini dikenal juga sebagai zakat\r\n                                            profesi atau zakat penghasilan.\r\n                                        </td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td style="width: 5px;  text-align: center; "><b>9.</b></td>\r\n                                        <td> <b>Zakat rikaz</b></td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td><b></b><br></td>\r\n                                        <td>Adalah zakat yang dikenakan atas harta temuan, dimana kadar zakatnya adalah\r\n                                            20%.\r\n                                        </td>\r\n                                    </tr>\r\n                                </tbody>\r\n                            </table>\r\n\r\n                            <h5 class="">\r\n                                </h5><h5 class="">Syarat Zakat Mal dan Zakat Fitrah:\r\n                            </h5>\r\n\r\n                            <p class="text-justify">\r\n                                Zakat mal wajib dikeluarkan atas harta yang dimiliki seseorang jika memenuhi syarat\r\n                                tertentu sesuai syariat Islam. Berikut adalah syarat-syarat untuk mengeluarkan zakat\r\n                                mal:\r\n                            </p>\r\n\r\n                            <table class="table table-borderless align-justify">\r\n                                <tbody>\r\n                                    <tr>\r\n                                        <td style="width: 25px;">1. </td>\r\n                                        <td>Harta yang dikenai zakat harus memenuhi syarat sesuai dengan ketentuan\r\n                                            syariat Islam.</td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td style="width: 25px;">2. </td>\r\n                                        <td>Syarat harta yang dikenakan zakat mal sebagai berikut:</td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td colspan="2" style="width: 25px;  padding-left: 30px !important;">a. milik\r\n                                            penuh</td>\r\n                                        <td><br></td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td colspan="2" style="width: 25px;  padding-left: 30px !important;">b. halal\r\n                                        </td>\r\n                                        <td><br></td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td colspan="2" style="width: 25px;  padding-left: 30px !important;">c. cukup\r\n                                            nisab</td>\r\n                                        <td><br></td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td colspan="2" style="width: 25px;  padding-left: 30px !important;">d. haul\r\n                                        </td>\r\n                                        <td><br></td>\r\n                                    </tr>\r\n                                    <tr>\r\n                                        <td style="width: 25px;">3. </td>\r\n                                        <td>Hanya saja, syarat haul tidak berlaku untuk zakat pertanian, perkebunan dan\r\n                                            kehutanan, perikanan, pendapatan dan jasa, serta zakat rikaz.</td>\r\n                                    </tr>\r\n                                </tbody>\r\n                            </table>\r\n\r\n                            <p class="text-justify">\r\n                                Sedangkan untuk syarat zakat fitrah sebagai berikut:\r\n                            </p>\r\n\r\n                            <ol class="pr-2"><li class="mb-3">\r\n                                    beragama Islam\r\n                                </li><li class="mb-3">\r\n                                    hidup pada saat bulan ramadhan;\r\n                                </li><li class="mb-3">\r\n                                    memiliki kelebihan kebutuhan pokok untuk malam dan hari raya idul fitri;\r\n                                </li></ol>\r\n\r\n                            <p class="text-secondary">\r\n                                (Sumber: Al Qur\'an Surah Al Baqarah ayat 267, Peraturan Menteri Agama Nomor 31 Tahun\r\n                                2019, Fatwa MUI Nomor 3 Tahun 2003, dan pendapat Shaikh Yusuf Qardawi).\r\n                            </p>\r\n\r\n                            <p class="text-justify">\r\n                                Untuk memperdalam pemahaman Anda tentang zakat, termasuk ketentuan, syarat, dan tata\r\n                                cara pengelolaannya, kami mengundang Anda untuk menonton video berikut yang menyajikan\r\n                                penjelasan lengkap dan terpercaya.\r\n                            </p><p><br></p>', 'Tentang Zakat', '', 'publish', 'open', 'open', '', 'tentang-zakat', '', '', '1765863955_3d123c86a458bcbfa39e.jpg', 'https://simamba.baznastangerangkab.or.id/upload/website/images/1765863955_3d123c86a458bcbfa39e.jpg', '2026-05-11 18:01:02', '0000-00-00 00:00:00', '', 0, '', 0, 107, 'article', '', 0),
	(12, 1, '2025-12-14 04:05:00', '0000-00-00 00:00:00', '<h5 class="text-bold" align="left">BANTUAN PAKET SEMBAKO</h5><p class="pg"><br>Bantuan paket sembako dalam kemasan yang layak diberikan kepada mustahik untuk memenuhi kebutuhan pokok. </p><p class="pg"><br></p>\r\n                <p class="pg"><b style="color: grey;">Tujuan</b>\r\n                  </p><ol><li class="pg">Terpenuhinya kebutuhan dasar mustahik</li><li class="pg">Meringankan beban mustahik karena harus membeli bahan makanan pokok</li><li class="pg">Mencegah mustahik kelaparan</li></ol>\r\n                <p></p>\r\n                <p class="pg"><b style="color: grey;">Sasaran</b>\r\n                  </p><ol><li class="pg">Disabilitas</li><li class="pg">Janda dan lansia</li><li class="pg">Guru mengaji muslim yang dhuafa</li><li class="pg">Orang yang terkena musibah bencana alam</li></ol>\r\n                <p></p>\r\n                <p class="pg"><b style="color: grey;">Asnaf</b><br>Fakir-Miskin<br><br><img src="https://simamba.baznastangerangkab.or.id/upload/website/images/1765849751_de020296a19d7d364bf7.jpg" style="width: 725.425px; height: 483.617px;"><br>\r\n                </p><div class="clearfix"></div>\r\n\r\n                <h5 class="text-bold">SANTUNAN YATIM DAN DHUAFA</h5><p><br></p>\r\n                <p class="pg">Bantuan kontribusi kegiatan santunan yang dikelola oleh lembaga sosial islam atau ormas Islam.</p>\r\n                <p class="pg"><b style="color: grey;">Tujuan</b>\r\n                  </p><ul class="dash"><li class="pg">Terselenggaranya kegiatan santunan</li><li class="pg">Terpenuhinya kebutuhan operasional peserta kegiatan santunan</li></ul>\r\n                <p></p>\r\n                <p class="pg"><b style="color: grey;">Sasaran</b>\r\n                  </p><ul class="dash"><li class="pg">Yatim dan piatu</li><li class="pg">Dhuafa dan lansia</li><li class="pg">Disabilitas</li></ul>\r\n                <p></p>\r\n                <p class="pg"><b style="color: grey;">Asnaf</b><br>Fakir-Miskin, Fii Sabilillah</p><p class="pg"><br></p><p></p>', 'Bidang Kemanusiaan', '', 'publish', 'open', 'open', '', 'bidang-kemanusiaan', '', '', '1765849039_d66bfc82e081e4ca4a0f.jpg', 'https://simamba.baznastangerangkab.or.id/upload/website/images/1765849039_d66bfc82e081e4ca4a0f.jpg', '2026-01-22 06:15:17', '0000-00-00 00:00:00', '', 0, '', 0, 38, 'program', '', 0),
	(13, 1, '2025-12-16 08:54:00', '0000-00-00 00:00:00', '<p>Program pelayanan kesehatan secara terpadu kepada seluruh mustahik.</p><p><br></p><p><img src="https://simamba.baznastangerangkab.or.id/upload/website/images/1765850084_147c68b8e9d13b6ceb6f.jpeg" style="width: 100%;"></p><p><br></p>', 'Bidang Kesehatan', '', 'publish', 'open', 'open', '', 'bidang-kesehatan', '', '', '1765850314_adfb4a613ff3e467ee63.jpg', 'https://simamba.baznastangerangkab.or.id/upload/website/images/1765850314_adfb4a613ff3e467ee63.jpg', '2026-01-22 06:18:55', '0000-00-00 00:00:00', '', 0, '', 0, 20, 'program', '', 0),
	(14, 1, '2025-12-16 09:10:00', '0000-00-00 00:00:00', '<h5><strong>BEASISWA SATU KECAMATAN SATU SARJANA (SKSS)</strong></h5><h5><strong><br></strong>Program BAZNAS dalam menyediakan dana pendidikan demi terjaminnya keberlangsungan program pendidikan bagi para mahasiswa dari keluarga kurang mampu serta sebagai pertanggungjawaban antar generasi.<br></h5><h5><strong>BANTUAN BIAYA PENDIDIKAN&nbsp;<br></strong></h5><h5>Penyaluran yang dilakukan berdasarkan pada pengajuan Proposal dari Mustahik kepada BAZNAS di bidang Pendidikan.</h5><ol><li><p>Dukungan Biaya Pokok Pendidikan SD sampai SMA sederajat</p></li><li><p>Dukungan Biaya Pokok Pendidikan Diploma dan S1</p></li><li><p>Dukungan Biaya Pokok Pendidikan Santri (pengajuan lembaga)</p></li><li><p>Program Pendidikan/Jenis Bantuan Lain sesuai arahan Pimpinan/Pleno BAZNAS</p></li><li><p>Pengadaan Aset Sekolah/Madrasah</p></li><li><p>Dukungan Biaya Operasional Pendidikan tingkat Diploma dan S1</p></li></ol><p></p>', 'Bidang Pendidikan', '', 'publish', 'open', 'open', '', 'bidang-pendidikan', '', '', '1765851400_229882385ee4dac63336.jpg', 'https://simamba.baznastangerangkab.or.id/upload/website/images/1765851400_229882385ee4dac63336.jpg', '2026-05-11 07:08:46', '0000-00-00 00:00:00', '', 0, '', 0, 67, 'program', '', 0);

DROP TABLE IF EXISTS `tbl_request`;
CREATE TABLE IF NOT EXISTS `tbl_request` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `request` text NOT NULL,
  `status` tinyint(1) DEFAULT 1 COMMENT '1=Aktif, 0=Tidak Aktif',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_request`;
INSERT INTO `tbl_request` (`ID`, `request`, `status`) VALUES
	(1, 'Permohonan Bantuan Biaya Sekolah', 1),
	(2, 'Permohonan Bantuan Modal Usaha', 1),
	(3, 'Permohonan Bantuan Rumah layak Huni', 1);

DROP TABLE IF EXISTS `tbl_requirements`;
CREATE TABLE IF NOT EXISTS `tbl_requirements` (
  `ID` int(10) NOT NULL AUTO_INCREMENT,
  `request_id` int(11) NOT NULL,
  `requirements` text NOT NULL,
  `status` tinyint(1) DEFAULT 0 COMMENT '1=Aktif, 0=Tidak Aktif',
  `created_at` datetime DEFAULT curdate(),
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `request_id` (`request_id`),
  CONSTRAINT `FK_tbl_requirements_tbl_request` FOREIGN KEY (`request_id`) REFERENCES `tbl_request` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_requirements`;
INSERT INTO `tbl_requirements` (`ID`, `request_id`, `requirements`, `status`, `created_at`, `updated_at`) VALUES
	(1, 1, 'Scan Kartu Tanda Penduduk atau kartu keluarga', 1, NULL, '2025-10-19 18:09:45');

DROP TABLE IF EXISTS `tbl_sliders`;
CREATE TABLE IF NOT EXISTS `tbl_sliders` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `caption` text DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `display_order` int(5) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_sliders`;
INSERT INTO `tbl_sliders` (`id`, `title`, `caption`, `image_url`, `image`, `link_url`, `display_order`, `status`, `created_at`, `updated_at`) VALUES
	(1, 'HUT RI', '', 'https://simamba.baznastangerangkab.or.id/upload/website/sliders/1764553066_530a58b26a10006060ed.webp', '1764553066_530a58b26a10006060ed.webp', '', 1, 'active', '2025-10-18 19:37:10', '2025-10-18 19:37:12');

DROP TABLE IF EXISTS `tbl_submissions`;
CREATE TABLE IF NOT EXISTS `tbl_submissions` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `submission_uid` varchar(16) NOT NULL,
  `applicant_id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL,
  `submission_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `max_edit_date` timestamp NULL DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending' COMMENT 'e.g., pending, approved, rejected, in_process',
  `notes` text NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `submission_uid` (`submission_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_submissions`;

DROP TABLE IF EXISTS `tbl_termmeta`;
CREATE TABLE IF NOT EXISTS `tbl_termmeta` (
  `meta_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `term_id` bigint(20) unsigned NOT NULL DEFAULT 0,
  `meta_key` varchar(255) DEFAULT NULL,
  `meta_value` longtext DEFAULT NULL,
  PRIMARY KEY (`meta_id`),
  KEY `term_id` (`term_id`),
  KEY `meta_key` (`meta_key`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

DELETE FROM `tbl_termmeta`;

DROP TABLE IF EXISTS `tbl_term_relationships`;
CREATE TABLE IF NOT EXISTS `tbl_term_relationships` (
  `object_id` bigint(20) unsigned NOT NULL DEFAULT 0,
  `term_taxonomy_id` bigint(20) unsigned NOT NULL DEFAULT 0,
  `term_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`object_id`,`term_taxonomy_id`),
  KEY `term_taxonomy_id` (`term_taxonomy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

DELETE FROM `tbl_term_relationships`;
INSERT INTO `tbl_term_relationships` (`object_id`, `term_taxonomy_id`, `term_order`) VALUES
	(11, 14, 0),
	(14, 0, 0);

DROP TABLE IF EXISTS `tbl_terms`;
CREATE TABLE IF NOT EXISTS `tbl_terms` (
  `term_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL DEFAULT '',
  `slug` varchar(200) NOT NULL DEFAULT '',
  `term_group` bigint(10) NOT NULL DEFAULT 0,
  `term_navbar` bigint(10) NOT NULL DEFAULT 0,
  `term_link` varchar(255) DEFAULT '',
  PRIMARY KEY (`term_id`),
  KEY `slug` (`slug`(191)),
  KEY `name` (`name`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

DELETE FROM `tbl_terms`;
INSERT INTO `tbl_terms` (`term_id`, `name`, `slug`, `term_group`, `term_navbar`, `term_link`) VALUES
	(2, 'Pendistribusian', 'penyaluran', 0, 1, ''),
	(3, 'Pengumpulan', 'pengumpulan', 0, 1, ''),
	(4, 'Zakat, Infaq dan Sedekah', 'zakat', 0, 1, ''),
	(12, 'Tentang Zakat', 'tentang-zakat', 0, 0, '/tentang-zakat'),
	(14, 'Tentang Infaq', 'tentang-infaq', 0, 0, ''),
	(15, 'Informasi Publik', 'informasi-publik', 0, 0, '');

DROP TABLE IF EXISTS `tbl_term_taxonomy`;
CREATE TABLE IF NOT EXISTS `tbl_term_taxonomy` (
  `term_taxonomy_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `term_id` bigint(20) unsigned NOT NULL DEFAULT 0,
  `taxonomy` varchar(32) NOT NULL DEFAULT '',
  `description` longtext NOT NULL,
  `parent` bigint(20) unsigned NOT NULL DEFAULT 0,
  `count` bigint(20) NOT NULL DEFAULT 0,
  PRIMARY KEY (`term_taxonomy_id`),
  UNIQUE KEY `term_id_taxonomy` (`term_id`,`taxonomy`),
  KEY `taxonomy` (`taxonomy`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

DELETE FROM `tbl_term_taxonomy`;
INSERT INTO `tbl_term_taxonomy` (`term_taxonomy_id`, `term_id`, `taxonomy`, `description`, `parent`, `count`) VALUES
	(3, 3, 'category', 'Lorem Ipsum', 0, 0),
	(4, 4, 'category', 'Navbar Zakat', 0, 0),
	(13, 2, 'category', 'Bidang Pendistribusian dan Pendayagunaan', 0, 0),
	(14, 12, 'category', 'Tentang Zakat', 4, 0),
	(15, 13, 'category', 'Navbar Tentang Infaq dan Sedekah', 0, 0),
	(16, 14, 'category', '', 4, 0),
	(17, 15, 'category', '', 0, 0);

DROP TABLE IF EXISTS `tbl_upload_requirement`;
CREATE TABLE IF NOT EXISTS `tbl_upload_requirement` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) DEFAULT NULL,
  `requirement_id` int(11) DEFAULT NULL,
  `data_upload` varchar(256) DEFAULT NULL,
  `data_upload_url` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_tbl_upload_requirement_tbl_requirements` (`requirement_id`),
  KEY `FK_tbl_upload_requirement_tbl_submissions` (`submission_id`),
  CONSTRAINT `FK_tbl_upload_requirement_tbl_requirements` FOREIGN KEY (`requirement_id`) REFERENCES `tbl_requirements` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `FK_tbl_upload_requirement_tbl_submissions` FOREIGN KEY (`submission_id`) REFERENCES `tbl_submissions` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_upload_requirement`;

DROP TABLE IF EXISTS `tbl_usermeta`;
CREATE TABLE IF NOT EXISTS `tbl_usermeta` (
  `umeta_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL DEFAULT 0,
  `meta_key` varchar(255) DEFAULT NULL,
  `meta_value` longtext DEFAULT NULL,
  PRIMARY KEY (`umeta_id`),
  KEY `user_id` (`user_id`),
  KEY `meta_key` (`meta_key`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

DELETE FROM `tbl_usermeta`;
INSERT INTO `tbl_usermeta` (`umeta_id`, `user_id`, `meta_key`, `meta_value`) VALUES
	(19, 2, 'first_name', 'super'),
	(20, 2, 'last_name', 'admin'),
	(21, 2, 'description', 'administrator');

DROP TABLE IF EXISTS `tbl_users`;
CREATE TABLE IF NOT EXISTS `tbl_users` (
  `ID` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_login` varchar(60) NOT NULL DEFAULT '',
  `user_pass` varchar(255) NOT NULL DEFAULT '',
  `user_nicename` varchar(50) NOT NULL DEFAULT '',
  `user_email` varchar(100) NOT NULL DEFAULT '',
  `role` varchar(20) DEFAULT 'writer',
  `user_url` varchar(100) NOT NULL DEFAULT '',
  `user_registered` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `user_activation_key` varchar(255) NOT NULL DEFAULT '',
  `user_status` int(11) NOT NULL DEFAULT 0,
  `display_name` varchar(250) NOT NULL DEFAULT '',
  PRIMARY KEY (`ID`),
  KEY `user_login_key` (`user_login`),
  KEY `user_nicename` (`user_nicename`),
  KEY `user_email` (`user_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `tbl_users`;
INSERT INTO `tbl_users` (`ID`, `user_login`, `user_pass`, `user_nicename`, `user_email`, `role`, `user_url`, `user_registered`, `user_activation_key`, `user_status`, `display_name`) VALUES
	(1, 'administrator', '$2b$12$sXUI7dLqueBsOZgvDKkzq.haI90vkgR0h9LJXaL38p8YJ9zK/ASqy', 'administrator', 'admin@example.com', 'admin', '', '0000-00-00 00:00:00', '', 0, 'administrator');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
