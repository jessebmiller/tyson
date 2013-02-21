Content = new Meteor.Collection('content');
/*
* Content is expected to have a 'type' field that identifies the name of the
* template that renders it.
*/

var ContentRouter = Backbone.Router.extend({
  routes: {
    ":type": "content"
  },
  content: function (type) {
    console.log(type);
    Session.set('type', type);
  }
});

