export const schema = [
  {
    name: 'students',
    description: 'Студенты',
    fields: [
      ['id', 'INTEGER · PK'],
      ['name', 'VARCHAR(100)'],
      ['age', 'INTEGER'],
      ['group_id', 'INTEGER · FK'],
      ['enrollment_date', 'DATE'],
    ],
  },
  {
    name: 'grades',
    description: 'Оценки',
    fields: [
      ['id', 'INTEGER · PK'],
      ['student_id', 'INTEGER · FK'],
      ['subject_id', 'INTEGER · FK'],
      ['grade', 'INTEGER'],
      ['created_at', 'DATE'],
    ],
  },
  {
    name: 'subjects',
    description: 'Предметы',
    fields: [
      ['id', 'INTEGER · PK'],
      ['name', 'VARCHAR(100)'],
      ['teacher', 'VARCHAR(100)'],
    ],
  },
  {
    name: 'student_groups',
    description: 'Учебные группы',
    fields: [
      ['id', 'INTEGER · PK'],
      ['name', 'VARCHAR(30)'],
    ],
  },
];
export const seed = `
CREATE TABLE student_groups(id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE students(id INTEGER PRIMARY KEY, name TEXT, age INTEGER, group_id INTEGER REFERENCES student_groups(id), enrollment_date TEXT);
CREATE TABLE subjects(id INTEGER PRIMARY KEY, name TEXT, teacher TEXT);
CREATE TABLE grades(id INTEGER PRIMARY KEY, student_id INTEGER REFERENCES students(id), subject_id INTEGER REFERENCES subjects(id), grade INTEGER, created_at TEXT);
INSERT INTO student_groups VALUES (1,'ИС-21'),(2,'ИС-22'),(3,'ПИ-21');
INSERT INTO students VALUES (1,'Алексей Иванов',16,1,'2024-09-01'),(2,'Мария Смирнова',16,1,'2024-09-01'),(3,'Дмитрий Козлов',15,2,'2025-09-01'),(4,'Анна Соколова',16,2,'2024-09-01'),(5,'Иван Петров',15,3,'2025-09-01'),(6,'Елена Волкова',16,3,'2024-09-01'),(7,'Никита Орлов',15,NULL,'2025-09-01');
INSERT INTO subjects VALUES (1,'Базы данных','Ольга Морозова'),(2,'Программирование','Павел Белов'),(3,'Математика','Ирина Лебедева'),(4,'Дизайн','Ольга Морозова');
INSERT INTO grades VALUES (1,1,1,5,'2025-10-01'),(2,1,2,5,'2025-10-02'),(3,1,3,4,'2025-10-03'),(4,2,1,5,'2025-10-01'),(5,2,2,5,'2025-10-02'),(6,2,3,5,'2025-10-03'),(7,3,1,4,'2025-10-01'),(8,3,2,3,'2025-10-02'),(9,3,3,4,'2025-10-03'),(10,4,1,5,'2025-10-01'),(11,4,2,4,'2025-10-02'),(12,4,3,4,'2025-10-03'),(13,5,1,3,'2025-10-01'),(14,5,2,4,'2025-10-02'),(15,5,3,3,'2025-10-03'),(16,6,1,4,'2025-10-01'),(17,6,2,4,'2025-10-02'),(18,6,3,4,'2025-10-03');`;
