/* global Collections, Models */
"use strict";

Meteor.startup(function() {
    Session.set('currentData', null);

    Models.Analysis.setCurrent(null);
});

Router.map(function() {

    Router.onBeforeAction('dataNotFound');
    Router.configure({
        layoutTemplate: 'layout',
        notFoundTemplate: 'notFound'
    });

    // Routes

    Router.onBeforeAction(function(pause) {
        var self = this;

        if (!this.ready()) {
            return;
        }

        var userId = Meteor.userId(),
            currentRoute = Router.current();

        // Redirect to home page if user is not logged in
        if(currentRoute && currentRoute.route.name !== 'home' && !userId) {
            pause();
            Router.go('home');
            return;
        }

        Session.set('dirty', false);
    });

    this.route('home', {
        path: '/',
        data: {}
    });

    this.route('new', {
        path: '/new-analysis',
        template: 'analysis',
        yieldTemplates: {
            configureChart: {to: 'footer'}
        },
        onRun: function() {
            Session.set('currentData', null);
            Models.Analysis.setCurrent(Models.Analysis.create({
                connectionString: localStorage.defaultConnectionString || "",
                query: localStorage.deafultQuery || ""
            }));
        },
        data: function() {
            var analysis = null;

            // don't re-trigger route each time the current analysis is saved
            Deps.nonreactive(function() {
                analysis = Models.Analysis.getCurrent();
            });

            return analysis;
        }
    });

    this.route('analysis', {
        path: '/analysis/:_id',
        template: 'analysis',
        yieldTemplates: {
            configureChart: {to: 'footer'}
        },
        onRun: function() {
            Session.set('currentData', null);
        },
        data: function() {
            var analysis = Collections.Analyses.findOne(this.params._id);
            Models.Analysis.setCurrent(analysis);
            return analysis;
        }
    });
});
