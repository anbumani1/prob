// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();

// Configuration from environment variables
const PORT = process.env.PORT || 4004;
const NODE_ENV = process.env.NODE_ENV || 'development';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'openai/gpt-3.5-turbo';

// Middleware
app.use(express.json());
app.use('/app', express.static(path.join(__dirname, 'app')));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Logging middleware
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    }
    next();
});

// Mock data
const mockData = {
    CompanyPolicy: [
        {
            ID: "550e8400-e29b-41d4-a716-446655440001",
            title: "Code of Conduct",
            content: "All employees and interns are expected to maintain the highest standards of professional conduct. This includes treating all colleagues with respect and dignity, maintaining confidentiality of company information, following all safety protocols, and reporting any violations to management.",
            version: "1.0",
            effectiveFrom: "2024-01-01"
        },
        {
            ID: "550e8400-e29b-41d4-a716-446655440002",
            title: "Remote Work Policy",
            content: "Our remote work policy allows for flexible working arrangements. Remote work is available for eligible positions, employees must maintain regular communication with their team, home office setup must meet security requirements, and regular check-ins with supervisors are required.",
            version: "2.1",
            effectiveFrom: "2024-02-15"
        },
        {
            ID: "550e8400-e29b-41d4-a716-446655440003",
            title: "Data Security Guidelines",
            content: "Protecting company and customer data is everyone's responsibility. Use strong passwords and enable two-factor authentication, never share login credentials, report suspected security incidents immediately, and follow proper data handling procedures.",
            version: "1.5",
            effectiveFrom: "2024-03-01"
        }
    ],
    ChatHistory: []
};

// Company context for AI assistant
const COMPANY_CONTEXT = `
You are an AI assistant for an intern onboarding portal. You help new interns with:

COMPANY POLICIES:
1. Code of Conduct: Professional behavior, respect, confidentiality, safety protocols
2. Remote Work Policy: Flexible arrangements, communication requirements, security setup
3. Data Security: Strong passwords, 2FA, no credential sharing, incident reporting

ONBOARDING TASKS:
- HR Documentation & Onboarding
- SAP BTP Fundamentals Training  
- Team Introduction Meetings
- Learning modules and assessments

AVAILABLE FEATURES:
- Company Policy viewer for detailed policy information
- Task dashboard for tracking progress
- Chat history for previous conversations
- Welcome dashboard with navigation

Always be helpful, professional, and guide interns to the appropriate sections of the portal when needed.
Keep responses concise but informative. If asked about specific policies, refer them to the Company Policy section.
`;

// AI Chat endpoint with environment configuration
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let aiReply;

        // Try OpenAI API if key is available
        if (OPENAI_API_KEY && process.env.ENABLE_AI_CHAT === 'true') {
            try {
                const axios = require('axios');
                const response = await axios.post(OPENAI_API_URL, {
                    model: OPENAI_MODEL,
                    messages: [
                        {
                            role: 'system',
                            content: COMPANY_CONTEXT
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    max_tokens: 300,
                    temperature: 0.7
                }, {
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': `http://localhost:${PORT}`,
                        'X-Title': process.env.APP_NAME || 'Intern Portal Chatbot'
                    }
                });

                aiReply = response.data.choices[0].message.content;
                
                if (NODE_ENV === 'development') {
                    console.log('✅ OpenAI API response received');
                }
            } catch (apiError) {
                console.log('⚠️ OpenAI API Error, using fallback:', apiError.message);
                aiReply = generateFallbackResponse(message);
            }
        } else {
            console.log('ℹ️ Using fallback responses (OpenAI disabled or no API key)');
            aiReply = generateFallbackResponse(message);
        }
        
        // Create new chat entry
        const newChat = {
            ID: `550e8400-e29b-41d4-a716-${Date.now()}`,
            userMessage: message,
            botReply: aiReply,
            timestamp: new Date().toISOString()
        };
        
        // Add to mock data
        mockData.ChatHistory.push(newChat);
        
        res.json({
            reply: aiReply,
            chatEntry: newChat
        });

    } catch (error) {
        console.error('❌ Chat Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fallback response generator
function generateFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('policy') || lowerMessage.includes('policies')) {
        return "📋 You can find all company policies in the Company Policy section of the portal. We have policies covering Code of Conduct, Remote Work, and Data Security. Would you like me to guide you there?";
    } else if (lowerMessage.includes('training') || lowerMessage.includes('learn')) {
        return "🎓 Your training requirements include HR Documentation, SAP BTP Fundamentals, and Team Introduction meetings. You can track your progress in the dashboard. What specific training are you interested in?";
    } else if (lowerMessage.includes('task') || lowerMessage.includes('progress')) {
        return "✅ You can view and track all your onboarding tasks in the Welcome dashboard. Your current progress shows completed tasks and upcoming requirements. Need help with a specific task?";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        return "🤝 I'm here to help with your onboarding! You can ask me about company policies, training requirements, task progress, or how to navigate the portal. What would you like to know?";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "👋 Hello! Welcome to the intern portal. I'm your AI assistant here to help with your onboarding journey. Feel free to ask me about policies, training, or any questions you have!";
    } else if (lowerMessage.includes('remote') || lowerMessage.includes('work from home')) {
        return "🏠 Our remote work policy allows flexible arrangements for eligible positions. You'll need to maintain regular communication with your team and ensure your home office meets security requirements. Check the Company Policy section for full details!";
    } else if (lowerMessage.includes('security') || lowerMessage.includes('password')) {
        return "🔒 Data security is crucial! Use strong passwords, enable two-factor authentication, never share credentials, and report any security incidents immediately. Review our Data Security Guidelines in the policy section.";
    } else {
        return "💬 Thank you for your question! I can help you with company policies, onboarding tasks, training requirements, and portal navigation. Feel free to ask me anything about your internship experience.";
    }
}

// OData endpoints
app.get('/odata/v4/OnboardingService/CompanyPolicy', (req, res) => {
    res.json({ value: mockData.CompanyPolicy });
});

app.get('/odata/v4/OnboardingService/ChatHistory', (req, res) => {
    res.json({ value: mockData.ChatHistory });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        version: process.env.APP_VERSION || '1.0.0',
        features: {
            aiChat: process.env.ENABLE_AI_CHAT === 'true',
            notifications: process.env.ENABLE_NOTIFICATIONS === 'true',
            analytics: process.env.ENABLE_ANALYTICS === 'true'
        }
    });
});

// Test page
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'ai-test.html'));
});

// Main page
app.get('/', (req, res) => {
    res.redirect('/app/webapp/index.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 ${process.env.APP_NAME || 'Intern Portal'} Server`);
    console.log(`📍 Environment: ${NODE_ENV}`);
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`📱 UI5 App: http://localhost:${PORT}/app/webapp/index.html`);
    console.log(`🧪 Test Page: http://localhost:${PORT}/test`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
    console.log(`🤖 AI Chat: ${OPENAI_API_KEY ? '✅ Enabled' : '❌ Disabled (no API key)'}`);
    console.log(`📋 Login: username 'intern', password 'welcome'`);
    console.log('─'.repeat(60));
});
