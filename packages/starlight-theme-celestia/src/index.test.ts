import { unified } from "@astrojs/markdown-remark";
import type { StarlightPlugin, StarlightUserConfig } from "@astrojs/starlight/types";
import type { AstroConfig, AstroIntegration, AstroUserConfig } from "astro";
import { mergeConfig } from "astro/config";
import { expect, test } from "bun:test";

import starlightCelestiaTheme from "./index";
import type { ThemeCelestiaOptions } from "./user-options";

type ConfigSetupHook = NonNullable<StarlightPlugin["hooks"]["config:setup"]>;
type ConfigSetupOptions = Parameters<ConfigSetupHook>[0];

/** Run the `config:setup` hook of the theme and return the config it asks Starlight to apply. */
async function setupConfig(
  options: ThemeCelestiaOptions = {},
  components: StarlightUserConfig["components"] = {},
): Promise<Partial<StarlightUserConfig>> {
  const hook = starlightCelestiaTheme(options).hooks["config:setup"];

  if (!hook) {
    throw new Error("the theme no longer registers a `config:setup` hook");
  }

  let updated: Partial<StarlightUserConfig> = {};

  await hook({
    config: { components },
    updateConfig: (config: Partial<StarlightUserConfig>) => {
      updated = config;
    },
    addIntegration: () => {},
    astroConfig: { root: new URL("file:///project/"), vite: {} },
  } as unknown as ConfigSetupOptions);

  return updated;
}

test("default factory returns a valid Starlight plugin", () => {
  const plugin = starlightCelestiaTheme();

  expect(plugin.name).toBe("starlight-theme-celestia");
  expect(plugin.hooks).toHaveProperty("config:setup");
  expect(typeof plugin.hooks["config:setup"]).toBe("function");
});

test("Starlight's own sidebar is kept when multi-sidebar is not configured", async () => {
  const config = await setupConfig();

  expect(config.components).not.toHaveProperty("Sidebar");
});

test("the sidebar is overridden when multi-sidebar is configured", async () => {
  const config = await setupConfig({ multiSidebar: { switcherStyle: "dropdown" } });

  expect(config.components?.Sidebar).toBe("starlight-theme-celestia/components/Sidebar.astro");
});

test("a user override of the sidebar wins over the multi-sidebar one", async () => {
  const config = await setupConfig({ multiSidebar: {} }, { Sidebar: "./src/components/Sidebar.astro" });

  expect(config.components?.Sidebar).toBe("./src/components/Sidebar.astro");
});

async function setupMarkdown(markdown: AstroUserConfig["markdown"] = {}) {
  let integration: AstroIntegration | undefined;
  await starlightCelestiaTheme().hooks["config:setup"]!({
    config: {},
    updateConfig: () => {},
    addIntegration: (value: AstroIntegration) => {
      integration = value;
    },
    astroConfig: { root: new URL("file:///project/"), vite: {} },
  } as unknown as ConfigSetupOptions);

  const hook = integration!.hooks["astro:config:setup"]!;
  let result: AstroUserConfig = { markdown };
  await hook({
    config: { markdown } as AstroConfig,
    updateConfig: (value: AstroUserConfig) => {
      result = mergeConfig(result, value);
      return result;
    },
  } as unknown as Parameters<typeof hook>[0]);
  return result.markdown!;
}

test("the theme uses unified to render custom heading IDs with a non-unified processor configured", async () => {
  const markdown = await setupMarkdown({
    processor: {
      name: "satteri",
      options: {},
      createRenderer: async () => {
        throw new Error("the incompatible processor must not render theme Markdown");
      },
    },
  });
  expect(markdown.processor!.name).toBe("unified");
  expect(markdown.remarkPlugins).toBeUndefined();
  const renderer = await markdown.processor!.createRenderer({});
  const result = await renderer.render("## A heading {#custom-id}");
  expect(result.code).toContain('id="custom-id"');
  expect(result.code).not.toContain("{#custom-id}");
});

test("the theme preserves an existing unified processor and shared Markdown settings", async () => {
  const remarkPlugin = () => () => {};
  const rehypePlugin = () => () => {};
  const recmaPlugin = () => () => {};
  const processor = unified({
    remarkPlugins: [remarkPlugin],
    rehypePlugins: [rehypePlugin],
    recmaPlugins: [recmaPlugin],
    remarkRehype: { clobberPrefix: "user-" },
    gfm: false,
    smartypants: false,
  });
  const markdown = await setupMarkdown({ processor, syntaxHighlight: false });
  expect(markdown.processor).toBe(processor);
  expect(processor.options.remarkPlugins[0]).toBe(remarkPlugin);
  expect(processor.options.rehypePlugins).toEqual([rehypePlugin]);
  expect(processor.options.recmaPlugins).toEqual([recmaPlugin]);
  expect(processor.options.remarkRehype).toEqual({ clobberPrefix: "user-" });
  expect(processor.options.gfm).toBe(false);
  expect(processor.options.smartypants).toBe(false);
  expect(markdown.syntaxHighlight).toBe(false);
});
