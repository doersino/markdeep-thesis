markdeepOptions = {
    tocStyle: 'long',   // important for toc processing (see further down)
    detectMath: false,  // since we're rolling our own mathjax here
    onLoad: function() {

        // preprocess
        processEndnotes();
        processTOC();
        solidifyCodeLinenumbers();

        // remove empty <p>s (this makes some weird layout stuff less weird)
        document.querySelectorAll(".md p").forEach(e => e.innerHTML.trim() == "" ? e.remove() : null);

        loadMathJaxAndThenBindery();
    }
};

// collect endnotes and write their contents as data attributes into the
// references to them. this enables bindery to convert them to footnotes
function processEndnotes() {

    // find all references to endnotes
    var references = Array.from(document.querySelectorAll("sup > a[href^='#endnote-']"));
    var endnotes = [];
    references.forEach(function (element) {

        // get endnote contents
        var endnoteName = element.getAttribute("href").substr(1);
        var endnote = document.querySelector("a[name=\"" + endnoteName + "\"]").parentNode;

        // store for later removal (don't remove yet because there might, in
        // theory, be multiple references to this endnote)
        if (!endnotes.includes(endnote)) {
            endnotes.push(endnote);
        }

        // make a working copy
        endnote = endnote.cloneNode(true);

        // remove the soon-to-be-obsolete endnote number
        endnote.childNodes[1].remove();

        // base64-endcode the referenced contents and store in the reference
        // (this is hacky, but easy!)
        var endnoteEncoded = window.btoa(endnote.innerHTML);
        element.setAttribute("data-footnote-content", endnoteEncoded);

        // prepare endnote reference for later processing in bindery
        element.classList.add("footnote-reference");
        element.innerHTML = "";

        // write it back to the dom
        element.parentNode.parentNode.replaceChild(element, element.parentNode);
    });

    // remove original endnotes
    endnotes.forEach(e => e.remove());
}

// coerce the table of contents into a format more suitable for inserting page
// numbers (later on, with bindery)
function processTOC() {

    // extract toc entries
    var toc = document.getElementsByClassName("longTOC")[0].childNodes[1];
    var tocEntries = [];
    toc.childNodes.forEach(function (element) {

        // ignore <br>s and (Top) link
        if (element.tagName && element.tagName.toLowerCase() == "a" && !element.classList.contains("tocTop")) {
            tocEntries.push(element);
        }
    });

    // generate new toc
    newToc = document.createElement("ol");
    tocEntries.forEach(function (element) {

        // extract heading level
        var level = element.classList[0];
        element.removeAttribute("class");

        // replace href with unique, tocN.N-style target
        var tocN = element.querySelector("span").innerHTML;
        tocN = "toc" + tocN.split("&nbsp;")[0];
        element.setAttribute("href", "#" + tocN);

        // assemble new toc entry
        var row = document.createElement("li");
        row.classList.add(level);
        var span = document.createElement("span");
        span.appendChild(element);
        row.appendChild(span);

        newToc.appendChild(row);
    });

    // replace old toc with new one
    toc.parentNode.replaceChild(newToc, toc);

    // each heading the text has three anchors in front of it, of the format
    // name, supersectionname/.../name, and tocN.N – the toc (now) links to
    // the last one, so pull this one into the heading. (required since the
    // anchors frequently end up on the page before the heading after bindery is
    // done processing)
    var headings = document.querySelectorAll(".md h1, .md h2, .md h3");
    headings.forEach(function (element) {
        var anchor = element.previousSibling;
        anchor = anchor.cloneNode(true);
        anchor.classList.add("heading-target");
        element.appendChild(anchor);
    });
}

// generate line numbers of code listings in js and write them to css, thus
// keeping them from restarting when a code block is split onto multiple pages
// by bindery
function solidifyCodeLinenumbers() {
    document.styleSheets[0].addRule('.md pre.listing .linenumbers span.line:before', 'content: attr(data-linenumber) !important;');
    document.querySelectorAll("pre .linenumbers").forEach(function (element) {
        var i = 1;
        element.querySelectorAll(".line").forEach(function (element) {
            var linenumber = i++;
            element.setAttribute("data-linenumber", linenumber);
        });
    });
}

// load mathjax and, once it's done rendering math to svg, invoke a
// postprocessing step and then bindery.
// for reference, see https://docs.mathjax.org/en/v1.1-latest/startup.html#startup-sequence
// and https://github.com/mathjax/mathjax-docs/wiki/Event-when-typesetting-is-done%3F-Rescaling-after-rendering...
function loadMathJaxAndThenBindery() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src  = "markdeep-thesis/lib/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_SVG";

    var config = `
        MathJax.Hub.Config({
            extensions: ["tex2jax.js"],
            jax: ["input/TeX","output/SVG"]
        });
        MathJax.Hub.Startup.onload();
        MathJax.Hub.Register.StartupHook("End",function () {
            //console.log(document.querySelector(".md"));
            postprocessMathJax();
            loadBindery();
        });
    `;

    script.text = config;
    document.getElementsByTagName("head")[0].appendChild(script);
}

// pulls generated svgs into the text where they should be placed, then removes
// any trace elements (haha) mathjax has left behind – this seems to help
// bindery avoid mistakes when page breaking
function postprocessMathJax() {
    var svgs = document.querySelectorAll(".MathJax_SVG svg");
    svgs.forEach(function (element) {
        element.parentNode.parentNode.replaceChild(element, element.parentNode);
    });
    document.querySelectorAll(".MathJax_Preview").forEach(e => e.remove());
    document.querySelectorAll("script[type='math/tex']").forEach(e => e.remove());
}

// loads bindery with the appropriate options
// TODO expose some of these to the user of markdeep-thesis?
function loadBindery() {
    var book = Bindery.makeBook({
        content: '.md',
        pageSetup: {
            size: { width: '21cm', height: '29.7cm' },
            margin: { top: '2cm', inner: '3cm', outer: '2cm', bottom: '2cm' },
        },
        printSetup: {
            layout: Bindery.Layout.PAGES,
            paper: Bindery.Paper.AUTO,
            marks: Bindery.Marks.NONE,
            bleed: '0pt',
        },
        //view: Bindery.View.PREVIEW,
        view: Bindery.View.PRINT,
        //view: Bindery.View.FLIPBOOK,
        rules: [
            Bindery.FullBleedPage({
                selector: '.title-page',
                continue: 'same'
            }),
            Bindery.PageBreak({ selector: 'h1', position: 'before', continue: 'right' }),
            Bindery.PageBreak({ selector: '.nonumberh1', position: 'before', continue: 'right' }),
            Bindery.PageBreak({ selector: 'hr', position: 'before', continue: 'right' }),
            Bindery.PageBreak({ selector: '.image', position: 'avoid'}),  // figures
            Bindery.PageBreak({ selector: '.table', position: 'avoid'}),  // figures
            Bindery.RunningHeader({
                render: function (page) {
                    var pageNum = page.number-2;

                    if (/*page.isEmpty ||*/ pageNum <= 0) {
                        return "";
                    }
                    if (page.isLeft) {
                        if (page.heading.h1 != null) {
                            return `${pageNum}⁓${page.heading.h1}`  // alternatives: ⸺, ⸻
                        }
                        return `${pageNum}`
                    } else {
                        return `Noah Doersing⁓${pageNum}`;
                    }
                }
            }),
            Bindery.PageReference({
                selector: '.longTOC li',
                replace: (element, number) => {
                    var pageNum = number-2;

                    element.innerHTML += `<span class='num'>${pageNum}</span>`;
                    return element;
                },
                createTest: function (element) {
                    const href = element.querySelector("a").getAttribute('href');
                    if (!href) return null;
                    return el => el.querySelector("a.target.heading-target[name='" + href.substr(1) + "']");
                }
            }),
            Bindery.Footnote({
                selector: 'a.footnote-reference',
                render: function (element, number) {
                    return "<sup>" + number + "</sup>" + window.atob(element.getAttribute("data-footnote-content"));
                }
            }),
            Bindery.Footnote({
                selector: 'p a[href^="http"], blockquote a[href^="http"]',
                render: (element, number) => {
                    return '<sup>' + number + '</sup> See <a href="' + element.href + '" class="url">' + element.href + '</a>.';
                }
            }),
        ],
    });

    //console.log(book);
    tryRestoringScrollPosition();
}

// restore scroll position once bindery appears to be done and another 100ms
// (for good measure) have passed by
function tryRestoringScrollPosition() {
    var to = setInterval(function() {
        var retry = true;
        try {
            retry = document.querySelector(".📖-root").classList.contains("📖-in-progress");  // this class disappears when bindery is done – hacky, but i didn't find another way of determining this
        } catch(e) {}

        if (!retry && window.name.search("^\\d+$") == 0) {
            clearInterval(to);
            setTimeout(function() {
                window.scrollTo(0, window.name);
            }, 100);  // <- this constant might need adjusting for more complex documents!
        }
    }, 10);  // retry every 10ms (overkill, but doesn't seem to hurt)
}

// store scroll position before unloading the page
window.onbeforeunload = function() {
    window.name = window.pageYOffset;
};
