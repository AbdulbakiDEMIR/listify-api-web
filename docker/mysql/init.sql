-- Listify Web - Veritabanı Başlangıç Şeması
CREATE DATABASE IF NOT EXISTS `listify` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `listify`;

CREATE TABLE IF NOT EXISTS `shared_lists` (
    `id` VARCHAR(36) NOT NULL,
    `local_list_id` VARCHAR(64) NOT NULL,
    `owner_client_id` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `type` ENUM('shopping', 'todo') NOT NULL DEFAULT 'shopping',
    `sync_token` VARCHAR(32) NOT NULL,
    `clone_token` VARCHAR(32) NOT NULL,
    `items` JSON NOT NULL,
    `version` INT NOT NULL DEFAULT 1,
    `expires_at` DATETIME NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_sync_token` (`sync_token`),
    UNIQUE KEY `uk_clone_token` (`clone_token`),
    INDEX `idx_local_list_id` (`local_list_id`),
    INDEX `idx_expires_at` (`expires_at`),
    INDEX `idx_owner_client_id` (`owner_client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
