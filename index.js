let inquirer = require('inquirer');
const mysql = require('mysql2');

const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: '',
      database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
  );

function viewEmployees() {
    db.query(`SELECT * FROM employees`, function (err, res) {
        console.table(res);
    });
}

function viewRoles() {
    db.query(`SELECT * FROM roles`, function (err, res) {
        console.table(res);
    });
}

function viewDepartments() {
    db.query(`SELECT * FROM departments`, function (err, res) {
        console.table(res);
    });
}

// Function to start questions

function init() {
    console.log(`
    
    ,________________________,
    |                        |
    |                        |
    |    Employee Manager    |
    |                        |
    |________________________|

    `);
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department'],
            name: 'menuChoice',
        }
    ]).then((choice) => {
            if (choice.menuChoice === 'View All Employees') viewEmployees();
            if (choice.menuChoice === 'View All Roles') viewRoles();
            if (choice.menuChoice === 'View All Departments') viewDepartments();
        });
}

// Function call to initialize app

init();

