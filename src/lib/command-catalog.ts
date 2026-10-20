import { fetchContent } from '$lib/fetchContent';

export type ParamType = 'string' | 'bool' | 'number' | 'integer';

export interface CommandParam {
  name: string;
  type: ParamType;
  required: boolean;
  defaultValue?: string | number | boolean | null;
  description?: string;
  values?: string[];
  placeholder?: string;
}

export interface CommandVariant {
  index: number;
  description: string | null;
  adminOnly: boolean;
  usage: string;
  params: CommandParam[];
}

export interface CatalogCommand {
  id: string;
  mod: string;
  category: string;
  name: string;
  alias: string | null;
  adminOnly: boolean;
  description: string | null;
  examples: string[];
  variants: CommandVariant[];
}

export interface CatalogMod {
  id: string;
  name: string;
  prefix: string;
  group: string;
  shorthands: string[];
}

export interface CommandCatalog {
  mods: CatalogMod[];
  commands: CatalogCommand[];
}

interface ParameterOverride {
  description?: string;
  values?: string[];
  placeholder?: string;
}

interface CommandOverride {
  category?: string;
  description?: string;
  alias?: string;
  examples?: string[];
  params?: Record<string, ParameterOverride>;
}

interface CatalogOverrides {
  params?: Record<string, ParameterOverride>;
  commands?: Record<string, CommandOverride>;
}

const CATALOG_PATH = 'commands/commands.json';
const OVERRIDES_PATH = 'commands/commands.overrides.json';

let cached: CommandCatalog | null = null;

function applyParamOverride(param: CommandParam, override: ParameterOverride): void {
  if (override.description) param.description = override.description;
  if (override.values) param.values = override.values;
  if (override.placeholder) param.placeholder = override.placeholder;
}

function applyOverrides(catalog: CommandCatalog, overrides: CatalogOverrides): void {
  const globalParams = overrides.params ?? {};
  for (const command of catalog.commands) {
    for (const variant of command.variants) {
      for (const param of variant.params) {
        const globalOverride = globalParams[param.name];
        if (globalOverride) applyParamOverride(param, globalOverride);
      }
    }
  }

  const map = overrides.commands ?? {};
  for (const command of catalog.commands) {
    const override = map[command.id];
    if (!override) continue;

    if (override.category) command.category = override.category;
    if (override.description) command.description = override.description;
    if (override.alias) command.alias = override.alias;
    if (override.examples) command.examples = override.examples;

    if (override.params) {
      for (const variant of command.variants) {
        for (const param of variant.params) {
          const paramOverride = override.params[param.name];
          if (paramOverride) applyParamOverride(param, paramOverride);
        }
      }
    }
  }
}

export async function loadCommandCatalog(): Promise<CommandCatalog> {
  if (cached) return cached;

  const catalogRes = await fetchContent(CATALOG_PATH);
  if (!catalogRes.ok) throw new Error(`Failed to load command catalog (${catalogRes.status})`);
  const catalog = (await catalogRes.json()) as CommandCatalog;

  try {
    const overridesRes = await fetchContent(OVERRIDES_PATH);
    if (overridesRes.ok) {
      const overrides = (await overridesRes.json()) as CatalogOverrides;
      applyOverrides(catalog, overrides);
    }
  } catch {
    // The overrides file is optional. Ignore a load failure.
  }

  cached = catalog;
  return catalog;
}

export function getMod(catalog: CommandCatalog, modId: string): CatalogMod | undefined {
  return catalog.mods.find((m) => m.id === modId);
}

export function buildCommandString(mod: CatalogMod, command: CatalogCommand, variant: CommandVariant, values: Record<string, string>): string {
  const parts = [`.${mod.prefix}`, command.name];
  for (const param of variant.params) {
    const value = values[param.name];
    if (value === undefined || value === '') {
      if (param.required) parts.push(`<${param.name}>`);
      continue;
    }
    parts.push(value);
  }
  return parts.join(' ');
}

export function commandSearchText(command: CatalogCommand): string {
  const parts = [command.name, command.alias ?? '', command.category, command.description ?? ''];
  for (const variant of command.variants) {
    parts.push(variant.description ?? '');
    for (const param of variant.params) {
      parts.push(param.name, param.description ?? '');
    }
  }
  return parts.join(' ').toLowerCase();
}
