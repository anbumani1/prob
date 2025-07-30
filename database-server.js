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

// Initialize SQLite database - use the CAP database file
const dbPath = path.join(__dirname, 'db', 'intern-portal.db');
const db = new sqlite3.Database(dbPath);

// Check if database exists and is properly initialized
function initializeDatabase() {
    console.log('🔧 Checking database connection...');

    // Check if CAP tables exist
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='intern_portal_CompanyPolicy'", (err, row) => {
        if (err) {
            console.error('❌ Database connection error:', err.message);
        } else if (row) {
            console.log('✅ CAP database tables found - using persistent SQLite database');
            checkDataIntegrity();
        } else {
            console.log('⚠️  CAP tables not found - database may need to be deployed');
            console.log('💡 Run: npx cds deploy --to sqlite:db/intern-portal.db');
        }
    });
}

function checkDataIntegrity() {
    db.get("SELECT COUNT(*) as count FROM intern_portal_CompanyPolicy", (err, row) => {
        if (!err && row) {
            console.log(`📊 Found ${row.count} company policies in database`);
        }
    });

    db.get("SELECT COUNT(*) as count FROM intern_portal_Tasks", (err, row) => {
        if (!err && row) {
            console.log(`📊 Found ${row.count} tasks in database`);
        }
    });

    db.get("SELECT COUNT(*) as count FROM intern_portal_Interns", (err, row) => {
        if (!err && row) {
            console.log(`📊 Found ${row.count} interns in database`);
        }
    });
}

// Data insertion is handled by CAP deployment from CSV files

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
    db.all('SELECT * FROM intern_portal_CompanyPolicy', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ value: rows });
    });
});

// Tasks
app.get('/odata/v4/OnboardingService/Tasks', (req, res) => {
    db.all('SELECT * FROM intern_portal_Tasks', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ value: rows });
    });
});

// Interns
app.get('/odata/v4/OnboardingService/Interns', (req, res) => {
    db.all('SELECT * FROM intern_portal_Interns', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ value: rows });
    });
});

// Chat History
app.get('/odata/v4/OnboardingService/ChatHistory', (req, res) => {
    db.all('SELECT * FROM intern_portal_ChatHistory ORDER BY timestamp DESC', (err, rows) => {
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

    db.run(`INSERT INTO intern_portal_ChatHistory (ID, userMessage, botReply, timestamp) VALUES (?, ?, ?, ?)`,
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
        db.get('SELECT COUNT(*) as count FROM intern_portal_CompanyPolicy', (err, row) => {
            if (!err) stats.policies = row.count;
        });

        db.get('SELECT COUNT(*) as count FROM intern_portal_Tasks', (err, row) => {
            if (!err) stats.tasks = row.count;
        });

        db.get('SELECT COUNT(*) as count FROM intern_portal_Interns', (err, row) => {
            if (!err) stats.interns = row.count;
        });

        db.get('SELECT COUNT(*) as count FROM intern_portal_ChatHistory', (err, row) => {
            if (!err) stats.chatHistory = row.count;

            res.json({
                database: 'SQLite (Persistent)',
                file: dbPath,
                type: 'CAP Database',
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
