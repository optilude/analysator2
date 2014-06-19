/* global moment, bootbox, Collections, Models */
"use strict";

Template.parameters.helpers({
    disableConfigureChart: function() {
        var currentData = Session.get('currentData');
        return !Boolean(currentData);
    },
    disableSave: function() {
        return !Boolean(Session.get('currentAnalysis')._id);
    },
    disableSaveAs: function() {
        return !Boolean(Session.get('currentAnalysis')._id);
    },
    disableDelete: function() {
        return !Boolean(Session.get('currentAnalysis')._id);
    }
});

Template.parameters.events = {

    'change .connectionString' : function(event, template) {
        var currentAnalysis = Models.Analysis.getCurrent();
        currentAnalysis.connectionString = template.$(".connectionString").val();
        Models.Analysis.setCurrent(currentAnalysis);

        // cache connection string for new analysis
        if(!currentAnalysis._id) {
            localStorage.defaultConnectionString = currentAnalysis.connectionString;
        }

    },

    'change .query' : function(event, template) {
        var currentAnalysis = Models.Analysis.getCurrent();
        currentAnalysis.query = template.$(".query").val();
        Models.Analysis.setCurrent(currentAnalysis);

        // cache query for new analysis
        if(!currentAnalysis._id) {
            localStorage.deafultQuery = currentAnalysis.query;
        }
    },

    'click .run' : function(event, template) {
        event.preventDefault();

        var currentAnalysis = Models.Analysis.getCurrent();
        currentAnalysis.connectionString = template.$(".connectionString").val();
        currentAnalysis.query = template.$(".query").val();
        Models.Analysis.setCurrent(currentAnalysis);

        Meteor.call("queryDatabase", currentAnalysis.connectionString, currentAnalysis.query, function(err, results) {
            if(err) {
                alert(err.reason);
                return;
            }

            Session.set('currentData', results);
        });
    },

    'click .configure-chart' : function(event, template) {
        event.preventDefault();
        $(".chartModal").modal();
    },

    'click .save' : function(event, template) {
        var currentAnalysis = Models.Analysis.getCurrent();

        Collections.Analyses.update(currentAnalysis._id, {
            $set: _.omit(currentAnalysis, '_id', 'owner')
        }, {}, function(err) {
            if(err) {
                alert("Unexpected error updating record: " + err);
                return;
            }
        });
    },

    'click .save-as' : function(event, template) {
        var currentAnalysis = Models.Analysis.getCurrent();

        bootbox.prompt("Please choose a name", function(newName) {
            if(!newName) {
                return;
            }

            var newAnalysis = Models.Analysis.create(_.extend(currentAnalysis, {name: newName}));
            Collections.Analyses.insert(_.clone(newAnalysis), function(err, id) {
                if(err) {
                    alert("Unexpected error inserting record: " + err);
                    return;
                }

                newAnalysis._id = id;
                Models.Analysis.setCurrent(newAnalysis);

                Router.go('analysis', {_id: id});
            });
        });
    },

    'click .delete' : function(event, template) {
        var currentAnalysis = Models.Analysis.getCurrent();

        bootbox.confirm("Are you sure you want to delete the analysis '" + currentAnalysis.name + "'?", function(result) {
            if(result) {
                Collections.Analyses.remove(currentAnalysis._id, function(err, count) {
                    if(err) {
                        alert("Unexpected error deleting record: " + err);
                        return;
                    }

                    Router.go('new');
                });
            }
        });
    }

};

Template.results.helpers({

    fields: function() {
        var data = Session.get('currentData');
        if(!data) {
            return [];
        }

        return data.fields;
    },

    rows: function() {
        var data = Session.get('currentData');
        if(!data) {
            return [];
        }

        return data.rows.map(function(row) {
            return data.fields.map(function(field) {
                var value = row[field.name];

                if(field.dataTypeID === 1082) { // date columns
                    value = moment(value).format("MM/DD/YYYY");
                }

                return value;
            });
        });
    }
});