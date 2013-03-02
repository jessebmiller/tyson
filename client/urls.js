var Urls = Backbone.Router.extend({
  routes: {
    '*path': 'setPath',
  },
  setPath: function (path) {
    path = path.split('/');
    Session.set('path', path);
  }
});

Routes = new Urls;
Backbone.history.start({pushState: true});
