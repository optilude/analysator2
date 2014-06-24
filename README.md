# The Analysator

The Analysator is a simple tool for querying databases and charting the results.

This is the fancy version using Meteor and sporting user accounts, analysis
sharing and server-side persistence.

Warning: This could be a big security hole if you have Postgres servers with
weak passwords.

(Why? Because it passes database queries more or less straight through from a
browser to any Postgres database reachable from the server, with only very
cursory validation against destructive queries.)

## Installation

Check out the code and install Meteor (http://docs.meteor.com/#quickstart) and
Meteorite (http://oortcloud.github.io/meteorite/). Then run:

    $ mrt install

Then run the app locally with:

    $ meteor

See also http://docs.meteor.com/#deploying.

For the app tbe useful, the server where you run `meteor` needs to be able to
access a Postgres database, and you need to know the connection string for this
database.

Use a modern browser like Chrome or Firefox.

## Usage

Set up a Postgres database somewhere accessible, e.g. `localhost`. In the
web GUI, specify a connection string like:

    postgres://user:password@localhost:5432/dbname

and then enter a database query. Click `Run` to execute the query. Then use
`Configure chart...` to set up charting if desired.

Analyses can be saved using the `Save` and `Save as...` buttons. You may share
analyses with other users by using the `Sharing...` button and searching by
email address. Analyses shared with you appear in your left-hand side
navigation immediately, but you cannot save or delete others' analysis. You can,
however use `Save as...` to create your own copy.
