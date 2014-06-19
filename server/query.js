/*global pg */
"use strict";

var Future = Npm.require('fibers/future');

Meteor.methods({

    /**
     * Send a query to the server
     */
    queryDatabase: function(connectionString, query) {
        check(connectionString, String);
        check(query, String);

        var fut = new Future();

        query = query.trim();

        // securityz lol
        if(query.toLowerCase().indexOf("select") !== 0 || (query.indexOf(";") > 0 && query.indexOf(";") !== query.length -1)) {
            throw new Meteor.Error(403, "Only single SELECT queries are permitted.");
        }

        pg.connect(connectionString, function(err, client, done) {
            if(err) {
                return fut.throw(new Meteor.Error(500, "Could not connect"));
            }

            client.query(query, function(err, results) {
                if(err) {
                    return fut.throw(new Meteor.Error(400, err.toString()));
                }

                return fut.return(results);
            });

            return done();
        });

        return fut.wait();
    }

});
