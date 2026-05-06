-- ============================================
-- H7 - Ampliacion simple de empresas
-- ============================================

-- 1) Quitar la vista actual para poder recrearla luego
DROP VIEW IF EXISTS `companies`;

-- 2) Ampliar la tabla base `empresas`
ALTER TABLE `empresas`
  ADD COLUMN `descripcion` TEXT NULL,
  ADD COLUMN `correo_contacto` VARCHAR(200) DEFAULT NULL,
  ADD COLUMN `telefono_contacto` VARCHAR(50) DEFAULT NULL,
  ADD COLUMN `persona_contacto` VARCHAR(150) DEFAULT NULL,
  ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN `actualizado_en` VARCHAR(40) DEFAULT NULL;

-- 3) Rellenar empresas ya existentes con datos utiles
UPDATE `empresas` e
JOIN `usuarios` u ON u.`id` = e.`usuario_id`
SET
  e.`descripcion` = COALESCE(e.`descripcion`, ''),
  e.`correo_contacto` = CASE
    WHEN e.`correo_contacto` IS NULL OR e.`correo_contacto` = '' THEN u.`correo`
    ELSE e.`correo_contacto`
  END,
  e.`telefono_contacto` = COALESCE(e.`telefono_contacto`, ''),
  e.`persona_contacto` = CASE
    WHEN e.`persona_contacto` IS NULL OR e.`persona_contacto` = '' THEN u.`nombre`
    ELSE e.`persona_contacto`
  END,
  e.`activo` = COALESCE(e.`activo`, 1),
  e.`actualizado_en` = CASE
    WHEN e.`actualizado_en` IS NULL OR e.`actualizado_en` = '' THEN e.`creado_en`
    ELSE e.`actualizado_en`
  END;

-- 4) Recrear la vista `companies` con los nuevos campos
CREATE VIEW `companies` AS
SELECT
  e.`id` AS `id`,
  e.`usuario_id` AS `user_id`,
  e.`nombre_empresa` AS `company_name`,
  e.`sector` AS `sector`,
  e.`ciudad` AS `city`,
  e.`descripcion` AS `description`,
  e.`correo_contacto` AS `contact_email`,
  e.`telefono_contacto` AS `contact_phone`,
  e.`persona_contacto` AS `contact_person`,
  e.`activo` AS `is_active`,
  e.`creado_en` AS `created_at`,
  e.`actualizado_en` AS `updated_at`
FROM `empresas` e;