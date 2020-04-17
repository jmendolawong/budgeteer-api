CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  userName varchar(128) NOT NULL,
  password varchar(64) NOT NULL
);