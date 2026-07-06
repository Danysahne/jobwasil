// Central UI string dictionary — German and Arabic.
// Job content (titles, descriptions) is translated at runtime via TranslateApi;
// this file only covers static app chrome.

export const strings = {
  de: {
    // Tabs
    tab_search: 'Suche',
    tab_favorites: 'Favoriten',
    tab_settings: 'Einstellungen',

    // Home
    app_name: 'Jobwasil',
    app_tagline: 'Dein Job-Zauberer',
    search_placeholder: 'Jobs suchen …',
    no_results: 'Keine Stellen gefunden.',
    load_error: 'Stellen konnten nicht geladen werden.',
    searched_as: 'Gesucht nach',

    // Filters
    filters: 'Filter',
    filter_location: 'Ort',
    filter_location_placeholder: 'z. B. Berlin',
    filter_radius: 'Umkreis',
    filter_worktime: 'Arbeitszeit',
    worktime_vz: 'Vollzeit',
    worktime_tz: 'Teilzeit',
    worktime_ho: 'Homeoffice',
    worktime_snw: 'Schicht/Nacht/WE',
    worktime_mj: 'Minijob',
    apply: 'Anwenden',
    reset: 'Zurücksetzen',

    // Favorites
    favorites_empty: 'Noch keine Favoriten.\nTippe auf das Herz bei einer Stelle, um sie zu speichern.',
    saved_on: 'Gespeichert am',

    // Settings
    settings_language: 'Sprache',
    settings_appearance: 'Erscheinungsbild',
    theme_system: 'System',
    theme_light: 'Hell',
    theme_dark: 'Dunkel',
    settings_about: 'Jobwasil zeigt Stellenangebote der Bundesagentur für Arbeit — auf Deutsch und Arabisch.',
    version: 'Version',

    // Job detail
    job_detail: 'Stellendetails',
    salary: 'Vergütung',
    start_date: 'Eintrittsdatum',
    published: 'Veröffentlicht',
    ref_number: 'Referenznummer',
    description: 'Stellenbeschreibung',
    job_load_error: 'Stelle konnte nicht geladen werden.',
    temp_work: 'Zeitarbeit',
    contract_unlimited: 'Unbefristet',
    contract_limited: 'Befristet',
    salary_per_hour: '€/Std.',
    salary_per_month: '€/Monat',

    // Misc
    not_found: 'Diese Seite existiert nicht.',
    go_home: 'Zur Startseite',

    // Access gate
    access_title: 'Zugangscode',
    access_message: 'Diese App ist privat. Bitte gib deinen Zugangscode ein.',
    access_placeholder: 'Zugangscode eingeben',
    access_submit: 'Weiter',
    access_error: 'Ungültiger Code. Bitte versuche es erneut.',

    // Onboarding
    ob_welcome: 'Willkommen bei Jobwasil!',
    ob_choose_lang: 'In welcher Sprache möchtest du die App nutzen?',
    ob_features_title: 'Das kann Jobwasil',
    ob_feature_search_title: 'Jobs finden',
    ob_feature_search_text: 'Durchsuche über eine Million Stellenangebote der Bundesagentur für Arbeit — mit Filtern für Ort, Umkreis und Arbeitszeit.',
    ob_feature_translate_title: 'Alles auf Arabisch',
    ob_feature_translate_text: 'Stellentitel und Beschreibungen werden automatisch übersetzt. Du kannst jederzeit zwischen Deutsch und Arabisch wechseln.',
    ob_feature_fav_title: 'Favoriten speichern',
    ob_feature_fav_text: 'Tippe auf das Herz, um interessante Stellen zu merken — auch offline verfügbar.',
    ob_settings_title: 'Deine Einstellungen',
    ob_settings_text: 'Richte dir die App ein — du kannst alles später jederzeit im Einstellungen-Tab ändern.',
    ob_next: 'Weiter',
    ob_back: 'Zurück',
    ob_start: 'Los geht’s!',
  },
  ar: {
    // Tabs
    tab_search: 'البحث',
    tab_favorites: 'المفضلة',
    tab_settings: 'الإعدادات',

    // Home
    app_name: 'جوب وصيل',
    app_tagline: 'ساحر الوظائف الخاص بك',
    search_placeholder: 'ابحث عن وظائف …',
    no_results: 'لم يتم العثور على وظائف.',
    load_error: 'تعذّر تحميل الوظائف.',
    searched_as: 'تم البحث عن',

    // Filters
    filters: 'الفلاتر',
    filter_location: 'المدينة',
    filter_location_placeholder: 'مثال: برلين',
    filter_radius: 'نطاق البحث',
    filter_worktime: 'وقت العمل',
    worktime_vz: 'دوام كامل',
    worktime_tz: 'دوام جزئي',
    worktime_ho: 'عمل عن بُعد',
    worktime_snw: 'ورديات/ليلي',
    worktime_mj: 'عمل مصغّر',
    apply: 'تطبيق',
    reset: 'إعادة تعيين',

    // Favorites
    favorites_empty: 'لا توجد مفضلات بعد.\nاضغط على القلب بجانب وظيفة لحفظها.',
    saved_on: 'حُفظت في',

    // Settings
    settings_language: 'اللغة',
    settings_appearance: 'المظهر',
    theme_system: 'النظام',
    theme_light: 'فاتح',
    theme_dark: 'داكن',
    settings_about: 'جوب وصيل يعرض وظائف من وكالة العمل الألمانية — بالألمانية والعربية.',
    version: 'الإصدار',

    // Job detail
    job_detail: 'تفاصيل الوظيفة',
    salary: 'الراتب',
    start_date: 'تاريخ البدء',
    published: 'تاريخ النشر',
    ref_number: 'الرقم المرجعي',
    description: 'وصف الوظيفة',
    job_load_error: 'تعذّر تحميل الوظيفة.',
    temp_work: 'عمل مؤقت',
    contract_unlimited: 'غير محدد المدة',
    contract_limited: 'محدد المدة',
    salary_per_hour: '€/ساعة',
    salary_per_month: '€/شهر',

    // Misc
    not_found: 'هذه الصفحة غير موجودة.',
    go_home: 'إلى الصفحة الرئيسية',

    // Access gate
    access_title: 'رمز الدخول',
    access_message: 'هذا التطبيق خاص. الرجاء إدخال رمز الدخول.',
    access_placeholder: 'أدخل رمز الدخول',
    access_submit: 'متابعة',
    access_error: 'رمز غير صحيح. حاول مرة أخرى.',

    // Onboarding
    ob_welcome: 'أهلاً بك في جوب وصيل!',
    ob_choose_lang: 'بأي لغة تريد استخدام التطبيق؟',
    ob_features_title: 'ماذا يقدّم جوب وصيل؟',
    ob_feature_search_title: 'ابحث عن وظائف',
    ob_feature_search_text: 'ابحث في أكثر من مليون وظيفة من وكالة العمل الألمانية — مع فلاتر للمدينة ونطاق البحث ووقت العمل.',
    ob_feature_translate_title: 'كل شيء بالعربية',
    ob_feature_translate_text: 'تُترجم عناوين الوظائف وأوصافها تلقائياً. يمكنك التبديل بين الألمانية والعربية في أي وقت.',
    ob_feature_fav_title: 'احفظ المفضلة',
    ob_feature_fav_text: 'اضغط على القلب لحفظ الوظائف المهمة — متاحة حتى بدون إنترنت.',
    ob_settings_title: 'إعداداتك',
    ob_settings_text: 'جهّز التطبيق كما يناسبك — يمكنك تغيير كل شيء لاحقاً من تبويب الإعدادات.',
    ob_next: 'التالي',
    ob_back: 'رجوع',
    ob_start: 'هيا نبدأ!',
  },
} as const;

export type StringKey = keyof typeof strings.de;
