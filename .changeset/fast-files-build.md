---
"domco": patch
---

Improve build and development performance across client entry handling and filesystem operations:

- Discover page, script, and style entries with one client source-tree walk.
- Resolve manifest entries with direct lookups, single-flight manifest loading, cached chunks, and parallel import processing.
- Look up development scripts and styles within their requested route directory instead of rescanning the client tree.
- Use one shared page watcher while preserving full reloads for `+page.html` changes.
- Avoid redundant filesystem existence checks, skip missing optional copy sources, and limit generated-page cleanup to the page output subtree.
