Content = new Meteor.Collection('content');

Content.path = (function () {
  /* replace this with backbone routes? probably.
   */
  binding = {}
  return {
    add: function (pathDef, query) {
      binding[pathDef] = query;
      return this;
    },
    contents: function (path) {
      query = binding[path] || {}; 
      return Content.find(query);
    }
  }
}());

Content = new Meteor.Collection('content')
/*
* Content is expected to have a 'type' field that identifies the name of the
* template that renders it.
*/
if (Meteor.isClient) {

  Template.pageBody.contents = function () {
    /* A set of objects for this url */
    Content.path
      .add('/tweets', {type: 'tweet'})
      .add('/text', {type: 'text'});
    return Content.path.contents(window.location.pathname);
  }

  Template.pageBody.render = function () {
    /*
     * Return the template associated with this content rendered with this content
     * Content is expected to have a 'type' field that identifies the name of the
     * template that renders it.
     */
    if (this.type === 'pageBody') { 
        /* do not allow content to instruct pageBody.render to recursively call itself */
        throw new Error('Content of type pageBody causes infinate recursion.')
    }
    return Template[this.type](this);}

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

