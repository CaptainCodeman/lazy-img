_[Demo and API docs](http://captaincodeman.github.io/lazy-img/)_

# \<lazy-image\>

`lazy-img` is a lazy loading img element that is shadow-dom friendly
and uses [IntersectionObserver](https://developers.google.com/web/updates/2016/04/intersectionobserver)
to detect when images are within the viewport and need to be loaded.

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
