'use strict';

let polyfillPromise;
if ('IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in IntersectionObserverEntry.prototype) {
  polyfillPromise = Promise.resolve();
} else {
  const url = new URL('intersection-observer.js', document.currentScript.src);
  polyfillPromise = new Promise(function(resolve, reject) {
    var s = document.createElement("script");
    s.src = url.href;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

var elementObservers = new WeakMap();

function notifyEntries(entries) {
  for(var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    if (entry.intersectionRatio) {
      entry.target.loadImage();
    }
  }
}

// small blank image to use as placeholder
const blankSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * `lazy-img` is a lazy loading img element that is shadow-dom friendly and uses
 * [IntersectionObserver](https://developers.google.com/web/updates/2016/04/intersectionobserver)
 * to efficiently detect when images are within the selected viewport and need to
 * be loaded.
 *
 * The default behavior is to use the browser viewport but more specific control
 * can be provided by setting the `observe` property to a parent selector (either
 * an element id, class or tag name):
 *
 * ```html
 * <div id="myscroller">
 *   <lazy-img src="image1.jpg" observe="#myscroller"></lazy-img>
 *   <lazy-img src="image2.jpg" observe="#myscroller"></lazy-img>
 *   ...
 *   <lazy-img src="image99.jpg" observe="#myscroller"></lazy-img>
 * <div>
 * ```
 *
 * `margin` and `threshold` properties also allow control over exactly when loading
 * is triggered as the element comes into view. `margin` can reduce or extend the
 * detection area of the container and `threshold` can determine what proportion of
 * the image needs to be within the area.
 *
 * If used on a browser without support for `IntersectionObserver` a polyfill will
 * be loaded automatically.
 *
 * @customElement
 * @demo /components/lazy-img/demo/
 */
class LazyImgElement extends HTMLElement {

  static get observedAttributes() {
    return ['alt', 'src', 'margin', 'threshold', 'observe'];
  }

  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this._img = document.createElement('img');
    this._img.style.width = '100%';
    this._img.style.height = '100%';
    this._img.src = blankSrc;
    this.shadow.appendChild(this._img);

    this._margin =  '0px 0px 0px 0px';
    this._threshold = 0.10;
    this._observe = null;
  }

  connectedCallback() {
    this.style.display = 'inline-block';
  }

  disconnectedCallback() {
    this.stopObserving();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[name] = newValue;
  }

  /** image src. */
  get src() { return this._src; }
  set src(value) {
    this.stopObserving();
    this.removeAttribute('loaded');
    this._src = value;
    this._img.src = blankSrc;
    this.startObserving();
    this.setAttribute('src', value);
  }

  /** image alt text. */
  get alt() { return this._alt; }
  set alt(value) {
    this._alt = this._img.alt = value;
    this.setAttribute('alt', value);
  }

  /** margin to extend intersection observer. */
  get margin() { return this._margin; }
  set margin(value) {
    this._margin = value;
    this.setAttribute('margin', value);
  }

  /**
   * threshold for intersection observer - what
   * percentage of the image needs to be visible
   * to trigger loading.
   */
  get threshold() { return this._threshold; }
  set threshold(value) {
    this._threshold = value;
    this.setAttribute('threshold', value);
  }

  /** selector of the container element to observe. */
  get observe() { return this._observe; }
  set observe(value) {
    this._observe = value;
    this.setAttribute('observe', value);
  }

  /** load the image */
  loadImage() {
    this._img.onload = () => {
      this.setAttribute('loaded', '');
      var event = new Event('load');
      event.detail = { originalTarget : this._img };
      this.dispatchEvent(event);
    };
    this._img.src = this._src;
    this.stopObserving();
  }

  /** stop observing visibility changes to this element */
  stopObserving() {
    if (this._observer) {
      this._observer.unobserve(this);
      if (--this._observer._lazyImgCount <= 0) {
        this.deleteObserver(this._observer);
      }
      this._observer = null;
    }
  }

  /** start observing for this element becoming visible */
  startObserving() {
    this.getObserver().then(observer => {
      this._observer = observer;
      this._observer.observe(this);
      this._observer._lazyImgCount++;
    });
  }

  /**
   * get or create the observer for this element
   *
   * returns a promise so that IntersectionObserver
   * can be polyfilled asynchronously and everything
   * be wired up and created while that happens.
   */
  getObserver() {
    return polyfillPromise.then(() => {
      var observer;

      // get element based on selector if there is one
      var el = this._observe ? this.getClosest() : null;
      var node = el || document.documentElement;

      var options = {
        root: el,
        rootMargin: this._margin,
        threshold: this._threshold
      }
      // See if there is already an observer created for the
      // intersection options given. Note we perform a double
      // lookup (map within a map) because the actual map key
      // is a different instance and there is no hashing
      var observersMap = elementObservers.get(node);
      if (!observersMap) {
        observersMap = new Map();
        elementObservers.set(node, observersMap);
      }

      var key = options.rootMargin + '/' + options.threshold;
      observer = observersMap.get(key);
      if (!observer) {
        // first time for this observer options combination
        observer = new IntersectionObserver(notifyEntries, options);
        observer._lazyImgKey = key;
        observer._lazyImgCount = 0;
        observersMap.set(key, observer);
      };

      return observer;
    });
  }

  /** disconnect and delete an observer */
  deleteObserver(observer) {
    var observersMap = elementObservers.get(observer.root);
    if (observersMap) {
      observersMap.delete(observer._lazyImgKey);
      if (observersMap.size === 0) {
        elementObservers.delete(observer.root);
      }
    }
    observer.disconnect();
  }

  /** get the closest element with the given selector */
  getClosest() {
    var el = this;
    while (el.host || (el.matches && !el.matches(this._observe)))
      el = el.host || el.parentNode;
    return el.matches ? el : null;
  }
}

window.customElements.define('lazy-img', LazyImgElement);
