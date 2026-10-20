// Command catalog generator.
// Parses VCF [Command] attributes out of mod source into a static JSON catalog.
// Run with `yarn gen:commands`. The output is committed to static/content/commands/.
//
// The mod source is not present in CI, so this script is a local dev tool only.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, '..');
const MODS_ROOT = process.env.MODS_ROOT || 'T:\\Desktop\\V Rising Stuff\\Modding\\Mods';
const OUTPUT_DIR = join(REPO_ROOT, 'static', 'content', 'commands');
const OUTPUT_FILE = join(OUTPUT_DIR, 'commands.json');

// One entry per mod. Add more mods here as they are documented.
const MOD_DEFS = [
  {
    id: 'sovutilities',
    name: 'SoV Utilities',
    prefix: 'sov',
    group: 'sov',
    srcDir: join(MODS_ROOT, 'SoVUtilities', 'Commands'),
  },
  {
    id: 'keys',
    name: 'Keys',
    prefix: 'keys',
    group: 'keys',
    srcDir: join(MODS_ROOT, 'Keys', 'Commands'),
  },
  {
    id: 'customabilities',
    name: 'Custom Abilities',
    prefix: 'abilities',
    group: 'abilities',
    srcDir: join(MODS_ROOT, 'CustomAbilities', 'Commands'),
  },
  {
    id: 'signs',
    name: 'Signs',
    prefix: 'sign',
    group: 'sign',
    category: 'Signs',
    srcDir: join(MODS_ROOT, 'ScarletSigns', 'Commands'),
  },
];

// Friendly category names per source file.
const FILE_CATEGORY = {
  Ability: 'Abilities',
  BehaviorDebug: 'Behavior Debug',
  Blacksmithing: 'Blacksmithing',
  Blood: 'Blood',
  Build: 'Architect',
  Command: 'Admin',
  Consume: 'Consume',
  Crafting: 'Crafting',
  Doctor: 'Doctor',
  Entity: 'Entity',
  EntitySearch: 'Entity Search',
  EntitySelection: 'Entity Selection',
  EntityTag: 'Entity Tags',
  Fabian: 'Fabian',
  FireZone: 'Fire Zones',
  FishZone: 'Fish Zones',
  Follower: 'Followers',
  HolyZone: 'Holy Zones',
  Item: 'Items',
  Locate: 'Locate',
  MapIcon: 'Map Icons',
  Mortality: 'Mortality',
  Onboarding: 'Onboarding',
  Rancher: 'Rancher',
  Region: 'Region Buffs',
  Shapeshift: 'Shapeshift',
  Spawner: 'Spawners',
  SpawnerSelection: 'Spawner Selection',
  Specialty: 'Specialties',
  SpellAlias: 'Spells',
  Stash: 'Stashes',
  Structure: 'Structures',
  Tag: 'Tags',
  Tailoring: 'Tailoring',
  Team: 'Teams',
  TeleportZone: 'Teleport Zones',
  Token: 'Tokens',
  VBloodShare: 'VBlood Sharing',
};

// Command name prefixes that set the category regardless of source file.
// Use these to split a group that lives in an otherwise unrelated file.
const GLOBAL_PREFIX_CATEGORY = [['mob stat ', 'Mob Stats']];

// The catch-all SovCommands.cs holds many unrelated groups.
// Split it by command name prefix. Longest match wins.
const SOV_PREFIX_CATEGORY = [
  ['buff ', 'Buffs'],
  ['vblood ', 'VBlood'],
  ['teleport ', 'Teleport'],
  ['coords', 'Teleport'],
  ['softlock ', 'Softlock'],
  ['shapeshift ', 'Shapeshift'],
  ['spawn ', 'Spawn and Debug'],
  ['list sequences', 'Spawn and Debug'],
  ['despawn sequence', 'Spawn and Debug'],
  ['list mobs', 'Spawn and Debug'],
  ['item test', 'Spawn and Debug'],
  ['test bufftoggle', 'Spawn and Debug'],
  ['damage ', 'Debug'],
  ['flag ', 'Debug'],
  ['recipe ', 'Crafting'],
  ['revive', 'Doctor'],
  ['refillblood', 'Doctor'],
  ['drawblood', 'Blood'],
  ['hideadmin', 'Player Toggles'],
  ['alwaysreveal', 'Player Toggles'],
  ['reveal', 'Player Toggles'],
  ['toggle anon', 'Player Toggles'],
  ['toggleteam', 'Player Toggles'],
  ['nameplate ', 'Player Toggles'],
  ['hideweapons', 'Player Toggles'],
  ['showweapons', 'Player Toggles'],
  ['mirror', 'Player Toggles'],
  ['barrel', 'Player Toggles'],
  ['riphood', 'Player Toggles'],
  ['power reset', 'Player Toggles'],
  ['cry', 'Emotes and Misc'],
  ['laugh', 'Emotes and Misc'],
  ['emote ', 'Emotes and Misc'],
  ['roll', 'Emotes and Misc'],
  ['trade', 'Penumbra'],
  ['repair', 'Admin'],
  ['inspect', 'Admin'],
  ['find bugged items', 'Admin'],
  ['repair bugged items', 'Admin'],
  ['fixclan', 'Admin'],
  ['who', 'Admin'],
];

function splitTopLevel(input, delimiter = ',') {
  const parts = [];
  let current = '';
  let depth = 0;
  let quote = null;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      current += ch;
      if (ch === '\\') {
        current += input[i + 1] ?? '';
        i++;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    if (ch === ')' || ch === ']' || ch === '}') depth--;
    if (ch === delimiter && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim() !== '') parts.push(current);
  return parts;
}

function unquote(value) {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function stringArg(value) {
  if (value === undefined) return null;
  const v = value.trim();
  if (v === '' || v === 'null') return null;
  return unquote(v);
}

function parseBool(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

function parseCommandAttribute(content) {
  const positional = [];
  const named = {};

  for (const rawPart of splitTopLevel(content, ',')) {
    const part = rawPart.trim();
    if (part === '') continue;
    const namedMatch = /^([A-Za-z_]\w*)\s*:\s*([\s\S]*)$/.exec(part);
    if (namedMatch && !part.startsWith('"') && !part.startsWith("'")) {
      named[namedMatch[1]] = namedMatch[2].trim();
    } else {
      positional.push(part);
    }
  }

  const name = stringArg(named.name ?? positional[0]) ?? '';
  const shorthand = stringArg(named.shortHand ?? named.shorthand ?? positional[1]);
  const description = stringArg(named.description ?? positional[3]);
  const adminOnly = parseBool(named.adminOnly ?? positional[5], false);

  return {
    name,
    shorthand: shorthand || null,
    description: description || null,
    adminOnly,
  };
}

function normalizeType(type) {
  const t = type.trim();
  if (t === 'string') return 'string';
  if (t === 'bool') return 'bool';
  if (t === 'float' || t === 'double' || t === 'decimal') return 'number';
  if (t === 'int' || t === 'long' || t === 'uint' || t === 'short' || t === 'byte') return 'integer';
  return 'string';
}

function parseDefault(raw) {
  const v = raw.trim();
  if (v === 'null') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+(\.\d+)?[fFdDmMlL]?$/.test(v)) return Number(v.replace(/[fFdDmMlL]$/, ''));
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  // An identifier (a constant). Keep the flag that a default exists, but do not show a value.
  return undefined;
}

function parseParams(signatureInner) {
  const params = [];
  for (const rawPart of splitTopLevel(signatureInner, ',')) {
    const part = rawPart.trim();
    if (part === '') continue;
    if (/^ChatCommandContext\b/.test(part)) continue;

    const eqIndex = part.indexOf('=');
    const left = (eqIndex >= 0 ? part.slice(0, eqIndex) : part).trim();
    const rawDefault = eqIndex >= 0 ? part.slice(eqIndex + 1).trim() : undefined;

    const tokens = left.split(/\s+/);
    const name = tokens.pop();
    const type = normalizeType(tokens.join(' '));

    params.push({
      name,
      type,
      required: eqIndex < 0,
      defaultValue: rawDefault === undefined ? undefined : parseDefault(rawDefault),
    });
  }
  return params;
}

function buildUsage(prefix, name, params) {
  let usage = `.${prefix} ${name}`;
  for (const param of params) {
    if (param.required) {
      usage += ` <${param.name}>`;
    } else if (param.defaultValue !== undefined && param.defaultValue !== null && param.defaultValue !== '') {
      usage += ` [${param.name}=${param.defaultValue}]`;
    } else {
      usage += ` [${param.name}]`;
    }
  }
  return usage;
}

function matchPrefix(map, name) {
  const lower = name.toLowerCase();
  let best = null;
  for (const [prefix, category] of map) {
    if (lower.startsWith(prefix) && (best === null || prefix.length > best.prefix.length)) {
      best = { prefix, category };
    }
  }
  return best ? best.category : null;
}

function resolveCategory(fileCategory, name) {
  const global = matchPrefix(GLOBAL_PREFIX_CATEGORY, name);
  if (global) return global;
  if (fileCategory !== 'SovCommands') return fileCategory;
  return matchPrefix(SOV_PREFIX_CATEGORY, name) ?? 'General';
}

function parseFile(mod, filePath, fileName) {
  const baseName = fileName.replace(/Commands?\.cs$/i, '').replace(/\.cs$/i, '');
  const rawFileCategory = FILE_CATEGORY[baseName] ?? (baseName === 'Sov' ? 'SovCommands' : baseName);
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  const records = [];
  let group = mod.group;
  let shorthand = null;
  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (inBlockComment) {
      const end = line.indexOf('*/');
      if (end === -1) continue;
      line = line.slice(end + 2);
      inBlockComment = false;
    }
    const blockStart = line.indexOf('/*');
    if (blockStart !== -1 && line.indexOf('*/', blockStart) === -1) {
      inBlockComment = true;
      line = line.slice(0, blockStart);
    } else if (blockStart !== -1) {
      line = line.slice(0, blockStart) + line.slice(line.indexOf('*/', blockStart) + 2);
    }

    const trimmed = line.trim();
    if (trimmed.startsWith('//')) continue;

    const groupMatch = /\[CommandGroup\(\s*"([^"]+)"\s*(?:,\s*"([^"]+)")?\s*\)\]/.exec(trimmed);
    if (groupMatch) {
      group = groupMatch[1];
      shorthand = groupMatch[2] ?? null;
      continue;
    }

    const commandMatch = /\[Command\((.*)\)\]\s*$/.exec(trimmed);
    if (!commandMatch) continue;

    const attr = parseCommandAttribute(commandMatch[1]);
    if (!attr.name) continue;

    let signatureInner = null;
    for (let j = i + 1; j < Math.min(i + 16, lines.length); j++) {
      const candidate = lines[j].trim();
      if (candidate === '' || candidate.startsWith('//') || candidate.startsWith('///') || candidate.startsWith('[')) continue;
      const sigMatch = /public\s+static\s+(?:async\s+)?\w[\w<>,\[\]\s]*\s+\w+\s*\(([^)]*)\)/.exec(candidate);
      if (sigMatch) {
        signatureInner = sigMatch[1];
      }
      break;
    }
    if (signatureInner === null) continue;

    const params = parseParams(signatureInner);
    records.push({
      name: attr.name,
      alias: attr.shorthand,
      description: attr.description,
      adminOnly: attr.adminOnly,
      group,
      groupShorthand: shorthand,
      fileCategory: rawFileCategory,
      params,
      usage: buildUsage(mod.prefix, attr.name, params),
    });
  }

  return records;
}

function groupRecords(mod, records) {
  const byName = new Map();
  for (const record of records) {
    const key = `${record.group}\u0000${record.name}`;
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(record);
  }

  const commands = [];
  for (const variants of byName.values()) {
    const first = variants[0];
    const entryId = `${mod.id}:${first.group}:${first.name}`;
    const category = mod.category ?? resolveCategory(first.fileCategory, first.name);
    const command = {
      id: entryId,
      mod: mod.id,
      category,
      name: first.name,
      alias: variants.find((v) => v.alias)?.alias ?? null,
      adminOnly: variants.some((v) => v.adminOnly),
      description: variants.find((v) => v.description)?.description ?? null,
      examples: [],
      variants: variants.map((v, index) => ({
        index,
        description: v.description,
        adminOnly: v.adminOnly,
        usage: v.usage,
        params: v.params,
      })),
    };
    commands.push(command);
  }

  commands.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  return commands;
}

async function main() {
  const mods = [];
  const allCommands = [];

  for (const mod of MOD_DEFS) {
    if (!existsSync(mod.srcDir)) {
      console.warn(`Skipping ${mod.id}: source dir not found at ${mod.srcDir}`);
      continue;
    }
    mods.push({ id: mod.id, name: mod.name, prefix: mod.prefix, group: mod.group, shorthands: [] });

    const files = readdirSync(mod.srcDir).filter((f) => f.endsWith('.cs'));
    const records = [];
    const shorthands = new Set();
    for (const file of files) {
      const parsed = parseFile(mod, join(mod.srcDir, file), file);
      for (const record of parsed) {
        if (record.groupShorthand) shorthands.add(record.groupShorthand);
        records.push(record);
      }
    }
    mods[mods.length - 1].shorthands = [...shorthands];
    allCommands.push(...groupRecords(mod, records));
  }

  allCommands.sort((a, b) => a.mod.localeCompare(b.mod) || a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  const catalog = { mods, commands: allCommands };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const raw = JSON.stringify(catalog, null, 2);
  const formatted = await prettier.format(raw, { filepath: OUTPUT_FILE });
  writeFileSync(OUTPUT_FILE, formatted);

  const adminCount = allCommands.filter((c) => c.adminOnly).length;
  console.log(`Wrote ${allCommands.length} commands (${adminCount} admin-only) from ${mods.length} mod(s) to ${OUTPUT_FILE}`);
}

await main();
