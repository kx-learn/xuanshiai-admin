-- 线上库 customer_lead 缺少 M4 新增列导致 MySQL 1054 (Unknown column 'audit_status')。
-- 线上环境 AUTO_INIT_DB 被强制关闭（config.py 校验 staging/production 必须关闭），
-- 代码更新后 _ensure_m4_columns 迁移从未在线上库执行。
-- 本脚本与 database_setup_marriage.py 的 _ensure_m4_columns / BUSINESS_TABLES 等价，可重复执行。
-- 注意：MySQL 8 不支持 ADD COLUMN IF NOT EXISTS，若列已存在 ALTER 会报 1060，可忽略。

-- 1) M4 客源线索补列
ALTER TABLE `customer_lead`
  ADD COLUMN `promoter_id` bigint unsigned DEFAULT NULL COMMENT '推广红娘用户ID',
  ADD COLUMN `audit_status` varchar(16) NOT NULL DEFAULT 'active' COMMENT 'active有效/pending待核',
  ADD INDEX `idx_customer_lead_promoter` (`promoter_id`);

-- 2) 客源标签两张表（列表查询子句会 JOIN，缺表同样会报错）
CREATE TABLE IF NOT EXISTS `customer_lead_tag` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(64) NOT NULL,
    `color` varchar(16) DEFAULT NULL,
    `enabled` tinyint NOT NULL DEFAULT 1,
    `sort` int NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_customer_lead_tag` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客源标签配置';

CREATE TABLE IF NOT EXISTS `customer_lead_tag_relation` (
    `lead_id` bigint unsigned NOT NULL,
    `tag_id` bigint unsigned NOT NULL,
    PRIMARY KEY (`lead_id`, `tag_id`),
    KEY `idx_customer_lead_tag` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客源标签关联';

-- 3) 验证
-- SHOW COLUMNS FROM `customer_lead` LIKE 'audit_status';
-- SHOW COLUMNS FROM `customer_lead` LIKE 'promoter_id';
