---
"domco": patch
---

Load the project's `.env` files for the build's mode into `process.env` before importing the server entry to read its prerender paths, without overwriting variables that are already set. Apps that check environment variables as they load no longer fail to import during a local build that has a `.env` file. When the import still fails, the error now explains that domco imports the app during the build and that nothing was prerendered.
