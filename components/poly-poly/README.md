# poly-poly

Element to load feature polyfills from [polyfill.io service](https://polyfill.io/v2/docs/).

Helps to follow [fundamental polyfill best practices](https://w3ctag.github.io/polyfills/)
and avoid bundling polyfills with your elements while still supporting the PRPL pattern.

## Background

Let's talk about polyfills ... they are never going to go away. The whole reason we can use
WebComponents at all is because polyfills enable them in browsers that don't yet support them.
If we had to wait for all browsers to support a feature before we could use it, some features
would never be usable because use helps drive implementation by other browser vendors and the
polyfills help with that.

We obviously need to load the WebComponents polyfill itself when using Polymer but what about
other polyfills for features that may be required by individual elements?

## The Problem

The problem is, who's job is it to load polyfills and how?

One option is for each element to load whatever polyfill it needs directly. It's easy to add
a static `<script src="some-polyfill.js">` to the element and boom, job done. But there are
some drawbacks to doing this:

1. Polyfill scripts need to be added to each element repository (and not all are available
via package managers). Does the element author have to maintain those scripts as they are
updated and improved? Will they?

2. Polyfill scripts are loaded by all browsers, whether they need them or not. Some polyfills
are small and insignificant but others can be pretty large and they all add-up and ultimately
consume bandwidth and add script parsing overhead which can be significant on slower devices.

3. Different elements could need the same polyfills or different combinations of polyfills
which would further add to waste, especially as the same scripts could then be referenced from
several different paths.

3. It's unclear when polyfills can be removed. For a published element it becomes a hard choice
to support some versions of browsers or not. All these polyfills in different elements could 
build up over time.

4. We may be forcing one particular polyfill on consumers of our element when they would
prefer to use a different implementation.

Some of these could be mitigated - the element could include some feature detection to only
load the polyfill if it was required but this then leads to other problems - making sure that
the now possibly unreferenced script is included in any app bundle and so on. If we end up using
several different polyfills in different elements, each will add some latency to the loading
which could be undesirable. We're also still left with the polyfill versioning and support issues.

Bundling polyfills with our element goes against [fundamental polyfill best practices](https://w3ctag.github.io/polyfills/)

There's also some similarities to [The Problem With Using HTML Imports for Dependency Management](https://www.tjvantoll.com/2014/08/12/the-problem-with-using-html-imports-for-dependency-management/)

## Use a Polyfill Service

The ideal solution to polyfill loading is to use a [polyfill service](https://polyfill.io/v2/docs/).
This can allow us to update the users browser to support just the features we require all in a
single web request and as browsers are updated, the use of the polyfills can evaporate to zero
all without a single code change or redeploy of our applications.

If our element used any new feature we would need to document it and it become the app authors 
responsibility to load any required polyfill for it based on the browsers they want to support.

Perfect!

Except ...

## Async Polyfill Loading

Our polyfills may be requested way up in the header of the page, but the elements that use them
are right down in the DOM. If we make everything load synchronously then we're OK but it would be
nicer if we could keep everything as async as possible and only load them if and when they are
required.

If the elements and polyfills are loaded async, there is no guarantee that the polyfills will have
patched the browser features before our elements try to use them. So how do we make them wait if
they have to?

In some ways, this is more of a challenge with Polymer and WebComponents because they are so "native".
With many other frameworks there is a much clearer point where the app is loaded and initialized so,
if you are loading polyfills, you can just delay that startup. But if you have native support for 
WebComponents and you want to initialize the rest of your app while the polyfills are loaded, you
need some way to make them wait.

So I tried to come up with a solution ...

Any element that requires polyfills should inludes a dependency on the [poly-poly.html](./poly-poly.html)
element. This generates a request to the [polyfill.io service](https://polyfill.io/v2/docs/) to load
whatever polyfills have been listed in the `window.PolyPoly.features` array. This array should be set
based on feature detection in the apps `index.html` page.

This will delay triggering any polyfill loading until an element that requires it is itself
loaded which should make the system lazy-loading / PRPL pattern friendly. i.e. if only certain pages
of an app need polyfilled features then the polyfills do not need to be loaded unless and until those
pages are.

The `poly-poly` element provides a promise that the calling element can use to delay any operations 
until the polyfilled features are available. Actually, it's not a real `Promise` - I didn't want to
load the promise-polyfill that would load regardless of the browsers existing support (which is the
whole point of this element) so it's Promise-_like_ ... just enough to provide a `.then()` callback.

An example of the "promise" being used to delay functionality of an element until the required feature
is available is shown in [lazy-img](https://github.com/CaptainCodeman/lazy-img) which requires the
newer [IntersectionObserver](https://developers.google.com/web/updates/2016/04/intersectionobserver)
which at the time of writing is only supported natively in Google Chrome.

With Chrome, no additional scripts are loaded. Using a browser without native support will make a
request to load the ~20Kb polyfill required to function.

## Final Thoughts

The idea scenario would be for as much of this to be automated and built in to tooling as
possible. Maybe elements could be tagged with the features that they use (or they be automatically
detected by an analyzer) and the script to load them generated automatically.

I'd love to hear feedback on the approach and any ideas to improve it.
