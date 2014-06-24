/* global Users */
"use strict";

Meteor.methods({

    /**
     * Find a user by email.
     */
    queryUser: function(email) {
        check(email, String);

        return Meteor.users.find({
            'emails.address': email
        }, {
            fields: {
                '_id'           : 1,
                'username'      : 1,
                'emails'        : 1,
                'profile.name'  : 1
            }
        }).fetch();
    }

});
