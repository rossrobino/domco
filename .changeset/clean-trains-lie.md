---
"domco": minor
---

feat: Run prerender in a child process and exit the process after prerendering.

Before, if a user's server had a long running process that doesn't end after prerendering, then the build would hang. Now a child process is used for prerendering and exits whe complete.
