const express = require('express');
const path = require('path');
const app = express();
const port = 4004;

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

// Serve the test page
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-app.html'));
});

// Serve the main page
app.get('/', (req, res) => {
  res.redirect('/app/webapp/index.html');
});

app.listen(port, () => {
  console.log(`🚀 Intern Portal Server running at http://localhost:${port}`);
  console.log(`📱 UI5 App: http://localhost:${port}/app/webapp/index.html`);
  console.log(`🔗 OData Service: http://localhost:${port}/odata/v4/OnboardingService/`);
  console.log(`\n📋 Login Credentials:`);
  console.log(`   Username: intern`);
  console.log(`   Password: welcome`);
});
