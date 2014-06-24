/* global moment, bootbox, Collections, Models, Schemata */
"use strict";

var emailName = '[a-z0-9!#$%&\'*+\\/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+\\/=?^_`{|}~-]+)*',
    emailDomain = '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z](?:[a-z-]*[a-z])?',
    isEmail = new RegExp('^' + emailName + '@' + emailDomain + '$');

var throttle = function(fn, options) {
    if(options.timer) {
        Meteor.clearTimeout(options.timer);
    }
    options.timer = Meteor.setTimeout(fn, options.timeout);
};

Template.sharing.rendered = function() {
    var template = this;

    var queryTimeout = {
        timer: null,
        timeout: 300
    };

    template.$(".selectUsers").select2({
        width: "100%",
        minimumInputLength: 6,
        allowClear: true,
        multiple: true,
        placeholder: "Enter an email address",
        initSelection: function(element, callback) {
            var data = [];

            var currentAnalysis = Models.Analysis.getCurrent();
            _.each(currentAnalysis.sharedWith || [], function(share) {
                var user = Meteor.users.findOne(share);
                if(user && user.emails && user.emails.length > 0) {
                    data.push({
                        id: share,
                        text: user.emails[0].address
                    });
                }
            });

            callback(data);
        },
        query: function(query) {
            var data = {results: []};
            if(isEmail.test(query.term)) {
                throttle(function() {

                    Meteor.call("queryUser", query.term, function(err, result) {
                        if(!err && result) {
                            _.each(result, function(r) {
                                data.results.push({id: r._id, text: r.emails[0].address});
                            });
                        }
                        query.callback(data);
                    });

                }, queryTimeout);
            }
        }

    });

    template.$(".sharingModal").on('show.bs.modal', function() {
        var currentAnalysis = Models.Analysis.getCurrent();
        if(currentAnalysis && currentAnalysis.sharedWith && currentAnalysis.sharedWith.length > 0) {
            template.$(".selectUsers").select2('val', currentAnalysis.sharedWith);
        }
    });

};

Template.sharing.events = {

    'click .save' : function(event, template) {
        var currentAnalysis = Models.Analysis.getCurrent();
        currentAnalysis.sharedWith = template.$(".selectUsers").select2("val");

        Collections.Analyses.update(currentAnalysis._id, {
            $set: {
                sharedWith: currentAnalysis.sharedWith
            }
        }, {}, function(err) {
            if(err) {
                alert("Unexpected error updating record: " + err);
                return;
            }
        });

        Models.Analysis.setCurrent(currentAnalysis);
    }

};