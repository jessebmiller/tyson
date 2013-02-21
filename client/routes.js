var ContentRouter = Backbone.Router.extend({

  routes: {
    "": "home",
    "type/:type": "content"
  },

  content: function (type) {
    Session.set('type', type);
  },
  home: function () {
    Session.set('type', 'all');
  }

});

Routes = new ContentRouter;
Backbone.history.start({pushState: true});
