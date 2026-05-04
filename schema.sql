CREATE DATABASE GreatShiftShuttle;
USE GreatShiftShuttle;
CREATE TABLE Routes (
    route_id INT PRIMARY KEY AUTO_INCREMENT,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    distance_km INT,
    estimated_duration TIME
);

CR

CREATE TABLE Drivers (
    driver_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(100),
    rating DECIMAL(3, 2)
);