
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
     * Content.insert({type: 'tweet', text: 'not displayed?'})
     */
    if (this.type === 'pageBody') { 
      throw new Error('do not create content of type pageBody it breaks stuff.')
    }
    return Template[this.type](this);}

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

