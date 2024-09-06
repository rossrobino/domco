# domco

## Construct Web Applications with Vite and Hono

```bash
npm create domco@latest
```

[Read the document to get started](https://domco.robino.dev)

| Key | Type    | Required | Example          | Description                                                                                                                             |
| --- | ------- | -------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| url | String  | Yes      | `/assets/me.png` | The URL of the source image that should be optimized. Absolute URLs must match a pattern defined in the `remotePatterns` configuration. |
| w   | Integer | Yes      | `200`            | The width (in pixels) that the source image should be resized to. Must match a value defined in the sizes configuration.                |
| q   | Integer | Yes      | `75`             | The quality that the source image should be reduced to. Must be between 1 (lowest quality) to 100 (highest quality).                    |
