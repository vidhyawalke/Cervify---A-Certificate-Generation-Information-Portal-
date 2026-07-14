const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'cervify.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

async function initializeDatabase() {
    console.log('Starting database initialization...');
    
    // Open SQLite database
    const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    console.log(`Database opened at: ${DB_PATH}`);

    // Read and execute schema
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
    await db.exec(schemaSql);
    console.log('Database tables created successfully.');

    // Seed Role Types
    const roles = ['admin', 'coordinator', 'principal', 'staff'];
    for (const role of roles) {
        const existing = await db.get('SELECT * FROM roletype_tbl WHERE roletype_type = ?', [role]);
        if (!existing) {
            await db.run('INSERT INTO roletype_tbl (roletype_type, status) VALUES (?, 1)', [role]);
            console.log(`Role type seeded: ${role}`);
        }
    }

    // Seed Departments
    const depts = [
        { degree: 'UG', name: 'Computer Applications (BCA)' },
        { degree: 'UG', name: 'Commerce (BCom)' },
        { degree: 'UG', name: 'Science (BSc)' },
        { degree: 'PG', name: 'Computer Science (MSc)' }
    ];
    for (const dept of depts) {
        const existing = await db.get('SELECT * FROM department_tbl WHERE deptName = ?', [dept.name]);
        if (!existing) {
            await db.run('INSERT INTO department_tbl (degree, deptName, status) VALUES (?, ?, 1)', [dept.degree, dept.name]);
            console.log(`Department seeded: ${dept.name}`);
        }
    }

    // Seed Categories
    const categories = ['Technical event', 'Certificate Course', 'Co-curricular', 'Workshop', 'Seminar'];
    for (const cat of categories) {
        const existing = await db.get('SELECT * FROM category_tbl WHERE category_name = ?', [cat]);
        if (!existing) {
            await db.run('INSERT INTO category_tbl (category_name, status) VALUES (?, 1)', [cat]);
            console.log(`Category seeded: ${cat}`);
        }
    }

    // Seed Agencies
    const agencies = [
        { name: 'Goa University', desc: 'Affiliated University' },
        { name: "Dnyanprassarak Mandal's College and Research Centre", desc: 'Host Institution' }
    ];
    for (const agency of agencies) {
        const existing = await db.get('SELECT * FROM agency_tbl WHERE agencyName = ?', [agency.name]);
        if (!existing) {
            await db.run('INSERT INTO agency_tbl (agencyName, agencyDesc, status) VALUES (?, ?, 1)', [agency.name, agency.desc]);
            console.log(`Agency seeded: ${agency.name}`);
        }
    }

    // Seed Staff/Users (Admin, Coordinator, Principal)
    const adminRoleId = (await db.get("SELECT roletype_id FROM roletype_tbl WHERE roletype_type = 'admin'")).roletype_id;
    const coordRoleId = (await db.get("SELECT roletype_id FROM roletype_tbl WHERE roletype_type = 'coordinator'")).roletype_id;
    const principalRoleId = (await db.get("SELECT roletype_id FROM roletype_tbl WHERE roletype_type = 'principal'")).roletype_id;
    const staffRoleId = (await db.get("SELECT roletype_id FROM roletype_tbl WHERE roletype_type = 'staff'")).roletype_id;

    const bcaDeptId = (await db.get("SELECT id FROM department_tbl WHERE deptName = 'Computer Applications (BCA)'")).id;

    const staffUsers = [
        {
            name: 'System Administrator',
            username: 'admin',
            email: 'admin@cervify.org',
            password: 'admin123',
            designation: 'IT Admin',
            roleId: adminRoleId,
            deptId: bcaDeptId
        },
        {
            name: 'Mr. Krishnarao Rane Sardessai',
            username: 'coordinator',
            email: 'coordinator@cervify.org',
            password: 'co123',
            designation: 'Assistant Professor',
            roleId: coordRoleId,
            deptId: bcaDeptId
        },
        {
            name: 'Prof. D. B. Arolkar',
            username: 'principal',
            email: 'principal@cervify.org',
            password: 'pr123',
            designation: 'Principal',
            roleId: principalRoleId,
            deptId: bcaDeptId
        }
    ];

    for (const user of staffUsers) {
        const existing = await db.get('SELECT * FROM staff_tbl WHERE username = ?', [user.username]);
        if (!existing) {
            const hashedPassword = bcrypt.hashSync(user.password, 10);
            await db.run(
                `INSERT INTO staff_tbl (staff_name, username, email, password, designation, roletype_id, department_id, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
                [user.name, user.username, user.email, hashedPassword, user.designation, user.roleId, user.deptId]
            );
            console.log(`Staff seeded: ${user.name} (${user.username})`);
        }
    }

    // Seed Students (exactly matching the students from the PDF)
    const students = [
        { name: 'Sakshi Adarkar', roll: 1, class: 'TY', course: 'BCA', year: '2022-2023' },
        { name: 'Anurag Gauthankar', roll: 7, class: 'TY', course: 'BCA', year: '2022-2023' },
        { name: 'Sanath Santosh', roll: 28, class: 'TY', course: 'BCA', year: '2022-2023' },
        { name: 'Abhilash Talwar', roll: 31, class: 'TY', course: 'BCA', year: '2022-2023' },
        { name: 'Vidhya Walke', roll: 32, class: 'TY', course: 'BCA', year: '2022-2023' }
    ];

    for (const stud of students) {
        const existing = await db.get('SELECT * FROM student_tbl WHERE student_name = ? AND student_roll_no = ?', [stud.name, stud.roll]);
        if (!existing) {
            await db.run(
                `INSERT INTO student_tbl (student_name, student_roll_no, student_class, student_course, student_academic_year, status)
                 VALUES (?, ?, ?, ?, ?, 1)`,
                [stud.name, stud.roll, stud.class, stud.course, stud.year]
            );
            console.log(`Student seeded: ${stud.name} (Roll ${stud.roll})`);
        }
    }

    console.log('Database initialization complete!');
    await db.close();
}

initializeDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
