[![Published on Vaadin  Directory](https://img.shields.io/badge/Vaadin%20Directory-published-00b4f0.svg)](https://vaadin.com/directory/component/CaptainCodemanlazy-img)
[![Stars on vaadin.com/directory](https://img.shields.io/vaadin-directory/star/CaptainCodemanlazy-img.svg)](https://vaadin.com/directory/component/CaptainCodemanlazy-img)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/CaptainCodeman/lazy-img)

_[Demo and API docs](http://captaincodeman.github.io/lazy-img/)_

# \<lazy-image\>

`lazy-img` is a lazy loading img element that is shadow-dom friendly
and uses [IntersectionObserver](https://developers.google.com/web/updates/2016/04/intersectionobserver)
to detect when images are within the viewport and need to be loaded.

The default behavior is to use the browser viewport but more specific control
can be provided by setting the `observe` property to a parent selector (either
an element id, class or tag name):

```
<div id="myscroller">
        <lazy-img src="image1.jpg" observe="#myscroller"></lazy-img>
        <lazy-img src="image2.jpg" observe="#myscroller"></lazy-img>
        ...
        <lazy-img src="image99.jpg" observe="#myscroller"></lazy-img>
<div>
```

`margin` and `threshold`  allow control over exactly when the loading is triggered as the
element comes into view. `margin` can reduce or extend the detection area of the container
and `threshold` can determine what proportion of the image needs to be within the area.

Demo is based on [this example of intersection-observer](https://github.com/wilsonpage/in-sixty/blob/gh-pages/intersection-observer/index.html)

If used on a browser without support for `IntersectionObserver` a polyfill will be
loaded automatically from the [polyfill.io service](https://polyfill.io/v2/docs/).

Configure this with the following code in `index.html`:

```
<script>
  // Define polyfills for features that our app depends on:
  window.PolyPoly = {
    features: []
  };
  ('IntersectionObserver' in window) || window.PolyPoly.features.push('IntersectionObserver');
</script>
```
