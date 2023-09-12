-- phpMyAdmin SQL Dump
-- version 5.2.1-1.fc36.remi
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 11, 2023 at 07:15 AM
-- Server version: 8.0.33
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sibeda`
--

-- --------------------------------------------------------

--
-- Table structure for table `account_base`
--

CREATE TABLE `account_base` (
  `id` int NOT NULL,
  `label` text NOT NULL,
  `remark` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `account_base`
--

INSERT INTO `account_base` (`id`, `label`, `remark`, `active`) VALUES
(56, '4', 'Pendapatan Daerah', 1),
(58, '5', 'Belanja Daerah', 1),
(59, '6', 'Pembiayaan Daerah', 1);

-- --------------------------------------------------------

--
-- Table structure for table `account_group`
--

CREATE TABLE `account_group` (
  `id` int NOT NULL,
  `account_base_id` int NOT NULL,
  `label` text NOT NULL,
  `remark` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `account_group`
--

INSERT INTO `account_group` (`id`, `account_base_id`, `label`, `remark`, `active`) VALUES
(1, 59, '1', 'Penerimaan Pembiayaan', 1),
(4, 56, '1', 'Pendapatan Asli Daerah (PAD)', 1),
(6, 56, '2', 'Pendapatan Transfer', 1),
(7, 59, '2', 'Pengeluaran Pembiayaan', 1),
(8, 58, '1', 'Belanja Operasi', 1);

-- --------------------------------------------------------

--
-- Table structure for table `account_object`
--

CREATE TABLE `account_object` (
  `id` int NOT NULL,
  `account_type_id` int NOT NULL,
  `label` text NOT NULL,
  `remark` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `account_object`
--

INSERT INTO `account_object` (`id`, `account_type_id`, `label`, `remark`, `active`) VALUES
(1, 1, '01', 'Hasil Penjualan BMD yang Tidak Dipisahkan', 1),
(3, 2, '02', 'Pelampauan Penerimaan Pendapatan Transfer', 1),
(4, 2, '05', 'Penghematan Belanja', 1),
(5, 2, '07', 'Sisa Dana Akibat Tidak Tercapainya Capaian Target Kinerja ', 1),
(6, 2, '08', 'Sisa Belanja Lainnya', 1),
(7, 1, '07', 'Pendapatan Bunga', 1),
(8, 3, '01', 'Belanja Gaji dan Tunjangan ASN', 1),
(9, 3, '02', 'Belanja Tambahan Penghasilan ASN', 1);

-- --------------------------------------------------------

--
-- Table structure for table `account_type`
--

CREATE TABLE `account_type` (
  `id` int NOT NULL,
  `account_group_id` int NOT NULL,
  `label` text NOT NULL,
  `remark` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `account_type`
--

INSERT INTO `account_type` (`id`, `account_group_id`, `label`, `remark`, `active`) VALUES
(1, 4, '04', 'Lain-lain PAD yang Sah', 1),
(2, 1, '01', 'Sisa Lebih Perhitungan Anggaran Tahun Sebelumnya', 1),
(3, 8, '01', 'Belanja Pegawai', 1);

-- --------------------------------------------------------

--
-- Table structure for table `city`
--

CREATE TABLE `city` (
  `id` int NOT NULL,
  `label` text NOT NULL,
  `logo` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `city`
--

INSERT INTO `city` (`id`, `label`, `logo`, `active`) VALUES
(1, 'Batam', '', 1),
(14, 'Kabupaten Bintan', '', 1),
(15, 'Natuna', '', 1),
(16, 'Kabupaten Tanjung Pinang', '', 1),
(17, 'Kabupten Karimunki', '', 1),
(18, 'Kabupaten Lingga', '', 1),
(19, 'Kabupaten Anambas', '', 1);

-- --------------------------------------------------------

--
-- Table structure for table `log`
--

CREATE TABLE `log` (
  `id` int NOT NULL,
  `"table"` text NOT NULL,
  `mode` varchar(1) NOT NULL,
  `start_value` json NOT NULL,
  `end_value` json NOT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `log`
--

INSERT INTO `log` (`id`, `"table"`, `mode`, `start_value`, `end_value`, `created_at`, `created_by`) VALUES
(81, 'user', 'U', '{}', '{\"id\": 3, \"mode\": \"U\", \"title\": \"Admin Kota\", \"city_id\": 1, \"role_id\": 2, \"fullname\": \"Admin Kota Batam\", \"password\": \"2354625aa0f9d28fe1f20927d01754b3\", \"username\": \"adminbatamm\"}', '2023-09-09 11:19:00', 'superadmin'),
(82, 'user', 'U', '{}', '{\"id\": 3, \"mode\": \"U\", \"title\": \"Admin Kota\", \"city_id\": 1, \"role_id\": 2, \"fullname\": \"Admin Kota Batam\", \"password\": \"f964b6e9fc89dd83bce6d124879cc455\", \"username\": \"adminbatam\"}', '2023-09-09 11:20:00', 'superadmin'),
(83, 'user', 'U', '{}', '{\"id\": 3, \"mode\": \"U\", \"title\": \"Admin Kota\", \"city_id\": 1, \"role_id\": 2, \"fullname\": \"Admin Kota Batam\", \"password\": \"bbba5d1f9c6d2b47988241265019d3f4\", \"username\": \"adminbatam\"}', '2023-09-09 11:20:00', 'superadmin'),
(84, 'user', 'D', '{}', '{\"id\": 3}', '2023-09-09 11:28:00', 'superadmin'),
(85, 'user', 'D', '{}', '{\"id\": 3}', '2023-09-09 11:52:00', 'superadmin'),
(86, 'user', 'D', '{}', '{\"id\": 3}', '2023-09-09 11:52:00', 'superadmin'),
(87, 'user', 'D', '{}', '{\"id\": 3}', '2023-09-09 12:01:00', 'superadmin'),
(88, 'user', 'D', '{}', '{\"id\": 3}', '2023-09-09 12:01:00', 'superadmin'),
(89, 'user', 'D', '{}', '{\"id\": 3}', '2023-09-09 12:01:00', 'superadmin'),
(90, 'user', 'U', '{}', '{\"password\": \"f964b6e9fc89dd83bce6d124879cc455\", \"username\": \"adminbatam\"}', '2023-09-09 12:14:00', 'adminbatam'),
(91, 'user', 'U', '{}', '{\"password\": \"f964b6e9fc89dd83bce6d124879cc455\", \"username\": \"adminbatam\"}', '2023-09-09 12:15:00', 'adminbatam'),
(92, 'user', 'U', '{}', '{\"password\": \"bbba5d1f9c6d2b47988241265019d3f4\", \"username\": \"adminbatam\"}', '2023-09-09 12:15:00', 'adminbatam'),
(93, 'user', 'D', '{}', '{\"id\": 333}', '2023-09-09 12:20:00', 'superadmin'),
(94, 'user', 'D', '{}', '{\"id\": 2}', '2023-09-09 12:20:00', 'superadmin'),
(95, 'user', 'D', '{}', '{\"id\": 3}', '2023-09-09 12:20:00', 'superadmin'),
(96, 'user', 'D', '{}', '{\"id\": 3}', '2023-09-09 12:21:00', 'superadmin'),
(97, 'city', 'U', '{}', '{\"id\": 17, \"blob\": \"null\", \"logo\": \"\", \"mode\": \"U\", \"label\": \"Kabupten Karimunnn\"}', '2023-09-09 13:18:00', 'superadmin'),
(98, 'city', 'U', '{}', '{\"id\": 17, \"blob\": \"null\", \"logo\": \"\", \"mode\": \"U\", \"label\": \"Kabupten Karimunsss\"}', '2023-09-09 13:18:00', 'superadmin'),
(99, 'city', 'U', '{}', '{\"id\": 17, \"blob\": \"null\", \"logo\": \"\", \"mode\": \"U\", \"label\": \"Kabupten Karimunki\"}', '2023-09-09 13:21:00', 'superadmin'),
(100, 'city', 'U', '{}', '{\"id\": 17, \"blob\": null, \"logo\": \"7efa36e8bca9d72df9dbac38cf4b771b.png\", \"mode\": \"U\", \"label\": \"Kabupten Karimunki\"}', '2023-09-09 13:21:00', 'superadmin'),
(101, 'city', 'D', '{}', '{\"id\": 17}', '2023-09-09 13:27:00', 'superadmin'),
(102, 'city', 'D', '{}', '{\"id\": 17}', '2023-09-09 13:27:00', 'superadmin'),
(103, 'city', 'C', '{}', '{\"id\": 0, \"blob\": \"null\", \"logo\": \"\", \"mode\": \"C\", \"label\": \"sadsa\"}', '2023-09-09 13:27:00', 'superadmin'),
(104, 'city', 'U', '{}', '{\"id\": 20, \"blob\": \"null\", \"logo\": \"\", \"mode\": \"U\", \"label\": \"sadsadd\"}', '2023-09-09 13:27:00', 'superadmin'),
(105, 'city', 'C', '{}', '{\"id\": 0, \"blob\": null, \"logo\": null, \"mode\": \"C\", \"label\": \"test\"}', '2023-09-09 13:30:00', 'superadmin'),
(106, 'signer', 'D', '{}', '{\"id\": 1}', '2023-09-09 13:44:00', 'superadmin'),
(107, 'signer', 'D', '{}', '{\"id\": 1}', '2023-09-09 13:44:00', 'superadmin'),
(108, 'signer', 'U', '{}', '{\"id\": 1, \"nip\": \"199110052015031000\", \"mode\": \"U\", \"title\": \"Penataaaa\", \"fullname\": \"Muhammad Eka Putra Galus, ST\", \"position\": \"Kepala Sub Bidang Bina dan Evaluasi Daerah\"}', '2023-09-09 13:45:00', 'superadmin'),
(109, 'signer', 'U', '{}', '{\"id\": 1, \"nip\": \"199110052015031000\", \"mode\": \"U\", \"title\": \"Penata\", \"fullname\": \"Muhammad Eka Putra Galus, ST\", \"position\": \"Kepala Sub Bidang Bina dan Evaluasi Daerah\"}', '2023-09-09 13:45:00', 'superadmin'),
(110, 'signer', 'D', '{}', '{\"id\": 1}', '2023-09-09 13:46:00', 'superadmin'),
(111, 'signer', 'D', '{}', '{\"id\": 1}', '2023-09-09 13:46:00', 'superadmin'),
(112, 'city', 'D', '{}', '{\"id\": 3}', '2023-09-09 13:50:00', 'superadmin'),
(113, 'signer', 'D', '{}', '{\"id\": 3}', '2023-09-09 13:50:00', 'superadmin'),
(114, 'signer', 'D', '{}', '{\"id\": 1}', '2023-09-09 13:50:00', 'superadmin'),
(115, 'signer', 'C', '{}', '{\"id\": 0, \"nip\": \"123456\", \"mode\": \"C\", \"title\": \"dasdas\", \"fullname\": \"asdas\", \"position\": \"dasdas\"}', '2023-09-09 13:54:00', 'superadmin'),
(116, 'signer', 'D', '{}', '{\"id\": 1}', '2023-09-09 13:54:00', 'superadmin'),
(117, 'city', 'U', '{}', '{\"id\": 19, \"blob\": null, \"logo\": \"5690944e58c1ad6adcc6ba9875323c2a.png\", \"mode\": \"U\", \"label\": \"Kabupaten Anambas\"}', '2023-09-10 08:52:00', 'superadmin'),
(118, 'city', 'U', '{}', '{\"id\": 19, \"blob\": \"null\", \"logo\": \"\", \"mode\": \"U\", \"label\": \"Kabupaten Anambas\"}', '2023-09-10 08:52:00', 'superadmin'),
(119, 'account_base', 'D', '{}', '{\"id\": 59}', '2023-09-10 09:14:00', 'superadmin'),
(120, 'account_base', 'D', '{}', '{\"id\": 59}', '2023-09-10 09:14:00', 'superadmin'),
(121, 'account_base', 'U', '{}', '{\"id\": 59, \"mode\": \"U\", \"label\": \"6\", \"remark\": \"Pembiayaan Daerahh\"}', '2023-09-10 09:14:00', 'superadmin'),
(122, 'account_base', 'U', '{}', '{\"id\": 59, \"mode\": \"U\", \"label\": \"6\", \"remark\": \"Pembiayaan Daerah\"}', '2023-09-10 09:14:00', 'superadmin'),
(123, 'account_base', 'C', '{}', '{\"id\": 0, \"mode\": \"C\", \"label\": \"6\", \"remark\": \"asdasd\"}', '2023-09-10 09:14:00', 'superadmin'),
(124, 'account_base', 'C', '{}', '{\"id\": 0, \"mode\": \"C\", \"label\": \"7\", \"remark\": \"asdasd\"}', '2023-09-10 09:15:00', 'superadmin'),
(125, 'account_base', 'C', '{}', '{\"id\": 0, \"mode\": \"C\", \"label\": \"6\", \"remark\": \"asdasd\"}', '2023-09-10 09:15:00', 'superadmin'),
(126, 'city', 'D', '{}', '{\"id\": 19}', '2023-09-10 11:23:00', 'superadmin'),
(127, 'city', 'D', '{}', '{\"id\": 19}', '2023-09-10 11:23:00', 'superadmin');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` int NOT NULL,
  `name` text NOT NULL,
  `remark` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id`, `name`, `remark`) VALUES
(1, 'super_admin', 'Admin Super'),
(2, 'city_admin', 'Admin Kota'),
(3, 'manager_ro', 'Pimpinan'),
(4, 'manager_city', 'Pimpinan Kota');

-- --------------------------------------------------------

--
-- Table structure for table `setting`
--

CREATE TABLE `setting` (
  `id` int NOT NULL,
  `name` text NOT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `setting`
--

INSERT INTO `setting` (`id`, `name`, `value`) VALUES
(1, 'app', 'sibeda2023'),
(2, 'delimiter', '_@_'),
(3, 'role_exception', '[\"1\",\"3\"]');

-- --------------------------------------------------------

--
-- Table structure for table `signer`
--

CREATE TABLE `signer` (
  `id` int NOT NULL,
  `nip` text NOT NULL,
  `fullname` text NOT NULL,
  `title` text NOT NULL,
  `position` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `signer`
--

INSERT INTO `signer` (`id`, `nip`, `fullname`, `title`, `position`, `active`) VALUES
(1, '199110052015031000', 'Muhammad Eka Putra Galus, ST', 'Penata', 'Kepala Sub Bidang Bina dan Evaluasi Daerah', 1);

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

CREATE TABLE `transaction` (
  `id` int NOT NULL,
  `account_object_id` int NOT NULL,
  `city_id` int NOT NULL,
  `plan_amount` double NOT NULL,
  `real_amount` double NOT NULL,
  `trans_date` date NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `transaction`
--

INSERT INTO `transaction` (`id`, `account_object_id`, `city_id`, `plan_amount`, `real_amount`, `trans_date`, `active`) VALUES
(12, 3, 1, 10000000000, 0, '2023-01-01', 1),
(13, 3, 1, 0, 0, '2023-09-11', 1),
(14, 4, 1, 6000000000, 0, '2023-01-01', 1),
(15, 4, 1, 0, 0, '2023-09-11', 1),
(16, 7, 1, 3000000000, 0, '2023-01-01', 1),
(19, 7, 1, 0, 606887373.79, '2023-09-11', 1),
(20, 1, 1, 0, 0, '2023-01-01', 1),
(21, 1, 1, 0, 9421650, '2023-09-11', 1),
(22, 8, 1, 282104876388, 0, '2023-01-01', 1),
(23, 8, 1, 0, 47305479604, '2023-09-11', 1),
(24, 9, 1, 200825996000, 0, '2023-01-01', 1),
(25, 9, 1, 0, 21007083709, '2023-09-11', 1);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int NOT NULL,
  `role_id` int NOT NULL,
  `city_id` int NOT NULL,
  `username` text NOT NULL,
  `password` text NOT NULL,
  `fullname` text NOT NULL,
  `title` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `email` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `token` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `role_id`, `city_id`, `username`, `password`, `fullname`, `title`, `email`, `token`, `active`) VALUES
(2, 1, 1, 'superadmin', 'f964b6e9fc89dd83bce6d124879cc455', 'Super Admin', 'Super Admin', NULL, 'c3489ab2a2eee22339ae765cb163ea08c81e728d9d4c2f636f067f89cc14862c17c4520f6cfd1ab53d8745e84681eb491', 1),
(3, 2, 1, 'adminbatam', 'bbba5d1f9c6d2b47988241265019d3f4', 'Admin Kota Batam', 'Admin Kota', NULL, '1b778867817e3a35e1c349630a5a8e69eccbc87e4b5ce2fe28308fd9f2a7baf3e3bf705011f8bf81cd8e164ce39fdd252', 1),
(4, 2, 14, 'adminbintan', '26a12718f47626685715b84c311e31df', 'Admin Kota Bintan', 'Admin Kota Bintan', NULL, NULL, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account_base`
--
ALTER TABLE `account_base`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_base_label_unique` (`label`(255)),
  ADD KEY `account_base_label_index` (`label`(255));

--
-- Indexes for table `account_group`
--
ALTER TABLE `account_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_group_label_unique` (`account_base_id`,`label`(255)) USING BTREE,
  ADD KEY `account_group_label_index` (`label`(255));

--
-- Indexes for table `account_object`
--
ALTER TABLE `account_object`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_object_label_unique` (`account_type_id`,`label`(255)) USING BTREE,
  ADD KEY `account_object_label_index` (`label`(255));

--
-- Indexes for table `account_type`
--
ALTER TABLE `account_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_type_label_unique` (`account_group_id`,`label`(255)) USING BTREE,
  ADD KEY `account_type_label_index` (`label`(255));

--
-- Indexes for table `city`
--
ALTER TABLE `city`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `city_label_unique` (`label`(255)),
  ADD KEY `city_label_index` (`label`(255));

--
-- Indexes for table `log`
--
ALTER TABLE `log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name_unique` (`name`(255)),
  ADD KEY `role_name_index` (`name`(255));

--
-- Indexes for table `setting`
--
ALTER TABLE `setting`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name_unique` (`name`(255));

--
-- Indexes for table `signer`
--
ALTER TABLE `signer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nip_unique` (`nip`(255));

--
-- Indexes for table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_account_object_id_foreign` (`account_object_id`),
  ADD KEY `transaction_city_id_foreign` (`city_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username_unique` (`username`(255)),
  ADD KEY `username_fullname_index` (`username`(255),`fullname`(255)),
  ADD KEY `role_id_foreign` (`role_id`),
  ADD KEY `city_id_foreign` (`city_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account_base`
--
ALTER TABLE `account_base`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `account_group`
--
ALTER TABLE `account_group`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `account_object`
--
ALTER TABLE `account_object`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `account_type`
--
ALTER TABLE `account_type`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `city`
--
ALTER TABLE `city`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `log`
--
ALTER TABLE `log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=128;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `setting`
--
ALTER TABLE `setting`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `signer`
--
ALTER TABLE `signer`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account_group`
--
ALTER TABLE `account_group`
  ADD CONSTRAINT `account_base_id_foreign` FOREIGN KEY (`account_base_id`) REFERENCES `account_base` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `account_object`
--
ALTER TABLE `account_object`
  ADD CONSTRAINT `account_type_id_foreign` FOREIGN KEY (`account_type_id`) REFERENCES `account_type` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `account_type`
--
ALTER TABLE `account_type`
  ADD CONSTRAINT `account_group_id_foreign` FOREIGN KEY (`account_group_id`) REFERENCES `account_group` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `transaction_account_object_id_foreign` FOREIGN KEY (`account_object_id`) REFERENCES `account_object` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transaction_city_id_foreign` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `city_id_foreign` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
