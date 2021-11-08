-- phpMyAdmin SQL Dump
-- version 4.8.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 24, 2021 at 12:12 PM
-- Server version: 5.7.24
-- PHP Version: 7.2.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `epharm`
--

-- --------------------------------------------------------

--
-- Table structure for table `apoteke`
--

DROP TABLE IF EXISTS `apoteke`;
CREATE TABLE IF NOT EXISTS `apoteke` (
  `ID` smallint(3) NOT NULL,
  `Adresa` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `Grad` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `Telefon` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `apoteke`
--

INSERT INTO `apoteke` (`ID`, `Adresa`, `Grad`, `Telefon`) VALUES
(1, 'Kralja Petra 1/5', 'Beograd', '06555333'),
(2, 'Stefana Prvovencanog 4', 'Beograd', '555-295');

-- --------------------------------------------------------

--
-- Table structure for table `apoteke_lekovi`
--

DROP TABLE IF EXISTS `apoteke_lekovi`;
CREATE TABLE IF NOT EXISTS `apoteke_lekovi` (
  `Sifra` int(9) NOT NULL,
  `Apoteka` smallint(3) NOT NULL,
  `Kolicina` float NOT NULL,
  `KriticnaKolicina` smallint(2) NOT NULL,
  `Deljiv` tinyint(1) NOT NULL,
  PRIMARY KEY (`Sifra`,`Apoteka`),
  KEY `FK_apoteka_lekovi_ID` (`Apoteka`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `apoteke_lekovi`
--

INSERT INTO `apoteke_lekovi` (`Sifra`, `Apoteka`, `Kolicina`, `KriticnaKolicina`, `Deljiv`) VALUES
(745686, 1, 50, 10, 0),
(745686, 2, 50.5, 5, 1),
(34564125, 1, 20, 5, 0),
(34564125, 2, 20, 5, 0);

-- --------------------------------------------------------

--
-- Table structure for table `lekovi`
--

DROP TABLE IF EXISTS `lekovi`;
CREATE TABLE IF NOT EXISTS `lekovi` (
  `Sifra` int(9) NOT NULL,
  `Ime` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `Opis` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `Cena` int(7) NOT NULL,
  `BrojTabli` smallint(2) NOT NULL,
  `Slika` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`Sifra`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `lekovi`
--

INSERT INTO `lekovi` (`Sifra`, `Ime`, `Opis`, `Cena`, `BrojTabli`, `Slika`) VALUES
(745686, 'Aspirin', 'Tradghasagha', 300, 2, 'undefined'),
(34564125, 'Brufen', 'Tralalalala', 500, 1, 'undefined');

-- --------------------------------------------------------

--
-- Table structure for table `log_izdati_lekovi`
--

DROP TABLE IF EXISTS `log_izdati_lekovi`;
CREATE TABLE IF NOT EXISTS `log_izdati_lekovi` (
  `ID` int(11) NOT NULL,
  `ImeLeka` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `SifraLeka` int(9) NOT NULL,
  `Kolicina` float NOT NULL,
  `Cena` int(8) NOT NULL,
  KEY `ID` (`ID`),
  KEY `Index_ID` (`ID`),
  KEY `Ime_Sifra_Index` (`ImeLeka`,`SifraLeka`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `log_izdati_lekovi`
--

INSERT INTO `log_izdati_lekovi` (`ID`, `ImeLeka`, `SifraLeka`, `Kolicina`, `Cena`) VALUES
(1, 'Brufen', 123456, 3, 300),
(1, 'Andol', 456789, 5, 1000),
(2, 'Brufen', 123456, 3, 300),
(2, 'Andol', 123456, 5, 777),
(3, 'Paracetamol', 123456, 1, 800),
(3, 'Brufen', 123456, 1, 250),
(4, 'Brufen', 123456, 3, 1000),
(5, 'Aspirin', 745686, 0, 0),
(6, 'Aspirin', 745686, 0.5, 150),
(7, 'Aspirin', 745686, 0.5, 150);

-- --------------------------------------------------------

--
-- Table structure for table `log_izdavanje_lekova`
--

DROP TABLE IF EXISTS `log_izdavanje_lekova`;
CREATE TABLE IF NOT EXISTS `log_izdavanje_lekova` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Zaposleni` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Apoteka` smallint(3) NOT NULL,
  `Datum` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_Zaposleni_Zaposleni_ID` (`Zaposleni`),
  KEY `Apoteka_Datum_Index` (`Apoteka`,`Datum`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `log_izdavanje_lekova`
--

INSERT INTO `log_izdavanje_lekova` (`ID`, `Zaposleni`, `Apoteka`, `Datum`) VALUES
(1, 'Dusan', 1, '2021-06-18 00:00:00'),
(2, 'Dusan', 1, '2021-05-18 00:00:00'),
(3, 'Dusan', 1, '2021-02-18 00:00:00'),
(4, 'Dusan', 1, '2020-12-18 00:00:00'),
(5, 'Dusan', 2, '2021-06-24 13:22:20'),
(6, 'Dusan', 2, '2021-06-24 13:26:10'),
(7, 'Dusan', 2, '2021-06-24 13:26:26');

-- --------------------------------------------------------

--
-- Table structure for table `obavestenja`
--

DROP TABLE IF EXISTS `obavestenja`;
CREATE TABLE IF NOT EXISTS `obavestenja` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Tekst` varchar(150) COLLATE utf8_unicode_ci NOT NULL,
  `Datum` datetime NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `obavestenja`
--

INSERT INTO `obavestenja` (`ID`, `Tekst`, `Datum`) VALUES
(1, 'Test test test', '2021-06-18 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `porudzbine`
--

DROP TABLE IF EXISTS `porudzbine`;
CREATE TABLE IF NOT EXISTS `porudzbine` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Apoteka` smallint(3) NOT NULL,
  `Kreirao` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `Potvrdio` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `Datum` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_apoteka_porudzbina_ID` (`Apoteka`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `porudzbine`
--

INSERT INTO `porudzbine` (`ID`, `Apoteka`, `Kreirao`, `Potvrdio`, `Datum`) VALUES
(1, 1, 'string', '', '2021-06-04 20:06:28'),
(2, 1, 'Stefan Dobrosavljevic', '', '2021-06-04 20:10:04'),
(3, 1, 'Stefan Dobrosavljevic', '', '2021-06-04 20:10:20'),
(4, 1, 'Stefan Dobrosavljevic', '', '2021-06-04 20:10:28'),
(5, 1, 'Dusann Anticc', '', '2021-06-21 18:44:22'),
(6, 2, 'Dusan', 'Dusann Anticc', '2021-06-24 12:56:07'),
(7, 2, 'Dusan', '', '2021-06-24 12:57:34');

-- --------------------------------------------------------

--
-- Table structure for table `porudzbine_lekovi`
--

DROP TABLE IF EXISTS `porudzbine_lekovi`;
CREATE TABLE IF NOT EXISTS `porudzbine_lekovi` (
  `IDPorudzbine` int(11) NOT NULL,
  `SifraLeka` int(9) NOT NULL,
  `Kolicina` smallint(3) NOT NULL,
  PRIMARY KEY (`IDPorudzbine`,`SifraLeka`),
  UNIQUE KEY `IDPorudzbine` (`IDPorudzbine`,`SifraLeka`),
  KEY `FK_lekovi_porudzbina_sifra` (`SifraLeka`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `porudzbine_lekovi`
--

INSERT INTO `porudzbine_lekovi` (`IDPorudzbine`, `SifraLeka`, `Kolicina`) VALUES
(5, 745686, 4),
(5, 34564125, 5);

-- --------------------------------------------------------

--
-- Table structure for table `zaposleni`
--

DROP TABLE IF EXISTS `zaposleni`;
CREATE TABLE IF NOT EXISTS `zaposleni` (
  `KorisnickoIme` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `Lozinka` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `LozinkaSalt` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `Ime` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `Prezime` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `Email` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `Telefon` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `Uloga` varchar(15) COLLATE utf8_unicode_ci NOT NULL,
  `Apoteka` smallint(3) NOT NULL,
  PRIMARY KEY (`KorisnickoIme`),
  UNIQUE KEY `Email` (`Email`),
  KEY `FK_zaposleni_apoteka_ID` (`Apoteka`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `zaposleni`
--

INSERT INTO `zaposleni` (`KorisnickoIme`, `Lozinka`, `LozinkaSalt`, `Ime`, `Prezime`, `Email`, `Telefon`, `Uloga`, `Apoteka`) VALUES
('Dusan', 'pFkxqPb6shg8GdlWYPYvvB9f7IoVuxsr', 'BLPlPTtEP1h0BCBs3KAUYQ==', 'Dusann', 'Anticc', 'dusan@gmail.com', '06543633', 'Vlasnik', 2),
('Stefan', 'hFeO+dDiBn0DIVSnqiNN+DgxzGn8JO2N', 'kF9ChbFYYFq+3iCl+ozF4g==', 'Stefan', 'Dobrosavljevic', 'dobri@gmail.com', '065444366', 'Vlasnik', 1),
('Tester', 'wSlIMjs3EXDJhq8RxC7Uc2Y8EgVsnizF', 'Nv5y/o3L4bvhZ/MnQDpftw==', 'Test', 'Testic', 'fasga@gmail.com', '4363463', 'Upravnik', 1);

-- --------------------------------------------------------

--
-- Table structure for table `zaposleni_obavestenja`
--

DROP TABLE IF EXISTS `zaposleni_obavestenja`;
CREATE TABLE IF NOT EXISTS `zaposleni_obavestenja` (
  `IDObavestenja` int(11) NOT NULL,
  `UsernameNadleznog` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `Status` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  UNIQUE KEY `ID_Username_Unique` (`UsernameNadleznog`,`IDObavestenja`),
  KEY `FK_obavestenja_zaposleniOb_ID` (`IDObavestenja`),
  KEY `FK_zaposleni_obavestenja_username` (`UsernameNadleznog`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `zaposleni_obavestenja`
--

INSERT INTO `zaposleni_obavestenja` (`IDObavestenja`, `UsernameNadleznog`, `Status`) VALUES
(1, 'Dusan', 'OBRISANO');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `apoteke_lekovi`
--
ALTER TABLE `apoteke_lekovi`
  ADD CONSTRAINT `FK_alekovi_lekovi_sifra` FOREIGN KEY (`Sifra`) REFERENCES `lekovi` (`Sifra`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_apoteka_lekovi_ID` FOREIGN KEY (`Apoteka`) REFERENCES `apoteke` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `log_izdati_lekovi`
--
ALTER TABLE `log_izdati_lekovi`
  ADD CONSTRAINT `FK_IzdavanjeLekova_ID` FOREIGN KEY (`ID`) REFERENCES `log_izdavanje_lekova` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `log_izdavanje_lekova`
--
ALTER TABLE `log_izdavanje_lekova`
  ADD CONSTRAINT `FK_Apoteka_Apoteka_ID` FOREIGN KEY (`Apoteka`) REFERENCES `apoteke` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `porudzbine`
--
ALTER TABLE `porudzbine`
  ADD CONSTRAINT `FK_apoteka_porudzbina_ID` FOREIGN KEY (`Apoteka`) REFERENCES `apoteke` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `porudzbine_lekovi`
--
ALTER TABLE `porudzbine_lekovi`
  ADD CONSTRAINT `FK_lekovi_porudzbina_sifra` FOREIGN KEY (`SifraLeka`) REFERENCES `lekovi` (`Sifra`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_porudzbina_ID` FOREIGN KEY (`IDPorudzbine`) REFERENCES `porudzbine` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `zaposleni`
--
ALTER TABLE `zaposleni`
  ADD CONSTRAINT `FK_zaposleni_apoteka_ID` FOREIGN KEY (`Apoteka`) REFERENCES `apoteke` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `zaposleni_obavestenja`
--
ALTER TABLE `zaposleni_obavestenja`
  ADD CONSTRAINT `FK_obavestenja_zaposleniOb_ID` FOREIGN KEY (`IDObavestenja`) REFERENCES `obavestenja` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_zaposleni_obavestenja_username` FOREIGN KEY (`UsernameNadleznog`) REFERENCES `zaposleni` (`KorisnickoIme`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
