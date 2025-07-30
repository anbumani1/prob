sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";

    return {
        /**
         * Create device model for responsive design
         * @returns {JSONModel} Device model
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        /**
         * Create user model for user-specific data
         * @returns {JSONModel} User model
         */
        createUserModel: function () {
            var oModel = new JSONModel({
                name: "",
                email: "",
                department: "",
                role: "Intern",
                avatar: "",
                isLoggedIn: false,
                preferences: {
                    theme: "sap_horizon",
                    language: "en",
                    notifications: true
                },
                stats: {
                    tasksCompleted: 0,
                    policiesRead: 0,
                    daysRemaining: 0,
                    progressPercentage: 0
                }
            });
            oModel.setDefaultBindingMode("TwoWay");
            return oModel;
        },

        /**
         * Create app state model for application state management
         * @returns {JSONModel} App state model
         */
        createAppStateModel: function () {
            var oModel = new JSONModel({
                busy: false,
                busyText: "Loading...",
                currentView: "Login",
                navigationHistory: [],
                notifications: [],
                unreadNotifications: 0,
                sideNavExpanded: false,
                shellHeaderVisible: true,
                footerVisible: true,
                breadcrumbs: []
            });
            oModel.setDefaultBindingMode("TwoWay");
            return oModel;
        },

        /**
         * Create navigation model for menu items
         * @returns {JSONModel} Navigation model
         */
        createNavigationModel: function () {
            var oModel = new JSONModel({
                menuItems: [
                    {
                        key: "welcome",
                        title: "Welcome",
                        icon: "sap-icon://home",
                        route: "RouteWelcome",
                        description: "Dashboard and overview"
                    },
                    {
                        key: "policies",
                        title: "Company Policies",
                        icon: "sap-icon://document",
                        route: "RouteCompanyPolicy",
                        description: "View company policies and guidelines"
                    },
                    {
                        key: "chat",
                        title: "AI Assistant",
                        icon: "sap-icon://discussion-2",
                        route: "RouteChatHistory",
                        description: "Chat with AI assistant"
                    },
                    {
                        key: "tasks",
                        title: "My Tasks",
                        icon: "sap-icon://task",
                        route: "RouteTasks",
                        description: "Track your onboarding progress"
                    },
                    {
                        key: "profile",
                        title: "Profile",
                        icon: "sap-icon://person-placeholder",
                        route: "RouteProfile",
                        description: "Manage your profile settings"
                    }
                ]
            });
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        }
    };
});
