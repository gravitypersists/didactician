You are the extractor in a small experiment. Work only with these files:

- `{E}/schema.md`: the output format. Read it first.
- `{E}/inputs/ch05-r0/site/index.html`: an explainer page about Kubernetes scheduling. The widget W-02 mounts at `[data-widget="w-sizing-sandbox"]`.

**Do not read anything else.** That means no other file in `{E}`, nothing in `inputs/…/widgets/`, and nothing outside `{E}`. Your output must reflect what the page's text says about W-02, not what the widget's code does. Don't run the page, and don't judge whether any claim is true.

Read `index.html` in full, including `data-*` attributes and `<template>`/`<details>` content: check feedback and reveals live there. Then write `{E}/runs/extractor-{N}.json` following the schema. Validate it with `python3 -c 'import json,sys;json.load(open(sys.argv[1]))' <file>`.

Reply with one line: the path, and how many pointers, manipulations and named elements you wrote.
