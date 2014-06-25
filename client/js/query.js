/* global moment, bootbox, Collections, Models, Schemata */
"use strict";

Template.analysis.helpers({

    analysisName: function() {
        var currentAnalysis = Models.Analysis.getCurrent();
        return currentAnalysis && currentAnalysis.name? currentAnalysis.name : null;
    },

    sharedBy: function() {
        var currentAnalysis = Session.get('currentAnalysis');
        if(!currentAnalysis || currentAnalysis.owner === Meteor.userId()) {
            return null;
        }

        var user = Meteor.users.findOne(currentAnalysis.owner);

        if(!user) {
            return null;
        }

        return user.emails[0].address;
    }

});

Template.analysis.events({

    'click .edit-name': function() {
        var currentAnalysis = Models.Analysis.getCurrent();

        bootbox.prompt({
            title: "Please enter a new name",
            value: currentAnalysis.name,
            callback: function(result) {
            if(!result) {
                return;
            }

            currentAnalysis.name = result;
            Models.Analysis.setCurrent(currentAnalysis);

            Collections.Analyses.update(currentAnalysis._id, {
                $set: {
                    name: currentAnalysis.name
                }
            }, {}, function(err) {
                if(err) {
                    alert("Unexpected error updating record: " + err);
                    return;
                }
            });
        }});
    }

});

Template.parameters.helpers({
    disableConfigureChart: function() {
        var currentData = Session.get('currentData');
        return ! (
            Boolean(currentData)
        );
    },
    disableSave: function() {
        var currentAnalysis = Session.get('currentAnalysis');
        return ! (
            currentAnalysis && currentAnalysis._id && currentAnalysis.owner === Meteor.userId()
        );
    },
    disableSharing: function() {
        var currentAnalysis = Session.get('currentAnalysis');
        return ! (
            currentAnalysis && currentAnalysis.owner === Meteor.userId()
        );
    },
    disableSaveAs: function() {
        var currentAnalysis = Session.get('currentAnalysis');
        return ! (
            currentAnalysis
        );
    },
    disableDelete: function() {
        var currentAnalysis = Session.get('currentAnalysis');
        return ! (
            currentAnalysis && currentAnalysis._id && currentAnalysis.owner === Meteor.userId()
        );
    },
    validationStatus: function(kw) {
        var currentAnalysis = Session.get('currentAnalysis');
        return (currentAnalysis && Schemata.Analysis.namedContext().validateOne(currentAnalysis, kw.hash.field))?
            "" : "has-error";
    }
});

Template.parameters.events = {

    'change .parameters-form' : function(event, template) {
        Session.set('dirty', true);
    },

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
                bootbox.alert(err.reason);
                return;
            }

            Session.set('currentData', results);
        });
    },

    'click .configure-chart' : function(event, template) {
        event.preventDefault();
        $(".chartModal").modal();
    },

    'click .configure-sharing' : function(event, template) {
        event.preventDefault();
        $(".sharingModal").modal();
    },

    'click .save' : function(event, template) {
        var currentAnalysis = Models.Analysis.getCurrent(),
            omit = ['_id'];

        // it's possible that we have only partly populated chart settings;
        // in this case, don't save them

        if(!currentAnalysis.chartSettings || !Schemata.ChartSettings.namedContext().validate(currentAnalysis.chartSettings)) {
            omit.push('chartSettings');
        }

        if(!Schemata.Analysis.namedContext().validate(_.omit(currentAnalysis, omit))) {
            bootbox.alert("Invalid analysis: " + _.pluck(Schemata.Analysis.namedContext().invalidKeys(), 'message').join('; '));
            return;
        }

        omit.push('owner');
        Collections.Analyses.update(currentAnalysis._id, {
            $set: _.omit(currentAnalysis, omit)
        }, {}, function(err) {
            if(err) {
                alert("Unexpected error updating record: " + err);
                return;
            }

            Session.set('dirty', false);
        });
    },

    'click .save-as' : function(event, template) {
        var currentAnalysis = Models.Analysis.getCurrent(),
            omit = ['_id'];

        // it's possible that we have only partly populated chart settings;
        // in this case, don't save them

        if(!currentAnalysis.chartSettings || !Schemata.ChartSettings.namedContext().validate(currentAnalysis.chartSettings)) {
            omit.push('chartSettings');
        }

        // validate, but don't fail due to a missing name
        if(!Schemata.Analysis.namedContext().validate(_.extend(_.omit(currentAnalysis, omit), {name: 'temp'}))) {
            console.error(Schemata.Analysis.namedContext().invalidKeys());
            bootbox.alert("Invalid analysis: " + _.pluck(Schemata.Analysis.namedContext().invalidKeys(), 'message').join('; '));
            return;
        }

        omit.push('owner');
        bootbox.prompt("Please choose a name", function(newName) {
            if(!newName) {
                return;
            }

            var newAnalysis = Models.Analysis.create(_.extend(_.omit(currentAnalysis, omit), {name: newName}));
            Collections.Analyses.insert(newAnalysis, function(err, id) {
                if(err) {
                    alert("Unexpected error inserting record: " + err);
                    return;
                }

                newAnalysis._id = id;
                Models.Analysis.setCurrent(newAnalysis);

                Session.set('dirty', false);

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

                if(value && (field.dataTypeID === 1082 || field.dataTypeID === 1184)) { // date columns
                    value = moment(value).format("DD/MM/YYYY");
                }

                return value;
            });
        });
    }
});