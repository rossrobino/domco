---
"domco": minor
---

feat: Adds `onStreamError` to the node listener to handle errors that occur during streaming.

This keeps the dev server alive when an error occurs during a stream, and provides a way to run cleanup or telemetry during stream errors.
