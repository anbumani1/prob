sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("intern.portal.controller.ChatHistory", {

        onInit: function () {
            // Check authentication
            this._checkAuthentication();
            
            // Initialize chat model
            var oChatModel = new JSONModel({
                newMessage: ""
            });
            this.getView().setModel(oChatModel, "chat");
            
            // Set up router
            this.getRouter().getRoute("RouteChatHistory").attachPatternMatched(this._onRouteMatched, this);
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

        _loadChatHistory: function () {
            // Get OData model and bind to the view
            var oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(oModel);
            
            // Refresh the binding
            var oList = this.byId("chatList");
            if (oList.getBinding("items")) {
                oList.getBinding("items").refresh();
            }
            
            // Scroll to bottom
            this._scrollToBottom();
        },

        onSendMessage: function () {
            var oChatModel = this.getView().getModel("chat");
            var sMessage = oChatModel.getProperty("/newMessage");
            
            if (!sMessage || sMessage.trim() === "") {
                MessageToast.show("Please enter a message");
                return;
            }
            
            // Get current user
            var sUserName = sessionStorage.getItem("username") || "User";
            
            // Create new chat entry
            var oNewChat = {
                ID: this._generateUUID(),
                userMessage: sMessage.trim(),
                botReply: this._generateBotResponse(sMessage.trim()),
                timestamp: new Date().toISOString()
            };
            
            // Add to OData model (in real app, this would be a POST request)
            var oModel = this.getOwnerComponent().getModel();
            var oBinding = oModel.bindList("/ChatHistory");
            
            try {
                oBinding.create(oNewChat);
                
                // Clear input
                oChatModel.setProperty("/newMessage", "");
                
                // Scroll to bottom after a short delay
                setTimeout(this._scrollToBottom.bind(this), 100);
                
            } catch (error) {
                MessageToast.show("Error sending message: " + error.message);
            }
        },

        _generateBotResponse: function (sMessage) {
            // Simple bot responses (in real app, this would be AI-powered)
            var aResponses = [
                "Thank you for your message. How can I help you with your onboarding?",
                "I understand your question. Let me provide you with the relevant information.",
                "That's a great question! Here's what you need to know...",
                "I'm here to help you with your internship journey. What else would you like to know?",
                "Based on your question, I recommend checking our company policies section."
            ];
            
            // Simple keyword-based responses
            if (sMessage.toLowerCase().includes("policy")) {
                return "You can find all company policies in the Company Policy section. Would you like me to guide you there?";
            } else if (sMessage.toLowerCase().includes("help")) {
                return "I'm here to help! You can ask me about company policies, onboarding tasks, or any other questions about your internship.";
            } else if (sMessage.toLowerCase().includes("task")) {
                return "Your current tasks are available in your dashboard. You've completed 5 tasks so far. Keep up the great work!";
            }
            
            return aResponses[Math.floor(Math.random() * aResponses.length)];
        },

        _generateUUID: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        _scrollToBottom: function () {
            var oScrollContainer = this.byId("chatContainer");
            if (oScrollContainer) {
                setTimeout(function() {
                    oScrollContainer.scrollTo(0, oScrollContainer.getDomRef().scrollHeight);
                }, 50);
            }
        },

        onNavBack: function () {
            this.getRouter().navTo("RouteWelcome");
        },

        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        }
    });
});
