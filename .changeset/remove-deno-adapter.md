---
"create-domco": major
---

Remove the Deno Deploy adapter option. New projects can use Cloudflare, Vercel, or no adapter. The `--adapter=deno` flag is no longer supported and exits with an error before creating any files.
