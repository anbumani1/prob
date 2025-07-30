sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("intern.portal.controller.Tasks", {

        onInit: function () {
            // Check authentication
            this._checkAuthentication();
            
            // Set up router
            this.getRouter().getRoute("RouteTasks").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._checkAuthentication();
            this._loadTasks();
        },

        _checkAuthentication: function () {
            var isLoggedIn = sessionStorage.getItem("isLoggedIn");
            if (!isLoggedIn || isLoggedIn !== "true") {
                this.getRouter().navTo("RouteLogin");
            }
        },

        _loadTasks: function () {
            // Simulate loading tasks data
            var oTasksModel = new JSONModel({
                pendingTasks: [
                    {
                        id: "1",
                        title: "Complete Security Training",
                        description: "Due: Tomorrow",
                        priority: "High",
                        status: "Pending",
                        dueDate: new Date(Date.now() + 86400000) // Tomorrow
                    },
                    {
                        id: "2",
                        title: "Submit Internship Agreement",
                        description: "Due: This week",
                        priority: "Medium",
                        status: "Pending",
                        dueDate: new Date(Date.now() + 7 * 86400000) // Next week
                    },
                    {
                        id: "3",
                        title: "Attend Team Introduction",
                        description: "Due: Next week",
                        priority: "Low",
                        status: "Pending",
                        dueDate: new Date(Date.now() + 14 * 86400000) // Two weeks
                    }
                ],
                completedTasks: [
                    {
                        id: "4",
                        title: "HR Documentation",
                        description: "Completed: 2 days ago",
                        priority: "High",
                        status: "Completed",
                        completedDate: new Date(Date.now() - 2 * 86400000)
                    },
                    {
                        id: "5",
                        title: "Office Tour",
                        description: "Completed: 3 days ago",
                        priority: "Medium",
                        status: "Completed",
                        completedDate: new Date(Date.now() - 3 * 86400000)
                    },
                    {
                        id: "6",
                        title: "IT Setup",
                        description: "Completed: 1 week ago",
                        priority: "High",
                        status: "Completed",
                        completedDate: new Date(Date.now() - 7 * 86400000)
                    },
                    {
                        id: "7",
                        title: "Welcome Orientation",
                        description: "Completed: 1 week ago",
                        priority: "Medium",
                        status: "Completed",
                        completedDate: new Date(Date.now() - 7 * 86400000)
                    }
                ]
            });
            
            this.getView().setModel(oTasksModel, "tasks");
        },

        // Event Handlers
        onRefreshTasks: function () {
            this._loadTasks();
            MessageToast.show("Tasks refreshed successfully!");
        },

        onTaskPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("tasks");
            var oTask = oContext.getObject();
            
            MessageBox.information(
                "Task: " + oTask.title + "\n" +
                "Priority: " + oTask.priority + "\n" +
                "Status: " + oTask.status + "\n" +
                "Description: " + oTask.description,
                {
                    title: "Task Details"
                }
            );
        },

        onAddTask: function () {
            MessageBox.confirm("Would you like to add a new task?", {
                title: "Add New Task",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        MessageToast.show("Add Task functionality - Coming soon!");
                    }
                }
            });
        },

        onViewAllTasks: function () {
            MessageToast.show("Detailed task view - Coming soon!");
        },

        onExportTasks: function () {
            MessageToast.show("Export functionality - Coming soon!");
        },

        onGetHelp: function () {
            MessageBox.information(
                "Need help with your tasks?\n\n" +
                "• Contact your supervisor for urgent tasks\n" +
                "• Use the AI Assistant for general questions\n" +
                "• Check the Company Policy section for guidelines\n" +
                "• Email HR for administrative support",
                {
                    title: "Task Help"
                }
            );
        },

        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        }
    });
});
