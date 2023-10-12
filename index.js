let inquirer = require('inquirer');
const mysql = require('mysql2');

const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: 'RamitaSQL',
      database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
  );


// Table functions

function viewEmployees() {
    db.query(`SELECT * FROM employees`, function (err, res) {
        console.log('')
        console.table(res);
        menu();
    });
}

function addEmployee() {
    let roleChoices = [];
    db.query(`SELECT role FROM roles`, function (err, results) {
        for (let i=0; i < results.length; i++) {
            roleChoices.push(results[i].role);
        }
    });

    let managerChoices = [];
    db.query(`SELECT CONCAT(first_name, ' ', last_name) AS name FROM employees`, function (err, results) {
        for (let i=0; i < results.length; i++) {
            managerChoices.push(results[i].name);
        } managerChoices.push('None');
    });

    inquirer.prompt([
        {
            type: 'input',
            message: "Please enter the employee's first name:",
            name: 'firstName',
        },
        {
            type: 'input',
            message: "Please enter the employee's last name:",
            name: 'lastName',
        },
        {
            type: 'list',
            message: 'Please choose a role for the employee:',
            choices: roleChoices,
            name: 'role',
        },
        {
            type: 'list',
            message: 'Please select a manager:',
            choices: managerChoices,
            name: 'manager',
        }
    ]).then((answers) => {

        function getRoleID() {
            var roleID;
            db.query(`SELECT role_id FROM roles WHERE role='${answers.role}'`, function (err, res) {
                if (err) console.log(err);
                else { 
                    roleID = res[0].role_id;
                    // console.log("role ID", roleID);
                    getManagerID(roleID)
                }
            })
            
        }
        
        function getManagerID(roleID) {
            var managerID;
            if (answers.manager != 'None') {
                let nameArray = answers.manager.split(' ');
                let firstName = nameArray[0];
                let lastName = nameArray[1];
    
                db.query(`SELECT employee_id AS id FROM employees WHERE first_name ='${firstName}' AND last_name='${lastName}'`, function (err, res) {
                    if (err) console.log(err);
                    else { 
                        managerID = res[0].id;
                        writeQuery(roleID, managerID);
                    }
                })
            } else {
                managerID = null;
                writeQuery(roleID, managerID);
            }
            
        }

        function writeQuery(roleID, managerID) {
            db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id)
            VALUES ('${answers.firstName}', '${answers.lastName}', ${roleID}, ${managerID}) `, function (err, res) {
                if (err) console.log(err);
                else { 
                    console.log(res);
                    menu();
                }
            })
        
        }
        
        getRoleID();
})}

addEmployee();

function updateEmployeeRole() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'Please choose an employee:',
            choices: [],
            name: 'employee',
        },
        {
            type: 'list',
            message: 'Please select a new role:',
            choices: [],
            name: 'role',
        }
    ]).then((answers) => {
        console.log(answers);
        menu();
    })
}

function viewRoles() {
    db.query(`SELECT * FROM roles`, function (err, res) {
        console.log('');
        console.table(res);
        menu();
    });
    
}

function addRole() {
    inquirer.prompt([
        {
            type: 'input',
            message: 'Please enter the name of the new role:',
            name: 'newRole',
        },
        {
            type: 'input',
            message: 'Please enter the salary of the new role:',
            name: 'newSalary',
        },
        {
            type: 'list',
            message: 'Please select the department:',
            choices: [],
            name: 'department',
        }
    ]).then((answers) => {
        console.log(answers);
        menu();
    })
}

function viewDepartments() {
    db.query(`SELECT * FROM departments`, function (err, res) {
        console.log('');
        console.table(res);
        menu();
    });
}

function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            message: 'Please enter the name of the new department:',
            name: 'newDepartment',
        },
    ]).then((answers) => {
        console.log(answers);
        menu();
    })
}


// Menu function

function menu() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit'],
            name: 'menuChoice',
        }
    ]).then((choice) => {
            if (choice.menuChoice === 'View All Employees') viewEmployees();
            if (choice.menuChoice === 'Add Employee') addEmployee();
            if (choice.menuChoice === 'Update Employee Role') updateEmployeeRole();
            if (choice.menuChoice === 'View All Roles') viewRoles();
            if (choice.menuChoice === 'Add role') addRole();
            if (choice.menuChoice === 'View All Departments') viewDepartments();
            if (choice.menuChoice === 'Add Departments') addDepartment();
            if (choice.menuChoice === 'Quit') process.exit();
        });
}

// Function to start program

function init() {
    console.log(`
    
    ,________________________,
    |                        |
    |                        |
    |    Employee Manager    |
    |                        |
    |________________________|

    `);
    menu();
}

// Function call to initialize app

// init();

