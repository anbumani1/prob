const express = require('express');
const path = require('path');
const app = express();
const port = 4004;

// Middleware
app.use(express.json());
app.use('/app', express.static(path.join(__dirname, 'app')));

// Mock data
const mockData = {
  CompanyPolicy: [
    {
      ID: "550e8400-e29b-41d4-a716-446655440001",
      title: "Code of Conduct",
      content: "All employees and interns are expected to maintain the highest standards of professional conduct.",
      version: "1.0",
      effectiveFrom: "2024-01-01"
    },
    {
      ID: "550e8400-e29b-41d4-a716-446655440002",
      title: "Remote Work Policy",
      content: "Our remote work policy allows for flexible working arrangements with proper communication.",
      version: "2.1",
      effectiveFrom: "2024-02-15"
    }
  ],
  ChatHistory: []
};

// Simple AI Chat endpoint with fallback responses
app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Smart fallback responses based on keywords
    let aiReply;
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('policy') || lowerMessage.includes('policies')) {
      aiReply = "📋 You can find all company policies in the Company Policy section of the portal. We have policies covering Code of Conduct, Remote Work, and Data Security. Would you like me to guide you there?";
    } else if (lowerMessage.includes('training') || lowerMessage.includes('learn')) {
      aiReply = "🎓 Your training requirements include HR Documentation, SAP BTP Fundamentals, and Team Introduction meetings. You can track your progress in the dashboard. What specific training are you interested in?";
    } else if (lowerMessage.includes('task') || lowerMessage.includes('progress')) {
      aiReply = "✅ You can view and track all your onboarding tasks in the Welcome dashboard. Your current progress shows completed tasks and upcoming requirements. Need help with a specific task?";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      aiReply = "🤝 I'm here to help with your onboarding! You can ask me about company policies, training requirements, task progress, or how to navigate the portal. What would you like to know?";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      aiReply = "👋 Hello! Welcome to the intern portal. I'm your AI assistant here to help with your onboarding journey. Feel free to ask me about policies, training, or any questions you have!";
    } else if (lowerMessage.includes('remote') || lowerMessage.includes('work from home')) {
      aiReply = "🏠 Our remote work policy allows flexible arrangements for eligible positions. You'll need to maintain regular communication with your team and ensure your home office meets security requirements. Check the Company Policy section for full details!";
    } else if (lowerMessage.includes('security') || lowerMessage.includes('password')) {
      aiReply = "🔒 Data security is crucial! Use strong passwords, enable two-factor authentication, never share credentials, and report any security incidents immediately. Review our Data Security Guidelines in the policy section.";
    } else {
      aiReply = "💬 Thank you for your question! I can help you with company policies, onboarding tasks, training requirements, and portal navigation. Feel free to ask me anything about your internship experience.";
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
    console.error('Chat Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// OData endpoints
app.get('/odata/v4/OnboardingService/CompanyPolicy', (req, res) => {
  res.json({ value: mockData.CompanyPolicy });
});

app.get('/odata/v4/OnboardingService/ChatHistory', (req, res) => {
  res.json({ value: mockData.ChatHistory });
});

// Test page
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'ai-test.html'));
});

// Main page
app.get('/', (req, res) => {
  res.redirect('/app/webapp/index.html');
});

// Start server
app.listen(port, () => {
  console.log(`🤖 AI-Powered Intern Portal running at http://localhost:${port}`);
  console.log(`📱 UI5 App: http://localhost:${port}/app/webapp/index.html`);
  console.log(`🧪 AI Test Page: http://localhost:${port}/test`);
  console.log(`🧠 AI Chat API: http://localhost:${port}/api/chat`);
  console.log(`\n📋 Login: username 'intern', password 'welcome'`);
  console.log(`🤖 AI Assistant: Smart keyword-based responses ready!`);
});
