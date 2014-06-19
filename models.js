/* global Collections, Models, Utils */
"use strict";

/*
 * Analysis models
 */

Models.Analysis = {
    create: function(doc) {
        return {
            owner:            Meteor.userId(),
            sharedWith:       doc && doc.sharedWith    ? _.clone(doc.sharedWith) : [],
            name:             doc                      ? doc.name : "",
            connectionString: doc                      ? doc.connectionString : "",
            query:            doc                      ? doc.query: "",
            chartSettings:    doc && doc.chartSettings ? _.clone(doc.chartSettings) : {}
        };
    },

    getCurrent: function() {
        var currentAnalysis = Session.get('currentAnalysis');
        return currentAnalysis? currentAnalysis : Models.Analysis.create();
    },

    setCurrent: function(analysis) {
        Session.set('currentAnalysis', analysis? analysis : null);
        Session.set('currentAnalysisId', analysis && analysis._id? analysis._id : null);
    }
};

Collections.Analyses = new Meteor.Collection("Analyses");

Collections.Analyses.allow({
    insert: function(userId, doc) {
        // cannot insert with another owner
        return (userId && doc.owner === userId);
    },
    update: function (userId, doc, fields, modifier) {
        // can only change your own documents
        return doc.owner === userId;
    },
    remove: function (userId, doc) {
        // can only remove your own documents
        return doc.owner === userId;
    },
    fetch: ['owner']
});

Collections.Analyses.deny({
    update: function (userId, docs, fields, modifier) {
        // can't change owners
        return _.contains(fields, 'owner');
    }
});

/*
 * Publications
 */

if(Meteor.isServer) {
    Meteor.publish("analyses", function() {
        return Collections.Analyses.find({
            $or: [
                {owner: this.userId},
                {sharedWith: this.userId}
            ]
        });
    });
} else if(Meteor.isClient) {
    Meteor.subscribe("analyses");
}
