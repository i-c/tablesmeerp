# tablesmeerp

A utility for processing random-generation tables in JSON or YAML format.

## Expressions

### table

```yaml
table: [name]
do:
  [expression]: ...
```

```json
{"table": "[name]", "do": {"[expression]": "..."}}
```

Register this as a table with the given name, and execute the given expression.

### text

```yaml
text: ...
```

```json
{"text": "..."}
```

Return the given text.

### roll

```yaml
roll: ...
```

```json
{"roll": "..."}
```

Evaluates the given dice roll text and return the results. Dice rolls are evaluated by the [`roll`](https://github.com/troygoode/node-roll) package.

### switch

```yaml
switch:
  - [expression]: ...
    case: ...
  - [expression]: ...
    case_start: ...
    case_end: ...
value:
  [expression]: ...
default:
  [expression]: ...
```

```json
{"switch": [{"[expression]": "...", "case": "..."},
            {"[expression]": "...", "case_start": "...", "case_end": "..."}],
 "value": {"[expression]": "..."},
 "default": {"[expression]": "..."}}
```

Evaluates the `value`, then returns the first expression from the list with a `case` that matches the evaluated `value` exactly, or with a `case_start` less than or equal to the evaluated `value` and `case_end` greater than or equal to the evaluated value.

The `default` is optional. If supplied, it will be evaluated and returned if no cases match. If not supplied and no cases match, nothing will be returned.

### pick_one

```yaml
pick_one:
  - [expression]: ...
  - [expression]: ...
```

```json
{"pick_one": [{"[expression]": "..."},
              {"[expression]": "..."}]}
```

Evaluates and returns a random expression from the list.

### save

```yaml
save: [name]
do:
  [expression]: ...
```

```json
{"save": "[name]", "do": {"[expression]": "..."}}
```

Evaluates the `do` expression and saves it as a variable named `[name]`.

### use

```yaml
use: [name]
```

```json
{"use": "[name]"}
```

Returns the value of the variable named `[name]`.
