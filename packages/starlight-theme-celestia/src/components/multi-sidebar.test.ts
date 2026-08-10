import type { StarlightRouteData } from "@astrojs/starlight/route-data";
import { expect, test } from "bun:test";

import { getMultiSidebarGroups } from "./multi-sidebar";

type SidebarEntry = StarlightRouteData["sidebar"][number];

function link(label: string, isCurrent = false): SidebarEntry {
  return { type: "link", label, href: `/${label}/`, isCurrent, badge: undefined, attrs: {} };
}

function group(label: string, entries: SidebarEntry[]): SidebarEntry {
  return { type: "group", label, entries: entries as never, collapsed: false, badge: undefined };
}

test("every top-level group becomes a sidebar", () => {
  const groups = getMultiSidebarGroups([group("Guide", [link("start")]), group("Reference", [link("config")])]);

  expect(groups.map(({ label }) => label)).toEqual(["Guide", "Reference"]);
  expect(groups.map(({ tabId }) => tabId)).toEqual(["celestia-sidebar-tab-0", "celestia-sidebar-tab-1"]);
  expect(groups.map(({ panelId }) => panelId)).toEqual(["celestia-sidebar-panel-0", "celestia-sidebar-panel-1"]);
});

test("the sidebar holding the current page is selected, however deeply it is nested", () => {
  const groups = getMultiSidebarGroups([
    group("Guide", [link("start")]),
    group("Reference", [group("Nested", [group("Deeper", [link("config", true)])])]),
  ]);

  expect(groups.map(({ isCurrent }) => isCurrent)).toEqual([false, true]);
});

test("pages outside every sidebar fall back to the first one", () => {
  const groups = getMultiSidebarGroups([group("Guide", [link("start")]), group("Reference", [link("config")])]);

  expect(groups.map(({ isCurrent }) => isCurrent)).toEqual([true, false]);
});

test("a top-level entry that is not a group is rejected", () => {
  expect(() => getMultiSidebarGroups([group("Guide", [link("start")]), link("Blog")])).toThrow(
    /`Blog` cannot be used with multi-sidebar/,
  );
});

test("an empty sidebar yields no sidebars", () => {
  expect(getMultiSidebarGroups([])).toEqual([]);
});
