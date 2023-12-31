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
    db.query(`SELECT e.employee_id, e.first_name, e.last_name, r.role AS 'title', r.salary, d.name AS 'department', CONCAT(m.first_name, ' ', m.last_name) AS 'manager'
        FROM employees e
        JOIN roles r ON e.role_id = r.role_id
        JOIN departments d ON r.department_id = d.department_id
        LEFT JOIN employees m ON e.manager_id = m.employee_id
        `, function (err, res) {
        if (err) console.log(err);
        else {
            console.log('')
            console.table(res);
            menu();
        }
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
        if (err) console.log(err);
        else {
            for (let i=0; i < results.length; i++) {
                managerChoices.push(results[i].name);
            } managerChoices.push('None');
        }
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
                    console.log('Employee added!');
                    menu();
                }
            })
        
        }
        
        getRoleID();
})}

function updateEmployeeRole() {

    function getChoices() {
        let employeeChoices = [];
        db.query(`SELECT CONCAT(first_name, ' ', last_name) AS name FROM employees`, function (err, results) {
            if (err) console.log(err);
            else {
                for (let i=0; i < results.length; i++) {
                    employeeChoices.push(results[i].name);
                } employeeChoices.push('None');
            }
            
            let roleChoices = [];
            db.query(`SELECT role FROM roles`, function (err, results) {
                if (err) console.log(err);
                else {
                    for (let i=0; i < results.length; i++) {
                        roleChoices.push(results[i].role);
                    }  
                        startPrompts(employeeChoices, roleChoices)
                }
            }); 
        });
    }

    getChoices();
    
    function startPrompts(employeeChoices, roleChoices) {

        inquirer.prompt([
            {
                type: 'list',
                message: 'Please choose an employee:',
                choices: employeeChoices,
                name: 'employee',
            },
            {
                type: 'list',
                message: 'Please select a new role:',
                choices: roleChoices,
                name: 'role',
            }
        ]).then((answers) => {

            function getRoleID() {
                var roleID;
                db.query(`SELECT role_id FROM roles WHERE role='${answers.role}'`, function (err, res) {
                    if (err) console.log(err);
                    else { 
                        roleID = res[0].role_id;
                        getEmployeeID(roleID)
                    }
                })
                
            }

            function getEmployeeID(roleID) {
                var employeeID;
                if (answers.employee != 'None') {
                    let nameArray = answers.employee.split(' ');
                    let firstName = nameArray[0];
                    let lastName = nameArray[1];
        
                    db.query(`SELECT employee_id AS id FROM employees 
                    WHERE first_name ='${firstName}' AND last_name='${lastName}'`, function (err, res) {
                        if (err) console.log(err);
                        else { 
                            employeeID = res[0].id;
                            writeQuery(roleID, employeeID);
                        }
                    })
                } else {
                    employeeID = null;
                    writeQuery(roleID, employeeID);
                }
                
            }

            function writeQuery(roleID, employeeID) {
                db.query(`UPDATE employees
                set role_id=${roleID}
                WHERE employee_id=${employeeID};`, function (err, res) {
                    if (err) console.log(err);
                    else { 
                        console.log('Updated employee role!');
                        menu();
                    }
                })

            }
            getRoleID() 
        })
    }
}

function viewRoles() {
    db.query(`SELECT r.role_id, r.role AS 'title', d.name AS 'department', r.salary
        FROM roles r
        JOIN departments d ON r.department_id = d.department_id`, function (err, res) {
        if (err) console.log(err);
        else {
            console.log('');
            console.table(res);
            menu();
        }
    });
}

function addRole() {
    let departmentChoices = [];
    db.query(`SELECT name FROM departments`, function (err, results) {
        if (err) console.log(err);
        else {
            for (let i=0; i < results.length; i++) {
                departmentChoices.push(results[i].name);
            }
            startPrompts();
        }
    });

    function startPrompts() {
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
                choices: departmentChoices,
                name: 'department',
            }
        ]).then((answers) => {
            let departmentID;
            db.query(`SELECT department_id FROM departments WHERE name='${answers.department}'`, function (err, results) {
                if (err) console.log(err);
                departmentID = results[0].department_id;
                writeQuery();
            })

            function writeQuery() {
                db.query(`INSERT INTO roles (role, salary, department_id)
                    VALUES ('${answers.newRole}', ${answers.newSalary}, ${departmentID});`, function (err, results) {
                        if (err) console.log(err);
                        else {
                            console.log('Role added!');
                        }
                        menu();
                    })
            }
        })
    }
    
}

function viewDepartments() {
    db.query(`SELECT * FROM departments`, function (err, res) {
        if (err) console.log(err);
        else {
            console.log('');
            console.table(res);
            menu();
        } 
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
        db.query(`INSERT INTO departments (name) VALUES ('${answers.newDepartment}')`, function (err, results) {
            if (err) console.log(err);
            else console.log('Department added!');
            menu();
        })
    })
}

function updateManager() {

    function getChoices() {
        let employeeChoices = [];
        db.query(`SELECT CONCAT(first_name, ' ', last_name) AS name FROM employees`, function (err, results) {
            if (err) console.log(err);
            else {
                for (let i=0; i < results.length; i++) {
                    employeeChoices.push(results[i].name);
                }
            }
            
            let managerChoices = [];
            db.query(`SELECT CONCAT(first_name, ' ', last_name) AS name FROM employees`, function (err, results) {
                if (err) console.log(err);
                else {
                    for (let i=0; i < results.length; i++) {
                        managerChoices.push(results[i].name);
                    }  
                        startPrompts(employeeChoices, managerChoices)
                }
            }); 
        });
    }

    getChoices();
    
    function startPrompts(employeeChoices, managerChoices) {

        inquirer.prompt([
            {
                type: 'list',
                message: 'Please choose an employee:',
                choices: employeeChoices,
                name: 'employee',
            },
            {
                type: 'list',
                message: 'Please select a new manager for the employee:',
                choices: managerChoices,
                name: 'manager',
            }
        ]).then((answers) => {

            function getEmployeeID() {
                var employeeID;

                let nameArray = answers.employee.split(' ');
                let firstName = nameArray[0];
                let lastName = nameArray[1];

                db.query(`SELECT employee_id AS id FROM employees 
                WHERE first_name ='${firstName}' AND last_name='${lastName}'`, function (err, res) {
                    if (err) console.log(err);
                    else { 
                        employeeID = res[0].id;
                        getManagerID(employeeID);
                    }
                })  
            }

            function getManagerID(employeeID) {
                var managerID;

                let nameArray = answers.manager.split(' ');
                let firstName = nameArray[0];
                let lastName = nameArray[1];

                db.query(`SELECT employee_id AS id FROM employees 
                WHERE first_name ='${firstName}' AND last_name='${lastName}'`, function (err, res) {
                    if (err) console.log(err);
                    else { 
                        managerID = res[0].id;
                        writeQuery(employeeID, managerID);
                    }
                })  
            }

            function writeQuery(employeeID, managerID) {
                db.query(`UPDATE employees
                set manager_id=${managerID}
                WHERE employee_id=${employeeID};`, function (err, res) {
                    if (err) console.log(err);
                    else { 
                        console.log('Updated manager!');
                        menu();
                    }
                })

            }
            getEmployeeID() 
        })
    }
}

function deleteDepartment() {
    function getChoices() {
        let departmentChoices = [];
        db.query(`SELECT name FROM departments`, function (err, results) {
            if (err) console.log(err);
            else {
                for (let i=0; i < results.length; i++) {
                    departmentChoices.push(results[i].name);
                } startPrompts(departmentChoices);
            }
        });
    } getChoices();

    function startPrompts(departmentChoices) {

        inquirer.prompt([
            {
                type: 'list',
                message: 'Please choose a department to delete:',
                choices: departmentChoices,
                name: 'department',
            }
        ]).then((answers) => {

            function writeQuery() {
                db.query(`DELETE FROM departments
                WHERE name = '${answers.department}';
                `, function (err, res) {
                    if (err) console.log(err);
                    else { 
                        console.log(`Deleted ${answers.department}!`);
                        menu();
                    }
                })

            }
            writeQuery(); 
        })
    }
}

function deleteEmployee() {
    function getChoices() {
        let employeeChoices = [];
        db.query(`SELECT CONCAT(first_name, ' ', last_name) AS 'name' FROM employees`, function (err, results) {
            if (err) console.log(err);
            else {
                for (let i=0; i < results.length; i++) {
                    employeeChoices.push(results[i].name);
                } startPrompts(employeeChoices);
            }
        });
    } getChoices();

    function startPrompts(employeeChoices) {

        inquirer.prompt([
            {
                type: 'list',
                message: 'Please choose an employee to delete:',
                choices: employeeChoices,
                name: 'employee',
            }
        ]).then((answers) => {

            function getEmployeeID() {
                var employeeID;

                let nameArray = answers.employee.split(' ');
                let firstName = nameArray[0];
                let lastName = nameArray[1];

                db.query(`SELECT employee_id AS id FROM employees 
                WHERE first_name ='${firstName}' AND last_name='${lastName}'`, function (err, res) {
                    if (err) console.log(err);
                    else { 
                        employeeID = res[0].id;
                        writeQuery(employeeID);
                    }
                })  
            }

            function writeQuery(employeeID) {
                db.query(`DELETE FROM employees
                WHERE employee_id = '${employeeID}';
                `, function (err, res) {
                    if (err) console.log(err);
                    else { 
                        console.log(`Deleted ${answers.employee}!`);
                        menu();
                    }
                })

            }
            getEmployeeID(); 
        })
    }
}

function deleteRole() {
    function getChoices() {
        let roleChoices = [];
        db.query(`SELECT role FROM roles`, function (err, results) {
            if (err) console.log(err);
            else {
                for (let i=0; i < results.length; i++) {
                    roleChoices.push(results[i].role);
                } startPrompts(roleChoices);
            }
        });
    } getChoices();

    function startPrompts(roleChoices) {

        inquirer.prompt([
            {
                type: 'list',
                message: 'Please choose a role to delete:',
                choices: roleChoices,
                name: 'role',
            }
        ]).then((answers) => {

            function writeQuery() {
                db.query(`DELETE FROM roles
                WHERE role = '${answers.role}';
                `, function (err, res) {
                    if (err) console.log(err);
                    else { 
                        console.log(`Deleted ${answers.role}!`);
                        menu();
                    }
                })

            }
            writeQuery(); 
        })
    }
}

function viewBudget() {
    db.query(`SELECT d.name AS 'department', SUM(r.salary) AS 'total utilized budget'
        FROM roles r
        JOIN departments d
        ON r.department_id = d.department_id
        GROUP BY d.department_id`, function (err, res) {
        if (err) console.log(err);
        else {
            console.log('');
            console.table(res);
            menu();
        } 
    });
}

function viewByDepartment() {
    function getChoices() {
        let departmentChoices = [];
        db.query(`SELECT name FROM departments`, function (err, results) {
            if (err) console.log(err);
            else {
                for (let i=0; i < results.length; i++) {
                    departmentChoices.push(results[i].name);
                } startPrompts(departmentChoices);
            }
        });
    } getChoices();

    function startPrompts(departmentChoices) {

        inquirer.prompt([
            {
                type: 'list',
                message: 'Please choose a department to view employees:',
                choices: departmentChoices,
                name: 'department',
            }
        ]).then((answers) => {

            function getDepartmentID() {
                var departmentID;
                db.query(`SELECT department_id FROM departments WHERE name='${answers.department}'`, function (err, res) {
                    if (err) console.log(err);
                    else { 
                        departmentID = res[0].department_id;
                        viewTable(departmentID)
                    }
                })
            }

            function viewTable(departmentID) {
                db.query(`SELECT CONCAT(e.first_name, ' ', e.last_name) AS 'name', d.name AS 'department'
                    FROM employees e
                    JOIN roles r ON e.role_id = r.role_id
                    JOIN departments d ON d.department_id = r.department_id
                    WHERE d.department_id = ${departmentID}`, function (err, res) {
                    if (err) console.log(err);
                    else { 
                        console.log('');
                        console.table(res);
                        menu();
                    }
                })
            }

            getDepartmentID();
        })
    }
}

function viewByManager() {

    async function getChoices() {
        let managerIDs = await getManagerID()
        let managerChoices = await getManagers(managerIDs)
        startPrompts(managerChoices);
    }

    function getManagerID() {
        let managerIDs = [];
        return new Promise((res, rej) => {
            db.query(`SELECT manager_id FROM employees WHERE manager_id IS NOT NULL`, function (err, results) {
                if (err) console.log(err);
                else {
                    for (let i=0; i < results.length; i++) {
                        managerIDs.push(results[i].manager_id);
                    }
                    res(managerIDs);
                } 
            });
        })
    }

    function getManagers(managerIDs) {
        let managerChoices = [];
        let mIDs = `employee_id = ${managerIDs[0]}`
        return new Promise((res, rej) => {
            for (let i=1; i < managerIDs.length; i++) {
                mIDs += ` OR employee_id = ${managerIDs[i]}`
            } 
                db.query(`SELECT CONCAT(first_name, ' ', last_name) AS 'name' FROM employees WHERE ${mIDs}`, function(err, results) {
                    if (err) console.log(err);
                    else {
                        managerChoices = results.map(manager => manager.name);                    
                        res(managerChoices);
                    } 
                }); 
             
        }) 
        
    }
    
    getChoices();

    function startPrompts(managerChoices) {

        inquirer.prompt([
            {
                type: 'list',
                message: 'Please choose a manager to view their employees:',
                choices: managerChoices,
                name: 'manager',
            }
        ]).then((answers) => {

            function getManagerID() {
                var managerID;

                let nameArray = answers.manager.split(' ');
                let firstName = nameArray[0];
                let lastName = nameArray[1];

                db.query(`SELECT employee_id AS id FROM employees 
                WHERE first_name ='${firstName}' AND last_name='${lastName}'`, function (err, res) {
                    if (err) console.log(err);
                    else { 
                        managerID = res[0].id;
                        viewTable(managerID);
                    }
                })  
            }

            function viewTable(managerID) {
                db.query(`SELECT CONCAT(e.first_name, ' ', e.last_name) AS 'name', CONCAT(m.first_name, ' ', m.last_name) AS 'manager'
                FROM employees e
                LEFT JOIN employees m ON e.manager_id = m.employee_id
                WHERE e.manager_id = ${managerID}`, function (err, res) {
                    if (err) console.log(err);
                    else { 
                        console.log('');
                        console.table(res);
                        menu();
                    }
                })
            }

            getManagerID();
        })
    }
}

// Menu function

function menu() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            choices: ['View All Employees', 
                'Add Employee', 
                'Update Employee Role', 
                'View All Roles', 
                'Add Role', 
                'View All Departments', 
                'Add Department', 
                'Update Manager', 
                'View Utilized Budget', 
                'View Employees by Department', 
                'View Employees by Manager', 
                'Delete Department', 
                'Delete Employee', 
                'Delete Role', 
                'Quit'],
            name: 'menuChoice',
        }
    ]).then((choice) => {
            if (choice.menuChoice === 'View All Employees') viewEmployees();
            if (choice.menuChoice === 'Add Employee') addEmployee();
            if (choice.menuChoice === 'Update Employee Role') updateEmployeeRole();
            if (choice.menuChoice === 'View All Roles') viewRoles();
            if (choice.menuChoice === 'Add Role') addRole();
            if (choice.menuChoice === 'View All Departments') viewDepartments();
            if (choice.menuChoice === 'Add Department') addDepartment();
            if (choice.menuChoice === 'View Employees by Department') viewByDepartment();
            if (choice.menuChoice === 'View Employees by Manager') viewByManager();
            if (choice.menuChoice === 'Update Manager') updateManager();
            if (choice.menuChoice === 'Delete Department') deleteDepartment();
            if (choice.menuChoice === 'Delete Employee') deleteEmployee();
            if (choice.menuChoice === 'Delete Role') deleteRole();
            if (choice.menuChoice === 'View Utilized Budget') viewBudget();
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

init();