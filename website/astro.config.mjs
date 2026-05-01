// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightCelestiaTheme from "starlight-theme-celestia";
import starlightUtils from "@lorenzo_lewis/starlight-utils";
import starlightVersions from "starlight-versions";

export default defineConfig({
  // Cap Rollup's parallel file ops so the build fits on the 3.5 GB CI runner.
  // Each Vite worker spawns its own @astrojs/compiler (Go→WASM) instance,
  // so unbounded fanout exhausts JSC's heap during "Building static entrypoints".
  vite: {
    build: {
      rollupOptions: {
        maxParallelFileOps: 2,
      },
    },
  },
  integrations: [
    starlight({
      title: "Celestia Theme",
      logo: {
        src: "./public/logo.svg",
      },
      plugins: [
        starlightCelestiaTheme(),
        starlightVersions({
          current: { label: "v0.1 (latest)" },
          versions: [{ slug: "v0.0", label: "v0.0" }],
        }),
        starlightUtils({
          multiSidebar: {
            switcherStyle: "horizontalList",
          },
        }),
      ],
      sidebar: [
        {
          label: "Guide",
          items: [
            { label: "Getting Started", link: "/guide/getting-started/" },
            {
              label: "Customization",
              items: [
                { label: "Colors & Typography", link: "/guide/customization/" },
                { label: "Code Blocks", link: "/guide/code-blocks/" },
              ],
            },
            { label: "Multi-Sidebar", link: "/guide/multi-sidebar/" },
            { label: "Versioning", link: "/guide/versioning/" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
    }),
  ],
});
