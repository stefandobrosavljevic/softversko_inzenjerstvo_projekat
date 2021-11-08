# Privileges for `epharm`@`localhost`

GRANT USAGE ON *.* TO 'epharm'@'localhost';

GRANT SELECT, INSERT, UPDATE, DELETE ON `epharm`.* TO 'epharm'@'localhost';

GRANT SELECT, INSERT, UPDATE, DELETE ON `epharm\_populated`.* TO 'epharm'@'localhost';