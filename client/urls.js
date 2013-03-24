/*
var Urls = Backbone.Router.extend({
    routes: {
        '': 'setEmptyPath',
        '*path': 'setPath',
    },
    setPath: function (path) {
        path = path.split('/');
        path.unshift('basePathHandler');
        Session.set('path', path);
    },
    setEmptyPath: function () {
        Session.set('path', ['basePathHandler']);
    }
});

Routes = new Urls;
Backbone.history.start({pushState: true});
*/
