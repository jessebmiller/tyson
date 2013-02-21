Meteor.startup(function () {
  // code to run on server at startup

  if (Content.find().count() === 0) {
    Content.insert({'type': 'homepage',
                    'message': 'this is the tyson homepage. cool huh?'});
    Content.insert({'type': 'text', 'title': 'Title1', 'text': 'some text'});
    Content.insert({'type': 'text', 'title': 'Title2', 'text': 'some more text'});
    Content.insert({'type': 'text',
                    'title': 'Title3',
                    'text': 'some more interesting text'});
    Content.insert({'type': 'tweet', 'text': 'some bAd text #tweettest'});
    Content.insert({'type': 'image',
                    'url': 'http://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png'});
  }
});
