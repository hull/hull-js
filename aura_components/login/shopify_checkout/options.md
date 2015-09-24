Shopify Checkout Component Options
==================================

To install this component paste the following snippet at the end of your Theme's `cart.liquid` file.

```html
<div data-hull-component="login/shopify_checkout@hull"></div>
```

## Core

### `data-target`

*String*

- The CSS selector to use to find the checkout button. If not provided, the component will try to find one element that matches with the `input[name="checkout"]` or `#checkout` selectors.

## Style

### `data-inject-link-tag`

*Boolean*, default to `true`.

- If set to `false` css stylesheet will not be injected into the shop. This options is useful for theme developer that want to have complete control over css.
