/* global Roles */

"use strict";

Meteor.startup(function () {
    var adminUser = Meteor.users.findOne({username: "admin"});

    if(!adminUser) {
        console.warn("WARNING: Creating default admin user. Log in as 'admin@example.org' with password 'secret' and change the password!");

        var userId = Accounts.createUser({
            'username': 'admin',
            'email': 'admin@example.org',
            'password': 'secret'
        });

        Roles.addUsersToRoles(userId, ['admin']);
    }
});
