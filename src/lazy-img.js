'use strict';

var elementObservers = new WeakMap();

function notifyEntries(entries) {
  for(var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    if (entry.intersectionRatio) {
      entry.target.loadImage();
    }
  }
}

const blankSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

let polyfillPromise;
if ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
  polyfillPromise = Promise.resolve();
} else {
  const url = new URL('intersection-observer.js', document.currentScript.src);
  polyfillPromise = new Promise(function(resolve, reject) {
    var s = document.createElement("script");
    s.src = url.href;
    s.onload = resolve;
    s.onerror = reject;
    document.documentElement.appendChild(s);
  });
}

class LazyImgElement extends HTMLElement {

  static get observedAttributes() {
    return ['src', 'alt', 'margin', 'threshold', 'observe'];
  }

  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.img = document.createElement('img');
    this.img.style.width = '100%';
    this.img.style.height = '100%';
    this.img.src = blankSrc;
    this.shadow.appendChild(this.img);

    this.margin =  '0px 0px 0px 0px';
    this.threshold = 0.10;
    this.observe = null;
  }

  connectedCallback() {
    this.style.display = 'inline-block';
  }

  disconnectedCallback() {
    this.stopObserving();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    switch (name) {
      case 'alt':
        this.img.alt = newValue;
        break;
      case 'src':
        this.onSrcChanged(newValue);
        break;
      case 'margin':
        this.margin = newValue;
        break;
      case 'threshold':
        this.threshold = newValue;
        break;
      case 'observe':
        this.observe = newValue;
        break;
    }
  }

  /** setting or changing the image src resets the state */
  onSrcChanged(src) {
    this.stopObserving();
    this.removeAttribute('loaded');
    this._src = src;
    this.img.src = blankSrc;
    this.startObserving();
  }

  /** load the image */
  loadImage() {
    this.img.onload = () => {
      this.setAttribute('loaded', '');
    };
    this.img.src = this._src;
    this.stopObserving();
  }

  /** stop observing visibility changes to this element */
  stopObserving() {
    if (this.observer) {
      this.observer.unobserve(this);
      if (--this.observer._lazyImgCount <= 0) {
        this.deleteObserver(this.observer);
      }
      this.observer = null;
    }
  }

  /** start observing for this element becoming visible */
  startObserving() {
    this.getObserver().then(observer => {
      this.observer = observer;
      this.observer.observe(this);
      this.observer._lazyImgCount++;
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
      var el = this.observe ? this.getClosest() : null;
      var node = el || document.documentElement;

      var options = {
        root: el,
        rootMargin: this.margin,
        threshold: this.threshold
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
    while (el.host || (el.matches && !el.matches(this.observe)))
      el = el.host || el.parentNode;
    return el.matches ? el : null;
  }
}

window.customElements.define('lazy-img', LazyImgElement);
