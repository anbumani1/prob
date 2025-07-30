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

            // Clear input immediately and show loading
            oChatModel.setProperty("/newMessage", "");
            MessageToast.show("Sending message...");

            // Send message to AI API
            this._sendToAI(sMessage.trim());
        },

        _sendToAI: function (sMessage) {
            var that = this;

            // Call AI API
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: sMessage
                })
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                // Refresh chat history to show new message
                that._loadChatHistory();
                MessageToast.show("Message sent successfully!");
            })
            .catch(function(error) {
                console.error('Error:', error);
                MessageToast.show("Error sending message. Please try again.");

                // Fallback: create local entry
                that._createFallbackMessage(sMessage);
            });
        },

        _createFallbackMessage: function (sMessage) {
            var oNewChat = {
                ID: this._generateUUID(),
                userMessage: sMessage,
                botReply: "I'm here to help with your onboarding questions! You can ask me about company policies, training requirements, or navigate to different sections of the portal.",
                timestamp: new Date().toISOString()
            };

            // Add to OData model
            var oModel = this.getOwnerComponent().getModel();
            var oBinding = oModel.bindList("/ChatHistory");

            try {
                oBinding.create(oNewChat);
                this._scrollToBottom();
            } catch (error) {
                MessageToast.show("Error creating message: " + error.message);
            }
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
