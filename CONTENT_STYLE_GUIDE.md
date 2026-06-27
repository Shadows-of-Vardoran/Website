# Content Style Guide

This document defines the formatting conventions for nation content and other lore pages rendered through the `marked` markdown parser. All new content should follow these rules before being committed.

## Punctuation

### Core rule

Periods and commas are the default. Semicolons and dashes are allowed only when absolutely necessary. Colons are allowed only to introduce lists.

### Semicolons

Do not use semicolons to join clauses. Replace them with a period or a comma.

- Wrong: `They serve as a judicial and logistical ruler; deciding where paths will be built.`
- Right: `They serve as a judicial and logistical ruler, deciding where paths will be built.`
- Wrong: `Lakkrah and Pisciv Vol are allies; engaging in frequent trade.`
- Right: `Lakkrah and Pisciv Vol are allies, engaging in frequent trade.`

Do not use semicolons to separate list items. Use commas.

- Wrong: `Solaria; Talagaela on Twilaria; and Talafaesga on Lunaira`
- Right: `Solaria, Talagaela on Twilaria, and Talafaesga on Lunaira`

Do not use semicolons in headings. Use a comma.

- Wrong: `# Qalidran; The Vampiric Parlor`
- Right: `# Qalidran, The Vampiric Parlor`

### Colons

Do not use colons for exposition or elaboration. Replace with a period or a comma.

- Wrong: `The prevailing attitude is: just let me farm.`
- Right: `The prevailing attitude is simple. Just let me farm.`
- Wrong: `They believe their history to be this: An ancient group...`
- Right: `They believe their history to this. An ancient group...`

Colons are acceptable when introducing a list.

- Right: `Aetheria is made up of four regions: the Inner Palace, the Terrace, the Gardens, and the Slums.`

### Dashes

Do not use em dashes, en dashes, or hyphens as punctuation to set off asides or clauses. Replace with commas or periods.

- Wrong: `Their nation is a young one– ruled over by the founding Talam`
- Right: `Their nation is a young one, ruled over by the founding Talam`
- Wrong: `Frankleburg--- each with her own small queendom`
- Right: `Frankleburg, each with her own small queendom`
- Wrong: `Access to blood is considered a right- one guaranteed by the laws of the land.`
- Right: `Access to blood is considered a right, one guaranteed by the laws of the land.`
- Wrong: `They do not target their countrymen- lest they incur the wrath of the Council- but everyone else is fair game.`
- Right: `They do not target their countrymen, lest they incur the wrath of the Council, but everyone else is fair game.`

When a dash-separated aside forms its own sentence, use a period instead.

- Wrong: `Lesser criminals- those involved in robbery, fights, etc- have their punishments decided by a jury.`
- Right: `Lesser criminals, those involved in robbery, fights, etc, have their punishments decided by a jury.`

### Comma splices

Do not join two independent clauses with only a comma. Use a period.

- Wrong: `Invention that relies on burning machines and bottled lightning is not prized, it is forbidden.`
- Right: `Invention that relies on burning machines and bottled lightning is not prized. It is forbidden.`

## Dates

Write all in-universe dates with a dash between the number and the epoch marker.

- Wrong: `999 AF`
- Right: `999-AF`
- Wrong: `1000 AF`
- Right: `1000-AF`

This applies to both `AF` and `PA` epochs.

## Quotes and apostrophes

### Straight quotes only

Never use smart or curly quotation marks or apostrophes. Always use straight ASCII quotes.

- Wrong: `"nothing but pirates"` (curly double quotes)
- Right: `"nothing but pirates"` (straight double quotes)
- Wrong: `magic's` (curly apostrophe U+2019)
- Right: `magic's` (straight apostrophe)

### Double quotes for mottos and sayings

Use double quotes for mottos, sayings, and quoted phrases. Do not use single quotes.

- Wrong: `'No reward without risk.'`
- Right: `"No reward without risk."`
- Wrong: `'The best place for a storm is the horizon.'`
- Right: `"The best place for a storm is the horizon."`

Do not double-wrap quotes.

- Wrong: `""To be different is to be strong""`
- Right: `"To be different is to be strong"`

## Heading levels

### Section headings under a nation

All top-level sections within a nation use `##`:

```
## Historical Overview
## Cultural Overview
## Racial and Magical Overview
## Important Allies and Enemies
## Important and Notable Landmarks/Places
## A Random Fun Fact
```

### Landmark and place entries

All individual landmarks and places under the "Important and Notable Landmarks/Places" section use `####`:

```
#### The Forbidden Tower
#### The Colosseum and the Cult of the Damned
#### Silverlight's Mines
```

Do not use `###` for landmark entries. Reserve `###` for sub-sections within broader sections, such as cultural sub-topics.

## Colored bars

Each section of nation content should have a vertical colored bar on the left side of its body text, matching the pattern used in the mortality contract. This breaks up walls of text and adds visual structure.

### Pattern

After each `##` heading, wrap the section content in this HTML structure:

```html
<div class="flex gap-4 my-2">
  <div class="w-3 rounded bg-gradient-to-b from-COLOR-800/60 to-COLOR-950/80 flex-shrink-0 border border-COLOR-900/30"></div>
  <div class="flex-1 text-[1.2rem]">
    <p>Content goes here.</p>
  </div>
</div>
```

Replace `COLOR` with the nation's accent color from its `colorKey` in `nations.json`:

| colorKey | COLOR   |
| -------- | ------- |
| gold     | gold    |
| violet   | violet  |
| sky      | sky     |
| emerald  | emerald |
| amber    | amber   |
| blue     | blue    |
| slate    | slate   |
| orange   | orange  |
| indigo   | indigo  |
| green    | green   |
| yellow   | yellow  |
| stone    | stone   |
| cyan     | cyan    |
| red      | red     |
| rose     | rose    |

### Content inside bars

- Use `<p>` tags for paragraphs instead of blank-line-separated markdown paragraphs, since the content lives inside an HTML block.
- Use `<em>` for italics instead of `*text*`.
- Use `<h4>` for sub-headings inside landmarks instead of `####`.

### Landmarks section

For the "Important and Notable Landmarks/Places" section, each landmark entry gets its own bar. The `####` heading sits above the bar, not inside it.

```html
## Important and Notable Landmarks/Places #### Capital: Cité D'or

<div class="flex gap-4 my-2">
  <div class="w-3 rounded bg-gradient-to-b from-amber-800/60 to-amber-950/80 flex-shrink-0 border border-amber-900/30"></div>
  <div class="flex-1 text-[1.2rem]">
    <p>The Capital of Frankleburg is Cité D'or, a neutral but very rich city.</p>
  </div>
</div>

#### The Queen's Library & University

<div class="flex gap-4 my-2">
  <div class="w-3 rounded bg-gradient-to-b from-amber-800/60 to-amber-950/80 flex-shrink-0 border border-amber-900/30"></div>
  <div class="flex-1 text-[1.2rem]">
    <p>Cité D'or is home to the largest public library in the world.</p>
  </div>
</div>
```

### Sections without bars

The nation title (`#`) and founding date line (`*Founded in...*`) do not get a bar. Only `##` sections and their content do.

## Checklist for new nation content

Before submitting new or revised nation content, verify the following:

- [ ] No smart or curly quotes or apostrophes (U+2018, U+2019, U+201C, U+201D, U+2013, U+2014)
- [ ] No semicolons used as punctuation (only commas and periods)
- [ ] No colons used for exposition (only for introducing lists)
- [ ] No em dashes, en dashes, or hyphens used as punctuation (replace with commas or periods)
- [ ] No comma splices (use periods between independent clauses)
- [ ] All dates use the dashed format (e.g. `999-AF`, not `999 AF`)
- [ ] All mottos and sayings use straight double quotes (not single quotes)
- [ ] Landmark headings use `####`, not `###`
- [ ] Each `##` section has a colored bar wrapping its content
- [ ] Colored bars use the correct color for the nation's `colorKey`
- [ ] Landmark headings sit outside their bars, not inside them
- [ ] Content inside bars uses `<p>` tags, not markdown paragraphs
- [ ] No stray characters or formatting artifacts
