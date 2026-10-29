# pointers.json: what the text says about widget W-02

You record what the page's text tells the reader to **do**, **expect**, or **look at** in the widget labelled W-02 ("Ari's sizing sheet"). You record what the text says, not whether it's true. When the text implies something without saying it outright ("that can mean another node on the bill"), encode the implication, and mark it with `"implied": true`.

Read the prose, the comprehension checks (including their options, feedback and reveals, which often sit in `data-*` attributes), captions, and disclosures. Anything that mentions W-02, "the widget", "the sheet", or its parts counts.

## Top level

```json
{
  "pointers": [ … ],
  "manipulations": [ … ],
  "named_elements": [ … ],
  "notes": "anything you could not encode, and why"
}
```

Every item has `"where"` (the nearest section id such as `s-04`, or a check id such as `k-09`) and `"quote"` (the exact text, short but sufficient).

## manipulations

These are things the text asks the reader to change in W-02, or says W-02 lets them explore:

```json
{ "where": "k-04", "quote": "…", "service": "orders", "attribute": "memory_request" }
```

`service` is one of `storefront`, `orders`, `payments`, `dispatch`, `notifications`, or `null`. `attribute` is one of `memory_request`, `cpu_request`, `copies`, `spare_switch`, `reset`, or `other:<short description>`.

## named_elements

These are names the text uses for a visible part of W-02 ("the warnings", "the X bar", "the Y switch"):

```json
{ "where": "s-05", "quote": "…", "name": "spare-node switch" }
```

## pointers

A pointer is a sequence of states the text asks the reader to produce, plus what the text says they'll see.

```json
{
  "id": "p1",
  "where": "k-09",
  "quote": "…",
  "start": "default",
  "steps": [ { "set": { "orders": 8 } }, { "set": { "orders": 12 } } ],
  "expect": [ { "at": 2, "observable": "nodes_for_pods", "op": "increases", "relative_to": 1, "implied": true } ]
}
```

**start** is the state the reader is in before step 1. It is one of:
- `"default"`: the widget as it opens, or after Reset;
- `"previous"`: wherever earlier instructions left the reader;
- `"unspecified"`: the text doesn't say;
- an object of steps applied to the default state, such as `{ "set": { "storefront": 2.5 } }`.

**steps.** Each step produces a new state. State 0 is the start; state *i* comes after step *i*.
- `{ "set": { "<service>": <GB per copy> } }`: a memory request.
- `{ "set_to_use": "all" }` or `{ "set_to_use": ["orders", …] }`: set each named service's request to what it used at the rush.
- `{ "scale": { "factor": 0.5, "services": "all" } }`, or with a list of services.
- `{ "spare": true }` / `{ "spare": false }`.
- `{ "reset": true }`.

`"all"` means every service the text means. If it's ambiguous which services "all" covers, say so in `notes`.

**expect** says what the text claims is shown at state `at` (default: the last state).
- `observable` is one of:
  - `nodes_for_pods`: the count without the spare node;
  - `nodes_total`: the count with the spare node, if it's on;
  - `set_by`: `"memory"`, `"processor"` or `"both"`;
  - `services_over`: the services whose request is below what they used, as shown by the warnings;
  - `services_never_placeable`;
  - `reserved_gb`;
  - `used_gb`.
- `op` is one of `eq`, `ne`, `gt`, `gte`, `lt`, `lte` (with `value`); `count_eq`, `count_gte`, `count_lte` (lists, with `value`); `includes`, `excludes` (lists, with a service as `value`); `increases`, `decreases`, `unchanged` (with `relative_to`, a state index).
- `implied: true` when the text implies it rather than stating it.

Encode quantities words as the text means them. "Several" is `count_gte 2`. "Another node" is `increases`. When a claim doesn't fit this vocabulary, leave it out and describe it in `notes`.
