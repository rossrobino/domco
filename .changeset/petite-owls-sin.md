---
"domco": major
---

refactor!: output file names have been updated to better match the names of the entry points.

Instead of prefixing each script with `_script/`, each entry point name is suffixed with `_page`, `_script`, or `_style`. This makes it easier to identify the original file.

For example, `/client/react/+script.tsx` now will be output as `/client/_immutable/react_script.hash.js`, while `/client/react/+style.css` outputs to `/client/_immutable/assets/react_style.hash.css`.

Root entry points directly in `/client/` are no longer renamed to `main`, they simply start with the suffix.
