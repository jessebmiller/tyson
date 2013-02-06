Content = new Meteor.Collection('content')
/*
* Content is expected to have a 'type' field that identifies the name of the
* template that renders it.
*/
if (Meteor.isClient) {

  Template.pageBody.contents = function () {
    return Content.find();
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

