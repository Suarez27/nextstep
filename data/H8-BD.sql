-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 26-04-2026 a las 16:39:08
-- Versión del servidor: 9.1.0
-- Versión de PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `nextstep`
--

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `agreements`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `agreements`;
CREATE TABLE IF NOT EXISTS `agreements` (
`center_id` int
,`created_at` varchar(40)
,`id` int
,`internship_id` int
,`notes` text
,`signed_at` varchar(40)
,`student_id` int
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumnos`
--

DROP TABLE IF EXISTS `alumnos`;
CREATE TABLE IF NOT EXISTS `alumnos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `centro_id` int DEFAULT NULL,
  `texto_cv` text,
  `habilidades` text,
  `validado` tinyint(1) NOT NULL DEFAULT '0',
  `creado_en` varchar(40) NOT NULL,
  `url_cv_pdf` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  KEY `fk_alumnos_centro` (`centro_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `alumnos`
--

INSERT INTO `alumnos` (`id`, `usuario_id`, `centro_id`, `texto_cv`, `habilidades`, `validado`, `creado_en`, `url_cv_pdf`) VALUES
(1, 4, 1, 'Estudiante DAW con conocimientos en JS y SQL.', 'JavaScript, HTML, CSS, Node.js, SQL', 0, '2026-03-25T00:00:40.410Z', '/uploads/cv/student-4-1774398322264-344517.pdf'),
(2, 7, 3, '', '', 1, '2026-03-25T00:15:14.242Z', '/uploads/cv/student-7-1774398373834-889871.pdf'),
(3, 8, 3, '', '', 1, '2026-03-25T10:23:57.084Z', NULL),
(4, 11, 1, '', '', 0, '2026-04-15T20:10:53.511Z', NULL),
(5, 12, 1, '', '', 1, '2026-04-15T20:11:20.988Z', NULL);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `applications`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `applications`;
CREATE TABLE IF NOT EXISTS `applications` (
`created_at` varchar(40)
,`id` int
,`internship_id` int
,`status` enum('pendiente','aceptada','rechazada')
,`student_id` int
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `candidaturas`
--

DROP TABLE IF EXISTS `candidaturas`;
CREATE TABLE IF NOT EXISTS `candidaturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `practica_id` int NOT NULL,
  `alumno_id` int NOT NULL,
  `estado` enum('pendiente','aceptada','rechazada') NOT NULL DEFAULT 'pendiente',
  `creado_en` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_practica_alumno` (`practica_id`,`alumno_id`),
  KEY `fk_candidaturas_alumno` (`alumno_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `candidaturas`
--

INSERT INTO `candidaturas` (`id`, `practica_id`, `alumno_id`, `estado`, `creado_en`) VALUES
(1, 1, 2, 'pendiente', '2026-03-25T00:18:21.090Z'),
(2, 1, 3, 'aceptada', '2026-03-25T10:25:12.427Z'),
(3, 1, 1, 'pendiente', '2026-04-15T13:41:07.016Z'),
(4, 2, 5, 'aceptada', '2026-04-15T20:30:59.291Z');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `catalogos`
--

DROP TABLE IF EXISTS `catalogos`;
CREATE TABLE IF NOT EXISTS `catalogos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` varchar(40) NOT NULL,
  `actualizado_en` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_catalogos_clave` (`clave`),
  KEY `idx_catalogos_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `catalogos`
--

INSERT INTO `catalogos` (`id`, `clave`, `nombre`, `descripcion`, `activo`, `creado_en`, `actualizado_en`) VALUES
(1, 'areas', 'Areas de practicas', 'Areas funcionales o tecnicas a las que puede pertenecer una practica', 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z'),
(2, 'sectors', 'Sectores de empresa', 'Sectores empresariales reutilizables para perfiles y filtros', 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z'),
(3, 'document_types', 'Tipos de documento', 'Tipos de documentos que puede gestionar el sistema', 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `catalogo_items`
--

DROP TABLE IF EXISTS `catalogo_items`;
CREATE TABLE IF NOT EXISTS `catalogo_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `catalogo_id` int NOT NULL,
  `valor` varchar(120) NOT NULL,
  `etiqueta` varchar(150) NOT NULL,
  `descripcion` text,
  `orden` int NOT NULL DEFAULT '0',
  `meta_json` json DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` varchar(40) NOT NULL,
  `actualizado_en` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_catalogo_items_catalogo_valor` (`catalogo_id`,`valor`),
  KEY `idx_catalogo_items_catalogo` (`catalogo_id`),
  KEY `idx_catalogo_items_catalogo_activo_orden` (`catalogo_id`,`activo`,`orden`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `catalogo_items`
--

INSERT INTO `catalogo_items` (`id`, `catalogo_id`, `valor`, `etiqueta`, `descripcion`, `orden`, `meta_json`, `activo`, `creado_en`, `actualizado_en`) VALUES
(1, 1, 'frontend', 'Frontend', 'Practicas orientadas a interfaces y experiencia web', 10, NULL, 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z'),
(2, 1, 'backend', 'Backend', 'Practicas orientadas a APIs, servidores y bases de datos', 20, NULL, 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z'),
(3, 1, 'fullstack', 'Full Stack', 'Practicas mixtas de frontend y backend', 30, NULL, 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z'),
(4, 1, 'soporte-ti', 'Soporte TI', 'Practicas de soporte tecnico e infraestructura', 40, NULL, 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z'),
(5, 1, 'marketing', 'Marketing', 'Practicas relacionadas con marketing digital y contenido', 50, NULL, 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z'),
(6, 1, 'administracion', 'Administracion', 'Practicas administrativas o de gestion', 60, NULL, 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z'),
(7, 2, 'software', 'Software', 'Empresas del sector software', 10, NULL, 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z'),
(8, 2, 'tecnologia', 'Tecnologia', 'Empresas tecnológicas generales', 20, NULL, 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z'),
(9, 2, 'marketing', 'Marketing', 'Empresas o departamentos de marketing', 30, NULL, 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z'),
(10, 2, 'administracion', 'Administracion', 'Empresas administrativas o de gestion', 40, NULL, 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z'),
(11, 2, 'sanidad', 'Sanidad', 'Centros y empresas del sector salud', 50, NULL, 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z'),
(12, 3, 'cv_pdf', 'CV en PDF', 'Curriculum vitae en formato PDF', 10, '{\"accept\": \".pdf\"}', 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z'),
(13, 3, 'dni_nie', 'DNI / NIE', 'Documento identificativo del alumno', 20, '{\"required_for\": \"student\"}', 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z'),
(14, 3, 'convenio', 'Convenio', 'Documento de convenio de practicas', 30, '{\"required_for\": \"agreement\"}', 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z'),
(15, 3, 'certificado_notas', 'Certificado de notas', 'Documento academico del alumno', 40, '{\"required_for\": \"student\"}', 1, '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `catalogs`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `catalogs`;
CREATE TABLE IF NOT EXISTS `catalogs` (
`created_at` varchar(40)
,`description` text
,`id` int
,`is_active` tinyint(1)
,`key` varchar(100)
,`name` varchar(150)
,`updated_at` varchar(40)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `catalog_items`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `catalog_items`;
CREATE TABLE IF NOT EXISTS `catalog_items` (
`catalog_id` int
,`created_at` varchar(40)
,`description` text
,`id` int
,`is_active` tinyint(1)
,`label` varchar(150)
,`meta_json` json
,`sort_order` int
,`updated_at` varchar(40)
,`value` varchar(120)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `centers`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `centers`;
CREATE TABLE IF NOT EXISTS `centers` (
`center_name` varchar(200)
,`city` varchar(120)
,`created_at` varchar(40)
,`id` int
,`user_id` int
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `centros_educativos`
--

DROP TABLE IF EXISTS `centros_educativos`;
CREATE TABLE IF NOT EXISTS `centros_educativos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `nombre_centro` varchar(200) NOT NULL,
  `ciudad` varchar(120) DEFAULT '',
  `creado_en` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `centros_educativos`
--

INSERT INTO `centros_educativos` (`id`, `usuario_id`, `nombre_centro`, `ciudad`, `creado_en`) VALUES
(1, 2, 'IES Innovacion Digital.L', 'Madrid', '2026-03-25T00:00:40.410Z'),
(3, 6, 'I.E.P Pachon', 'Madrid', '2026-03-25T00:14:34.703Z');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `companies`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `companies`;
CREATE TABLE IF NOT EXISTS `companies` (
`city` varchar(120)
,`company_name` varchar(200)
,`contact_email` varchar(200)
,`contact_person` varchar(150)
,`contact_phone` varchar(50)
,`created_at` varchar(40)
,`description` text
,`id` int
,`is_active` tinyint(1)
,`sector` varchar(120)
,`updated_at` varchar(40)
,`user_id` int
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `convenios`
--

DROP TABLE IF EXISTS `convenios`;
CREATE TABLE IF NOT EXISTS `convenios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `practica_id` int NOT NULL,
  `alumno_id` int NOT NULL,
  `centro_id` int NOT NULL,
  `firmado_en` varchar(40) NOT NULL,
  `notas` text,
  `creado_en` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_convenios_practica` (`practica_id`),
  KEY `fk_convenios_alumno` (`alumno_id`),
  KEY `fk_convenios_centro` (`centro_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `convenios`
--

INSERT INTO `convenios` (`id`, `practica_id`, `alumno_id`, `centro_id`, `firmado_en`, `notas`, `creado_en`) VALUES
(1, 2, 5, 1, '2026-04-15T20:46:02.894Z', 'Prueba 1 con Lucas', '2026-04-15T20:46:02.894Z');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresas`
--

DROP TABLE IF EXISTS `empresas`;
CREATE TABLE IF NOT EXISTS `empresas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `nombre_empresa` varchar(200) NOT NULL,
  `sector` varchar(120) DEFAULT '',
  `ciudad` varchar(120) DEFAULT '',
  `creado_en` varchar(40) NOT NULL,
  `descripcion` text,
  `correo_contacto` varchar(200) DEFAULT NULL,
  `telefono_contacto` varchar(50) DEFAULT NULL,
  `persona_contacto` varchar(150) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `actualizado_en` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `empresas`
--

INSERT INTO `empresas` (`id`, `usuario_id`, `nombre_empresa`, `sector`, `ciudad`, `creado_en`, `descripcion`, `correo_contacto`, `telefono_contacto`, `persona_contacto`, `activo`, `actualizado_en`) VALUES
(1, 3, 'TechBridge S.L.L.L', 'Software', 'Madrid', '2026-03-25T00:00:40.410Z', '', 'empresa@nextstep.local', '', 'Empresa Demo', 1, '2026-04-26T00:16:01.225Z'),
(3, 5, 'I.E.P. Los bandidos', 'Tecnologico', 'Madrid', '2026-03-25T10:22:34.191Z', '', 'alderete2108@gmail.com', '', 'Stefano Alderete Campos', 1, '2026-03-25T10:22:34.191Z');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entrevistas`
--

DROP TABLE IF EXISTS `entrevistas`;
CREATE TABLE IF NOT EXISTS `entrevistas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidatura_id` int NOT NULL,
  `fecha_entrevista` varchar(40) NOT NULL,
  `notas` text,
  `creado_en` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_entrevistas_candidatura` (`candidatura_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `followups`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `followups`;
CREATE TABLE IF NOT EXISTS `followups` (
`author_user_id` int
,`content` text
,`created_at` varchar(40)
,`id` int
,`progress` int
,`student_id` int
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `internships`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `internships`;
CREATE TABLE IF NOT EXISTS `internships` (
`accepted_applications_count` bigint
,`application_deadline` varchar(40)
,`area_item_id` int
,`area_label` varchar(150)
,`area_value` varchar(120)
,`available_slots` bigint
,`company_id` int
,`company_is_active` tinyint(1)
,`company_name` varchar(200)
,`created_at` varchar(40)
,`description` text
,`end_date` varchar(40)
,`hours_total` int
,`id` int
,`is_active` tinyint(1)
,`requirements` text
,`schedule` varchar(120)
,`slots` int
,`start_date` varchar(40)
,`status` enum('borrador','publicada','pausada','cerrada','cancelada')
,`title` varchar(200)
,`updated_at` varchar(40)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `interviews`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `interviews`;
CREATE TABLE IF NOT EXISTS `interviews` (
`application_id` int
,`created_at` varchar(40)
,`id` int
,`interview_at` varchar(40)
,`notes` text
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `practicas`
--

DROP TABLE IF EXISTS `practicas`;
CREATE TABLE IF NOT EXISTS `practicas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int NOT NULL,
  `area_item_id` int DEFAULT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text NOT NULL,
  `horas_totales` int NOT NULL,
  `horario` varchar(120) DEFAULT '',
  `plazas` int NOT NULL DEFAULT '1',
  `requisitos` text,
  `estado` enum('borrador','publicada','pausada','cerrada','cancelada') NOT NULL DEFAULT 'publicada',
  `fecha_inicio_estimada` varchar(40) DEFAULT NULL,
  `fecha_fin_estimada` varchar(40) DEFAULT NULL,
  `fecha_limite_candidatura` varchar(40) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` varchar(40) NOT NULL,
  `actualizado_en` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_practicas_empresa` (`empresa_id`),
  KEY `idx_practicas_area_item` (`area_item_id`),
  KEY `idx_practicas_estado_activo` (`estado`,`activo`),
  KEY `idx_practicas_empresa_estado` (`empresa_id`,`estado`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `practicas`
--

INSERT INTO `practicas` (`id`, `empresa_id`, `area_item_id`, `titulo`, `descripcion`, `horas_totales`, `horario`, `plazas`, `requisitos`, `estado`, `fecha_inicio_estimada`, `fecha_fin_estimada`, `fecha_limite_candidatura`, `activo`, `creado_en`, `actualizado_en`) VALUES
(1, 1, 1, 'Practicas Frontend Junior', 'Apoyo en interfaces web con React y APIs REST.', 300, 'L-V 09:00-14:00', 2, 'Conocimientos basicos de HTML, CSS, JavaScript y React. Ganas de aprender y trabajar con APIs REST.', 'publicada', NULL, NULL, NULL, 1, '2026-03-25T00:00:40.410Z', '2026-03-25T00:00:40.410Z'),
(2, 1, 3, 'Practicas Nuevas Prueba 1', 'Texto descriptivo del puesto', 300, '', 2, 'Conocimientos basicos de desarrollo web y actitud proactiva.', 'publicada', NULL, NULL, NULL, 1, '2026-04-15T20:30:42.872Z', '2026-04-15T20:30:42.872Z');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguimientos`
--

DROP TABLE IF EXISTS `seguimientos`;
CREATE TABLE IF NOT EXISTS `seguimientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alumno_id` int NOT NULL,
  `usuario_autor_id` int NOT NULL,
  `contenido` text NOT NULL,
  `progreso` int NOT NULL DEFAULT '0',
  `creado_en` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_seguimientos_alumno` (`alumno_id`),
  KEY `fk_seguimientos_usuario` (`usuario_autor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `students`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `students`;
CREATE TABLE IF NOT EXISTS `students` (
`center_id` int
,`created_at` varchar(40)
,`cv_pdf_url` varchar(500)
,`cv_text` text
,`id` int
,`skills` text
,`user_id` int
,`validated` tinyint(1)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `users`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
`created_at` varchar(40)
,`email` varchar(200)
,`id` int
,`name` varchar(120)
,`password_hash` varchar(255)
,`role` enum('admin','centro','empresa','alumno')
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `correo` varchar(200) NOT NULL,
  `hash_contrasena` varchar(255) NOT NULL,
  `rol` enum('admin','centro','empresa','alumno') NOT NULL,
  `creado_en` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `hash_contrasena`, `rol`, `creado_en`) VALUES
(1, 'Admin NextStep', 'admin@nextstep.local', '$2b$10$VQ0cw35.AUMg5G/1XX7ELehiN936PUQ76sV0b5sSpbWoxXQiIzpwi', 'admin', '2026-03-25T00:00:40.410Z'),
(2, 'Centro Demo', 'centro@nextstep.local', '$2b$10$VQ0cw35.AUMg5G/1XX7ELehiN936PUQ76sV0b5sSpbWoxXQiIzpwi', 'centro', '2026-03-25T00:00:40.410Z'),
(3, 'Empresa Demo', 'empresa@nextstep.local', '$2b$10$VQ0cw35.AUMg5G/1XX7ELehiN936PUQ76sV0b5sSpbWoxXQiIzpwi', 'empresa', '2026-03-25T00:00:40.410Z'),
(4, 'Alumno Demo', 'alumno@nextstep.local', '$2b$10$VQ0cw35.AUMg5G/1XX7ELehiN936PUQ76sV0b5sSpbWoxXQiIzpwi', 'alumno', '2026-03-25T00:00:40.410Z'),
(5, 'Stefano Alderete Campos', 'alderete2108@gmail.com', '$2b$10$AogGjZ3hqFh5D9uARrlGn.zQf5uuQp/Je77ZfnyxGJM.Dzz4o/dQK', 'empresa', '2026-03-25T00:13:26.863Z'),
(6, 'Camila Gonzalez Pachon', 'cami@hotmail.com', '$2b$10$zGJGmjU.Dr9Wxoz2zOBRSO8tb/nV4g8wQgzfop7sEB/C74Ksl4FZ.', 'centro', '2026-03-25T00:14:28.235Z'),
(7, 'Stefano', 'sgac@gmail.com', '$2b$10$p877nT17QXgYoVgBYlJcYOPDrxnll92ekV.R11H1x1eZP.xTypVdW', 'alumno', '2026-03-25T00:15:14.242Z'),
(8, 'Irak Suarez', 'irak123@gmail.com', '$2b$10$WXpNjb3z2PgJi31vrUUeQe02nLrmkXuzYfi3oswTx312n/2jQ9Bzm', 'alumno', '2026-03-25T10:23:57.084Z'),
(9, 'julio', 'julio@nextstep.local', '$2b$10$HaTxTwdqi/6vWyUX4V7v2e5GTVOJYbOqHGYXnKcTOcbshrQDtMzmK', 'alumno', '2026-04-15T19:57:26.278Z'),
(10, 'juan', 'juan@nextstep.local', '$2b$10$tKKe3z6UzSJ0VzmXufgJ0.CPLj9mKd8GEiKI94ZqLZ6WdvbzyRv9i', 'alumno', '2026-04-15T20:05:55.174Z'),
(11, 'luis', 'luis@nextstep.local', '$2b$10$suNfcw2jFFcWg8TZ0xenEe0CS6ZLXW.geHvXHDiK4MPZ4zfwuazG6', 'alumno', '2026-04-15T20:10:53.511Z'),
(12, 'lucas', 'lucas@nextstep.local', '$2b$10$KNcGB7ScQm0fsl52j0uGFegh46aiEPUwgErLSMHe4tgK6AWZLWiNC', 'alumno', '2026-04-15T20:11:20.988Z');

-- --------------------------------------------------------

--
-- Estructura para la vista `agreements`
--
DROP TABLE IF EXISTS `agreements`;

DROP VIEW IF EXISTS `agreements`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `agreements`  AS SELECT `convenios`.`id` AS `id`, `convenios`.`practica_id` AS `internship_id`, `convenios`.`alumno_id` AS `student_id`, `convenios`.`centro_id` AS `center_id`, `convenios`.`firmado_en` AS `signed_at`, `convenios`.`notas` AS `notes`, `convenios`.`creado_en` AS `created_at` FROM `convenios` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `applications`
--
DROP TABLE IF EXISTS `applications`;

DROP VIEW IF EXISTS `applications`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `applications`  AS SELECT `candidaturas`.`id` AS `id`, `candidaturas`.`practica_id` AS `internship_id`, `candidaturas`.`alumno_id` AS `student_id`, `candidaturas`.`estado` AS `status`, `candidaturas`.`creado_en` AS `created_at` FROM `candidaturas` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `catalogs`
--
DROP TABLE IF EXISTS `catalogs`;

DROP VIEW IF EXISTS `catalogs`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `catalogs`  AS SELECT `catalogos`.`id` AS `id`, `catalogos`.`clave` AS `key`, `catalogos`.`nombre` AS `name`, `catalogos`.`descripcion` AS `description`, `catalogos`.`activo` AS `is_active`, `catalogos`.`creado_en` AS `created_at`, `catalogos`.`actualizado_en` AS `updated_at` FROM `catalogos` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `catalog_items`
--
DROP TABLE IF EXISTS `catalog_items`;

DROP VIEW IF EXISTS `catalog_items`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `catalog_items`  AS SELECT `catalogo_items`.`id` AS `id`, `catalogo_items`.`catalogo_id` AS `catalog_id`, `catalogo_items`.`valor` AS `value`, `catalogo_items`.`etiqueta` AS `label`, `catalogo_items`.`descripcion` AS `description`, `catalogo_items`.`orden` AS `sort_order`, `catalogo_items`.`meta_json` AS `meta_json`, `catalogo_items`.`activo` AS `is_active`, `catalogo_items`.`creado_en` AS `created_at`, `catalogo_items`.`actualizado_en` AS `updated_at` FROM `catalogo_items` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `centers`
--
DROP TABLE IF EXISTS `centers`;

DROP VIEW IF EXISTS `centers`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `centers`  AS SELECT `centros_educativos`.`id` AS `id`, `centros_educativos`.`usuario_id` AS `user_id`, `centros_educativos`.`nombre_centro` AS `center_name`, `centros_educativos`.`ciudad` AS `city`, `centros_educativos`.`creado_en` AS `created_at` FROM `centros_educativos` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `companies`
--
DROP TABLE IF EXISTS `companies`;

DROP VIEW IF EXISTS `companies`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `companies`  AS SELECT `empresas`.`id` AS `id`, `empresas`.`usuario_id` AS `user_id`, `empresas`.`nombre_empresa` AS `company_name`, `empresas`.`sector` AS `sector`, `empresas`.`ciudad` AS `city`, `empresas`.`descripcion` AS `description`, `empresas`.`correo_contacto` AS `contact_email`, `empresas`.`telefono_contacto` AS `contact_phone`, `empresas`.`persona_contacto` AS `contact_person`, `empresas`.`activo` AS `is_active`, `empresas`.`creado_en` AS `created_at`, `empresas`.`actualizado_en` AS `updated_at` FROM `empresas` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `followups`
--
DROP TABLE IF EXISTS `followups`;

DROP VIEW IF EXISTS `followups`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `followups`  AS SELECT `seguimientos`.`id` AS `id`, `seguimientos`.`alumno_id` AS `student_id`, `seguimientos`.`usuario_autor_id` AS `author_user_id`, `seguimientos`.`contenido` AS `content`, `seguimientos`.`progreso` AS `progress`, `seguimientos`.`creado_en` AS `created_at` FROM `seguimientos` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `internships`
--
DROP TABLE IF EXISTS `internships`;

DROP VIEW IF EXISTS `internships`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `internships`  AS SELECT `p`.`id` AS `id`, `p`.`empresa_id` AS `company_id`, `e`.`nombre_empresa` AS `company_name`, `e`.`activo` AS `company_is_active`, `p`.`area_item_id` AS `area_item_id`, `ci`.`valor` AS `area_value`, `ci`.`etiqueta` AS `area_label`, `p`.`titulo` AS `title`, `p`.`descripcion` AS `description`, `p`.`horas_totales` AS `hours_total`, `p`.`horario` AS `schedule`, `p`.`plazas` AS `slots`, coalesce(`accepted`.`accepted_count`,0) AS `accepted_applications_count`, greatest((`p`.`plazas` - coalesce(`accepted`.`accepted_count`,0)),0) AS `available_slots`, `p`.`requisitos` AS `requirements`, `p`.`estado` AS `status`, `p`.`fecha_inicio_estimada` AS `start_date`, `p`.`fecha_fin_estimada` AS `end_date`, `p`.`fecha_limite_candidatura` AS `application_deadline`, `p`.`activo` AS `is_active`, `p`.`creado_en` AS `created_at`, `p`.`actualizado_en` AS `updated_at` FROM (((`practicas` `p` join `empresas` `e` on((`e`.`id` = `p`.`empresa_id`))) left join `catalogo_items` `ci` on((`ci`.`id` = `p`.`area_item_id`))) left join (select `c`.`practica_id` AS `practica_id`,count(0) AS `accepted_count` from `candidaturas` `c` where (`c`.`estado` = 'aceptada') group by `c`.`practica_id`) `accepted` on((`accepted`.`practica_id` = `p`.`id`))) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `interviews`
--
DROP TABLE IF EXISTS `interviews`;

DROP VIEW IF EXISTS `interviews`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `interviews`  AS SELECT `entrevistas`.`id` AS `id`, `entrevistas`.`candidatura_id` AS `application_id`, `entrevistas`.`fecha_entrevista` AS `interview_at`, `entrevistas`.`notas` AS `notes`, `entrevistas`.`creado_en` AS `created_at` FROM `entrevistas` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `students`
--
DROP TABLE IF EXISTS `students`;

DROP VIEW IF EXISTS `students`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `students`  AS SELECT `alumnos`.`id` AS `id`, `alumnos`.`usuario_id` AS `user_id`, `alumnos`.`centro_id` AS `center_id`, `alumnos`.`texto_cv` AS `cv_text`, `alumnos`.`url_cv_pdf` AS `cv_pdf_url`, `alumnos`.`habilidades` AS `skills`, `alumnos`.`validado` AS `validated`, `alumnos`.`creado_en` AS `created_at` FROM `alumnos` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `users`
--
DROP TABLE IF EXISTS `users`;

DROP VIEW IF EXISTS `users`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `users`  AS SELECT `usuarios`.`id` AS `id`, `usuarios`.`nombre` AS `name`, `usuarios`.`correo` AS `email`, `usuarios`.`hash_contrasena` AS `password_hash`, `usuarios`.`rol` AS `role`, `usuarios`.`creado_en` AS `created_at` FROM `usuarios` ;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD CONSTRAINT `fk_alumnos_centro` FOREIGN KEY (`centro_id`) REFERENCES `centros_educativos` (`id`),
  ADD CONSTRAINT `fk_alumnos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `candidaturas`
--
ALTER TABLE `candidaturas`
  ADD CONSTRAINT `fk_candidaturas_alumno` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`),
  ADD CONSTRAINT `fk_candidaturas_practica` FOREIGN KEY (`practica_id`) REFERENCES `practicas` (`id`);

--
-- Filtros para la tabla `catalogo_items`
--
ALTER TABLE `catalogo_items`
  ADD CONSTRAINT `fk_catalogo_items_catalogo` FOREIGN KEY (`catalogo_id`) REFERENCES `catalogos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `centros_educativos`
--
ALTER TABLE `centros_educativos`
  ADD CONSTRAINT `fk_centros_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `convenios`
--
ALTER TABLE `convenios`
  ADD CONSTRAINT `fk_convenios_alumno` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`),
  ADD CONSTRAINT `fk_convenios_centro` FOREIGN KEY (`centro_id`) REFERENCES `centros_educativos` (`id`),
  ADD CONSTRAINT `fk_convenios_practica` FOREIGN KEY (`practica_id`) REFERENCES `practicas` (`id`);

--
-- Filtros para la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD CONSTRAINT `fk_empresas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `entrevistas`
--
ALTER TABLE `entrevistas`
  ADD CONSTRAINT `fk_entrevistas_candidatura` FOREIGN KEY (`candidatura_id`) REFERENCES `candidaturas` (`id`);

--
-- Filtros para la tabla `practicas`
--
ALTER TABLE `practicas`
  ADD CONSTRAINT `fk_practicas_area_item` FOREIGN KEY (`area_item_id`) REFERENCES `catalogo_items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_practicas_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`);

--
-- Filtros para la tabla `seguimientos`
--
ALTER TABLE `seguimientos`
  ADD CONSTRAINT `fk_seguimientos_alumno` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`),
  ADD CONSTRAINT `fk_seguimientos_usuario` FOREIGN KEY (`usuario_autor_id`) REFERENCES `usuarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
