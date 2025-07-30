sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("intern.portal.controller.Login", {

        onInit: function () {
            // Initialize login model
            var oLoginModel = new JSONModel({
                username: "",
                password: ""
            });
            this.getView().setModel(oLoginModel);
        },

        onLogin: function () {
            var oModel = this.getView().getModel();
            var sUsername = oModel.getProperty("/username");
            var sPassword = oModel.getProperty("/password");
            var oMessageStrip = this.byId("loginMessage");

            // Simple validation
            if (!sUsername || !sPassword) {
                oMessageStrip.setText("Please enter both username and password");
                oMessageStrip.setVisible(true);
                return;
            }

            // Simple authentication (in real app, this would be server-side)
            if (sUsername === "intern" && sPassword === "welcome") {
                // Hide error message
                oMessageStrip.setVisible(false);
                
                // Store user session (simplified)
                sessionStorage.setItem("isLoggedIn", "true");
                sessionStorage.setItem("username", sUsername);
                
                // Navigate to welcome page
                this.getRouter().navTo("RouteWelcome");
                
                MessageToast.show("Login successful!");
            } else {
                oMessageStrip.setText(this.getView().getModel("i18n").getResourceBundle().getText("loginError"));
                oMessageStrip.setVisible(true);
            }
        },

        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        }
    });
});
