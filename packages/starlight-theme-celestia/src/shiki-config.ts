import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
  transformerRemoveNotationEscape,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerTwoslash } from "@shikijs/twoslash";
import type { ShikiTransformer } from "@shikijs/types";
import type { ShikiConfig } from "astro";
import { createRequire } from "node:module";
import { createRenderer } from "shiki-twoslash-renderer";

import { transformerContainer } from "./shiki-transformer-container";

const require = createRequire(import.meta.url);

export function createShikiConfig(options: { twoslash: boolean }): ShikiConfig {
  const transformers: ShikiTransformer[] = [
    transformerMetaHighlight(),
    transformerMetaWordHighlight(),
    transformerNotationDiff(),
    transformerNotationHighlight(),
    transformerNotationWordHighlight(),
    transformerRemoveNotationEscape(),

    transformerContainer(),
    ...(options.twoslash ? createTwoslashTransformers() : []),
  ];

  return {
    themes: {
      light: "one-light",
      dark: "github-dark-dimmed",
    },
    defaultColor: false,
    transformers: transformers,
  };
}

/**
 * Twoslash needs the Node API surface of TypeScript, `ts.sys` in particular.
 * Projects that do not pin `typescript` themselves can end up with the native
 * TypeScript 7 package, which does not expose that API, so probe the resolved
 * module before handing it to Twoslash.
 *
 * @internal
 */
export function isTwoslashCompatibleTsModule(tsModule: unknown): boolean {
  const sys = (tsModule as { sys?: { readFile?: unknown } } | null | undefined)?.sys;

  return typeof sys?.readFile === "function";
}

type TwoslashOptions = NonNullable<NonNullable<Parameters<typeof transformerTwoslash>[0]>["twoslashOptions"]>;

function createTwoslashTransformers(): ShikiTransformer[] {
  let tsModule: unknown;

  try {
    tsModule = require("typescript");
  } catch {
    tsModule = undefined;
  }

  if (!isTwoslashCompatibleTsModule(tsModule)) {
    console.warn(
      "[starlight-theme-celestia] Twoslash code blocks are disabled because no compatible `typescript` installation was found. Add `typescript` (^5.5.0 || ^6.0.0) to your project to enable them.",
    );

    return [];
  }

  return [
    transformerTwoslash({
      renderer: createRenderer(),
      explicitTrigger: true,
      twoslashOptions: {
        tsModule: tsModule as TwoslashOptions["tsModule"],
        compilerOptions: {
          noUncheckedSideEffectImports: false,
        },
      },
    }),
  ];
}
