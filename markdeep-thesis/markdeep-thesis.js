var markdeepOptions = {
    tocStyle: 'long',   // important for toc processing (see further down)
    detectMath: false,  // since we're rolling our own mathjax here
    onLoad: function() {
        processMarkdeepThesisOptions();
        postprocessMarkdeep();
        loadMathJaxAndBindery();
    }
};

var options;
function processMarkdeepThesisOptions() {
    options = {
          view: "print"
        , titlePage: null
        , fontSize: 10.5
        , pageSize: {width: '21cm', height: '29.7cm'}
        , pageMargins: {top: '2.5cm', inner: '3.5cm', outer: '2.5cm', bottom: '2.5cm'}
        , extraBinderyRules: []  // this option is why bindery must be loaded before the options are defined in demo.md.html
        , runningHeader: (p => `${p.number}`)
        , markdeepDiagramScale: 1.0
        , hookAfterMarkdeep: Function.prototype  // turns out this is a good way of specifying a noop function: https://stackoverflow.com/a/33458430
        , hookAfterMarkdeepPostprocessing: Function.prototype
        , hookAfterMathJax: Function.prototype
        , hookAfterMathJaxPostprocessing: Function.prototype
        , hookAfterBindery: Function.prototype
    };

    if (typeof markdeepThesisOptions !== 'undefined') {
        options = Object.assign({}, options, markdeepThesisOptions);
    }

    // handle font size – all other options are handled by later functions
    document.documentElement.style.setProperty('--base-font-size', options.fontSize + "pt");

    options.hookAfterMarkdeep();
}

function postprocessMarkdeep() {
    applyStyles();
    renderTitlePage();
    processEndnotes();
    processTOCAndSectionHeadings();
    solidifyCodeLineNumbers();
    scaleDiagrams();

    // remove empty <p>s (this makes some weird layout stuff less weird)
    document.querySelectorAll(".md p").forEach(e => e.innerHTML.trim() == "" ? e.remove() : null);

    options.hookAfterMarkdeepPostprocessing();
}

// if these styles are defined in the .md.html document instead of here, Chrome
// confuses style sheet precedence during printing to PDF (but *not* during
// normal page display, for whatever weirdo reason) such that, for example,
// headings aren't the correct sizes and a whole bunch of margins are messed up
function applyStyles() {
    document.head.innerHTML += `
        <link rel="stylesheet" href="markdeep-thesis/lib/markdeep-relative-sizes/1.11/relativize.css">
        <link rel="stylesheet" href="markdeep-thesis/style.css">'
    `;
}

function renderTitlePage() {
    if (!options.titlePage) {
        return;
    }

    // converts \n line breaks into <br>
    function e(n) {
        return (n || "").trim().split("\n").join("<br>");
    }

    var titlePageMarkup = `
    <div class="title-page">
        <div class="title-top">
            <div class="title-institution">${e(options.titlePage.institution)}</div>
            <div class="title-institution-extra">${e(options.titlePage.institutionExtra)}</div>
        </div>
        <div class="title-middle">
            <div class="title-kind">${e(options.titlePage.thesisKind)}</div>
            <div class="title-title">${e(options.titlePage.thesisTitle)}</div>
            <div class="title-subtitle">${e(options.titlePage.thesisSubtitle)}</div>
            <div class="title-author">${e(options.titlePage.thesisAuthor)}</div>
            <div class="title-date">${e(options.titlePage.thesisDate)}</div>
        </div>
        <div class="title-bottom">
    `
    if (options.titlePage.reviewers) {
        titlePageMarkup += `<div class="thesis-reviewer">Reviewer` + (options.titlePage.reviewers.length == 1 ? "" : "s") + `:</div>`;
        options.titlePage.reviewers.forEach(function (r) {
            titlePageMarkup += `<div class="thesis-reviewer">${e(r)}</div>`
        });
    }

    titlePageMarkup += `
        </div>
    </div>
    <hr>
    `

    var tmp = document.createElement('div');
    tmp.innerHTML = titlePageMarkup;
    document.querySelector(".md").insertAdjacentElement('afterbegin', tmp);
}

// collect endnotes and write their contents as data attributes into the
// references to them. this enables bindery to convert them to footnotes
function processEndnotes() {

    // find all references to endnotes
    var references = Array.from(document.querySelectorAll("sup > a[href^='#endnote-']"));
    var endnotes = [];
    references.forEach(function (element) {

        // get endnote contents
        var endnoteName = element.getAttribute("href").substr(1);
        try {
            var endnote = document.querySelector("a[name=\"" + endnoteName + "\"]").parentNode;
        } catch (error) {
            var msg = "Definition of footnote reference '[^" + endnoteName + "]' not found";
            element.innerText = msg;
            element.setAttribute("style", "color: red !important");
            console.log(msg);
            return;
        }

        // store for later removal (don't remove yet because there might, in
        // theory, be multiple references to this endnote)
        if (!endnotes.includes(endnote)) {
            endnotes.push(endnote);
        }

        // make a working copy
        endnote = endnote.cloneNode(true);

        // remove the soon-to-be-obsolete endnote number
        endnote.childNodes[1].remove();

        // encode the referenced contents and store in the reference
        // (this is hacky, but easy!)
        var endnoteEncoded = encodeURIComponent(endnote.innerHTML);
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
// numbers (later on, with bindery), also solidify section numbers in headings
// in the text
function processTOCAndSectionHeadings() {

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

    // each heading in the text has three anchors in front of it, of the format
    // name, supersectionname/.../name, and tocN.N – the toc (now) links to
    // the last one, so pull this one into the heading. (required since the
    // anchors frequently end up on the page before the heading after bindery is
    // done processing)
    var headings = document.querySelectorAll(".md h1, .md h2, .md h3, .md h4, .md h5, .md h6");
    headings.forEach(function (element) {
        var anchor = element.previousSibling;
        anchor = anchor.cloneNode(true);
        anchor.classList.add("heading-target");
        element.appendChild(anchor);

        // solidify section numbers
        var sectionNumber = anchor.name.substr(3);
        element.setAttribute("data-sectionnumber", sectionNumber);
    });

    // display newly-solidified section numbers instead of css couters (which
    // are buggy in bindery in a similar way as listing line numbers)
    for (i = 1; i <= 6; i++) {
        document.styleSheets[0].addRule('.md h' + i + ':before', 'content: attr(data-sectionnumber) !important;');
    }
}

// generate line numbers of code listings in js and write them to css, thus
// keeping them from restarting when a code block is split onto multiple pages
// by bindery
function solidifyCodeLineNumbers() {
    document.styleSheets[0].addRule('.md pre.listing .linenumbers span.line:before', 'content: attr(data-linenumber) !important;');
    document.querySelectorAll("pre .linenumbers").forEach(function (element) {
        var i = 1;
        element.querySelectorAll(".line").forEach(function (element) {
            var linenumber = i++;
            element.setAttribute("data-linenumber", linenumber);
        });
    });
}

// scale diagrams: markdeep diagrams have their width and height attributes set
// to absoulute pixel values, which can't easily be scaled with css. so we
// need to move this width and height information into a new viewbox
// attribute, then we can set a new width and height depending on the desired
// zoom factor. note this this functionality is similar to a part of markdeep-
// slides
function scaleDiagrams() {
    // this factor works well as a baseline
    var zoom = options.markdeepDiagramScale;

    document.querySelectorAll("svg.diagram").forEach(function(diag) {
        var w = diag.getAttribute("width"),
            h = diag.getAttribute("height");

        diag.removeAttribute("width");
        diag.removeAttribute("height");
        diag.setAttribute("viewBox", "0 0 " + w + " " + h);
        diag.style.width  = w * zoom;
        diag.style.height = h * zoom;
    });
}

// load mathjax and, once it's done rendering math to svg, invoke a
// postprocessing step and then bindery.
// for reference, see https://docs.mathjax.org/en/v1.1-latest/startup.html#startup-sequence
// and https://github.com/mathjax/mathjax-docs/wiki/Event-when-typesetting-is-done%3F-Rescaling-after-rendering...
function loadMathJaxAndBindery() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "markdeep-thesis/lib/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_SVG";

    var config = `
        MathJax.Hub.Startup.onload();
        MathJax.Hub.Register.StartupHook("End",function () {
            options.hookAfterMathJax();
            postprocessMathJax();
            options.hookAfterMathJaxPostprocessing();
            loadBindery();
        });
    `;
    script.text = config;

    document.getElementsByTagName("head")[0].appendChild(script);
}

// pulls generated math svgs into the text where they should be placed, then
// remove any trace elements (haha) mathjax has left behind – this seems to help
// bindery avoid mistakes related to page breaking
function postprocessMathJax() {
    var svgs = document.querySelectorAll(".MathJax_SVG svg");
    svgs.forEach(function (element) {
        element.parentNode.parentNode.replaceChild(element, element.parentNode);
    });
    document.querySelectorAll(".MathJax_Preview").forEach(e => e.remove());
    document.querySelectorAll("script[type='math/tex']").forEach(e => e.remove());
}

// loads bindery with the appropriate options
function loadBindery() {
    var view;
    switch (options.view) {
        case "print": view = Bindery.View.PRINT; break;
        case "preview": view = Bindery.View.PREVIEW; break;
        case "flipbook": view = Bindery.View.FLIPBOOK; break;
        default: view = Bindery.View.PRINT; break;
    }

    var book = Bindery.makeBook({
        content: '.md',
        pageSetup: {
            size: options.pageSize,
            margin: options.pageMargins,
        },
        printSetup: {
            layout: Bindery.Layout.PAGES,
            paper: Bindery.Paper.AUTO,
            marks: Bindery.Marks.NONE,
            bleed: '0pt',
        },
        view: view,
        rules: [
            Bindery.FullBleedPage({
                selector: '.title-page',
                continue: 'same'
            }),
            Bindery.PageBreak({ selector: 'h1', position: 'before', continue: 'right' }),
            Bindery.PageBreak({ selector: '.nonumberh1', position: 'before', continue: 'right' }),
            Bindery.PageBreak({ selector: 'hr:not(.ignore)', position: 'before', continue: 'right' }),
            Bindery.PageBreak({ selector: '.pagebreak', position: 'before' }),  // just write <span class="pagebreak"></span> to force a page break
            Bindery.PageBreak({ selector: '.image', position: 'avoid'}),  // figures
            Bindery.PageBreak({ selector: '.table', position: 'avoid'}),  // figures
            Bindery.RunningHeader({
                render: function (page) {
                    page.number = page.number-2;

                    if (page.number <= 0) {
                        return "";
                    }
                    return options.runningHeader(page);
                }
            }),
            Bindery.PageReference({
                selector: '.longTOC li',
                replace: (element, number) => {

                    // no need to subtract 2 here since the modified page object
                    // from the RunningHeader setting above seems to be reused
                    // here
                    var pageNum = number;

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
                    return "<sup>" + number + "</sup>" + decodeURIComponent(element.getAttribute("data-footnote-content"));
                }
            }),
            Bindery.Footnote({
                selector: 'p a[href^="http"]:not(.url), blockquote a[href^="http"]:not(.url), li a[href^="http"]:not(.url)',
                render: (element, number) => {
                    return '<sup>' + number + '</sup> See <a href="' + element.href + '" class="url">' + element.href + '</a>.';
                }
            }),
            ...options.extraBinderyRules
        ],
    });

    tryRestoringScrollPosition();
}

// restore scroll position once bindery appears to be done and another 100ms
// (for good measure) have passed by
function tryRestoringScrollPosition() {
    var to = setInterval(function() {
        var retry = true;
        try {

            // this class disappears when bindery is done – hacky, but i didn't
            // find another way of determining this
            retry = document.querySelector(".📖-root").classList.contains("📖-in-progress");
        } catch(e) {}

        if (!retry && window.name.search("^\\d+$") == 0) {
            clearInterval(to);
            options.hookAfterBindery();
            setTimeout(function() {
                window.scrollTo(0, window.name);
            }, 100);  // <- this constant might need adjusting for more complex
                      //    documents (although it worked for my 100-page thesis)
        }
    }, 10);  // retry every 10ms (overkill, but doesn't seem to matter)
}

// store scroll position before unloading the page
window.onbeforeunload = function() {
    window.name = window.pageYOffset;
};
