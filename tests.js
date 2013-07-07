/*

Tyson tests

view should take a tree of viewable content and return reactive html
a type is viewable if it has a template associated with it.

model should build a viewable tree based on the current context (url,
current user, settings and so on).

*/

// run tests only on the client
var assert = Meteor.isClient ? Tinytest.add : function () {};

function setupTestTypeDefs() {
    Tyson.registerContentType({
        name: "trivialContent",
        view: function () { return "trivial content"; },
        summarize: function () { return "tc"; }
    });

    Tyson.registerContentType({
        name: "string",
        view: function (obj) { return obj.string; }
    });

    Tyson.registerContentType({
        name: "text",
        view: Template.text,
        summarize: function (obj) { return obj.text.substring(0, 1); }
    });

    Tyson.registerContentType({
        name: "textLink",
        view: Template.textLink
    });

    Tyson.registerContentType({
        name: "list",
        unit: {type: "list", elements: []},
        cons: function (obj, lst) { lst.elements.splice(0, 0, obj); },
        view: function (obj) {
            return Template.list({elements: _.map(obj.elements, Tyson.view)});
        }
    });

    Tyson.registerContentType({
        name: "trivialGrid",
        unit: { type: "trivialGrid", children: [] },
        cons: function (m, obj) {
            m.children.splice(0, 0, obj);
            return m;
        },

        view: function (obj) {
            return wu(obj.children)
                .map(Tyson.view)
                .toArray()
                .join('');
        }
    });

    Tyson.registerContentType(function () {
        function gmap (f, g) {
            /* map function f across grid g */
            var children = _.map(g.children, f);
            var grid = g;
            grid.children = children;
            return grid;
        }

        return {
            name: "grid",
            unit: {children: []},
            cons: function (grid, obj) {
                return grid.children.splice(0, 0, obj);
            },
            view: function (obj) {
                return Template.grid(gmap(Tyson.view, obj));
            }
        };
    }());
}

var testText = {
    type: "text",
    text: "test text"
};

var testTextLink = {
    type: "textLink",
    url: "/test",
    text: "test link"
};

var Content = new Meteor.Collection('content');

function setupCollections () {
    Content.insert(testText);
    Content.insert(testTextLink);
    Content.insert({ type: "trivialContent" });
}

function tearDownCollections () {
    var all = _.map(Content.find().fetch(), function (elm) {
        return {_id: elm._id};
    });
    _.each(all, function (elm) {
        Content.remove(elm);
    });
}

function setupControllers () {
    Tyson.registerController("all", function () {
        /* all :: [Content] */
        return { type: "list", elements: Content.find().fetch() };
    });

    Tyson.registerController("just", function (contentType) {
        /* just :: String -> [Content] */
        var query = { type: contentType };
        var elements =  Content.find(query).fetch();
        return { type: "list", elements: elements };
    });

    Tyson.registerController("either", function (typeOne, typeTwo) {
        /* either :: String -> String -> [Content] */
        var query = { type: {$in: [typeOne, typeTwo]}};
        var elements = Content.find(query).fetch();
        return { type: "list", elements: elements };
    });

    Tyson.registerController('add', function (a, b) {
        return String(parseInt(a, 10) + parseInt(b, 10));
    });

    Tyson.registerController('mult', function (a, b) {
        return String(parseInt(a, 10) * parseInt(b, 10));
    });

    Tyson.registerController('str', function (s) {
        return {type: 'string', string: String(s) };
    });
}

function setUp () {
    thatGetPath = Tyson.getPath;
    tearDown();
    setupTestTypeDefs();
    setupCollections();
    setupControllers();
}

function tearDown () {
    Tyson.__clearContentTypeDefs__();
    Tyson.__clearControllers__();
    Tyson.getPath = thatGetPath;
    tearDownCollections();
}

/* general properties */
assert("unit returns a fresh object, not a reference", function (test) {
    setUp();

    var obj = Tyson.unit("trivialGrid");
    var obj2 = Tyson.unit("trivialGrid");
    test.isFalse(obj === obj2);
    obj.p = "prop one";
    obj2.p = "prop two";
    test.isFalse(obj.p === obj2.p);

    tearDown();
});

assert("registerControllers registers a list of controllers", function (test) {
    setUp();

    Tyson.registerControllers([
        ["conone", function () { return 'conone'; }],
        ["contwo", function () { return 'contwo'; }, 0]
    ]);
    test.equal(Tyson.model(['conone']).children[0], 'conone');
    test.equal(Tyson.model(['contwo']).children[0], 'contwo');

    tearDown();
});

assert("registerContentTypes registers a list of types", function (test) {
    var types;
    setUp();

    Tyson.registerContentTypes([{ name: 'one' }, { name: 'two' }]);
    types = Tyson._getContentTypeDefs();
    test.equal(types.one.name, 'one');
    test.equal(types.two.name, 'two');

    tearDown();
});

/* thisView template helper tests */
assert("{{{ thisView }}} makes a controller and gets a view", function (test) {
    setUp();

    Tyson.__getPath__ = function () {
        return "str/add/3/4/";
    };

    test.equal(Template.thisViewTest('base'), '7');

    tearDown();
});

/* model and controller function tests */
assert("registerContentType adds type classes to registry", function (test) {
    /*
     ContentTypes holds all functions and information needed to handle
     different situations or interfaces (displayable, listable, so on)
     */
    setUp();

    var testTypeDefs = Tyson._getContentTypeDefs();
    test.equal(testTypeDefs["trivialContent"].view(), "trivial content");
    test.equal(testTypeDefs["trivialContent"].summarize(), "tc");

    tearDown();
});

assert("Arbatrary controllers compose as expected", function (test) {
    var zero, one, five, ten;
    function val(trivialObj) {
        return trivialObj.children[0];
    }

    setUp();

    zero = Tyson.model(['mult', '0', 'add', '10', '10'], 'trivialGrid');
    test.equal(val(zero), '0');
    one = Tyson.model(['add', '0', '1'], "trivialGrid");
    test.equal(val(one), '1');
    ten = Tyson.model(['add', 'add', '1', '2', 'add', '3', '4'], "trivialGrid");
    test.equal(val(ten), '10');
    five = Tyson.model(['mult', '1', 'add', '1', 'add', 'add', 'add', 'add',
                        '0', '0', '0', '0', '4'], "trivialGrid");
    test.equal(val(five), '5');

    tearDown();
});

assert("model with single controller and many arguements", function (test) {
    var content;
    var types;

    function getType(obj) {
        return obj.type;
    }

    function hasText(t, l) {
        var found = _.find(l, function (elm) {
            return elm === t;
        });
        if (found === undefined) {
            return false;
        }
        return true;
    }

    setUp();

    content = Tyson.model(["either", "text", "trivialContent"], "trivialGrid");
    types = wu(content.children[0].elements).map(getType).toArray();
    test.equal(content.children.length, 1);
    test.equal(content.children[0].elements.length, 2);
    test.isTrue(hasText("text", types));
    test.isTrue(hasText("trivialContent", types));
    test.isFalse(hasText("textLink", types));

    tearDown();
});

assert("model with single controller and arguement", function (test) {
    var content;
    setUp();

    content = Tyson.model(["just", "text"], "trivialGrid");
    test.equal(content.children.length, 1);
    test.equal(content.children[0].elements.length, 1);
    test.equal(content.children[0].elements[0].type, "text");
    test.equal(content.children[0].elements[0].text, "test text");

    tearDown();
});

assert("model with single controller no arguements works", function (test) {
    var content;
    setUp();

    content = Tyson.model(["all"], "trivialGrid");
    test.equal(content.children[0].elements[0].type, "text");
    test.equal(content.children[0].elements[0].text, "test text");
    test.equal(content.children[0].elements[1].type, "textLink");
    test.equal(content.children[0].elements[1].url, "/test");
    test.equal(content.children[0].elements.length, 3);
    test.equal(content.children[0].type, "list");
    test.equal(content.children.length, 1);

    tearDown();
});

/* view function tests */
assert("view works on trees (grids) of content", function (test) {
    var contentList = {type: "list", elements: [testTextLink, testText]};
    var contentTree = {type: "grid", class: "test", id: "123456",
                       children: [testText, testTextLink]};
    var contentTreeTwo = {type: "grid", class: "test", id: "654321",
                          children: [contentTree,
                                     testText,
                                     testTextLink,
                                     contentList]};
    var expected = "<div class=\"test\" id=\"654321\">" +
            "        <div class=\"test\" id=\"123456\">" +
            "        <p>test text</p>" +
            "        <a href=\"/test\">test link</a>" +
            "      </div>" +
            "        <p>test text</p>" +
            "        <a href=\"/test\">test link</a>" +
            "        <ul>" +
            "      <li><a href=\"/test\">test link</a></li>" +
            "      <li><p>test text</p></li>" +
            "    </ul>" +
            "      </div>".replace(/(\r\n|\n|\r)/gm,"");
    var viewed = Tyson.view(contentTreeTwo).replace(/(\r\n|\n|\r)/gm,"");

    setUp();

    test.equal(viewed, expected);

    tearDown();
});

assert("view works on Arrays of content", function (test) {
    setUp();

    var contentList = {type: "list", elements: [testTextLink, testText]};
    var expected =
            "<ul>" +
            "      <li><a href=\"/test\">test link</a></li>" +
            "      <li><p>test text</p></li>" +
            "    </ul>".replace(/(\r\n|\n|\r)/gm,"");
    var viewed = Tyson.view(contentList).replace(/(\r\n|\n|\r)/gm,"");
    test.equal(viewed, expected);

    tearDown();
});

assert("view returns the registered correct view for a type", function (test) {
    setUp();

    test.equal(Tyson.view(testText), "<p>test text</p>");
    test.equal(Tyson.view(testTextLink), "<a href=\"/test\">test link</a>");

    tearDown();
});

assert("arbetrary functors work too (summarize)", function (test) {
    setUp();

    test.equal(Tyson.fmap('summarize', testText), 't');

    tearDown();
});

assert("Tests can pass", function (test) {
    test.equal(true, true);
});
