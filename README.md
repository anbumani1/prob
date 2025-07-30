# Intern Portal - Full Stack Application

A comprehensive intern onboarding portal built with SAP CAP (Cloud Application Programming Model) and Fiori freestyle UI5.

## Project Structure

```
/intern-portal
├── /app/                          # Fiori freestyle UI5 App
│   ├── /webapp/
│   │   ├── /view/                 # XML Views
│   │   │   ├── Welcome.view.xml
│   │   │   ├── CompanyPolicy.view.xml
│   │   │   ├── ChatHistory.view.xml
│   │   │   └── Login.view.xml
│   │   ├── /controller/           # JavaScript Controllers
│   │   │   ├── Welcome.controller.js
│   │   │   ├── CompanyPolicy.controller.js
│   │   │   └── ChatHistory.controller.js
│   │   ├── /model/
│   │   │   └── models.js
│   │   ├── Component.js
│   │   └── index.html
│   ├── manifest.json              # App descriptor with OData V4 config
│   └── i18n/i18n.properties      # Internationalization
├── /srv/                          # CAP service layer
│   └── onboarding-service.cds     # Service definitions
├── /db/
│   ├── schema.cds                 # Data model definitions
│   └── /data/                     # Sample data (CSV files)
├── package.json
└── README.md
```

## Features

### Frontend (UI5 Fiori Freestyle)
- **Login Page**: Simple authentication with username/password
- **Welcome Dashboard**: Overview with navigation and progress stats
- **Company Policy Viewer**: Browse and read company policies
- **Chat History**: Interactive chat interface with bot responses

### Backend (SAP CAP + AI Integration)
- **OData V4 Service**: RESTful API for data access
- **Entity Models**: Interns, Tasks, CompanyPolicy, ChatHistory
- **Sample Data**: Pre-populated CSV data for testing
- **AI Chatbot**: OpenAI-powered intelligent assistant for intern support

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- SAP CDS CLI

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd intern-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env and add your OpenAI API key
   # OPENAI_API_KEY=your-actual-api-key-here
   ```

4. Start the development server:
   ```bash
   # Start with environment variables (recommended)
   npm run start:env

   # Or use other server options:
   npm run start:basic    # Basic AI server
   npm run start:simple   # Simple server
   npm start              # CAP server
   ```

5. Access the application:
   - Main App: http://localhost:4004/app/webapp/index.html
   - AI Test Page: http://localhost:4004/test
   - Health Check: http://localhost:4004/health

### Login Credentials
- Username: `intern`
- Password: `welcome`

## Environment Configuration

The application uses environment variables for secure configuration management.

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key for AI chat | - | Yes (for AI features) |
| `OPENAI_API_URL` | OpenAI API endpoint | https://openrouter.ai/api/v1/chat/completions | No |
| `OPENAI_MODEL` | AI model to use | openai/gpt-3.5-turbo | No |
| `PORT` | Server port | 4004 | No |
| `NODE_ENV` | Environment mode | development | No |
| `ENABLE_AI_CHAT` | Enable/disable AI chat | true | No |
| `ENABLE_NOTIFICATIONS` | Enable/disable notifications | true | No |
| `SESSION_SECRET` | Session encryption key | - | Yes (production) |

### Setup Instructions

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file with your values:**
   ```bash
   # Required: Add your OpenAI API key
   OPENAI_API_KEY=sk-or-v1-your-actual-api-key-here

   # Optional: Customize other settings
   PORT=4004
   NODE_ENV=development
   ENABLE_AI_CHAT=true
   ```

3. **Start the server with environment variables:**
   ```bash
   npm run start:env
   ```

### Security Notes

- ⚠️ **Never commit .env files to version control**
- 🔒 **Keep your API keys secure and private**
- 🛡️ **Use different .env files for different environments**
- 📝 **Update .env.example when adding new variables**

## Data Model

### Entities

#### Interns
- ID (UUID)
- fullName (String)
- email (String)
- department (String)
- joinDate (Date)

#### Tasks
- ID (UUID)
- activity (String)
- category (String)
- priority (String)
- status (String)
- date (Date)
- time (Integer)
- intern (Association to Interns)

#### CompanyPolicy
- ID (UUID)
- title (String)
- content (LargeString)
- version (String)
- effectiveFrom (Date)

#### ChatHistory
- ID (UUID)
- userMessage (String)
- botReply (String)
- timestamp (Timestamp)

## API Endpoints

The CAP service exposes the following OData V4 endpoints:

- `GET /odata/v4/OnboardingService/Interns` - List all interns
- `GET /odata/v4/OnboardingService/Tasks` - List all tasks
- `GET /odata/v4/OnboardingService/CompanyPolicy` - List all policies
- `GET /odata/v4/OnboardingService/ChatHistory` - List chat history

## Development

### Adding New Views
1. Create XML view in `app/webapp/view/`
2. Create corresponding controller in `app/webapp/controller/`
3. Add route configuration in `app/manifest.json`
4. Update navigation logic in existing controllers

### Extending Data Model
1. Update `db/schema.cds` with new entities
2. Add sample data in `db/data/` (CSV format)
3. Update service definition in `srv/onboarding-service.cds`

### Customizing UI
- Modify XML views for layout changes
- Update i18n properties for text changes
- Extend controllers for new functionality

## Deployment

For production deployment, consider:
- SAP BTP (Business Technology Platform)
- Cloud Foundry
- Docker containers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
