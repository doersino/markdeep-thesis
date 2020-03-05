*(Really just a note to self.)*

When upgrading any of these dependencies, keep the following in mind:


## Markdeep

* Add support (and maybe an example in the demo) for any newly added constructs.
* Get the new `relativize.css` from [here](https://github.com/doersino/markdeep-relative-sizes).
* Update the include path at the bottom of the demo to match the new version.
* Update the include path in the `applyStyles` function of `../markdeep-thesis.js` to match the new version.


## Bindery

* Download new versions of the required files from [here](https://unpkg.com/browse/bindery@2.2.9/dist/).
* Check if anything breaks (*especially* in the printed PDF).


## MathJax

* [Strip it down](https://github.com/mathjax/MathJax-docs/wiki/Guide:-reducing-size-of-a-mathjax-installation/1814429ed1e97bfb7675c0fd400804baa9287249) to match the currently included version in terms of feature set and size.
* Update the include path at the bottom of the demo to match the new version.


## Webfonts

* Download new versions of ... from ...:
    * Aleo from https://github.com/AlessioLaiso/aleo
    * Iosevka from https://github.com/be5invis/Iosevka
    * Poppins from https://github.com/itfoundry/poppins
    * PT Sans Narrow & PT Serif from https://google-webfonts-helper.herokuapp.com/fonts, see also https://fonts.google.com/attribution
* Update their import paths in `../style.css`.
