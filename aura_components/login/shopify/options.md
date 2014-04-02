Shopify Component Options
=========================

## Core

### `data-show-link-identity`

*Boolean*, default to `true`.

- If set to `true` user will see a button that allow him to link other social identity.

## Style

### `data-inject-link-tag`

*Boolean*, default to `true`.

- If set to `false` css stylesheet will not be injected into the shop. This options is usefull for theme developer that want to have complete control over css.

### `data-inline`

*Boolean*, default to `false`. Only work with if `data-inject-link-tag` is set to `true`.

- If set to `false` buttons are stacked.
- If set to `true` buttons are displayed on one line.

## Error message

### `data-show-errors`

*Boolean*, default to `true`.

- If set to `false`, error message are not displayed. The theme developer have to handle error messsage manualy.

### `data-identity-taken-message`

*String*, default to:

```
'This "{{provider}}" account is already linked to another User'
```

### `data-email-taken-message`

*String*, default to:

```
'"{{email}}" is already taken'
```

### `data-auth-failed-message`

*String*, default to:

```
'You did not fully authorize or "{{provider}}" app is not well configured'
```

### `data-window-closed-message`

*String*, default to:

```
'Authorization window has been closed'
```

### `data-fallback-message`

*String*, default to the error message sent by the server. (Most of the time is `'Login failed'`).

