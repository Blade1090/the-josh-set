// ShelfCheck v0.40 — exhaustive safe PriceCharting reconciliation.
// After the second Collector export pass, these are the remaining one-to-one naming
// differences. Compilation/generic rows are intentionally left unmatched when an
// exact product price cannot safely represent a single Josh identity.
(()=>{
  if(typeof PC_REVIEWED_ALIASES==='undefined'||typeof pcNormTitle!=='function')return;
  const safe={
    'Va-11 Hall-A':1543,'8 to Glory':13,'Futuridium':1624,'Oceanhorn':1684,
    'Darkest Dungeon: Ancestral Edition':306,"Tony Hawk's Pro Skater 1 and 2":1340,
    'Atelier Lydie & Suelle':115,'Forestry 2017':1620,'Organ Trail':878,'White Day':1433,
    'Maldita Castilla EX':1665,'Valhalla Hills':1393,'Castlevania Requiem':1587,
    'American Ninja Warrior':2078,'Blaster Master Zero 2':178,'Tony Hawk 5':1767,
    'Marenian Tavern Story':1666,'Turok 3: Shadow Of Oblivion':1821,'Claire':1590,
    'Gravity Ghost':1628,'Accel World Vs Sword Art Online':30,
    'Cyanide & Happiness: Freakpocalypse':1995,'Swordbreaker':1919,'Lone Survivor':1662,
    'Brothers':1583,'Minecraft: Story Mode Season Two':1671,'Corpse Killer':269,
    'Tales From the Borderlands':1198,'Metronomicon':1758,'Stealth Inc':1734,'Night Trap':844,
    'Agatha Christie: Murder on the Orient Express':1563,'Shikhondo':1726,'The First Tree':1753,
    'Slaps and Beans':1584,'Friday the 13th':1621,'Urban Trial Tricky':1986,
    'Valentino Rossi':1775,'Typoman':1541,'Battle Garegga':139,'Knack II':676,'Redeemer':968,
    'Goat Simulator':536,"Defender's Quest: Valley of the Forgotten":346,'Panzer Dragoon':1817,
    'Bayala':148,'Tomb Raider: Definitive Edition':1339,
    "Nobunaga's Ambition Sphere of Influence [Ascension]":854,
    'The Sexy Brutale [Full House Edition]':1288,
    'Dusk':2266,'Hot Wheels Unleashed':2267,'In Nightmare':2268,'Risen':2269,
    'Saints Row':2270,'Construction Simulator':2271
  };
  for(const [title,id] of Object.entries(safe))PC_REVIEWED_ALIASES.set(pcNormTitle(title),id);
  const intentional=[
    'BioShock The Collection','Dungeons III: Complete Collection','Final Fantasy XIV Online Complete Edition',
    'La-Mulana 1 & 2 [Hidden Treasures Edition]','Mafia Trilogy','Minecraft',
    'Oniken + Odallus Collection','Wonder Boy'
  ];
  window.SHELFCHECK_PC_V040={reviewedAliases:PC_REVIEWED_ALIASES.size,intentionalUnmatched:intentional};
})();
