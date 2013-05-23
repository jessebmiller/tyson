/* to run all specs with space-daisy, create an html file with this in it.

 <head>
   <title>Tyson Spec Runner</title>
 </head>
 <body>
   {{> specRunner }}
 </body>

 <template name="testContentType">
   <span class="testContentType">{{ text }}</span>
 </template>
*/

describe("Curried function application", function () {

    function add(a, b) { 
        return a + b; 
    }

    it("returns a function with the first argument filled in", function () {
        var add3 = add.curry(3);
        expect(add3(10)).toBe(13);
    });
});

describe("Curry/Composition Path Handling Strategy", function () {

    var thatGetPathname = TYSON.getPathname;

    beforeEach(function () {
        TYSON.pathHandlers.mult = function (a, b) {
            return parseInt(a, 10) * parseInt(b, 10);
        };

        TYSON.pathHandlers.add  = function (a, b) {
            return parseInt(a, 10) + parseInt(b, 10);
        };

        TYSON.pathHandlers.dubl = function (a) {
            return parseInt(a, 10) * 2;
        };

        TYSON.pathHandlers.func = function () {
            return 'func called';
        };

        TYSON.pathHandlers.concat = function (a, b, c) {
            return a+b+c;
        };

        TYSON.pathHandlers.error = function (a, b) {
            throw "test error";
        };

    });

    afterEach(function () {
        TYSON.pathHandlers.mult   = {};
        TYSON.pathHandlers.add    = {};
        TYSON.pathHandlers.dubl   = {};
        TYSON.pathHandlers.func   = {};
        TYSON.pathHandlers.concat = {};
        TYSON.pathHandlers.error  = {};
        TYSON.getPahtname         = thatGetPathname;
    });

    it("Currys the path down as far as it can go", function () {
        /* calls add and mult in expected order */
        expect(TYSON.composeFromPath("/mult/5/add/1/1")).toBe(10);
        expect(TYSON.composeFromPath("/add/5/mult/1/1")).toBe(6);
        /* works with just one function */
        expect(TYSON.composeFromPath("/add/10/10/")).toBe(20);
        /* works with functions of more than 2 args */
        expect(TYSON.composeFromPath("/add/1/concat/1/2/3")).toBe(124);
        expect(TYSON.composeFromPath("/concat/oh-/my-/guarsh"))
            .toBe("oh-my-guarsh");
    });

    it("can handle mixes of functions and args", function () {
        var path = "/add/mult/2/2/add/mult/1/1/2"; // (2*2) + ((1*1) + 2) = 7
        expect(TYSON.composeFromPath(path)).toBe(7);
    });

    it("Is triggered by {{{ thisPage }}}", function () {
        TYSON.getPathname = function () {
            return "/add/add/2/3/add/3/add/1/1";
        };
        expect(Template.thisPage()).toBe('10');
    });

    it("relys on defaultPahtHandler for the root path", function () {
	expect(TYSON.composeFromPath("/")).toBe(
	  '<h2>Tyson could not find a homepage template</h2>\n'+
          '  <p>define a template named "homepage"</p>');
    });

    it("survives errors in path handling and in function calls", function () {
	Template.error500Page = function () {
	    return "internal error";
	}
	expect(TYSON.composeFromPath("/error/5/5")).toBe("internal error");
	expect(TYSON.composeFromPath("/mult/5/5")).toBe(25);
    });

    it("Works with single arguement functions", function () {
        expect(TYSON.composeFromPath("/dubl/4")).toBe(8);
    });

    it("calls the function if the path is just a function", function () {
        expect(TYSON.composeFromPath('/func')).toBe('func called');
    });

    it("expects path handlers to handle NaNs. FIX WITH TYPES!", function () {
        /* this expects NaN to flow through currently. If tyson ever gets type
           checking added this should not be an issue (Maybe anyone?) */
        expect(isNaN(TYSON.composeFromPath("/add/a/1"))).toBe(true);
        /* big TODO: change the behavior of /add/a/1 from returning NaN to a
           type error through type checking these functions and their
           arguements */
    });

});
