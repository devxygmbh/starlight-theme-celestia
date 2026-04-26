import type { StarlightConfig, StarlightPlugin, StarlightUserConfig } from "@astrojs/starlight/types";
import type { AstroConfig } from "astro";
import remarkCustomHeaderId from "remark-custom-header-id";

import { createShikiConfig } from "./shiki-config";
import type { ThemeCelestiaOptions } from "./user-options";
import { vitePluginUserConfig } from "./virtual-user-config";

const components = {
  Header: "starlight-theme-celestia/components/Header.astro",
  Search: "starlight-theme-celestia/components/Search.astro",
  ThemeProvider: "starlight-theme-celestia/components/ThemeProvider.astro",
  ThemeSelect: "starlight-theme-celestia/components/ThemeSelect.astro",
  SocialIcons: "starlight-theme-celestia/components/SocialIcons.astro",
  SiteTitle: "starlight-theme-celestia/components/SiteTitleVersioned.astro",
  PageFrame: "starlight-theme-celestia/components/PageFrame.astro",
  Pagination: "starlight-theme-celestia/components/Pagination.astro",
  MobileMenuToggle: "starlight-theme-celestia/components/MobileMenuToggle.astro",
  TwoColumnContent: "starlight-theme-celestia/components/TwoColumnContent.astro",
  MarkdownContent: "starlight-theme-celestia/components/MarkdownContent.astro",
  Hero: "starlight-theme-celestia/components/Hero.astro",
  MobileTableOfContents: "starlight-theme-celestia/components/MobileTableOfContents.astro",
  MobileMenuFooter: "starlight-theme-celestia/components/MobileMenuFooter.astro",
  LanguageSelect: "starlight-theme-celestia/components/LanguageSelect.astro",
  Head: "starlight-theme-celestia/components/Head.astro",
} as const satisfies Partial<StarlightConfig["components"]>;

export type { ThemeCelestiaOptions };

export default function starlightCelestiaTheme(options: ThemeCelestiaOptions = {}): StarlightPlugin {
  return {
    name: "starlight-theme-celestia",
    hooks: {
      setup: async ({ config, updateConfig, addIntegration, astroConfig }) => {
        let useTailwind: boolean;

        if (options.stylingSystem === "css") {
          useTailwind = false;
        } else if (options.stylingSystem === "tailwind") {
          useTailwind = true;
        } else {
          const hasTailwindcss = await checkHasPlugin(astroConfig.vite?.plugins, "tailwind");
          useTailwind = hasTailwindcss;
        }

        const newConfig = {
          customCss: [
            "starlight-theme-celestia/layer.css",

            useTailwind ? "" : "starlight-theme-celestia/tailwind.gen.css",

            "starlight-theme-celestia/theme.css",

            ...(config.customCss || []),

            "starlight-theme-celestia/styles.css",
          ].filter(Boolean),
          components: {
            ...components,
            ...config.components,
          },
          expressiveCode: config.expressiveCode ?? false,
        } satisfies Partial<StarlightUserConfig>;

        updateConfig(newConfig);

        addIntegration({
          name: "starlight-theme-celestia-integration",
          hooks: {
            "astro:config:setup": ({ updateConfig }) => {
              updateConfig({
                markdown: {
                  shikiConfig: createShikiConfig({ twoslash: true }),
                  remarkPlugins: [remarkCustomHeaderId],
                },
                vite: {
                  plugins: [
                    vitePluginUserConfig({
                      nav: options.nav,
                      rootHref: astroConfig.root.toString(),
                    }),
                  ],
                },
              });
            },
          },
        });
      },
    },
  };
}

type ViteUserConfig = AstroConfig["vite"];
type VitePlugin = NonNullable<ViteUserConfig["plugins"]>[number];

async function checkHasPlugin(plugin: VitePlugin | Promise<VitePlugin>, search: string): Promise<boolean> {
  const awaited = await plugin;

  if (!awaited) {
    return false;
  }
  if (Array.isArray(awaited)) {
    for (const p of awaited) {
      if (await checkHasPlugin(p, search)) {
        return true;
      }
    }
    return false;
  }
  const name = awaited.name || "";
  return name.includes(search);
}
