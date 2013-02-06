Content = new Meteor.Collection('content')

if (Meteor.isClient) {

  Template.pageBody.contents = function () {
    return Content.find();
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

