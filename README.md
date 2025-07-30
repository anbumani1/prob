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

3. Start the development server:
   ```bash
   npm start
   ```

4. Access the application:
   - CAP Service: http://localhost:4004
   - UI5 App: http://localhost:4004/app/webapp/index.html

### Login Credentials
- Username: `intern`
- Password: `welcome`

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
