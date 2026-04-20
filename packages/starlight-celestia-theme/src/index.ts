import type { StarlightConfig, StarlightPlugin, StarlightUserConfig } from "@astrojs/starlight/types";
import type { AstroConfig } from "astro";
import remarkCustomHeaderId from "remark-custom-header-id";

import { createShikiConfig } from "./shiki-config";
import type { ThemeCelestiaOptions } from "./user-options";
import { vitePluginUserConfig } from "./virtual-user-config";

const components = {
  Header: "starlight-celestia-theme/components/Header.astro",
  Search: "starlight-celestia-theme/components/Search.astro",
  ThemeProvider: "starlight-celestia-theme/components/ThemeProvider.astro",
  ThemeSelect: "starlight-celestia-theme/components/ThemeSelect.astro",
  SocialIcons: "starlight-celestia-theme/components/SocialIcons.astro",
  SiteTitle: "starlight-celestia-theme/components/SiteTitleVersioned.astro",
  PageFrame: "starlight-celestia-theme/components/PageFrame.astro",
  Pagination: "starlight-celestia-theme/components/Pagination.astro",
  MobileMenuToggle: "starlight-celestia-theme/components/MobileMenuToggle.astro",
  TwoColumnContent: "starlight-celestia-theme/components/TwoColumnContent.astro",
  MarkdownContent: "starlight-celestia-theme/components/MarkdownContent.astro",
  Hero: "starlight-celestia-theme/components/Hero.astro",
  MobileTableOfContents: "starlight-celestia-theme/components/MobileTableOfContents.astro",
  MobileMenuFooter: "starlight-celestia-theme/components/MobileMenuFooter.astro",
  LanguageSelect: "starlight-celestia-theme/components/LanguageSelect.astro",
  Head: "starlight-celestia-theme/components/Head.astro",
} as const satisfies Partial<StarlightConfig["components"]>;

export type { ThemeCelestiaOptions };

export default function starlightCelestiaTheme(options: ThemeCelestiaOptions = {}): StarlightPlugin {
  return {
    name: "starlight-celestia-theme",
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
            "starlight-celestia-theme/layer.css",

            useTailwind ? "" : "starlight-celestia-theme/tailwind.gen.css",

            "starlight-celestia-theme/theme.css",

            ...(config.customCss || []),

            "starlight-celestia-theme/styles.css",
          ].filter(Boolean),
          components: {
            ...components,
            ...config.components,
          },
          expressiveCode: config.expressiveCode ?? false,
        } satisfies Partial<StarlightUserConfig>;

        updateConfig(newConfig);

        addIntegration({
          name: "starlight-celestia-theme-integration",
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
