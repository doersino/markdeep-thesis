𐃢𐃤𐃭𐃣𐃯𐃰𐃪𐃥𐃦𐃡𐃨𐃩

* provide user with a set of options? paper size, margins, main font size, author name, bindery view,...

* decrease font size a bit, increase margins a touch, etc. (check my bsc thesis for reference)
* style all code listings like tilde ones?
* style admonitions better
* force use of https://fonts.google.com/specimen/PT+Serif instead of os-installed pt serif (which on mac has no umlauts)
    * same for pt sans narrow
    * download and rename the webfonts (also goes for all others)
    * sort of keep track of their licenses, for eventual release
    * although chrome seems to use the webfonts either way, so whatever
* revisit running heads, see https://www.thebookdesigner.com/2014/03/how-to-design-running-heads-for-your-book/
* make markdeep drawings a bit smaller – use zoom? or whatever machinery i used for markdeep-slides

* gobble parens around citations into citation (both in text view and in references list)
    * similar for some other references, like section X etc.
* figure out how best to avoid page breaks for captioned code
* marry mathjax/markdeep with unicodemathml
* maybe reference renaming: from names to numbers? rename to numbers in bibliography, then find all occurrences in the text?




## release

* test the entire thing with the markdeep demo, fix whatever issues crop up, document which markdeep features aren't supported
* document that markdeep includes (for individual chapters => thesis.md.html, 01-title.md, 02-abstract.md, 03-introduction.md, ..., 99-bibliography.md?) don't work

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
