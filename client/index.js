/* global moment, Morris, bootbox, Collections, Models, Utils */
"use strict";

Meteor.startup(function() {
    Session.set('currentData', null);
    Models.Analysis.setCurrent(null);
});

Router.map(function() {
    this.route('home', {path: '/'});

    this.route('new', {
        template: 'analysis',
        path: '/new-analysis',
        onBeforeAction: function() {
            Session.set('currentData', null);
            Models.Analysis.setCurrent(Models.Analysis.create());
        },
        data: function() {
            return Models.Analysis.getCurrent();
        }
    });

    this.route('analysis', {
        template: 'analysis',
        path: '/analysis/:_id',
        data: function() {
            var analysis = Collections.Analyses.findOne(this.params._id),
                current = Router.current();

            if(current.route.name !== 'analysis' || current.options.params._id !== this.params._id) {
                Session.set('currentData', null);
            }

            Models.Analysis.setCurrent(analysis);
            return analysis;
        }
    });
});
