/* global Collections, Models, Schemata, SimpleSchema */
"use strict";

/*
 * Analysis model and collection
 */

Schemata.ChartSettings = new SimpleSchema({

    type: {
        type: String,
        allowedValues: ['Line', 'Area', 'Bar', 'Donut']
    },

    xkey: {
        type: String
    },

    ykeys: {
        type: [String],
        minCount: 1
    },

    goals: {
        type: [String],
        optional: true
    },

    events: {
        type: [String],
        optional: true
    },

    preUnits: {
        type: String,
        optional: true
    },

    postUnits: {
        type: String,
        optional: true
    },

    smoothLines: {
        type: Boolean,
        defaultValue: true,
        optional: true
    },

    parseTime: {
        type: Boolean,
        defaultValue: false,
        optional: true
    },

    stacked: {
        type: Boolean,
        defaultValue: false,
        optional: true
    }

});

Schemata.Analysis = new SimpleSchema({

    owner: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        denyUpdate: true
    },

    sharedWith: {
        type: [String],
        optional: true
    },

    name: {
        type: String
    },

    connectionString: {
        type: String
    },

    query: {
        type: String
    },

    chartSettings: {
        type: Schemata.ChartSettings,
        optional: true
    }

});

/*
 * Model helpers
 */

Models.Analysis = {
    create: function(doc) {
        return {
            owner:            Meteor.userId(),
            sharedWith:       [],
            name:             doc                      ? doc.name : "",
            connectionString: doc                      ? doc.connectionString : "",
            query:            doc                      ? doc.query: "",
            chartSettings:    doc && doc.chartSettings ? _.clone(doc.chartSettings) : null
        };
    },

    getCurrent: function() {
        var currentAnalysis = Session.get('currentAnalysis');
        return currentAnalysis? currentAnalysis : Models.Analysis.create();
    },

    setCurrent: function(analysis) {
        Session.set('currentAnalysis', analysis? analysis : null);
    }
};

Collections.Analyses = new Meteor.Collection("Analyses", {
    schema: Schemata.Analysis
});

Collections.Analyses.allow({
    insert: function(userId, doc) {
        return (userId && doc.owner === userId);
    },
    update: function (userId, doc, fields, modifier) {
        return doc.owner === userId;
    },
    remove: function (userId, doc) {
        return doc.owner === userId;
    },
    fetch: ['owner']
});

/*
 * Publications/subscriptions
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

    Meteor.publish('sharedUsers', function(analysisId) {
        check(analysisId, String);

        if(!analysisId) {
            return null;
        }

        var analysis = Collections.Analyses.findOne(analysisId);
        if(!analysis) {
            return null;
        }

        var userIds = (analysis.sharedWith || []).slice();

        if(analysis.owner !== this.userId) {
            userIds.push(analysis.owner);
        }

        return Meteor.users.find({
            _id: {$in : userIds}
        }, {
            fields: {
                '_id'           : 1,
                'username'      : 1,
                'emails'        : 1,
                'profile.name'  : 1
            }
        });
    });

} else if(Meteor.isClient) {

    Meteor.subscribe("analyses");

    Deps.autorun(function() {
        var currentAnalysis = Models.Analysis.getCurrent();
        return Meteor.subscribe("sharedUsers", currentAnalysis && currentAnalysis._id? currentAnalysis._id : null);
    });

}
