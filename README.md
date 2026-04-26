# starlight-theme-celestia

A clean, modern theme for [Astro Starlight](https://starlight.astro.build/), forked from [starlight-theme-nova](https://github.com/ocavue/starlight-theme-nova).

## Features

- **No sidebar borders** — seamless layout between content and sidebars
- **Inter font** — self-hosted via `@fontsource/inter`, 14px base size
- **Wider content** — 55rem content width, 17rem sidebars
- **3-way theme toggle** — cycles through Auto, Light, and Dark
- **Warm accent colors** — `#fb923c` (dark) / `#c2410c` (light)
- **Multi-sidebar ready** — ships `@lorenzo_lewis/starlight-utils` as a dependency
- **Version dropdown** — built-in `starlight-versions` integration with auto-detected header dropdown

## Installation

```bash
bun add git+ssh://git@codefloe.com/devxy/starlight-theme-celestia.git
```

## Usage

```js
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightCelestiaTheme from "starlight-theme-celestia";

export default defineConfig({
  integrations: [
    starlight({
      title: "My Docs",
      plugins: [starlightCelestiaTheme()],
      sidebar: [{ label: "Guide", autogenerate: { directory: "guide" } }],
    }),
  ],
});
```

### Options

```js
starlightCelestiaTheme({
  // Navigation items in the header bar
  nav: [
    { label: "Blog", href: "/blog" },
    { label: "GitHub", href: "https://github.com" },
  ],
  // CSS delivery mode: 'detect' (default), 'css', or 'tailwind'
  stylingSystem: "detect",
});
```

### Multi-Sidebar

The theme ships `@lorenzo_lewis/starlight-utils` as a dependency.
Add it alongside the theme plugin:

```js
import starlightUtils from "@lorenzo_lewis/starlight-utils";

// Inside starlight({ plugins: [...] })
starlightUtils({
  multiSidebar: {
    switcherStyle: "horizontalList",
  },
});
```

### Versioning

The theme ships `starlight-versions` as a dependency. When configured, a version dropdown automatically appears next to the site title:

```js
import starlightVersions from "starlight-versions";

// Inside starlight({ plugins: [...] })
starlightVersions({
  current: { label: "v2.0 (latest)" },
  versions: [{ slug: "v1", label: "v1.0" }],
});
```

## Development

```bash
bun install
bun --filter starlight-theme-celestia build
bun --filter starlight-theme-celestia-website dev
```

## License

MIT
