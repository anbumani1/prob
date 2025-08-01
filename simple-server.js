const express = require('express');
const path = require('path');
const app = express();
const port = 4004;

// OpenAI Configuration
const OPENAI_API_KEY = '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';
const OPENAI_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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

// Serve static files from the app directory
app.use('/app', express.static(path.join(__dirname, 'app')));

// Mock OData service endpoints
app.use(express.json());

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
  ChatHistory: [
    {
      ID: "550e8400-e29b-41d4-a716-446655440031",
      userMessage: "What is the leave policy?",
      botReply: "You are allowed 20 paid leaves per year. Please check our Company Policy section for detailed information.",
      timestamp: "2025-07-29T10:00:00Z"
    },
    {
      ID: "550e8400-e29b-41d4-a716-446655440032",
      userMessage: "How to access SAP BTP Training?",
      botReply: "You can access it via the Learning tab in the portal. I can guide you through the onboarding process if needed.",
      timestamp: "2025-07-29T10:05:00Z"
    },
    {
      ID: "550e8400-e29b-41d4-a716-446655440033",
      userMessage: "What are my tasks for today?",
      botReply: "You have 3 pending tasks in your dashboard. Would you like me to show you the details?",
      timestamp: "2025-07-29T10:10:00Z"
    }
  ]
};

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Try to use axios for OpenAI API call
    let aiReply;
    try {
      const axios = require('axios');
      const response = await axios.post(OPENAI_API_URL, {
        model: 'openai/gpt-3.5-turbo',
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
          'HTTP-Referer': 'http://localhost:4004',
          'X-Title': 'Intern Portal Chatbot'
        }
      });

      aiReply = response.data.choices[0].message.content;
    } catch (apiError) {
      console.log('AI API Error, using fallback response:', apiError.message);

      // Intelligent fallback responses based on keywords
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('policy') || lowerMessage.includes('policies')) {
        aiReply = "You can find all company policies in the Company Policy section of the portal. We have policies covering Code of Conduct, Remote Work, and Data Security. Would you like me to guide you there?";
      } else if (lowerMessage.includes('training') || lowerMessage.includes('learn')) {
        aiReply = "Your training requirements include HR Documentation, SAP BTP Fundamentals, and Team Introduction meetings. You can track your progress in the dashboard. What specific training are you interested in?";
      } else if (lowerMessage.includes('task') || lowerMessage.includes('progress')) {
        aiReply = "You can view and track all your onboarding tasks in the Welcome dashboard. Your current progress shows completed tasks and upcoming requirements. Need help with a specific task?";
      } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        aiReply = "I'm here to help with your onboarding! You can ask me about company policies, training requirements, task progress, or how to navigate the portal. What would you like to know?";
      } else {
        aiReply = "Thank you for your question! I can help you with company policies, onboarding tasks, training requirements, and portal navigation. Feel free to ask me anything about your internship experience.";
      }
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

// Mock OData endpoints
app.get('/odata/v4/OnboardingService/CompanyPolicy', (req, res) => {
  res.json({ value: mockData.CompanyPolicy });
});

app.get('/odata/v4/OnboardingService/ChatHistory', (req, res) => {
  res.json({ value: mockData.ChatHistory });
});

app.post('/odata/v4/OnboardingService/ChatHistory', (req, res) => {
  const newChat = req.body;
  newChat.ID = newChat.ID || `550e8400-e29b-41d4-a716-${Date.now()}`;
  mockData.ChatHistory.push(newChat);
  res.status(201).json(newChat);
});

// Serve the AI test page
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'ai-test.html'));
});

// Serve the basic test page
app.get('/test-basic', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-app.html'));
});

// Serve the main page
app.get('/', (req, res) => {
  res.redirect('/app/webapp/index.html');
});

app.listen(port, () => {
  console.log(`🤖 AI-Powered Intern Portal running at http://localhost:${port}`);
  console.log(`📱 UI5 App: http://localhost:${port}/app/webapp/index.html`);
  console.log(`🧪 AI Test Page: http://localhost:${port}/test`);
  console.log(`🔗 OData Service: http://localhost:${port}/odata/v4/OnboardingService/`);
  console.log(`🧠 AI Chat API: http://localhost:${port}/api/chat`);
  console.log(`\n📋 Login Credentials:`);
  console.log(`   Username: intern`);
  console.log(`   Password: welcome`);
  console.log(`\n🤖 AI Assistant: OpenAI GPT-3.5-turbo with intelligent fallbacks`);
});
