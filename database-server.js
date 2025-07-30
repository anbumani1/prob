// Database Server with SQLite integration
require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.DB_PORT || 4005;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});

// Initialize SQLite database
const dbPath = path.join(__dirname, 'intern-portal.db');
const db = new sqlite3.Database(dbPath);

// Create tables and insert initial data
function initializeDatabase() {
    console.log('🔧 Initializing database...');
    
    // Create tables
    db.serialize(() => {
        // Company Policy table
        db.run(`CREATE TABLE IF NOT EXISTS CompanyPolicy (
            ID TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            version TEXT NOT NULL,
            effectiveFrom DATE NOT NULL
        )`);

        // Tasks table
        db.run(`CREATE TABLE IF NOT EXISTS Tasks (
            ID TEXT PRIMARY KEY,
            activity TEXT NOT NULL,
            category TEXT NOT NULL,
            priority TEXT NOT NULL,
            status TEXT NOT NULL,
            date DATE NOT NULL,
            time INTEGER NOT NULL,
            intern_ID TEXT
        )`);

        // Interns table
        db.run(`CREATE TABLE IF NOT EXISTS Interns (
            ID TEXT PRIMARY KEY,
            fullName TEXT NOT NULL,
            email TEXT NOT NULL,
            department TEXT NOT NULL,
            joinDate DATE NOT NULL
        )`);

        // Chat History table
        db.run(`CREATE TABLE IF NOT EXISTS ChatHistory (
            ID TEXT PRIMARY KEY,
            userMessage TEXT NOT NULL,
            botReply TEXT NOT NULL,
            timestamp DATETIME NOT NULL
        )`);

        // Insert initial data
        insertInitialData();
    });
}

function insertInitialData() {
    console.log('📊 Inserting initial data...');
    
    // Company Policies
    const policies = [
        {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Code of Conduct',
            content: 'All employees and interns are expected to maintain the highest standards of professional conduct. This includes treating all colleagues with respect and dignity, maintaining confidentiality of company information, following all safety protocols, and reporting any violations to management.',
            version: '1.0',
            effectiveFrom: '2024-01-01'
        },
        {
            id: '550e8400-e29b-41d4-a716-446655440002',
            title: 'Remote Work Policy',
            content: 'Our remote work policy allows for flexible working arrangements. Remote work is available for eligible positions, employees must maintain regular communication with their team, home office setup must meet security requirements, and regular check-ins with supervisors are required.',
            version: '2.1',
            effectiveFrom: '2024-02-15'
        },
        {
            id: '550e8400-e29b-41d4-a716-446655440003',
            title: 'Data Security Guidelines',
            content: 'Protecting company and customer data is everyone\'s responsibility. Use strong passwords and enable two-factor authentication, never share login credentials, report suspected security incidents immediately, and follow proper data handling procedures.',
            version: '1.5',
            effectiveFrom: '2024-03-01'
        }
    ];

    policies.forEach(policy => {
        db.run(`INSERT OR REPLACE INTO CompanyPolicy (ID, title, content, version, effectiveFrom) 
                VALUES (?, ?, ?, ?, ?)`, 
                [policy.id, policy.title, policy.content, policy.version, policy.effectiveFrom]);
    });

    // Sample Tasks
    const tasks = [
        {
            id: '550e8400-e29b-41d4-a716-446655440011',
            activity: 'HR Documentation & Onboarding',
            category: 'Training',
            priority: 'High',
            status: 'Completed',
            date: '2024-01-16',
            time: 120,
            intern_ID: '550e8400-e29b-41d4-a716-446655440001'
        },
        {
            id: '550e8400-e29b-41d4-a716-446655440012',
            activity: 'SAP BTP Fundamentals Training',
            category: 'Learning',
            priority: 'High',
            status: 'InProgress',
            date: '2024-01-29',
            time: 240,
            intern_ID: '550e8400-e29b-41d4-a716-446655440001'
        },
        {
            id: '550e8400-e29b-41d4-a716-446655440013',
            activity: 'Team Introduction Meeting',
            category: 'Meeting',
            priority: 'Medium',
            status: 'Planned',
            date: '2024-01-22',
            time: 0,
            intern_ID: '550e8400-e29b-41d4-a716-446655440002'
        }
    ];

    tasks.forEach(task => {
        db.run(`INSERT OR REPLACE INTO Tasks (ID, activity, category, priority, status, date, time, intern_ID) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
                [task.id, task.activity, task.category, task.priority, task.status, task.date, task.time, task.intern_ID]);
    });

    // Sample Interns
    const interns = [
        {
            id: '550e8400-e29b-41d4-a716-446655440001',
            fullName: 'John Doe',
            email: 'john.doe@company.com',
            department: 'Technology',
            joinDate: '2024-01-15'
        },
        {
            id: '550e8400-e29b-41d4-a716-446655440002',
            fullName: 'Jane Smith',
            email: 'jane.smith@company.com',
            department: 'Marketing',
            joinDate: '2024-01-20'
        }
    ];

    interns.forEach(intern => {
        db.run(`INSERT OR REPLACE INTO Interns (ID, fullName, email, department, joinDate) 
                VALUES (?, ?, ?, ?, ?)`, 
                [intern.id, intern.fullName, intern.email, intern.department, intern.joinDate]);
    });

    console.log('✅ Initial data inserted successfully!');
}

// API Endpoints

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        database: 'SQLite',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Company Policies
app.get('/odata/v4/OnboardingService/CompanyPolicy', (req, res) => {
    db.all('SELECT * FROM CompanyPolicy', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ value: rows });
    });
});

// Tasks
app.get('/odata/v4/OnboardingService/Tasks', (req, res) => {
    db.all('SELECT * FROM Tasks', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ value: rows });
    });
});

// Interns
app.get('/odata/v4/OnboardingService/Interns', (req, res) => {
    db.all('SELECT * FROM Interns', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ value: rows });
    });
});

// Chat History
app.get('/odata/v4/OnboardingService/ChatHistory', (req, res) => {
    db.all('SELECT * FROM ChatHistory ORDER BY timestamp DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ value: rows });
    });
});

// Add chat entry
app.post('/odata/v4/OnboardingService/ChatHistory', (req, res) => {
    const { ID, userMessage, botReply, timestamp } = req.body;
    
    db.run(`INSERT INTO ChatHistory (ID, userMessage, botReply, timestamp) VALUES (?, ?, ?, ?)`,
        [ID, userMessage, botReply, timestamp], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ 
                success: true, 
                id: this.lastID,
                message: 'Chat entry added successfully' 
            });
        });
});

// Database statistics
app.get('/db/stats', (req, res) => {
    const stats = {};
    
    db.serialize(() => {
        db.get('SELECT COUNT(*) as count FROM CompanyPolicy', (err, row) => {
            if (!err) stats.policies = row.count;
        });
        
        db.get('SELECT COUNT(*) as count FROM Tasks', (err, row) => {
            if (!err) stats.tasks = row.count;
        });
        
        db.get('SELECT COUNT(*) as count FROM Interns', (err, row) => {
            if (!err) stats.interns = row.count;
        });
        
        db.get('SELECT COUNT(*) as count FROM ChatHistory', (err, row) => {
            if (!err) stats.chatHistory = row.count;
            
            res.json({
                database: 'SQLite',
                file: dbPath,
                statistics: stats,
                timestamp: new Date().toISOString()
            });
        });
    });
});

// Initialize database and start server
initializeDatabase();

app.listen(PORT, () => {
    console.log(`🗄️  Database Server Running`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🗃️  Database: ${dbPath}`);
    console.log(`🌐 Health Check: http://localhost:${PORT}/health`);
    console.log(`📊 Database Stats: http://localhost:${PORT}/db/stats`);
    console.log(`📋 Company Policies: http://localhost:${PORT}/odata/v4/OnboardingService/CompanyPolicy`);
    console.log(`✅ Tasks: http://localhost:${PORT}/odata/v4/OnboardingService/Tasks`);
    console.log(`👥 Interns: http://localhost:${PORT}/odata/v4/OnboardingService/Interns`);
    console.log(`💬 Chat History: http://localhost:${PORT}/odata/v4/OnboardingService/ChatHistory`);
    console.log('─'.repeat(80));
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down database server...');
    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed.');
        }
        process.exit(0);
    });
});
