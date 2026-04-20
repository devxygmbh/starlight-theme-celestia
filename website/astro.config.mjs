// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightCelestiaTheme from "starlight-celestia-theme";
import starlightUtils from "@lorenzo_lewis/starlight-utils";
import starlightVersions from "starlight-versions";

export default defineConfig({
  integrations: [
    starlight({
      title: "Celestia Theme",
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
