Tyson
=====

Universal Content.

### I'm with Niel

Tyson uses function composition and content type declaration to create dynamic
content websites.

### Tyson provides

## {{{ renderThisPage }}}
Renders the page based on a composition of functions declared by the url path.
Looks for these functions in TYSON.pathHandlers

## {{{ renderThisContent }}}
Renders a piece of content. Content should have a type field specifying the
the name of a template that renders it.

## TYSON.pathHandlers
Attach composable functions to this object. {{{ renderThisPage }}} will look
here for functions to compose based on the url path.

## Content collection
A collection of content with type fields identifying which template to use to
render them.

# TODO
publish the Content collection (leave that to the user?)
