* gobble parens around citations into citation (both in text view and in references list)
    * similar for some other references, like section X etc.
* figure out how best to avoid page breaks for captioned code and tables? possible/reasonable at all? or just better to use full-page figures for them? hack bindery to move figures that don't fit on the current page to the top of the next page?
* maybe reference renaming: from names to numbers? rename to numbers in bibliography, then find all occurrences in the text?

* (just for my thesis) marry mathjax/markdeep with unicodemathml




## release

* test the entire thing with the markdeep feature demo, fix whatever issues crop up, document which markdeep features aren't supported
* document that markdeep includes (for individual chapters, e.g. thesis.md.html, 01-title.md, 02-abstract.md, 03-introduction.md, ..., 99-bibliography.md?) don't work as of now

```
I've made another¹ thing that bends Markdeep to my will:

Write your {Bachelor,Master}'s thesis with Markdeep, MathJax and Bindery:
https://github.com/doersino/markdeep-thesis

(CC @CasualEffects)

¹ Previously: https://github.com/doersino/markdeep-slides
```

demo:

=> come up with some weird area of study and subject
=> reviewing profs: morgan, bovik
=> reference Bovik, H. "Breath-First Techniques for the Game of Life",  in Artificial Intelligences Health, 5(88-108), 1998.

note in readme:

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
