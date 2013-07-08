# Tyson

Universal Content.

Tyson uses function composition and content type declaration to create universal
content websites. Like Niel would.

## usage
put [wu-xian](https://github.com/jessebmiller/wu-xian) (a simple meteor package of wu.js) and Tyson in the /packages folder. I like to use git submodules for this.

#### THIS IS NOT READY FOR REAL APPLICATIONS! WORK IN PROGRESS!

## Philosophy
Content websites can be though of as being made up of three different general pices. First and formost is the content which is an arbetrary graph of content and relations. Second is a view on subsets of the graph (all the HTML templates and CSS that declares how content is displayed on the page). Third is the logic that builds the subsets.

This maps fairly cleanly to the MVC pattern. 

### Model
In Tyson, the content is typed so the Model consists of all the arbetrary content type deffinitions, the graph of typed content and to an extend the tree of typed content for an individual page view.

### View
Tyson.view is a datatype (content type) generic function that takes a tree of typed Viewable content, and returns the HTML and CSS. As long as the Viewable type class is implemented for each content type in the tree, Tyson.view will generate the HTML. 

### Controller
In Tyson, the controller is composed from the URL path. We register composable functions and build urls that describe how to compose them into the controller for the page. This controller should ultimately return a tree of content to be passed to the view function.

for example:
if we register the function "subject" which takes a single arguement naming a subject and returns a List (a content type as well) of posts on that subject, then the path /subject/sports will pass "sports" (no controller has been registered for "sports" so it will treat this as an arguement) to the subject function and the result to Tyson.view

We could then register a function "third" which takes a List and returns just the third element. Visiting the path /third/subject/sports will compose these controllers and give us a page displaying the third post from the subject sports.
