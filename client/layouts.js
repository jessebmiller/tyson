Template.navigation.theseNavLinks = function () {
    /* return all nav links in order for this page */
    query = Session.get('navLinks') || {};
    return NavigationLinks.find(query);
}

Template.homepage.highlights = function () {
    return Content.find({'highlight': 'true'});
}
