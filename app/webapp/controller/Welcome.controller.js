sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("intern.portal.controller.Welcome", {

        onInit: function () {
            // Check if user is logged in
            this._checkAuthentication();
            
            // Initialize welcome page data
            var oWelcomeModel = new JSONModel({
                tasksCompleted: 5,
                policiesRead: 3,
                daysRemaining: 25
            });
            this.getView().setModel(oWelcomeModel);
            
            // Set up router
            this.getRouter().getRoute("RouteWelcome").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._checkAuthentication();
        },

        _checkAuthentication: function () {
            var isLoggedIn = sessionStorage.getItem("isLoggedIn");
            if (!isLoggedIn || isLoggedIn !== "true") {
                this.getRouter().navTo("RouteLogin");
            }
        },

        onNavigateToPolicy: function () {
            this.getRouter().navTo("RouteCompanyPolicy");
        },

        onNavigateToChat: function () {
            this.getRouter().navTo("RouteChatHistory");
        },

        onLogout: function () {
            // Clear session
            sessionStorage.removeItem("isLoggedIn");
            sessionStorage.removeItem("username");
            
            // Navigate to login
            this.getRouter().navTo("RouteLogin");
        },

        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        }
    });
});
