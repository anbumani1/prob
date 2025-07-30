const cds = require('@sap/cds');

// Enable development mode
cds.env.requires.db = { kind: 'sqlite', credentials: { url: ':memory:' } };

// Start the server
cds.serve('srv/onboarding-service.cds').in(cds.app()).then(() => {
    console.log('CAP server started successfully');
    console.log('Service available at: http://localhost:4004');
    console.log('UI5 App available at: http://localhost:4004/app/webapp/index.html');
}).catch(err => {
    console.error('Error starting server:', err);
    process.exit(1);
});
