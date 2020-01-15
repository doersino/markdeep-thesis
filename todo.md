* make demo more interesting and re-gen pdf

future work:
* keep scroll position in local storage instead of window name
* maybe reference renaming: from names to numbers? rename to numbers in bibliography, then find all occurrences in the text?
    * or, also, specifying references in some bibtex-style format and generate them
* gobble parens around citations into citation (both in text view and in references list)
    * similar for some other references, like section X etc.
* make links in footnotes create a new footnote somehow? not super important
    * idea: put footnote content in display: none element right after footnote reference, then bindery should be able to pick up on contained links

* test the entire thing with the markdeep feature demo, fix whatever issues crop up, document which markdeep features aren't supported
* document that markdeep includes (for individual chapters, e.g. thesis.md.html, 01-title.md, 02-abstract.md, 03-introduction.md, ..., 99-bibliography.md?) don't work as of now
* write readme
* make an upgrade.md like for -slides: bindery https://unpkg.com/browse/bindery@2.2.9/dist/, etc.








```
I've made another¹ thing that bends Markdeep to my will:

Write your {Bachelor,Master}'s thesis with Markdeep, MathJax and Bindery:
https://github.com/doersino/markdeep-thesis

(CC @CasualEffects)

¹ Previously: https://github.com/doersino/markdeep-slides
```
