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

    // for some reason, pdf sometimes bugs out and send the index instead of the string
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