-- Category Table (e.g. Technical event, Certificate Course, Co-curricular)
CREATE TABLE IF NOT EXISTS category_tbl (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT NOT NULL,
    status INTEGER DEFAULT 1 -- 0: inactive, 1: active
);

-- Department Table (e.g. BCA, BCom, BSc)
CREATE TABLE IF NOT EXISTS department_tbl (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    degree TEXT NOT NULL, -- UG/PG
    deptName TEXT NOT NULL,
    status INTEGER DEFAULT 1 -- 0: inactive, 1: active
);

-- Agency Table (e.g. Collaborating institutions, sponsors)
CREATE TABLE IF NOT EXISTS agency_tbl (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agencyName TEXT NOT NULL,
    agencyDesc TEXT,
    status INTEGER DEFAULT 1 -- 0: inactive, 1: active
);

-- Role Type Table (e.g. Admin, Coordinator, Principal, Staff)
CREATE TABLE IF NOT EXISTS roletype_tbl (
    roletype_id INTEGER PRIMARY KEY AUTOINCREMENT,
    roletype_type TEXT NOT NULL,
    status INTEGER DEFAULT 1 -- 0: inactive, 1: active
);

-- Staff Table (Users of the system: Admin, Coordinator, Principal, Teachers)
CREATE TABLE IF NOT EXISTS staff_tbl (
    staff_id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    designation TEXT,
    roletype_id INTEGER,
    department_id INTEGER,
    status INTEGER DEFAULT 1, -- 0: inactive, 1: active
    FOREIGN KEY (roletype_id) REFERENCES roletype_tbl(roletype_id),
    FOREIGN KEY (department_id) REFERENCES department_tbl(id)
);

-- Student Table
CREATE TABLE IF NOT EXISTS student_tbl (
    stud_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT NOT NULL,
    student_roll_no INTEGER NOT NULL,
    student_class TEXT NOT NULL, -- FY/SY/TY
    student_course TEXT NOT NULL, -- BCA, BCom, etc.
    student_academic_year TEXT NOT NULL, -- e.g. 2022-2023
    status INTEGER DEFAULT 1 -- 0: inactive, 1: active
);

-- Visitor Table (External participants)
CREATE TABLE IF NOT EXISTS visitor_tbl (
    visitor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_name TEXT NOT NULL,
    visitor_organization TEXT,
    visitor_designation TEXT,
    status INTEGER DEFAULT 1 -- 0: inactive, 1: active
);

-- Activity Table
CREATE TABLE IF NOT EXISTS activity_tbl (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    act_name TEXT NOT NULL,
    f_date TEXT NOT NULL, -- YYYY-MM-DD
    t_date TEXT NOT NULL, -- YYYY-MM-DD
    dept1_id INTEGER,
    dept2_id INTEGER,
    cat_id INTEGER,
    agency_id INTEGER,
    coordinator_id INTEGER,
    tag TEXT,
    status INTEGER DEFAULT 1, -- 0: inactive, 1: active, 2: frozen
    FOREIGN KEY (dept1_id) REFERENCES department_tbl(id),
    FOREIGN KEY (dept2_id) REFERENCES department_tbl(id),
    FOREIGN KEY (cat_id) REFERENCES category_tbl(category_id),
    FOREIGN KEY (agency_id) REFERENCES agency_tbl(id),
    FOREIGN KEY (coordinator_id) REFERENCES staff_tbl(staff_id)
);

-- Certificate Table (Numbers generated upon approval/creation)
CREATE TABLE IF NOT EXISTS certificate_tbl (
    certificate_id INTEGER PRIMARY KEY AUTOINCREMENT,
    certificate_no TEXT NOT NULL UNIQUE,
    certificate_type TEXT NOT NULL, -- e.g., Winner, Runner up, Participant, Coordinator
    status INTEGER DEFAULT 1 -- 0: inactive/revoked, 1: active/generated, 2: validated
);

-- Participants Table (Links participants to activities and certificates)
CREATE TABLE IF NOT EXISTS participants_tbl (
    part_id INTEGER PRIMARY KEY AUTOINCREMENT,
    act_id INTEGER,
    certificate_id INTEGER,
    part_type TEXT NOT NULL, -- student, staff, visitor
    actual_id INTEGER NOT NULL, -- references stud_id, staff_id, or visitor_id depending on part_type
    status INTEGER DEFAULT 1, -- 0: inactive, 1: active (selected), 2: approved/validated
    FOREIGN KEY (act_id) REFERENCES activity_tbl(id),
    FOREIGN KEY (certificate_id) REFERENCES certificate_tbl(certificate_id)
);

-- Activity Document Table (Notice, brochure, report, attendance sheet, cert background)
CREATE TABLE IF NOT EXISTS activity_doc_tbl (
    activity_Doc_Id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_notice TEXT, -- URL/file path
    activity_brochure TEXT, -- URL/file path
    activity_report TEXT, -- URL/file path
    activity_attendance TEXT, -- URL/file path
    act_id INTEGER,
    activity_cert_design TEXT, -- JSON configuration or background image path for certificate design
    status INTEGER DEFAULT 1, -- 0: inactive, 1: active
    FOREIGN KEY (act_id) REFERENCES activity_tbl(id)
);
