-- =====================================================
-- H6 - MODULO GENERICO DE CATALOGOS
-- Tablas base en español + vistas en ingles
-- =====================================================

START TRANSACTION;

-- -----------------------------------------------------
-- LIMPIEZA PREVIA DE VISTAS
-- -----------------------------------------------------
DROP VIEW IF EXISTS `catalog_items`;
DROP VIEW IF EXISTS `catalogs`;

-- -----------------------------------------------------
-- TABLA BASE: catalogos
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `catalogos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` varchar(40) NOT NULL,
  `actualizado_en` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_catalogos_clave` (`clave`),
  KEY `idx_catalogos_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- TABLA BASE: catalogo_items
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `catalogo_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `catalogo_id` int NOT NULL,
  `valor` varchar(120) NOT NULL,
  `etiqueta` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `orden` int NOT NULL DEFAULT 0,
  `meta_json` json DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` varchar(40) NOT NULL,
  `actualizado_en` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_catalogo_items_catalogo_valor` (`catalogo_id`, `valor`),
  KEY `idx_catalogo_items_catalogo` (`catalogo_id`),
  KEY `idx_catalogo_items_catalogo_activo_orden` (`catalogo_id`, `activo`, `orden`),
  CONSTRAINT `fk_catalogo_items_catalogo`
    FOREIGN KEY (`catalogo_id`) REFERENCES `catalogos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- SEED: catalogos iniciales
-- -----------------------------------------------------
INSERT INTO `catalogos` (`clave`, `nombre`, `descripcion`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  'areas',
  'Areas de practicas',
  'Areas funcionales o tecnicas a las que puede pertenecer una practica',
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `catalogos` WHERE `clave` = 'areas'
);

INSERT INTO `catalogos` (`clave`, `nombre`, `descripcion`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  'sectors',
  'Sectores de empresa',
  'Sectores empresariales reutilizables para perfiles y filtros',
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `catalogos` WHERE `clave` = 'sectors'
);

INSERT INTO `catalogos` (`clave`, `nombre`, `descripcion`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  'document_types',
  'Tipos de documento',
  'Tipos de documentos que puede gestionar el sistema',
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `catalogos` WHERE `clave` = 'document_types'
);

-- -----------------------------------------------------
-- SEED: items de areas
-- -----------------------------------------------------
INSERT INTO `catalogo_items`
(`catalogo_id`, `valor`, `etiqueta`, `descripcion`, `orden`, `meta_json`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  c.id,
  'frontend',
  'Frontend',
  'Practicas orientadas a interfaces y experiencia web',
  10,
  NULL,
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM `catalogos` c
WHERE c.`clave` = 'areas'
  AND NOT EXISTS (
    SELECT 1
    FROM `catalogo_items` ci
    WHERE ci.`catalogo_id` = c.`id`
      AND ci.`valor` = 'frontend'
  );

INSERT INTO `catalogo_items`
(`catalogo_id`, `valor`, `etiqueta`, `descripcion`, `orden`, `meta_json`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  c.id,
  'backend',
  'Backend',
  'Practicas orientadas a APIs, servidores y bases de datos',
  20,
  NULL,
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM `catalogos` c
WHERE c.`clave` = 'areas'
  AND NOT EXISTS (
    SELECT 1
    FROM `catalogo_items` ci
    WHERE ci.`catalogo_id` = c.`id`
      AND ci.`valor` = 'backend'
  );

INSERT INTO `catalogo_items`
(`catalogo_id`, `valor`, `etiqueta`, `descripcion`, `orden`, `meta_json`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  c.id,
  'fullstack',
  'Full Stack',
  'Practicas mixtas de frontend y backend',
  30,
  NULL,
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM `catalogos` c
WHERE c.`clave` = 'areas'
  AND NOT EXISTS (
    SELECT 1
    FROM `catalogo_items` ci
    WHERE ci.`catalogo_id` = c.`id`
      AND ci.`valor` = 'fullstack'
  );

INSERT INTO `catalogo_items`
(`catalogo_id`, `valor`, `etiqueta`, `descripcion`, `orden`, `meta_json`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  c.id,
  'soporte-ti',
  'Soporte TI',
  'Practicas de soporte tecnico e infraestructura',
  40,
  NULL,
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM `catalogos` c
WHERE c.`clave` = 'areas'
  AND NOT EXISTS (
    SELECT 1
    FROM `catalogo_items` ci
    WHERE ci.`catalogo_id` = c.`id`
      AND ci.`valor` = 'soporte-ti'
  );

INSERT INTO `catalogo_items`
(`catalogo_id`, `valor`, `etiqueta`, `descripcion`, `orden`, `meta_json`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  c.id,
  'marketing',
  'Marketing',
  'Practicas relacionadas con marketing digital y contenido',
  50,
  NULL,
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM `catalogos` c
WHERE c.`clave` = 'areas'
  AND NOT EXISTS (
    SELECT 1
    FROM `catalogo_items` ci
    WHERE ci.`catalogo_id` = c.`id`
      AND ci.`valor` = 'marketing'
  );

INSERT INTO `catalogo_items`
(`catalogo_id`, `valor`, `etiqueta`, `descripcion`, `orden`, `meta_json`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  c.id,
  'administracion',
  'Administracion',
  'Practicas administrativas o de gestion',
  60,
  NULL,
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM `catalogos` c
WHERE c.`clave` = 'areas'
  AND NOT EXISTS (
    SELECT 1
    FROM `catalogo_items` ci
    WHERE ci.`catalogo_id` = c.`id`
      AND ci.`valor` = 'administracion'
  );

-- -----------------------------------------------------
-- SEED: items de sectors
-- -----------------------------------------------------
INSERT INTO `catalogo_items`
(`catalogo_id`, `valor`, `etiqueta`, `descripcion`, `orden`, `meta_json`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  c.id,
  'software',
  'Software',
  'Empresas del sector software',
  10,
  NULL,
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM `catalogos` c
WHERE c.`clave` = 'sectors'
  AND NOT EXISTS (
    SELECT 1
    FROM `catalogo_items` ci
    WHERE ci.`catalogo_id` = c.`id`
      AND ci.`valor` = 'software'
  );

INSERT INTO `catalogo_items`
(`catalogo_id`, `valor`, `etiqueta`, `descripcion`, `orden`, `meta_json`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  c.id,
  'tecnologia',
  'Tecnologia',
  'Empresas tecnológicas generales',
  20,
  NULL,
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM `catalogos` c
WHERE c.`clave` = 'sectors'
  AND NOT EXISTS (
    SELECT 1
    FROM `catalogo_items` ci
    WHERE ci.`catalogo_id` = c.`id`
      AND ci.`valor` = 'tecnologia'
  );

INSERT INTO `catalogo_items`
(`catalogo_id`, `valor`, `etiqueta`, `descripcion`, `orden`, `meta_json`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  c.id,
  'marketing',
  'Marketing',
  'Empresas o departamentos de marketing',
  30,
  NULL,
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM `catalogos` c
WHERE c.`clave` = 'sectors'
  AND NOT EXISTS (
    SELECT 1
    FROM `catalogo_items` ci
    WHERE ci.`catalogo_id` = c.`id`
      AND ci.`valor` = 'marketing'
  );

INSERT INTO `catalogo_items`
(`catalogo_id`, `valor`, `etiqueta`, `descripcion`, `orden`, `meta_json`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  c.id,
  'administracion',
  'Administracion',
  'Empresas administrativas o de gestion',
  40,
  NULL,
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM `catalogos` c
WHERE c.`clave` = 'sectors'
  AND NOT EXISTS (
    SELECT 1
    FROM `catalogo_items` ci
    WHERE ci.`catalogo_id` = c.`id`
      AND ci.`valor` = 'administracion'
  );

INSERT INTO `catalogo_items`
(`catalogo_id`, `valor`, `etiqueta`, `descripcion`, `orden`, `meta_json`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  c.id,
  'sanidad',
  'Sanidad',
  'Centros y empresas del sector salud',
  50,
  NULL,
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM `catalogos` c
WHERE c.`clave` = 'sectors'
  AND NOT EXISTS (
    SELECT 1
    FROM `catalogo_items` ci
    WHERE ci.`catalogo_id` = c.`id`
      AND ci.`valor` = 'sanidad'
  );

-- -----------------------------------------------------
-- SEED: items de document_types
-- -----------------------------------------------------
INSERT INTO `catalogo_items`
(`catalogo_id`, `valor`, `etiqueta`, `descripcion`, `orden`, `meta_json`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  c.id,
  'cv_pdf',
  'CV en PDF',
  'Curriculum vitae en formato PDF',
  10,
  JSON_OBJECT('accept', '.pdf'),
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM `catalogos` c
WHERE c.`clave` = 'document_types'
  AND NOT EXISTS (
    SELECT 1
    FROM `catalogo_items` ci
    WHERE ci.`catalogo_id` = c.`id`
      AND ci.`valor` = 'cv_pdf'
  );

INSERT INTO `catalogo_items`
(`catalogo_id`, `valor`, `etiqueta`, `descripcion`, `orden`, `meta_json`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  c.id,
  'dni_nie',
  'DNI / NIE',
  'Documento identificativo del alumno',
  20,
  JSON_OBJECT('required_for', 'student'),
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM `catalogos` c
WHERE c.`clave` = 'document_types'
  AND NOT EXISTS (
    SELECT 1
    FROM `catalogo_items` ci
    WHERE ci.`catalogo_id` = c.`id`
      AND ci.`valor` = 'dni_nie'
  );

INSERT INTO `catalogo_items`
(`catalogo_id`, `valor`, `etiqueta`, `descripcion`, `orden`, `meta_json`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  c.id,
  'convenio',
  'Convenio',
  'Documento de convenio de practicas',
  30,
  JSON_OBJECT('required_for', 'agreement'),
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM `catalogos` c
WHERE c.`clave` = 'document_types'
  AND NOT EXISTS (
    SELECT 1
    FROM `catalogo_items` ci
    WHERE ci.`catalogo_id` = c.`id`
      AND ci.`valor` = 'convenio'
  );

INSERT INTO `catalogo_items`
(`catalogo_id`, `valor`, `etiqueta`, `descripcion`, `orden`, `meta_json`, `activo`, `creado_en`, `actualizado_en`)
SELECT
  c.id,
  'certificado_notas',
  'Certificado de notas',
  'Documento academico del alumno',
  40,
  JSON_OBJECT('required_for', 'student'),
  1,
  '2026-04-16T00:00:00.000Z',
  '2026-04-16T00:00:00.000Z'
FROM `catalogos` c
WHERE c.`clave` = 'document_types'
  AND NOT EXISTS (
    SELECT 1
    FROM `catalogo_items` ci
    WHERE ci.`catalogo_id` = c.`id`
      AND ci.`valor` = 'certificado_notas'
  );

-- -----------------------------------------------------
-- VISTAS EN INGLES
-- -----------------------------------------------------
CREATE VIEW `catalogs` AS
SELECT
  `catalogos`.`id` AS `id`,
  `catalogos`.`clave` AS `key`,
  `catalogos`.`nombre` AS `name`,
  `catalogos`.`descripcion` AS `description`,
  `catalogos`.`activo` AS `is_active`,
  `catalogos`.`creado_en` AS `created_at`,
  `catalogos`.`actualizado_en` AS `updated_at`
FROM `catalogos`;

CREATE VIEW `catalog_items` AS
SELECT
  `catalogo_items`.`id` AS `id`,
  `catalogo_items`.`catalogo_id` AS `catalog_id`,
  `catalogo_items`.`valor` AS `value`,
  `catalogo_items`.`etiqueta` AS `label`,
  `catalogo_items`.`descripcion` AS `description`,
  `catalogo_items`.`orden` AS `sort_order`,
  `catalogo_items`.`meta_json` AS `meta_json`,
  `catalogo_items`.`activo` AS `is_active`,
  `catalogo_items`.`creado_en` AS `created_at`,
  `catalogo_items`.`actualizado_en` AS `updated_at`
FROM `catalogo_items`;

COMMIT;