Template.header.menuItems = function () {
  /* Return a list of name type pairs mapping the display name to the
   * type name
   * Used for generating a menu listing the contnet types
   * TODO: decide if these menu item definitions should go in the
   *       database.
   */

  return [{displayName: 'Home', type: 'homepage'},
          {displayName: 'Text', type: 'text'},
          {displayName: 'Tweets', type: 'tweet'},
          {displayName: 'Images', type: 'image'}];
}


Template.pageBody.contents = function () {
  /* Return the list of content objects for this url */
  if (Session.get('type') === 'all') {
    query = {}
  }
  else {
    query = {'type': Session.get('type')}
  }
  return Content.find(query);
}

Template.pageBody.render = function () {
  /*
   * Return the template associated with this content rendered with this content
   * Content is expected to have a 'type' field that identifies the name of the
   * template that renders it.
   */
  if (this.type === 'pageBody') {
    /* do not allow content to instruct pageBody.render
     *  to recursively call itself
     */
    throw new Error('Content of type pageBody causes infinate recursion.')
  }
  return Template[this.type](this);
}
