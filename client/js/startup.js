/* global Collections, Models, bootbox, Roles */
"use strict";

Meteor.startup(function() {
    Session.set('currentData', null);
    Models.Analysis.setCurrent(null);
});

Router.map(function() {

    var go = Router.go;
    Router.go = function () {
        var self = this,
            args = arguments;
        if(Session.get('dirty')) {
            bootbox.confirm("You have unsaved changes, which will be lost if you navigate away. Really leave this page?", function(confirm) {
                if(confirm) {
                    go.apply(self, args);
                }
            });
        } else {
            go.apply(self, args);
        }
    };

    Router.configure({
        layoutTemplate: 'layout',
        notFoundTemplate: 'notFound',

        onBeforeAction: function(pause) {
            var self = this;

            if(!this.ready()) {
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
        }
    });

    Router.onBeforeAction('dataNotFound');
    Router.onBeforeAction('loading');

    this.route('home', {
        path: '/',
        data: {}
    });

    this.route('new', {
        path: '/new-analysis',
        template: 'analysis',
        yieldTemplates: {
            analysisFooter: {to: 'footer'}
        },

        onRun: function() {
            Deps.nonreactive(function() {
                Session.set('currentData', null);
                Models.Analysis.setCurrent(Models.Analysis.create({
                    connectionString: localStorage.defaultConnectionString || "",
                    query: localStorage.deafultQuery || ""
                }));
            });
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
            analysisFooter: {to: 'footer'}
        },

        onRun: function() {
            Deps.nonreactive(function() {
                Session.set('currentData', null);
            });
        },

        data: function() {
            var id = this.params._id;

            var analysis = Collections.Analyses.findOne(id);
            Models.Analysis.setCurrent(analysis);

            return analysis;
        }

    });

    this.route('adminAccounts', {
        path:'/admin/accounts',
        template: 'accountsAdmin',
        data: {},
        onBeforeAction: function() {
            if(Meteor.loggingIn()) {
                this.render(this.loadingTemplate);
            } else if(!Roles.userIsInRole(Meteor.user(), ['admin'])) {
                this.redirect('/');
            }
        }
    });

});
