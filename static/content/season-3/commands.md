<!-- section:onboarding -->
These are the steps you take when joining the server as your character. They use the chat commands listed in the other tabs on this page. If you run into problems at any point, open a Player Support ticket about it. <span class="text-accent">All onboards are logged.</span>

## What You Need
To onboard, you need:
<div class="text-xl leading-relaxed">
- Your race.
- Racial options, such as what magical schools you are as a Mytt or what blood type your Human is.
- Whether you are taking a Citizenship option.
- What two specialties you are starting with.
</div>

<span class="text-accent">Citizenship teleports you to the starting location within the respective town.</span>

> [!WARNING] If you are **not a Talam** and want the "Bear Faction" animal-ally faction, open a Player Support ticket **after your character has been made in-game**. We will get you the tag.

## Steps
1. Log into the live server and make your character as normal.
2. After your character raises from the coffin in the crypt, run `.sov onboardrace <race> <arguments>`.
3. Run `.sov onboardspecialties <specialty1> <specialty2>` to set your initial Specialty levels.

### Vampires
`.sov onboardrace vampire <optionalFaction>`
- Valid factions are `Rustlock`, `Mosswick`, or `Dawnbreak`.

### Humans
`.sov onboardrace human <bloodtype> <optionalFaction>`
- Valid blood types are `rogue`, `warrior`, `scholar`, `brute`, or `worker`.
- Valid factions are `Brighthaven`, `Rustlock`, `Mosswick`, or `Dawnbreak`.

### Werewolves
`.sov onboardrace werewolf <optionalFaction>`
- Valid factions are `Rustlock`, `Mosswick`, or `Dawnbreak`.

### Mytts
`.sov onboardrace mytt <school1> <school2> <school3> <faction>`
- Valid schools are `light` or `shadow`, `storm` or `frost`, and `illusion` or `chaos`.
- Valid factions are `Brighthaven`, `Rustlock`, `Mosswick`, or `Dawnbreak`.

### Talam
`.sov onboardrace talam <subrace> <bloodtype> <optionalFaction>`
- Valid subraces are `sun`, `moon`, or `twilight`.
- Valid blood types are `rogue`, `warrior`, `scholar`, `brute`, or `worker`.
- Valid factions are `Rustlock`.

> [!WARNING] Taking Rustlock citizenship as a Talam will exclude you from the default Bear animal faction.

## Specialty Options
These are for the `.sov onboardspecialties <specialty1> <specialty2>` command.
- Valid specialty options are `bloodmagic`, `chaosmagic`, `stormmagic`, `shadowmagic`, `unholymagic`, `illusionmagic`, `frostmagic`, `lightmagic`, `elementalmagic`, `druidicmagic`, `martialarts`, `blacksmithing`, `tailoring`, `ritualism`, `architect`, `doctor`, `alchemy`, `engineering`, and `rancher`.

## Examples
| Command | Description |
|---|---|
| `.sov onboardrace mytt shadow storm chaos rustlock` | A Mytt composed of Shadow, Storm, and Chaos magic who is a citizen of Rustlock. |
| `.sov onboardrace human worker` | A Human with worker blood and no citizenship. |
| `.sov onboardrace talam moon scholar` | A Talam with the moon subrace and scholar blood. |
| `.sov onboardspecialties illusionmagic blacksmithing` | Starting with Illusion Magic and Blacksmithing specialties. |

<!-- section:character -->
View your character's race, onboarding status, and specialty information.

| Command | Description |
|---|---|
| **Character Commands** | |
| `.sov race` / `.sov r` | Shows your race information and lists any race-specific commands available to you. |
| `.sov onboard status` | Shows your current onboarding status. |
| `.sov specialty info ["playerName"]` / `.sov si` | Shows your specialty levels, or another player's if you provide their name. |
| `.sov specialty list [page]` / `.sov sl` | Lists all available specialty types in the system. Paginated at 10 per page. |

<!-- section:abilities -->
Manage and assign spells from your personal spell pool to your ability slots. Integrates with the CustomAbilities system.

Valid slot names are `primary`/`attack`, `q`/`secondary`, `e`/`power`, `dash`/`travel`, `r`/`spell1`, `c`/`spell2`, and `ult`/`ultimate`.

| Command | Description |
|---|---|
| **Spell Commands** | |
| `.sov spell list` / `.sov spl` | Lists all spells in your personal spell pool. |
| `.sov spell set <slot> <spellIdentifier>` / `.sov ss` | Assigns a spell from your pool to any slot. Use a slot name like `q`, `e`, `r`, or `c`. |
| `.sov spell clear <slot>` / `.sov sc` | Clears a spell slot by name, such as `q`, `e`, `r`, or `c`. |
| `.sov spell copy r` / `.sov scr` | Copies your equipped vanilla R spell to your Q slot. Not from your spell pool. |
| `.sov spell copy c` / `.sov scc` | Copies your equipped vanilla C spell to your E slot. Not from your spell pool. |
| **Preset Commands** | |
| `.sov preset save "<name>"` / `.sov ps` | Saves your current ability setup as a preset. |
| `.sov preset load "<name>"` / `.sov pl` | Loads a saved ability preset. |
| `.sov preset list [page]` / `.sov plist` | Lists your saved ability presets. Paginated. |
| `.sov preset delete "<name>"` / `.sov pd` | Deletes a saved ability preset. |

## Examples
| Command | Description |
|---|---|
| `.sov spell set q ChaosVolley` | Assign a spell to your Q slot. |
| `.sov spell set e FrostDash` | Assign a spell to your E slot. |
| `.sov spell clear q` | Clear your Q slot. |
| `.sov spell copy r` | Copy your R spell to Q. |
| `.sov preset save "pvp"` | Save your current setup as a preset. |
| `.sov preset load "pvp"` | Load a saved preset. |

<!-- section:forms -->
Assign custom shapeshift forms to named slots for quick switching.

Valid slots are `wolf`, `bear`, `spider`, `rat`, and `toad`.

| Command | Description |
|---|---|
| **Form Commands** | |
| `.sov form list [page]` / `.sov fol` | Lists all custom forms you have access to. Paginated at 5 per page. |
| `.sov form set <slot> <key>` / `.sov fs` | Assigns a custom form to a named slot for quick access. |
| `.sov form clear <slot>` / `.sov fc` | Clears a form slot, reverting it to the default form for that slot. |
| `.sov form info` / `.sov fi` | Shows your current form slot assignments and what is bound to each. |

## Examples
| Command | Description |
|---|---|
| `.sov form set 1 wolf` | Assign the wolf form to slot 1. |
| `.sov form info` | Check your current slot setup. |

<!-- section:crafting -->
Browse and craft items from available recipes. Recipes may be gated by specialty level, tags, or other requirements.

| Command | Description |
|---|---|
| **Crafting Commands** | |
| `.sov craftlist` / `.sov cl` | Lists all craftable items you currently have access to based on your specialties and tags. |
| `.sov craftinfo "<recipeName>"` / `.sov ci` | Shows the materials required for a specific recipe. Supports partial name matching. |
| `.sov craft "<itemName>"` / `.sov c` | Crafts an item by its recipe name. Partial match is supported. Wrap multi-word names in quotes, such as `.sov c "iron sword"`. |

## Examples
| Command | Description |
|---|---|
| `.sov craftlist` | See what you can craft. |
| `.sov craftinfo "bone_scythe"` | Check what materials a recipe needs. |
| `.sov craft "bone_scythe"` | Craft an item. |

<!-- section:vblood -->
Claim VBlood encounters to gain progression rewards by paying material costs.

| Command | Description |
|---|---|
| **VBlood Commands** | |
| `.sov vblood claim` | Claims the VBlood you are standing near by paying the required material costs. Walk up to a VBlood and use this command. |

You must be physically near the VBlood to claim it. Material costs vary by VBlood and will be displayed when you try to use the command.

<!-- section:anonymity -->
Commands for managing your nameplate visibility, hood, and anonymous messaging.

| Command | Description |
|---|---|
| **Anonymity Commands** | |
| `.sov alwaysreveal [revealStatus]` | Toggles whether your nameplate is always visible, bypassing the nameplate-hiding effect of the Razer Hood. Use `true`, `false`, or leave empty to toggle. |
| `.sov toggle anon [anonStatus]` | Toggles anonymous messaging for your local chat messages. When enabled, your messages in local chat will not show your name. Use `true`, `false`, or leave empty to toggle. |
| `.sov reveal` | Reveals your own nameplate. |
| `.sov riphood` | Reveals the nameplate of the nearest player on their knees. Cannot be used in combat. Broadcasts a local message to everyone nearby. |
| `.anon "<message>"` | Prefix any chat message with `.anon` to send it anonymously. Unlike `.sov toggle anon`, this works per-message without changing your settings. |

<!-- section:emotes -->
Miscellaneous utility and roleplay commands.

| Command | Description |
|---|---|
| **Emotes & Misc Commands** | |
| `.sov emote sit <sitNumber>` | Applies a sit emote buff from 1 to 6. Choose from different sitting animations. |
| `.sov cry` | Performs the cry emote. |
| `.sov weapon emote` / `.sov we` | Brandishes your held weapon in a local emote for nearby players. |
| `.sov hideweapons <weaponSide>` | Hides your weapons on a specified side: `left`, `right`, or `both`. |
| `.sov showweapons` | Shows all weapons, removing any weapon-hiding buffs. |
| `.sov roll <diceNotation>` | Rolls dice in NdM format, such as `2d6` or `1d20`. Broadcasts the result to nearby players and optionally to Discord. |
| `.sov mirror` | Opens the mirror customization menu. Cannot be used while in combat. |
| `.sov power reset` | Reverts your physical power to normal while unarmed or holding a fishing pole. Useful if gear level calculations go wrong. Power returns when you swap weapons. |
| `.sov coords` | Prints your current world coordinates (x, y, z). Useful for sharing locations. |
| `.sov buff refresh` | Refreshes your active buffs applied via race tags (Human, Mytt, Werewolf, etc.). |
| `.sov trade` | Trades with the nearest custom merchant. Can only be used if you and they are not in combat. Used when a player does not or cannot use human form to trade with a merchant. |

<!-- section:mortality -->
Commands for the mortality system. Track your status and draw blood.

| Command | Description |
|---|---|
| **Mortality Commands** | |
| `.sov mortality status` | Shows your current mortality status, including any critical injuries, remaining time, and expiration status. |
| `.sov drawblood` | Draws your blood into a bottle. Requires the Human, Werewolf, or Talam tag. Reduces your current blood pool by 40. Has a 20 hour cooldown. |

See the [Doctor Guide](#cmd-doctor) for commands that interface with this system.

<!-- section:mytt-blood -->
Mytt race players have a unique blood system to attune, focus, and consume items for blood.

| Command | Description |
|---|---|
| **Mytt Blood Commands** | |
| `.sov attune <bloodType>` / `.sov a` | Switches to one of your school's available blood types. |
| `.sov focus <quality>` / `.sov f` | Sets your blood quality to a specific value freely, from 0 to 100. |
| `.sov eat "<item>" <quantity>` / `.sov e` | Consumes items to refill your blood pool. |
| `.sov eatlist [page]` / `.sov el` | Lists items you can consume and their blood refill percentages. Paginated. |

<!-- section:ritualism -->
Toggle buffs on yourself and send ritual buff consent requests to other players. Ritual buffs require the target player to accept before they take effect. Requires the Ritualism specialty.

| Command | Description |
|---|---|
| **Self-Buff Commands** | |
| `.sov buff list` | Lists all toggleable buffs available to you. |
| `.sov buff toggle <buffAlias>` | Toggles a buff on or off for yourself. |
| **Ritual Buffs (Player-to-Player)** | |
| `.sov buff toggle <buffAlias> "<playerName>"` | Sends a ritual consent request to another player to apply a buff to them. |
| `.sov buff aoe <buffAlias>` | Sends ritual buff consent requests to all nearby players at once. |
| `.sov buff accept` | Accepts a pending ritual buff request from another player. |
| `.sov buff decline` | Declines a pending ritual buff request. |
| `.sov buff clear` | Removes all active ritual buffs from yourself that were applied by others. |
| `.sov buff remove <buffAlias> "<playerName>"` | Removes a ritual buff that you previously applied to another player. |

## Examples
| Command | Description |
|---|---|
| `.sov buff toggle night_vision` | Toggle a buff on yourself. |
| `.sov buff toggle bless "Kaelen"` | Send a buff request to another player. |
| `.sov buff accept` | Accept an incoming buff request. |
| `.sov buff aoe bless` | Apply a buff to everyone nearby. |

<!-- section:blacksmithing -->
Forge abilities onto weapons, name them, set descriptions, and lock them. Requires the Blacksmithing specialty.

| Command | Description |
|---|---|
| **Forging Commands** | |
| `.sov forge q <ability>` / `.sov fq` | Forges an ability onto the Q slot of your currently held weapon. |
| `.sov forge e <ability>` / `.sov fe` | Forges an ability onto the E slot of your currently held weapon. |
| `.sov forge primary <ability>` / `.sov fp` | Forges an ability onto the primary slot of your held weapon. |
| `.sov forge clear <slot>` / `.sov fgc` | Clears a forged ability from a specific slot on your held weapon. |
| `.sov forge list <slot>` / `.sov fgl` | Lists all valid abilities that can be forged into a specific slot on your held weapon. |
| **Weapon Customization** | |
| `.sov forge name "<name>"` / `.sov fn` | Sets a custom name for your forged weapon. |
| `.sov forge desc "<description>"` / `.sov fd` | Sets a custom description on your forged weapon. Use double quotes around the description, such as `.sov forge desc "A blade forged in dragonfire."`. |
| `.sov forge lock` / `.sov flk` | Toggles whether only the original forger can modify this weapon. Locked weapons cannot be altered by others. |
| **Inspection and Flavor** | |
| `.sov weapon inspect` / `.sov wi` | Inspects your held weapon to view its forging status, name, description, and required materials. |
| `.sov weapon details` / `.sov wd` | Shows your held weapon's tier, forge materials, and next reinforce cost. |
| `.sov forge reinforce` / `.sov fre` | Reinforces your held weapon to the next tier. |
| `.sov weapon emote` / `.sov we` | Brandishes your held weapon in a local emote for nearby players to see. |

## Examples
| Command | Description |
|---|---|
| `.sov forge q Firebrand` | Forge a Firebrand ability onto your weapon's Q slot. |
| `.sov forge name "Soulreaver"` | Name your weapon. |
| `.sov forge desc "A blade forged in dragonfire."` | Set a custom description on your weapon. |
| `.sov weapon inspect` | Inspect your weapon. |
| `.sov weapon details` | View your weapon's tier and next reinforce cost. |
| `.sov forge reinforce` | Reinforce your weapon to the next tier. |

<!-- section:tailoring -->
Reinforce your armor to increase its durability. Requires the Tailoring specialty.

| Command | Description |
|---|---|
| **Tailoring Commands** | |
| `.sov tailor reinforce` / `.sov tre` | Reinforces the armor in your last hotbar slot to increase its durability. |
| `.sov tailor reinforce inspect` / `.sov trei` | Inspects the reinforcement status of the armor in your last hotbar slot. |

Once a piece of armor has been reinforced, it can only be repaired by taking it to a tailorer to reinforce it again. Tailors also have access to custom crafting recipes. See the [Crafting Guide](#cmd-crafting) to browse and craft them.

<!-- section:rancher -->
Spawn captured animals from tokens, tend to them for resources, and manage your ranch. Requires the Rancher specialty.

| Command | Description |
|---|---|
| **Rancher Commands** | |
| `.sov rancher spawn <animal>` / `.sov rs` | Spawns a captured animal from your rancher tokens. |
| `.sov rancher tend` / `.sov rt` | Tends to nearby ranch animals to collect resources from them. |
| `.sov rancher check` / `.sov rc` | Checks what animals are within your tend radius. |
| `.sov rancher tokens` / `.sov rtk` | Views your rancher token balances for different animal types. |

## Examples
| Command | Description |
|---|---|
| `.sov rancher tokens` | Check your rancher tokens. |
| `.sov rancher spawn sheep` | Spawn a sheep, using a token in the process. |
| `.sov rancher tend` | Collect from nearby animals. |

<!-- section:architect -->
Spawn furniture and enter a specialized build mode. Requires the Architect specialty with appropriate unlock levels.

| Command | Description |
|---|---|
| **Architect Commands** | |
| `.sov build list [page]` / `.sov bl` | Lists all available architect furniture you can spawn. Paginated at 10 per page. |
| `.sov build search "<searchTerm>" [page]` / `.sov bse` | Searches architect furniture by name substring. Paginated. |
| `.sov build spawn <prefabName>` / `.sov bs` | Spawns a furniture ghost at your location and enters architect build mode. |
| `.sov build mode` / `.sov bm` | Toggles architect build mode on and off. |
| `.sov build expand [count=1]` / `.sov be` | Expands your castle heart's floor limit by +5 per boost. Requires Tier 3 Architect and material costs. |

## Examples
| Command | Description |
|---|---|
| `.sov build list` | Browse available furniture. |
| `.sov build search "throne"` | Search for a specific item. |
| `.sov build spawn CastleThrone` | Spawn a piece of furniture. |

<!-- section:doctor -->
Treatment, revival, and blood refill commands. Requires the Doctor specialty and the Doctor tag.

| Command | Description |
|---|---|
| **Doctor Commands** | |
| `.sov treat "<playerName>"` | Treats a player's critical injury. Requires the Doctor tag. |
| `.sov revive <tier>` | Revives a nearby downed player. Requires the Doctor tag and Doctor specialty at the specified tier level, from 1 to 3. |
| `.sov refillblood <quantity>` | Refills blood in 10% increments, from 1 to 10. Requires the Doctor tag and Doctor specialty level 2+. Must be near a Blood Press. |

Tier 1, 2, and 3 revives require Doctor specialty level 1, 2, or 3 respectively. Cannot revive or treat while in combat. If your mortality timer expires, your character may face consequences. Seek treatment promptly.

<!-- section:keys -->
The Keys feature allows players to give keys to their sigil to other players. If you have keys to a sigil, you can join that sigil via a chat command without needing an invite.

Use cases include:
- Swapping between two sigils you are an IC member of.
- Kicking out offline people to make room in your sigil, since they have a key and can get back in themselves later.
- Letting admins better facilitate temporary sigils for events.

**Terms**

- **Owner.** This is who the system has registered as the owner of the clan. This is different from the Leader role in-game and is tracked separately.
- **Keys.** Small bits of data that let you use a command to join a sigil without an invite.

This feature respects the current sigil limit and will not allow you to bypass it. Admins can give keys that bypass the limit. If you are the Owner of a clan, you are automatically given the in-game Leader role when joining with a key. This is for sigil access, not castle access. Ensure you are alright with people having access to the sigil before giving them a key. To use `.keys use`, you must have your mouse hovering over territory the clan owns. You do not need to be standing in that territory.

| Command | Description |
|---|---|
| **Key Commands** | |
| `.keys register` | Registers your clan with the Keys feature. You must be the clan Leader to use. The player who runs it is registered as the clan Owner. |
| `.keys give "<playerName>"` | Gives another player keys to the sigil you are currently in. Must be the clan Owner to use. |
| `.keys remove "<playerName>"` | Removes keys from another player for the sigil you are currently in. Must be the clan Owner to use. |
| `.keys remove clan` | Removes all keys from your clan. |
| `.keys owner "<playerName>"` | Transfers ownership from you to the target player. Must be the clan Owner to use. |
| `.keys list mine` | Lists all the keys you have been given. |
| `.keys list clan` | Lists all the keys to the current clan that have been given out. Must be the clan Owner to use. |
| `.keys use "<clanName>"` | Uses a key you own to join the target clan. If the clan name has spaces, wrap it in quotes, such as `.keys use "My Clan"`. If you have multiple keys for clans with the same name, use `.keys use "ClanName #1"` or `#2` to pick. |

<!-- section:signs -->
Create, manage, and browse floating text signs in the world. Signs persist across server restarts.

| Command | Description |
|---|---|
| **Player Commands** | |
| `.sign create "<text>" [color] [fontSize]` | Creates a floating text sign at your current position. Default color is white, default font size is 18. |
| `.sign move "<idOrText>"` | Moves a sign to the position you are aiming at. |
| `.sign list [page]` | Lists signs you own. Paginated at 6 per page. |
| `.sign nearest` | Shows details of the nearest sign within 5 units. |
| `.sign info ["idOrText"]` | Shows full info of a specific sign by ID or text match. Without arguments, shows info of the nearest sign. |
| `.sign remove ["idOrText"]` | Removes the nearest sign within 5 units. Provide an ID or text to remove a specific sign instead. |

<!-- section:stashes -->
Place portable stash chests in the world to store items. You may have up to 2 stashes placed at once. Placing one costs 300 wood.

| Command | Description |
|---|---|
| **Stash Commands** | |
| `.sov stash place` | Places a stash chest at your location. Costs 300 wood. |
| `.sov stash remove` | Disassembles the nearest stash within 5 meters. |
| `.sov stash bury` | Buries the nearest stash so it looks buried. |
| `.sov stash unbury` | Unburies the nearest stash. |
