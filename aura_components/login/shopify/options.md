Shopify Component Options
=========================

You can customize your login buttons by adding options to your snippet.

```html
<div data-hull-component="login/shopify@hull">Loading Social Login...</div>;
```

This is the default snippet. Let's say we want to change the 'Sign In with Facebook' to 'Connect with Facebook'. To do that we need to set the `data-sign-in-message` to `Connect with {{provider}}`.

```html
<div data-hull-component="login/shopify@hull" data-sign-in-message="Connect with {{provider}}">Loading Social Login...</div>;
```

## Core

### `data-show-link-identity`

*Boolean*, default to `true`.

- If set to `true` user will see a button that allow him to link other social identity.

### `data-show-sign-out`

*Boolean*, default to `true`.

- If set to `true` user will see a link that allow him to sign out.

### `data-show-errors`

*Boolean*, default to `true`.

- If set to `false`, error message are not displayed. The theme developer have to handle error messsage manualy.

### `data-redirect-to`

*String*, default to:

```
'/account'
```

## Style

### `data-inject-link-tag`

*Boolean*, default to `true`.

- If set to `false` css stylesheet will not be injected into the shop. This options is useful for theme developer that want to have complete control over css.

### `data-inline`

*Boolean*, default to `false`. Only work with if `data-inject-link-tag` is set to `true`.

- If set to `false` buttons are stacked.
- If set to `true` buttons are displayed on one line.

## Action messages

### `data-sign-in-message`

*String*, default to:

```
'Sign In with {{provider}}'
```

### `data-link-message`

*String*, default to:

```
'Link your {{provider}} account'
```

### `data-unlink-message`

*String*, default to:

```
'Unlink your {{provider}} account'
```

## Error messages

### `data-identity-taken-message`

*String*, default to:

```
'This "{{provider}}" account is already linked to another User.'
```

### `data-email-taken-message`

*String*, default to:

```
'"{{email}}" is already taken'
```

### `data-auth-failed-message`

*String*, default to:

```
'You did not fully authorize or "{{provider}}" app is not well configured.'
```

### `data-window-closed-message`

*String*, default to:

```
'Authorization window has been closed.'
```

### `data-customer-exists-message`

*String*, default to:

```
'"{{email}}" is already associated with an account... Please <a href="/account/login">log in with your password</a>. If you have forgotten your password, you can <a href="/account/login#recover">reset your password here</a>.'
```

### `data-fallback-message`

*String*, default to:

```
'Bummer, something went wrong during authentication.'
```

