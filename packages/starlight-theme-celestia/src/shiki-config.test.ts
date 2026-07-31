import { expect, test } from "bun:test";

import { createShikiConfig, isTwoslashCompatibleTsModule } from "./shiki-config";

test("a TypeScript module exposing the Node system API is usable for Twoslash", () => {
  expect(isTwoslashCompatibleTsModule({ sys: { readFile: () => undefined } })).toBe(true);
});

test("a missing or incompatible TypeScript module is rejected", () => {
  expect(isTwoslashCompatibleTsModule(undefined)).toBe(false);
  expect(isTwoslashCompatibleTsModule(null)).toBe(false);
  // TypeScript 7 ships a native compiler without the `ts.sys` API.
  expect(isTwoslashCompatibleTsModule({ version: "7.0.2" })).toBe(false);
  expect(isTwoslashCompatibleTsModule({ sys: {} })).toBe(false);
});

test("the Twoslash transformer is only added when requested", () => {
  const withTwoslash = createShikiConfig({ twoslash: true }).transformers ?? [];
  const withoutTwoslash = createShikiConfig({ twoslash: false }).transformers ?? [];

  expect(withTwoslash.length).toBe(withoutTwoslash.length + 1);
});
