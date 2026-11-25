const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let db;

const initDb = async () => {
    if (!db) {
        db = await open({
            filename: 'C:/Users/goroshek/Desktop/колледж/4 курс/sqllite/Photobooth.db',
            driver: sqlite3.Database
        });
    }

    // Включаем поддержку внешних ключей
    await db.exec('PRAGMA foreign_keys = ON;');

    // Роли
    await db.exec(`
        CREATE TABLE IF NOT EXISTS Roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )`);

    // Пользователи
    await db.exec(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role_id_FK INTEGER NOT NULL,
            name TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT,
            FOREIGN KEY (role_id_FK) REFERENCES Roles(id)
        )`);

    // Профили фотографов
    await db.exec(`
        CREATE TABLE IF NOT EXISTS Profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id_FK INTEGER NOT NULL UNIQUE,
            city TEXT,
            genres TEXT,
            price_hour INTEGER,
            description TEXT,
            avatar_url TEXT,
            FOREIGN KEY (user_id_FK) REFERENCES Users(id) ON DELETE CASCADE
        )`);

    // Проекты
    await db.exec(`
        CREATE TABLE IF NOT EXISTS Projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id_FK INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            genre TEXT,
            shoot_date TEXT,
            is_private INTEGER NOT NULL DEFAULT 0,
            access_password TEXT,
            cover_photo_url TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (profile_id_FK) REFERENCES Profiles(id) ON DELETE CASCADE
        )`);

    // Фотографии
    await db.exec(`
        CREATE TABLE IF NOT EXISTS Photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id_FK INTEGER NOT NULL,
            file_path TEXT NOT NULL,
            uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (project_id_FK) REFERENCES Projects(id) ON DELETE CASCADE
        )`);

    // Заявки
    await db.exec(`
        CREATE TABLE IF NOT EXISTS Requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id_FK INTEGER,
            photographer_id_FK INTEGER NOT NULL,
            name TEXT NOT NULL,
            contact TEXT NOT NULL,
            desired_date TEXT,
            genre TEXT,
            comment TEXT,
            status TEXT NOT NULL DEFAULT 'new',
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (customer_id_FK) REFERENCES Users(id),
            FOREIGN KEY (photographer_id_FK) REFERENCES Profiles(id)
        )`);

    // Стартовые роли (если их ещё нет)
    const rolesCount = await db.get('SELECT COUNT(*) as count FROM Roles');
    if (rolesCount.count === 0) {
        await db.run('INSERT INTO Roles (name) VALUES (?)', ['photographer']);
        await db.run('INSERT INTO Roles (name) VALUES (?)', ['customer']);
    }
};

const getDb = () => db;

module.exports = {
    initDb,
    getDb
};