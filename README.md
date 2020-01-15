# markdeep-thesis

TODO

* no page number on first two pages (title page and intentionally left blank)
* this is kinda fragile
* only one style: what i used for my own msc thesis, might not really be standard across the world
* liable to break with markdeep and bindery updates if they change the generated markup
* advertise markdeep-slides
* only print in chrome etc.
* (figure out why chrome seems to forget *part* of the styling (h1 sizes, <code> visibility, admonition title border-bottom, etc.) when entering print mode)
    * => print in Chrome via the browser menu item, not cmp+P!
* major things addressed by this work:
    * page breaking, with custom header/footer/page number, i.e. not the ones automatically inserted by the browser in print view, which are ugly
    * footnotes at the bottom of the corresponding pages instead of markdeep's default endnotes
    * custom aspect ratio/paper formats: a4, letter, ...
        * => try this out!
    * good styling for readability etc.
* note that there is no bibtex-style way of managing references – you need to do the formatting manually. this is certainly a feature that would be neat to integrate
* also would be neat (although markdeep should take care of this, really): some way of linking to sections with numbers (remember the manual step i had to do)?

TODO see markdeep-slides readme for reference

## Getting started

TODO etc.


## License

TODO bindery below, fonts PT Serif, Poppins, Iosevka Web, PT Sans Narrow, Aleo https://google-webfonts-helper.herokuapp.com, https://fonts.google.com/attribution, also iosevka which is not on google fonts yet (basically mirror what i've done for -slides)

You may use this repository's contents under the terms of the *BSD 2-Clause "Simplified" License*, see `LICENSE`.

However, the subdirectory `markdeep-thesis/lib/` contains **third-party software with its own licenses**:

* Morgan McGuire's **Markdeep** is *also* licensed under the *BSD 2-Clause "Simplified" License*, see [here](https://casual-effects.com/markdeep/#license).
* Markdeep includes Ivan Sagalaev's **highlight.js** with its *BSD 3-Clause License*, see [here](https://github.com/highlightjs/highlight.js/blob/master/LICENSE).
* TODO bindery
* **MathJax** is licensed under the *Apache License 2.0*, see [here](https://github.com/mathjax/MathJax/blob/master/LICENSE).
* All included **webfonts** (TODO list fonts used) are licensed under the *SIL Open Font License*, see [here](https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL_web).
