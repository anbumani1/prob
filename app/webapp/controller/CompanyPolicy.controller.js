sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("intern.portal.controller.CompanyPolicy", {

        onInit: function () {
            // Check authentication
            this._checkAuthentication();
            
            // Initialize selected policy model
            var oSelectedPolicyModel = new JSONModel({
                selectedPolicy: null
            });
            this.getView().setModel(oSelectedPolicyModel, "selectedPolicy");
            
            // Set up router
            this.getRouter().getRoute("RouteCompanyPolicy").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._checkAuthentication();
            this._loadPolicies();
        },

        _checkAuthentication: function () {
            var isLoggedIn = sessionStorage.getItem("isLoggedIn");
            if (!isLoggedIn || isLoggedIn !== "true") {
                this.getRouter().navTo("RouteLogin");
            }
        },

        _loadPolicies: function () {
            // Get OData model and bind to the view
            var oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(oModel);
            
            // Refresh the binding
            var oList = this.byId("policyList");
            if (oList.getBinding("items")) {
                oList.getBinding("items").refresh();
            }
        },

        onPolicySelect: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("listItem");
            var oContext = oSelectedItem.getBindingContext();
            var oSelectedPolicy = oContext.getObject();
            
            // Update selected policy model
            this.getView().getModel("selectedPolicy").setProperty("/selectedPolicy", oSelectedPolicy);
            
            // Update detail panel
            this.byId("selectedPolicyTitle").setText(oSelectedPolicy.title);
            this.byId("selectedPolicyVersion").setText("Version: " + oSelectedPolicy.version);
            this.byId("selectedPolicyDate").setText("Effective from: " + oSelectedPolicy.effectiveFrom);
            this.byId("selectedPolicyContent").setHtmlText(oSelectedPolicy.content || "No content available");
            
            // Show detail panel
            this.byId("policyDetailPanel").setVisible(true);
        },

        onRefresh: function () {
            this._loadPolicies();
            MessageToast.show("Policies refreshed");
        },

        onNavBack: function () {
            this.getRouter().navTo("RouteWelcome");
        },

        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        }
    });
});
