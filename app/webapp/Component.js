sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "intern/portal/model/models"
], function (UIComponent, Device, JSONModel, models) {
    "use strict";

    return UIComponent.extend("intern.portal.Component", {

        metadata: {
            manifest: "json"
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * @public
         * @override
         */
        init: function () {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // create and set user model
            this.setModel(models.createUserModel(), "user");

            // create and set app state model
            this.setModel(models.createAppStateModel(), "appState");

            // enable routing
            this.getRouter().initialize();

            // setup error handling
            this._setupErrorHandling();
        },

        /**
         * Setup global error handling
         * @private
         */
        _setupErrorHandling: function () {
            sap.ui.getCore().attachParseError(function (oEvent) {
                var oError = oEvent.getParameter("error");
                sap.m.MessageToast.show("Parse Error: " + oError.message);
            });

            sap.ui.getCore().attachValidationError(function (oEvent) {
                var oError = oEvent.getParameter("error");
                sap.m.MessageToast.show("Validation Error: " + oError.message);
            });
        },

        /**
         * Get the content density class
         * @public
         * @returns {string} CSS class for content density
         */
        getContentDensityClass: function () {
            if (!this._sContentDensityClass) {
                if (!Device.support.touch) {
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        }
    });
});
