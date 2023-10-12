let inquirer = require('inquirer');

// Function to start questions

function init() {
    console.log('Employee Manager');
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department'],
            name: 'menuChoice',
        }
    ]).then((choice) => {
            console.log(choice);
        });
}

// Function call to initialize app

init();