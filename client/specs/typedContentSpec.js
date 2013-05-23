/*
 to run all specs with space-daisy, create an html file with this in it.

 <head>
   <title>Tyson Spec Runner</title>
 </head>
 <body>
   {{> specRunner }}
 </body>

 <template name="testContentType">
   <p class="testContentType">{{ text }}</p>
 </template>
*/

describe("Built in content type system", function () {

    var testArticle = {};    
    var articleId = '';

    function withPath (pathname) {
	TYSON.getPathname = function () {
	    return pathname;
	}
    }

    beforeEach(function () {
	console.log('\n\n');
	testArticle = {
	    type: 'article',
	    markdown: '# heading',
	    slug: 'test-article'
	};
	articleId = tysonContent.insert(testArticle);
	thisGetPathname = TYSON.getPathname
    });

    afterEach(function () {
        testArticle = {};
	tysonContent.remove(articleId);
	TYSON.getPathname = thisGetPathname;
    });

    it("finds and renders articles by slug", function () {
	var rendered = '';
	withPath('/content/slug/test-article');
	rendered = Template.thisPage();
	expect(rendered).toBe('<div class="article"><h1 id="heading">heading</h1></div>');
    });

    it('has an article path handler that accepts slugs and _ids', function () {
	var rendered = '';
	var expected = '<div class="article"><h1 id="heading">heading</h1></div>';

	withPath("/article/test-article");
	rendered = Template.thisPage();
	expect(rendered).toBe(expected);

	withPath("/article/" + articleId);
	rendered = Template.thisPage();
	expect(rendered).toBe(expected);
    });
});

describe("Typed Content", function () {

    var testContent = {};
    var testArticle = {}

    beforeEach(function () {
	testContent = {
            type: "testContentType",
            text: "test content type text"
        };
    });

    afterEach(function () {
        testContent = {};
	testArticle = {};
    });

    it("{{{ renderThisContent }}} matches template type to name", function () {
        /* {{> tysonDetail }} calls {{{ renderThisContent }}} */
        rendered = $(Template.tysonDetail(testContent));
        expect(rendered[0].tagName).toBe('P');
        expect(rendered[0].className).toBe('testContentType');
        expect(rendered.text()).toBe('test content type text');
    });

});