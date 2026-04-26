import type { ViteUserConfig } from "astro";

import type { ConfigSerialized } from "./user-options";

function resolveVirtualModuleId<T extends string>(id: T): `\0${T}` {
  return `\0${id}`;
}

const VERSIONS_VIRTUAL_ID = "virtual:starlight-versions-config";
const VERSIONS_FALLBACK = `export default ${JSON.stringify({
  current: { label: "latest", redirect: "root" },
  versions: [],
  versionsBySlug: {},
})}`;

/** Vite plugin that exposes user config via virtual modules. */
export function vitePluginUserConfig(config: ConfigSerialized): NonNullable<ViteUserConfig["plugins"]>[number] {
  /** Map of virtual module names to their code contents as strings. */
  const modules = {
    "virtual:starlight-theme-celestia/user-config": `export default ${JSON.stringify(config)}`,
  } satisfies Record<string, string>;

  /** Mapping names prefixed with `\0` to their original form. */
  const resolutionMap = Object.fromEntries(
    (Object.keys(modules) as (keyof typeof modules)[]).map((key) => [resolveVirtualModuleId(key), key]),
  );

  return {
    name: "vite-plugin-starlight-theme-celestia-user-config",
    // enforce 'post' so starlight-versions' real config takes precedence over our fallback
    enforce: "post" as const,
    resolveId(id): string | void {
      if (id in modules) return resolveVirtualModuleId(id);
      // Fallback for virtual:starlight-versions-config when the plugin isn't configured
      if (id === VERSIONS_VIRTUAL_ID) return resolveVirtualModuleId(id);
    },
    load(id): string | void {
      const resolution = resolutionMap[id];
      if (resolution) return modules[resolution];
      // Provide empty fallback if starlight-versions plugin didn't load
      if (id === resolveVirtualModuleId(VERSIONS_VIRTUAL_ID)) return VERSIONS_FALLBACK;
    },
  };
}
