/* global Collections, Models */
"use strict";

Meteor.startup(function() {
    Session.set('currentData', null);
    Models.Analysis.setCurrent(null);

    Deps.autorun(function() {
        var userId = Meteor.userId(),
            currentRoute = Router.current();

        // Redirect to home page if user is not logged in
        if(currentRoute && currentRoute.route.name !== 'home' && !userId) {
            Router.go('home');
        }

    });

});

Router.map(function() {

    Router.onBeforeAction('dataNotFound');
    Router.configure({
        layoutTemplate: 'layout',
        notFoundTemplate: 'notFound'
    });

    // Routes

    this.route('home', {
        path: '/',
        data: {}
    });

    this.route('new', {
        template: 'analysis',
        path: '/new-analysis',
        onRun: function() {
            Session.set('currentData', null);
            Models.Analysis.setCurrent(Models.Analysis.create({
                connectionString: localStorage.defaultConnectionString || "",
                query: localStorage.deafultQuery || ""
            }));
        },
        data: function() {
            return Models.Analysis.getCurrent();
        }
    });

    this.route('analysis', {
        template: 'analysis',
        path: '/analysis/:_id',
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
