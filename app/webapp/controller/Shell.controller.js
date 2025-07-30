sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("intern.portal.controller.Shell", {

        onInit: function () {
            // Initialize shell
            this._initializeShell();
            
            // Setup router events
            this._setupRouterEvents();
            
            // Load user data
            this._loadUserData();
            
            // Setup notifications
            this._setupNotifications();
        },

        _initializeShell: function () {
            // Set initial app state
            var oAppStateModel = this.getOwnerComponent().getModel("appState");
            oAppStateModel.setProperty("/shellHeaderVisible", true);
            oAppStateModel.setProperty("/footerVisible", true);
            
            // Apply content density class
            var sContentDensityClass = this.getOwnerComponent().getContentDensityClass();
            this.getView().addStyleClass(sContentDensityClass);
        },

        _setupRouterEvents: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.attachRouteMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sRouteName = oEvent.getParameter("name");
            var oAppStateModel = this.getOwnerComponent().getModel("appState");
            
            // Update current view
            var sViewName = this._getViewNameFromRoute(sRouteName);
            oAppStateModel.setProperty("/currentView", sViewName);
            
            // Update breadcrumbs
            this._updateBreadcrumbs(sViewName);
        },

        _getViewNameFromRoute: function (sRouteName) {
            var mRouteToView = {
                "RouteLogin": "Login",
                "RouteWelcome": "Welcome",
                "RouteCompanyPolicy": "Company Policies",
                "RouteChatHistory": "AI Assistant",
                "RouteTasks": "My Tasks",
                "RouteProfile": "Profile"
            };
            return mRouteToView[sRouteName] || "Intern Portal";
        },

        _updateBreadcrumbs: function (sViewName) {
            var oAppStateModel = this.getOwnerComponent().getModel("appState");
            var aBreadcrumbs = [
                { text: "Home", route: "RouteWelcome" },
                { text: sViewName, route: null }
            ];
            oAppStateModel.setProperty("/breadcrumbs", aBreadcrumbs);
        },

        _loadUserData: function () {
            // Simulate loading user data
            var oUserModel = this.getOwnerComponent().getModel("user");
            var sUsername = sessionStorage.getItem("username") || "Intern";
            
            oUserModel.setData({
                name: sUsername === "intern" ? "John Doe" : sUsername,
                email: "john.doe@company.com",
                department: "SAP BTP",
                role: "Software Engineering Intern",
                avatar: "",
                isLoggedIn: true,
                preferences: {
                    theme: "sap_horizon",
                    language: "en",
                    notifications: true
                },
                stats: {
                    tasksCompleted: 7,
                    policiesRead: 3,
                    daysRemaining: 23,
                    progressPercentage: 65
                }
            });
        },

        _setupNotifications: function () {
            var oAppStateModel = this.getOwnerComponent().getModel("appState");
            var aNotifications = [
                {
                    title: "Welcome to the Intern Portal!",
                    description: "Complete your onboarding tasks to get started.",
                    timestamp: "2 hours ago",
                    icon: "sap-icon://hello-world",
                    type: "Information"
                },
                {
                    title: "New Policy Update",
                    description: "Remote Work Policy has been updated. Please review.",
                    timestamp: "1 day ago",
                    icon: "sap-icon://document",
                    type: "Warning"
                },
                {
                    title: "Training Reminder",
                    description: "SAP BTP Fundamentals training is due tomorrow.",
                    timestamp: "2 days ago",
                    icon: "sap-icon://learning-assistant",
                    type: "Information"
                }
            ];
            
            oAppStateModel.setProperty("/notifications", aNotifications);
            oAppStateModel.setProperty("/unreadNotifications", aNotifications.length);
        },

        // Event Handlers
        onHomePress: function () {
            this.getOwnerComponent().getRouter().navTo("RouteWelcome");
        },

        onAvatarPress: function () {
            MessageToast.show("Profile menu - Coming soon!");
        },

        onLogout: function () {
            var that = this;
            MessageBox.confirm("Are you sure you want to logout?", {
                title: "Logout",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        // Clear session
                        sessionStorage.removeItem("isLoggedIn");
                        sessionStorage.removeItem("username");
                        
                        // Navigate to login
                        that.getOwnerComponent().getRouter().navTo("RouteLogin");
                        MessageToast.show("Logged out successfully");
                    }
                }
            });
        },

        onSearchPress: function () {
            if (!this._searchDialog) {
                this._searchDialog = this.byId("searchDialog");
            }
            this._searchDialog.open();
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getSource().getValue();
            if (sQuery) {
                this._performSearch(sQuery);
            }
        },

        _performSearch: function (sQuery) {
            // Simulate search results
            var aResults = [
                {
                    title: "Remote Work Policy",
                    description: "Guidelines for working from home",
                    icon: "sap-icon://home",
                    route: "RouteCompanyPolicy"
                },
                {
                    title: "AI Assistant",
                    description: "Get help with onboarding questions",
                    icon: "sap-icon://discussion-2",
                    route: "RouteChatHistory"
                },
                {
                    title: "Task Progress",
                    description: "Track your onboarding progress",
                    icon: "sap-icon://task",
                    route: "RouteWelcome"
                }
            ].filter(function (oItem) {
                return oItem.title.toLowerCase().includes(sQuery.toLowerCase()) ||
                       oItem.description.toLowerCase().includes(sQuery.toLowerCase());
            });

            var oSearchModel = new JSONModel({ searchResults: aResults });
            this.getView().setModel(oSearchModel);
            this.byId("searchResults").setVisible(aResults.length > 0);
        },

        onSearchResultPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sRoute = oContext.getProperty("route");
            
            if (sRoute) {
                this.getOwnerComponent().getRouter().navTo(sRoute);
                this.onCloseSearchDialog();
            }
        },

        onCloseSearchDialog: function () {
            if (this._searchDialog) {
                this._searchDialog.close();
                this.byId("searchField").setValue("");
                this.byId("searchResults").setVisible(false);
            }
        },

        onNotificationsPress: function (oEvent) {
            if (!this._notificationsPopover) {
                this._notificationsPopover = this.byId("notificationsPopover");
            }
            this._notificationsPopover.openBy(oEvent.getSource());
        },

        onNotificationPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("appState");
            var sTitle = oContext.getProperty("title");
            MessageToast.show("Notification: " + sTitle);
        },

        onClearNotifications: function () {
            var oAppStateModel = this.getOwnerComponent().getModel("appState");
            oAppStateModel.setProperty("/notifications", []);
            oAppStateModel.setProperty("/unreadNotifications", 0);
            MessageToast.show("All notifications cleared");
        },

        onHelpPress: function () {
            MessageToast.show("Help documentation - Coming soon!");
        },

        onSettingsPress: function () {
            MessageToast.show("Settings panel - Coming soon!");
        },

        onBreadcrumbPress: function () {
            this.getOwnerComponent().getRouter().navTo("RouteWelcome");
        }
    });
});
