/* global Collections, Models, Roles */
"use strict";

Template.sidebar.helpers({
    dirty: function() {
        return Session.get('dirty');
    },
    newActive: function() {
        var currentRoute = Router.current();
        return currentRoute && currentRoute.route.name === "new"? "active" : null;
    },
    currentAnalysis: function() {
        return Models.Analysis.getCurrent();
    },
    savedAnalyses: function() {
        var currentRoute = Router.current();
        return Collections.Analyses.find({}, {sort: ['name']}).map(function(a) {
            return {
                _id: a._id,
                name: a.name,
                active: (currentRoute && currentRoute.route.name === "analysis" && currentRoute.options.params._id === a._id)? "active" : null
            };
        });
    }
});

Template.header.helpers({
    isAdmin: function() {
        return Roles.userIsInRole(Meteor.user(), ['admin']);
    },
    adminAccountsActive: function() {
        var currentRoute = Router.current();
        return currentRoute && currentRoute.route.name === "adminAccounts"? "active" : null;
    },
});
