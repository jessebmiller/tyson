Meteor.startup(function () {
    /* code to run at server startup */

    if (Content.find().count() === 0) {
        /* add fixtures here */
  }
});
