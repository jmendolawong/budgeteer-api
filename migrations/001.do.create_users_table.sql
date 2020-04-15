CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  email varchar(128) NOT NULL,
  password varchar(64) NOT NULL
);