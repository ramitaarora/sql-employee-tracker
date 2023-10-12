DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;
USE employee_db;

CREATE TABLE departments (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

INSERT INTO departments (name)
VALUES ('Sales'),
    ('Engineering'),
    ('Finance'),
    ('Legal');

CREATE TABLE roles (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    salary INT NOT NULL,
    department VARCHAR(50) NOT NULL,
    FOREIGN KEY (department) REFERENCES departments(name) ON DELETE SET NULL
);

INSERT INTO roles (role, salary, department)
VALUES ('Sales Lead', 100000, 'Sales'),
    ('Salesperson', 80000, 'Sales'),
    ('Lead Engineer', 150000, 'Engineering'),
    ('Software Engineer', 12000, 'Engineering'),
    ('Account Manager', 160000, 'Finance'),
    ('Accountant', 125000, 'Finance'),
    ('Legal Team Lead', 250000, 'Legal'),
    ('Lawyer', 190000, 'Legal');

CREATE TABLE employees (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    title VARCHAR(50) NOT NULL,
    manager VARCHAR(50),
    FOREIGN KEY (title) REFERENCES roles(role) ON DELETE SET NULL
);

INSERT INTO employees (first_name, last_name, title, manager)
VALUES ('John', 'Doe', 'Sales Lead', null),
    ('Mike', 'Chan', 'Salesperson', 'John Doe'),
    ('Ashley', 'Rodriguez', 'Lead Engineer', null),
    ('Kevin', 'Tupik', 'Software Engineer', 'Ashley Rodriguez'),
    ('Kunal', 'Singh', 'Account Manager', null),
    ('Malia', 'Brown', 'Accountant', 'Kunal Singh'),
    ('Sarah', 'Lourd', 'Legal Team Lead', null),
    ('Tom', 'Allen', 'Lawyer', 'Sarah Lourd');