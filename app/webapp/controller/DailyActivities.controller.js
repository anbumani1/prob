sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("intern.portal.controller.DailyActivities", {

        onInit: function () {
            this._initializeModel();
        },

        _initializeModel: function () {
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
                    },
                    {
                        id: "4",
                        title: "Security Training Module",
                        description: "Complete mandatory security training",
                        category: "Training",
                        priority: "High",
                        status: "Completed",
                        date: "2024-01-15",
                        timeMinutes: 90
                    },
                    {
                        id: "5",
                        title: "Project Assignment Review",
                        description: "Review assigned project requirements",
                        category: "Meeting",
                        priority: "Medium",
                        status: "InProgress",
                        date: "2024-01-18",
                        timeMinutes: 60
                    }
                ],
                stats: {
                    total: 5,
                    completed: 2,
                    inProgress: 2,
                    totalMinutes: 510
                }
            });
            
            this.getView().setModel(oActivitiesModel, "activities");
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

        // Event Handlers
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

        onEditActivity: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("activities");
            var oActivity = oContext.getObject();
            
            MessageBox.confirm("Edit activity: " + oActivity.title + "?", {
                title: "Edit Activity",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        MessageToast.show("Edit functionality - Coming soon!");
                    }
                }
            });
        },

        onDeleteActivity: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("activities");
            var oActivity = oContext.getObject();
            
            MessageBox.confirm("Delete activity: " + oActivity.title + "?", {
                title: "Delete Activity",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        MessageToast.show("Delete functionality - Coming soon!");
                    }
                }
            });
        },

        onRefresh: function () {
            this._initializeModel();
            MessageToast.show("Activities refreshed!");
        },

        // Quick Actions
        onQuickAddTraining: function () {
            MessageToast.show("Adding training activity - Coming soon!");
        },

        onScheduleMeeting: function () {
            MessageToast.show("Schedule meeting - Coming soon!");
        },

        onExportActivities: function () {
            var oModel = this.getView().getModel("activities");
            var aActivities = oModel.getProperty("/activities");
            
            if (aActivities.length === 0) {
                MessageToast.show("No activities to export");
                return;
            }
            
            var sContent = "Daily Activities Export\n";
            sContent += "Generated: " + new Date().toLocaleString() + "\n\n";
            
            aActivities.forEach(function (activity) {
                sContent += "Activity: " + activity.title + "\n";
                sContent += "Description: " + activity.description + "\n";
                sContent += "Category: " + activity.category + "\n";
                sContent += "Priority: " + activity.priority + "\n";
                sContent += "Status: " + activity.status + "\n";
                sContent += "Date: " + activity.date + "\n";
                sContent += "Time: " + activity.timeMinutes + " minutes\n\n";
            });
            
            var blob = new Blob([sContent], { type: "text/plain" });
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = "daily-activities-" + new Date().toISOString().split('T')[0] + ".txt";
            a.click();
            window.URL.revokeObjectURL(url);
            
            MessageToast.show("Activities exported successfully!");
        },

        onViewCalendar: function () {
            MessageToast.show("Calendar view - Coming soon!");
        }
    });
});
