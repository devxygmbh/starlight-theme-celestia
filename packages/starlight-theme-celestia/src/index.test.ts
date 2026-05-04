import { expect, test } from "bun:test";

import starlightCelestiaTheme from "./index";

test("default factory returns a valid Starlight plugin", () => {
  const plugin = starlightCelestiaTheme();

  expect(plugin.name).toBe("starlight-theme-celestia");
  expect(plugin.hooks).toHaveProperty("config:setup");
  expect(typeof plugin.hooks["config:setup"]).toBe("function");
});
