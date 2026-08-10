import type { StarlightPlugin, StarlightUserConfig } from "@astrojs/starlight/types";
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
