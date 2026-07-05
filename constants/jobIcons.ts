// Maps a German job title (beruf) to a MaterialCommunityIcons name.
// First matching keyword group wins; order groups from specific to generic.

const ICON_RULES: [string, string[]][] = [
  ['truck', ['fahrer', 'kraftfahr', 'kurier', 'zusteller', 'lokführer', 'triebfahrzeug']],
  ['package-variant-closed', ['lager', 'logistik', 'kommission', 'stapler', 'versand']],
  ['medical-bag', ['pflege', 'kranken', 'medizin', 'arzt', 'ärzt', 'therapeut', 'apothek', 'zahn', 'gesundheit', 'rettung', 'hebamme']],
  ['cart', ['verkauf', 'verkäufer', 'kassier', 'einzelhandel', 'handel']],
  ['laptop', ['informatik', 'software', 'entwickler', 'it-', 'systemadmin', 'devops', 'data']],
  ['silverware-fork-knife', ['koch', 'köch', 'küche', 'restaurant', 'gastro', 'kellner', 'servicekraft', 'barista', 'bäcker', 'konditor', 'fleischer']],
  ['bed', ['hotel', 'housekeeping', 'rezeption']],
  ['broom', ['reinigung', 'gebäudereinig', 'raumpfleg']],
  ['school', ['erzieher', 'lehrer', 'lehrkraft', 'pädagog', 'sozialarb', 'sozialpäd', 'kita', 'dozent', 'ausbilder']],
  ['hammer', ['bau', 'maurer', 'zimmer', 'dachdeck', 'trockenbau', 'estrich', 'fliesenleger', 'gerüst']],
  ['flash', ['elektro', 'elektrik', 'elektronik', 'mechatronik']],
  ['pipe-wrench', ['sanitär', 'heizung', 'klima', 'klempner', 'anlagenmech', 'installateur']],
  ['wrench', ['mechanik', 'mechaniker', 'schlosser', 'metall', 'schweiß', 'zerspan', 'industriemech', 'maschinen', 'werkzeug', 'monteur', 'kfz']],
  ['flower', ['garten', 'landschaft', 'florist', 'gärtner', 'forst', 'landwirt']],
  ['content-cut', ['friseur', 'kosmetik', 'nagel']],
  ['shield-account', ['sicherheit', 'schutz', 'wach', 'objektschutz', 'pförtner']],
  ['calculator', ['buchhalt', 'steuer', 'controlling', 'finanz', 'lohn']],
  ['scale-balance', ['recht', 'jurist', 'anwalt', 'notar']],
  ['brush', ['maler', 'lackier', 'stuckateur']],
  ['account-tie', ['leiter', 'leitung', 'manager', 'geschäftsführ', 'vorstand']],
  ['headset', ['callcenter', 'call center', 'kundenservice', 'kundenbetreu', 'support']],
  ['office-building', ['büro', 'verwaltung', 'kaufmann', 'kauffrau', 'kaufleute', 'sekretari', 'sachbearbeit', 'assisten']],
];

export function iconForJob(beruf?: string): string {
  if (!beruf) return 'briefcase-outline';
  const lower = beruf.toLowerCase();
  for (const [icon, keywords] of ICON_RULES) {
    if (keywords.some((k) => lower.includes(k))) return icon;
  }
  return 'briefcase-outline';
}
