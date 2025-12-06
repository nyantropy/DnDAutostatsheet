// armor class is a simple formula depending on what type of armor is currently equipped
function calculateArmorClass(armorType, dmod, basearmor, bonusarmor) 
{
    armorType = String(armorType);

    switch (armorType) 
    {
        case "Unarmored":
            return 10 + dmod + bonusarmor;

        case "Light Armor":
            return basearmor + dmod + bonusarmor;

        case "Medium Armor":
            if (dmod >= 2) 
            {
                return basearmor + 2 + bonusarmor;
            }
            else 
            {
                return basearmor + dmod + bonusarmor;
            }

        case "Heavy Armor":
            return basearmor + bonusarmor;

        case "Mage Armor":
            return 13 + dmod + bonusarmor;

        default:
            return 0;
    }
}

// initiative is a simple addition of two values
function calculateInitiative(dmod, ibonus)
{
    return dmod + ibonus;
}

// speed is dependent on exhaustion level
function calculateSpeed(sbonus, elevel)
{
    elevel = Number(elevel);

    if(elevel >= 5)
    {
        return 0
    }

    if(elevel >= 2)
    {
        return (30 + sbonus) / 2
    }

    return 30 + sbonus;
}

// proficiency formula
function calculateProficiency(level)
{
    level = Number(level);
    
    if(level === 0)
    {
        return 0;
    }

    return Math.ceil(1 + 0.25 * level);
}

// max hp formula
function calculateMaxHP(level, rollhp, cmod, elevel)
{
    var base = Math.max(level * cmod, 0);

    var maxHP = base + rollhp;

    if (elevel >= 4) 
    {
        return maxHP / 2;
    }

    return maxHP;
}


// another simple formula for the modifier
function calculateModifier(score) 
{
    score = Number(score);

    if (!score) 
    {
        return "";
    }

    if (score >= 30) 
    {
        return 10;
    }

    return Math.floor((score - 10) / 2);
}

// formula for the individual skills
function calculateSkill(mod, bonus, profbonus, addbonus) 
{
    mod = Number(mod);
    bonus = Number(bonus);
    profbonus = Number(profbonus);
    addbonus = String(addbonus).trim().toUpperCase();

    // for some reason, pdf sometimes bugs out and sends the index instead of the string
    // dont really know why it is bugged, dont really care to find out either
    if (addbonus === "0") addbonus = "E";
    if (addbonus === "1") addbonus = "P";
    if (addbonus === "2") addbonus = "N";


    switch (addbonus) 
    {
        case "P":
            return mod + bonus + profbonus;

        case "E":
            return mod + bonus + (profbonus * 2);

        case "N":
        default:
            return mod + bonus;
    }
}

// single source of truth regarding class mapping
function getClassRegistry()
{
    var classRegistry = {
        Barbarian:  { levelField: "BarbarianLevel",  hitDie: 12 },
        Bard:       { levelField: "BardLevel",       hitDie: 8  },
        Cleric:     { levelField: "ClericLevel",     hitDie: 8  },
        Druid:      { levelField: "DruidLevel",      hitDie: 8  },
        Fighter:    { levelField: "FighterLevel",    hitDie: 10 },
        Monk:       { levelField: "MonkLevel",       hitDie: 8  },
        Paladin:    { levelField: "PaladinLevel",    hitDie: 10 },
        Ranger:     { levelField: "RangerLevel",     hitDie: 10 },
        Rogue:      { levelField: "RogueLevel",      hitDie: 8  },
        Sorcerer:   { levelField: "SorcererLevel",   hitDie: 6  },
        Warlock:    { levelField: "WarlockLevel",    hitDie: 8  },
        Wizard:     { levelField: "WizardLevel",     hitDie: 6  },
        Artificer:  { levelField: "ArtificerLevel",  hitDie: 8  },
        Mystic:     { levelField: "MysticLevel",     hitDie: 8  },
        Monster:    { levelField: "MonsterLevel",    hitDie: 8  },
    };

    return classRegistry;
}

// get the level list of all supported classes of the sheet
function getLevelFieldList(classRegistry) 
{
    var list = [];
    for (var cls in classRegistry) 
    {
        list.push(classRegistry[cls].levelField);
    }

    return list;
}

// only exists to keep hardcoding on script file level, making field logic abstract and less likely to bug out due to misnaming
function getLevelFieldSuffix()
{
    return "Level";
}

// used for multiclassing
// hides all level fields unrelated to the currently selected class
function showOnlyField(allFields, targetField) 
{
    for (var i = 0; i < allFields.length; i++) 
    {
        var f = this.getField(allFields[i]);
        if (f) f.display = display.hidden;
    }

    if (targetField) 
    {
        var t = this.getField(targetField);
        if (t) t.display = display.visible;
    }
}

// calculate the cumulative Level in a multiclassing setting
function calculateTotalLevel(allFields) 
{
    var total = 0;

    for (var i = 0; i < allFields.length; i++) 
    {
        var f = this.getField(allFields[i]);
        if (f) total += Number(f.value) || 0;
    }

    return total;
}

// needed for the way character hit dice are done in this document
// produces results like below:
// [ {className:"Wizard",hitDie:6,level:3}, {...} ]
function generateCharacterHitDice(classRegistry)
{
    var results = [];

    for (var cls in classRegistry) 
    {
        // why does javascript work like this?
        // i cannot combine the getfield call into the level assignment logic, so it just looks like this i guess
        var entry = classRegistry[cls];
        var f = this.getField(entry.levelField);
        var lvl = 0;
        if (f) lvl = Number(f.value) || 0;

        if (lvl > 0) 
        {
            results.push({
                className: cls,
                hitDie: entry.hitDie,   
                level: lvl             
            });
        }
    }

    results.sort(function(a, b) 
    {
        return a.hitDie - b.hitDie;
    });

    return results;
}

// combine the results of generateCharacterHitDice() into a usable format
// really it just aggregates everything, but javascript hates me and pdf code is hard (annoying)
// to debug, so im sure there is a much simpler way of doing this
function combineHitDice(diceList)
{
    var combined = {};
    
    for (var i = 0; i < diceList.length; i++) 
    {
        var die = diceList[i].hitDie;
        var lvl = diceList[i].level;

        if (!combined[die]) 
        {
            combined[die] = lvl;
        }
        else
        {
            combined[die] += lvl;
        }
    }

    var result = [];

    for (var die in combined) 
    {
        result.push({
            hitDie: Number(die),
            level: combined[die]
        });
    }

    // sort by lowest first
    result.sort(function(a, b) 
    {
        return a.hitDie - b.hitDie;
    });

    return result;
}

// a somewhat "complex" function that assigns hit dice to predetermined slots in the pdf
// really its not all that difficult, but figuring it out took a little bit
function updateHitDiceGrid(classRegistry)
{
    // 1) Generate raw hit dice (per class)
    var diceList = generateCharacterHitDice(classRegistry);

    // 2) Combine equal dice types
    var combined = combineHitDice(diceList);

    // 3) Define the slot fields
    //    hard coded out of necessity
    var slots = 
    [
        { type: "HDSlot1_Type", left: "HDSlot1_Left" },
        { type: "HDSlot2_Type", left: "HDSlot2_Left" },
        { type: "HDSlot3_Type", left: "HDSlot3_Left" },
        { type: "HDSlot4_Type", left: "HDSlot4_Left" }
    ];

    // 4) Hide all slots initially
    for (var i = 0; i < slots.length; i++) 
    {
        this.getField(slots[i].type).display = display.hidden;
        this.getField(slots[i].left).display = display.hidden;
    }

    // 5) Fill active slots (up to 4)
    for (var i = 0; i < combined.length && i < slots.length; i++) 
    {
        var slot = slots[i];
        var d = combined[i];

        this.getField(slot.type).display = display.visible;
        this.getField(slot.left).display = display.visible;

        this.getField(slot.type).value = "/ " + d.level + "d" + d.hitDie;
    }
}