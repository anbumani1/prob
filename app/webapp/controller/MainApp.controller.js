sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (Controller, JSONModel, MessageToast, MessageBox, Fragment) {
    "use strict";

    return Controller.extend("intern.portal.controller.MainApp", {

        onInit: function () {
            // Check authentication
            this._checkAuthentication();
            
            // Initialize models
            this._initializeModels();
            
            // Set up router
            this.getRouter().getRoute("RouteMainApp").attachPatternMatched(this._onRouteMatched, this);
            
            // Set up keyboard shortcuts
            this._setupKeyboardShortcuts();
        },

        _onRouteMatched: function () {
            this._checkAuthentication();
            this._loadChatHistory();
        },

        _checkAuthentication: function () {
            var isLoggedIn = sessionStorage.getItem("isLoggedIn");
            if (!isLoggedIn || isLoggedIn !== "true") {
                this.getRouter().navTo("RouteLogin");
            }
        },

        _initializeModels: function () {
            // Chat model
            var oChatModel = new JSONModel({
                newMessage: "",
                messages: [],
                isLoading: false,
                currentUser: sessionStorage.getItem("username") || "intern"
            });
            this.getView().setModel(oChatModel, "chat");

            // Navigation model
            var oNavModel = new JSONModel({
                selectedKey: "aiAssistant"
            });
            this.getView().setModel(oNavModel, "nav");

            // Activities model
            var oActivitiesModel = new JSONModel({
                activities: [
                    {
                        id: "1",
                        title: "HR Documentation & Onboarding",
                        description: "Complete all required HR forms, I-9...",
                        category: "Training",
                        priority: "High",
                        status: "Completed",
                        date: "2024-01-16",
                        timeMinutes: 120
                    },
                    {
                        id: "2",
                        title: "SAP BTP Fundamentals Training",
                        description: "Complete SAP Business Technology...",
                        category: "Learning",
                        priority: "High",
                        status: "InProgress",
                        date: "2024-01-20",
                        timeMinutes: 240
                    },
                    {
                        id: "3",
                        title: "Team Introduction Meeting",
                        description: "Meet with team members, understan...",
                        category: "Meeting",
                        priority: "Medium",
                        status: "Planned",
                        date: "2024-01-22",
                        timeMinutes: 0
                    }
                ]
            });
            this.getView().setModel(oActivitiesModel, "activities");
        },

        _setupKeyboardShortcuts: function () {
            var that = this;
            jQuery(document).on("keydown", function (e) {
                // Ctrl+Enter to send message
                if (e.ctrlKey && e.keyCode === 13) {
                    that.onSendMessage();
                }
            });
        },

        _loadChatHistory: function () {
            // Load existing chat history from server
            var that = this;
            jQuery.ajax({
                url: "/odata/v4/OnboardingService/ChatHistory",
                method: "GET",
                success: function (data) {
                    var oChatModel = that.getView().getModel("chat");
                    var aMessages = [];
                    
                    if (data.value && data.value.length > 0) {
                        data.value.forEach(function (chat) {
                            aMessages.push({
                                type: "user",
                                text: chat.userMessage,
                                timestamp: new Date(chat.timestamp)
                            });
                            aMessages.push({
                                type: "bot",
                                text: chat.botReply,
                                timestamp: new Date(chat.timestamp)
                            });
                        });
                    }
                    
                    oChatModel.setProperty("/messages", aMessages);
                    that._scrollToBottom();
                },
                error: function () {
                    console.log("Could not load chat history");
                }
            });
        },

        // Navigation Events
        onNavigationSelect: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            var oNavModel = this.getView().getModel("nav");
            oNavModel.setProperty("/selectedKey", sKey);
            
            switch (sKey) {
                case "dashboard":
                    this.getRouter().navTo("RouteWelcome");
                    break;
                case "activities":
                    this._showDailyActivities();
                    break;
                case "aiAssistant":
                case "chat":
                    this._showAIAssistant();
                    break;
                case "history":
                    this._showChatHistory();
                    break;
                case "analytics":
                    MessageToast.show("Analytics - Coming soon!");
                    break;
                case "settings":
                    MessageToast.show("Settings - Coming soon!");
                    break;
            }
        },

        // Header Actions
        onRefresh: function () {
            this._loadChatHistory();
            MessageToast.show("Chat refreshed!");
        },

        onPrint: function () {
            MessageToast.show("Print functionality - Coming soon!");
        },

        onUserProfile: function () {
            var username = sessionStorage.getItem("username") || "intern";
            MessageBox.information(
                "User: " + username + "\n" +
                "Role: Intern\n" +
                "Department: Technology\n" +
                "Start Date: " + new Date().toLocaleDateString(),
                {
                    title: "User Profile"
                }
            );
        },

        // Chat Functions
        onSendMessage: function () {
            var oChatModel = this.getView().getModel("chat");
            var sMessage = oChatModel.getProperty("/newMessage").trim();

            if (!sMessage) {
                MessageToast.show("Please enter a message");
                return;
            }

            // Add user message to UI
            this._addMessageToUI("user", sMessage);

            oChatModel.setProperty("/newMessage", "");
            oChatModel.setProperty("/isLoading", true);

            // Show typing indicator
            this._showTypingIndicator();

            // Send to AI
            this._sendToAI(sMessage);
        },

        _sendToAI: function (sMessage) {
            var that = this;
            var oChatModel = this.getView().getModel("chat");

            jQuery.ajax({
                url: "/api/chat",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({ message: sMessage }),
                success: function (data) {
                    that._hideTypingIndicator();
                    that._addMessageToUI("bot", data.reply);
                    oChatModel.setProperty("/isLoading", false);
                },
                error: function () {
                    that._hideTypingIndicator();
                    that._addMessageToUI("bot", "Sorry, I'm having trouble connecting right now. Please try again later.");
                    oChatModel.setProperty("/isLoading", false);
                }
            });
        },

        _addMessageToUI: function (sType, sText) {
            var oContainer = this.byId("chatMessagesContainer");
            var oMessageBox = new sap.m.VBox({
                class: sType === "user" ? "chat-message-user" : "chat-message-bot"
            });

            var oHBox = new sap.m.HBox({
                alignItems: "Center",
                justifyContent: sType === "user" ? "End" : "Start"
            });

            if (sType === "user") {
                var oTextBox = new sap.m.VBox({
                    class: "sapUiSmallMarginEnd"
                });
                oTextBox.addItem(new sap.m.Text({
                    text: sText,
                    class: "sapUiMediumText"
                }));
                oTextBox.addItem(new sap.m.Text({
                    text: new Date().toLocaleTimeString(),
                    class: "chat-timestamp",
                    textAlign: "End"
                }));

                oHBox.addItem(oTextBox);
                oHBox.addItem(new sap.f.Avatar({
                    displaySize: "S",
                    initials: sessionStorage.getItem("username") || "IN",
                    backgroundColor: "Accent2"
                }));
            } else {
                oHBox.addItem(new sap.f.Avatar({
                    src: "sap-icon://discussion-2",
                    displaySize: "S",
                    backgroundColor: "Accent1",
                    class: "sapUiSmallMarginEnd"
                }));

                var oTextBox = new sap.m.VBox();
                oTextBox.addItem(new sap.m.Text({
                    text: sText,
                    class: "sapUiMediumText"
                }));
                oTextBox.addItem(new sap.m.Text({
                    text: new Date().toLocaleTimeString(),
                    class: "chat-timestamp"
                }));

                oHBox.addItem(oTextBox);
            }

            oMessageBox.addItem(oHBox);
            oContainer.addItem(oMessageBox);

            this._scrollToBottom();
        },

        _showTypingIndicator: function () {
            var oContainer = this.byId("chatMessagesContainer");
            var oTypingIndicator = new sap.m.HBox({
                id: "typingIndicator",
                class: "ai-typing-indicator",
                alignItems: "Center"
            });

            oTypingIndicator.addItem(new sap.f.Avatar({
                src: "sap-icon://discussion-2",
                displaySize: "S",
                backgroundColor: "Accent1",
                class: "sapUiSmallMarginEnd"
            }));

            var oTypingText = new sap.m.Text({
                text: "AI is typing..."
            });

            var oDotsContainer = new sap.m.HBox({
                class: "typing-dots sapUiSmallMarginBegin"
            });

            for (var i = 0; i < 3; i++) {
                oDotsContainer.addItem(new sap.ui.core.HTML({
                    content: '<div class="typing-dot"></div>'
                }));
            }

            oTypingIndicator.addItem(oTypingText);
            oTypingIndicator.addItem(oDotsContainer);
            oContainer.addItem(oTypingIndicator);

            this._scrollToBottom();
        },

        _hideTypingIndicator: function () {
            var oTypingIndicator = sap.ui.getCore().byId("typingIndicator");
            if (oTypingIndicator) {
                oTypingIndicator.destroy();
            }
        },

        onQuickAction: function (oEvent) {
            var sText = oEvent.getSource().getText();
            var sMessage = "";
            
            switch (true) {
                case sText.includes("Policies"):
                    sMessage = "Tell me about company policies";
                    break;
                case sText.includes("Training"):
                    sMessage = "What training do I need to complete?";
                    break;
                case sText.includes("Tasks"):
                    sMessage = "Show me my current tasks and progress";
                    break;
                case sText.includes("Remote Work"):
                    sMessage = "What are the remote work policies?";
                    break;
                case sText.includes("Security"):
                    sMessage = "Tell me about data security guidelines";
                    break;
                case sText.includes("Help"):
                    sMessage = "I need help with my onboarding";
                    break;
            }
            
            if (sMessage) {
                var oChatModel = this.getView().getModel("chat");
                oChatModel.setProperty("/newMessage", sMessage);
                this.onSendMessage();
            }
        },

        onClearChat: function () {
            var that = this;
            MessageBox.confirm("Are you sure you want to clear the chat history?", {
                title: "Clear Chat",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        var oChatModel = that.getView().getModel("chat");
                        oChatModel.setProperty("/messages", []);
                        MessageToast.show("Chat cleared!");
                    }
                }
            });
        },

        onExportChat: function () {
            var oChatModel = this.getView().getModel("chat");
            var aMessages = oChatModel.getProperty("/messages");
            
            if (aMessages.length === 0) {
                MessageToast.show("No messages to export");
                return;
            }
            
            var sContent = "Intern Portal - Chat Export\n";
            sContent += "Generated: " + new Date().toLocaleString() + "\n\n";
            
            aMessages.forEach(function (message) {
                sContent += (message.type === "user" ? "You: " : "AI: ") + message.text + "\n";
                sContent += "Time: " + message.timestamp.toLocaleString() + "\n\n";
            });
            
            var blob = new Blob([sContent], { type: "text/plain" });
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = "chat-export-" + new Date().toISOString().split('T')[0] + ".txt";
            a.click();
            window.URL.revokeObjectURL(url);
            
            MessageToast.show("Chat exported successfully!");
        },

        _showDailyActivities: function () {
            var oNavContainer = this.byId("mainNavContainer");
            var oDailyActivitiesPage = this.byId("dailyActivitiesPage");
            oNavContainer.to(oDailyActivitiesPage);
        },

        _showAIAssistant: function () {
            var oNavContainer = this.byId("mainNavContainer");
            var oAIPage = this.byId("aiAssistantPage");
            oNavContainer.to(oAIPage);
        },

        _showChatHistory: function () {
            MessageToast.show("Showing current chat - History view coming soon!");
        },

        _scrollToBottom: function () {
            setTimeout(function () {
                var oScrollContainer = sap.ui.getCore().byId("chatScrollContainer");
                if (oScrollContainer) {
                    oScrollContainer.scrollTo(0, oScrollContainer.getScrollHeight());
                }
            }, 100);
        },

        // Formatters
        formatPriorityState: function (sPriority) {
            switch (sPriority) {
                case "High":
                    return "Error";
                case "Medium":
                    return "Warning";
                case "Low":
                    return "Success";
                default:
                    return "None";
            }
        },

        formatStatusState: function (sStatus) {
            switch (sStatus) {
                case "Completed":
                    return "Success";
                case "InProgress":
                    return "Warning";
                case "Planned":
                    return "Information";
                default:
                    return "None";
            }
        },

        // Activity Event Handlers
        onActivityPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("activities");
            var oActivity = oContext.getObject();

            MessageBox.information(
                "Activity: " + oActivity.title + "\n" +
                "Description: " + oActivity.description + "\n" +
                "Category: " + oActivity.category + "\n" +
                "Priority: " + oActivity.priority + "\n" +
                "Status: " + oActivity.status + "\n" +
                "Date: " + oActivity.date + "\n" +
                "Time: " + oActivity.timeMinutes + " minutes",
                {
                    title: "Activity Details"
                }
            );
        },

        onAddActivity: function () {
            MessageBox.confirm("Would you like to add a new activity?", {
                title: "Add New Activity",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        MessageToast.show("Add Activity functionality - Coming soon!");
                    }
                }
            });
        },

        onRefreshActivities: function () {
            MessageToast.show("Activities refreshed!");
        },

        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        }
    });
});
