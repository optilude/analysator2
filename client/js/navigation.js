/* global Collections, Models */
"use strict";

Template.sidebar.helpers({
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