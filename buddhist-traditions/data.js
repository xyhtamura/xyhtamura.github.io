// Global Buddhist Traditions Dataset
// Structured taxonomic, doctrinal, geographic, and bibliographic repository
// Designed for visual mapping, interactive graph traversal, and multi-faceted filtering.

window.BUDDHIST_DATA = {
  metadata: {
    title: "Global Buddhist Traditions & Lineages",
    version: "1.0.0",
    lastUpdated: "2026-08-27",
    author: "Antigravity",
    totalTraditions: 38
  },
  vehicles: [
    {
      id: "theravada",
      name: "Theravāda & Southern Stream",
      pali: "थेरवाद",
      color: "#d97706",
      accent: "#b45309",
      bgLight: "#fef3c7",
      description: "The 'Way of the Elders' preserving the Pāli Canon. Emphasizes the Arahant ideal, analytical Abhidhamma deconstruction of mental factors, and monastic Vinaya adherence.",
      geography: "Sri Lanka, Myanmar, Thailand, Cambodia, Laos, Chittagong",
      scripture: "Pāli Tipiṭaka"
    },
    {
      id: "mahayana",
      name: "Mahāyāna & Eastern Stream",
      pali: "महायान",
      color: "#dc2626",
      accent: "#991b1b",
      bgLight: "#fee2e2",
      description: "The 'Great Vehicle' emphasizing the Bodhisattva ideal, universal liberation, Madhyamaka Emptiness (Śūnyatā), Yogācāra phenomenology, and Buddha-Nature (Tathāgatagarbha).",
      geography: "China, Japan, Korea, Vietnam, Taiwan",
      scripture: "Sanskrit Sūtras, Chinese Taishō Tripiṭaka"
    },
    {
      id: "vajrayana",
      name: "Vajrayāna & Northern Stream",
      pali: "वज्रयान",
      color: "#2563eb",
      accent: "#1d4ed8",
      bgLight: "#dbeafe",
      description: "The 'Diamond / Thunderbolt Vehicle' (Tantric Buddhism / Mantrayāna). The Fruition Vehicle using Deity Yoga, subtle body physiology (prāṇa, nāḍī, bindu), and non-dual awareness.",
      geography: "Tibet, Bhutan, Nepal (Newar), Mongolia, Buryatia, Kalmykia, Ladakh",
      scripture: "Tantras, Tibetan Kangyur & Tengyur, Sanskrit Tantric Liturgies"
    },
    {
      id: "modernist",
      name: "Modernist, Engaged & Emancipatory",
      pali: "नवयान",
      color: "#059669",
      accent: "#047857",
      bgLight: "#d1fae5",
      description: "Contemporary adaptations including Ambedkarite Navayāna (Dalit anti-caste liberation), Socially Engaged Buddhism, Secular Buddhism, and Clinical Mindfulness.",
      geography: "Global West, India, Urban East/Southeast Asia",
      scripture: "Contemporary treaties, Vernacular translations, Clinical manuals"
    }
  ],
  traditions: [
    // ==========================================
    // ROOT / EARLY BUDDHISM
    // ==========================================
    {
      id: "early-buddhism",
      name: "Early Buddhism & Pre-Sectarian Roots",
      nativeName: "मूलबौद्धधर्म",
      transliteration: "Mūla-buddhadharma",
      vehicle: "Early Roots",
      stream: "root",
      region: "South Asia",
      countries: ["India", "Nepal"],
      period: "c. 5th–3rd Century BCE",
      founders: ["Siddhārtha Gautama (Śākyamuni Buddha)", "The Great Disciples (Sāriputta, Moggallāna, Ānanda, Mahākassapa)"],
      canonicalLanguages: ["Pāḷi", "Gāndhārī", "Early Prakrits", "Early Sanskrit"],
      keyTexts: ["Early Sutta Collections (Nikāyas / Āgamas)", "Early Pātimokkha (Vinaya)", "Dhammapada"],
      corePhilosophy: "The Four Noble Truths, Three Marks of Existence (Anitya, Duḥkha, Anātman), and 12-linked Dependent Origination (Pratītyasamutpāda). Liberation from cyclical rebirth (Saṃsāra) into Nirvāṇa.",
      practiceType: "Breath Awareness, Satipaṭṭhāna & Jhāna",
      corePractices: [
        "Mindfulness of Breathing (Ānāpānasati)",
        "Four Foundations of Mindfulness (Satipaṭṭhāna)",
        "Four Absorptions (Jhānas / Dhyānas)",
        "Monastic Almsround & Vinaya Precepts"
      ],
      soteriologicalGoal: "Arahant (destruction of all āsavas / mental taints)",
      institutionalForm: "Wandering monastic mendicants (Sangha) residing in rainy-season retreats (Vassāvāsa)",
      description: "The historical foundation established in ancient Magadha, Kosala, and the Ganges basin. Following the Buddha's Parinirvāṇa, teachings were codified at the First Buddhist Council in Rājagaha and preserved orally in early Indo-Aryan Prakrits. King Ashoka (3rd c. BCE) subsequently dispatched missionary envoys to Sri Lanka, Gandhara, Central Asia, and Southeast Asia.",
      parentLineage: null,
      relatedLineages: ["classical-theravada", "early-mahayana"],
      links: [
        { title: "Early Buddhist Texts (SuttaCentral)", url: "https://suttacentral.net/", type: "Texts" },
        { title: "Early Buddhism (Wikipedia)", url: "https://en.wikipedia.org/wiki/Early_Buddhism", type: "Overview" },
        { title: "The Buddha's Life & Teaching (Access to Insight)", url: "https://www.accesstoinsight.org/ptf/buddha.html", type: "Resource" }
      ]
    },

    // ==========================================
    // SOUTHERN STREAM: THERAVĀDA
    // ==========================================
    {
      id: "classical-theravada",
      name: "Classical Theravāda (Mahāvihāra Tradition)",
      nativeName: "थेरवाद महाविहार",
      transliteration: "Theravāda Mahāvihāra",
      vehicle: "Theravāda",
      stream: "theravada",
      region: "South Asia",
      countries: ["Sri Lanka"],
      period: "3rd Century BCE – 5th Century CE",
      founders: ["Mahinda Thera", "Saṅghamittā Therī", "Bhadantācariya Buddhaghosa"],
      canonicalLanguages: ["Pāḷi"],
      keyTexts: ["Pāḷi Tipiṭaka", "Visuddhimagga (Path of Purification)", "Abhidhammattha-saṅgaha"],
      corePhilosophy: "Analytical pluralist realism: deconstructs physical and mental phenomena into 82 distinct irreducible ultimate realities (dhammas). Emphasizes strict preservation of the Pāli textual transmission.",
      practiceType: "Samatha & Vipassanā Analytical Insight",
      corePractices: [
        "40 Kammaṭṭhāna meditation objects",
        "Systematic Vipassanā deconstruction of the Five Aggregates",
        "Abhidhamma psychological analysis",
        "Pātimokkha monastic recitations"
      ],
      soteriologicalGoal: "Arahant (complete cessation in Nibbāna)",
      institutionalForm: "Orthodox monastic fraternity based historically at the Mahāvihāra of Anuradhapura",
      description: "Established in Sri Lanka under King Devānampiya Tissa through the mission of Ashoka's son Mahinda. Preserved the Pāli Canon in writing during the 1st century BCE at Aluvihāra. In the 5th century, Buddhaghosa composed the Visuddhimagga, establishing the classical commentary framework that became the definitive doctrinal authority across Southern Buddhism.",
      parentLineage: "early-buddhism",
      relatedLineages: ["sri-lanka-nikayas", "thai-forest", "burmese-vipassana-mahasi"],
      links: [
        { title: "Theravada (Stanford Encyclopedia of Philosophy)", url: "https://plato.stanford.edu/entries/buddhism-theravada/", type: "Scholarly" },
        { title: "Theravada Buddhism (Access to Insight)", url: "https://www.accesstoinsight.org/theravada.html", type: "Resource" },
        { title: "Visuddhimagga Overview (Wikipedia)", url: "https://en.wikipedia.org/wiki/Visuddhimagga", type: "Overview" }
      ]
    },
    {
      id: "sri-lanka-nikayas",
      name: "Sri Lankan Monastic Fraternities (Siam, Amarapura, Rāmañña)",
      nativeName: "ශ්‍රී ලංකා නිකාය",
      transliteration: "Śrī Laṅkā Nikāya",
      vehicle: "Theravāda",
      stream: "theravada",
      region: "South Asia",
      countries: ["Sri Lanka"],
      period: "18th–19th Century CE to Present",
      founders: ["Weliwita Sri Saranankara", "Phra Upali", "Ambagahawatte Saranankara"],
      canonicalLanguages: ["Pāḷi", "Sinhala"],
      keyTexts: ["Pāḷi Vinaya Piṭaka", "Visuddhimagga", "Kankhavitarani"],
      corePhilosophy: "Orthodox Pāli Theravāda scholasticism, temple landholding, and forest hermitages. Intersects with Sinhala cultural heritage, state patronage, and relic veneration (Temple of the Tooth).",
      practiceType: "Gāmavāsin (Scholastic/Ritual) & Araññavāsin (Forest Hermit)",
      corePractices: [
        "Pāli scholastic study (Piriwena)",
        "Relic veneration (Dalada Maligawa)",
        "Pirit chanting (protective paritta texts)",
        "Forest meditation retreats (Galduwa / Meetirigala Nissarana Vanaya)"
      ],
      soteriologicalGoal: "Arahantship / Favorable karmic rebirth",
      institutionalForm: "Tripartite monastic fraternities: Siam Nikāya (Govigama caste), Amarapura Nikāya (open caste), Rāmañña Nikāya (strict reformist/forest)",
      description: "Reconstituted in the 18th century after colonial decline through ordinations imported from Ayutthaya (Thailand), forming the Siam Nikāya. Subsequent non-caste fraternities (Amarapura and Rāmañña) emerged via Burmese ordinations, creating the contemporary tripartite sangha structure.",
      parentLineage: "classical-theravada",
      relatedLineages: ["thai-forest", "burmese-vipassana-mahasi"],
      links: [
        { title: "Siam Nikaya (Wikipedia)", url: "https://en.wikipedia.org/wiki/Siam_Nikaya", type: "Overview" },
        { title: "Ramanna Nikaya (Wikipedia)", url: "https://en.wikipedia.org/wiki/Rama%C3%B1%C3%B1a_Nik%C4%81ya", type: "Overview" },
        { title: "Buddhist Monasticism in Sri Lanka (Access to Insight)", url: "https://www.accesstoinsight.org/lib/authors/kariyawasam/wheel402.html", type: "Resource" }
      ]
    },
    {
      id: "burmese-vipassana-mahasi",
      name: "Burmese Vipassanā Movement (Mahāsi Noting Method)",
      nativeName: "မဟာစည် ဝိပဿနာ",
      transliteration: "Mahāsi Vipassanā",
      vehicle: "Theravāda",
      stream: "theravada",
      region: "Southeast Asia",
      countries: ["Myanmar", "Global West", "Sri Lanka", "Thailand"],
      period: "Late 19th Century – Mid 20th Century to Present",
      founders: ["Ledi Sayadaw", "Mingun Jetawun Sayadaw", "Mahasi Sayadaw", "Sayadaw U Pandita"],
      canonicalLanguages: ["Pāḷi", "Burmese", "English"],
      keyTexts: ["Mahāsatipaṭṭhāna Sutta", "Visuddhimagga", "The Progress of Insight (Mahasi Sayadaw)"],
      corePhilosophy: "Dry Insight (sukkha-vipassanā): direct experiential deconstruction of mind-and-matter without requiring prior attainment of full Jhānic absorption. Democratized meditation for laypersons.",
      practiceType: "Dry Insight (Moment-to-moment Noting)",
      corePractices: [
        "Mental noting of abdominal rising and falling",
        "Continuous labeling of bodily movements, thoughts, and sensations",
        "Slow-motion walking meditation (cankamana)",
        "Progressive traversal of the 16 Insight Knowledges (ñāṇas)"
      ],
      soteriologicalGoal: "Sotāpanna (Stream-entry) to Arahant",
      institutionalForm: "Urban and rural lay meditation centers (Yeiktha), global retreat centers (IMS, Spirit Rock)",
      description: "Initiated under British colonial rule by Ledi Sayadaw to preserve the Dhamma, and institutionalized in Yangon by Mahasi Sayadaw. Transformed Theravāda from an exclusively monastic asceticism into a global mass contemplative practice, serving as the direct ancestor of Western Insight Meditation.",
      parentLineage: "classical-theravada",
      relatedLineages: ["burmese-vipassana-goenka", "burmese-pa-auk", "western-insight"],
      links: [
        { title: "Mahasi Sayadaw (Wikipedia)", url: "https://en.wikipedia.org/wiki/Mahasi_Sayadaw", type: "Overview" },
        { title: "The Progress of Insight (Access to Insight)", url: "https://www.accesstoinsight.org/lib/authors/mahasi/progress.html", type: "Texts" },
        { title: "Vipassana Movement (Wikipedia)", url: "https://en.wikipedia.org/wiki/Vipassana_movement", type: "Overview" }
      ]
    },
    {
      id: "burmese-vipassana-goenka",
      name: "S. N. Goenka / Sayagyi U Ba Khin Tradition",
      nativeName: "ဝိပဿနာ ဂိုအင်ကာ",
      transliteration: "Goenka Vipassanā",
      vehicle: "Theravāda",
      stream: "theravada",
      region: "Southeast Asia",
      countries: ["Myanmar", "India", "Global (Worldwide)"],
      period: "Mid-20th Century to Present",
      founders: ["Sayagyi U Ba Khin", "S. N. Goenka"],
      canonicalLanguages: ["Pāḷi", "Hindi", "English"],
      keyTexts: ["Mahāsatipaṭṭhāna Sutta", "Dhamma Discourse Summaries"],
      corePhilosophy: "Rigorous observation of physical sensations (vedanā) as the direct physical interface of craving and aversion. Emphasizes non-sectarian universality and purification of deep mental conditioning (saṅkhāras).",
      practiceType: "Systematic Body-Sweeping & Equanimity",
      corePractices: [
        "Ānāpānasati (breath awareness at the nostrils for 3.5 days)",
        "Systematic body sweeping of bodily sensations (vedanā) for 6.5 days",
        "Loving-kindness meditation (Mettā-bhāvanā)",
        "Strict 10-day Noble Silence retreat structure"
      ],
      soteriologicalGoal: "Eradication of latent defilements (anusayas), liberation from suffering",
      institutionalForm: "Global network of over 200 dedicated non-profit retreat centers (Dhamma Giri, etc.) run by volunteer trusts",
      description: "Developed in post-independence Myanmar by accountant-general Sayagyi U Ba Khin and propagated globally by Indian-Burmese teacher S. N. Goenka. Centers operate on a strict 10-day residential format financed entirely through voluntary donations from past students.",
      parentLineage: "classical-theravada",
      relatedLineages: ["burmese-vipassana-mahasi", "western-insight"],
      links: [
        { title: "Vipassana Research Institute (VRI)", url: "https://www.vridhamma.org/", type: "Official" },
        { title: "S. N. Goenka (Wikipedia)", url: "https://en.wikipedia.org/wiki/S._N._Goenka", type: "Overview" },
        { title: "Global Vipassana Pagoda", url: "https://www.globalpagoda.org/", type: "Resource" }
      ]
    },
    {
      id: "burmese-pa-auk",
      name: "Pa-Auk Sayadaw Lineage (Classical Samatha-Vipassanā)",
      nativeName: "ဖားအောက် ဝိပဿနာ",
      transliteration: "Pa-Auk Kammaṭṭhāna",
      vehicle: "Theravāda",
      stream: "theravada",
      region: "Southeast Asia",
      countries: ["Myanmar", "Malaysia", "Singapore", "USA"],
      period: "Late 20th Century to Present",
      founders: ["Pa-Auk Tawya Sayadaw (U Āciṇṇa)"],
      canonicalLanguages: ["Pāḷi", "Burmese"],
      keyTexts: ["Visuddhimagga", "Abhidhammattha-saṅgaha", "Knowing and Seeing (Pa-Auk Sayadaw)"],
      corePhilosophy: "Classical fundamentalism: insists that deep Insight (Vipassanā) requires first attaining luminous Jhāna absorption (via breath nimitta or kasiṇa discs) to produce the powerful concentrated light needed to discern ultimate sub-atomic kalāpa particles.",
      practiceType: "Jhāna Absorption followed by Deep Kalāpa Dissection",
      corePractices: [
        "Breath nimitta absorption into the 4 Form & 4 Formless Jhānas",
        "Color and Element Kasiṇa mastery",
        "Dissection of material kalāpas into ultimate dhammas",
        "Discerning Dependent Origination across past and future lives"
      ],
      soteriologicalGoal: "Classical Arahantship via complete Visuddhimagga stages",
      institutionalForm: "Large forest monastery complexes (Pa-Auk Forest Monastery in Mawlamyine)",
      description: "Represents the most rigorous contemporary revival of the classical Buddhaghosa commentary curriculum. Monks and lay retreatants undergo months or years of intensive cloistered training mastering the full sequence of 8 absorptions before undertaking Abhidhammic insight.",
      parentLineage: "classical-theravada",
      relatedLineages: ["burmese-vipassana-mahasi", "thai-forest"],
      links: [
        { title: "Pa-Auk Tawya Official Site", url: "https://www.paaukforestmonastery.org/", type: "Official" },
        { title: "Knowing and Seeing (Pa-Auk Sayadaw PDF)", url: "https://www.paaukforestmonastery.org/knowing-and-seeing", type: "Texts" },
        { title: "Pa-Auk Sayadaw (Wikipedia)", url: "https://en.wikipedia.org/wiki/Pa-Auk_Sayadaw", type: "Overview" }
      ]
    },
    {
      id: "thai-forest",
      name: "Thai Forest Tradition (Kammaṭṭhāna Lineage)",
      nativeName: "พระป่าสายกัมมัฏฐาน",
      transliteration: "Phra Pa Kammaṭṭhāna",
      vehicle: "Theravāda",
      stream: "theravada",
      region: "Southeast Asia",
      countries: ["Thailand", "UK", "USA", "Australia", "New Zealand", "Canada"],
      period: "Late 19th Century to Present",
      founders: ["Ajahn Sao Kantasīlo", "Ajahn Mun Bhūridatto", "Ajahn Chah", "Ajahn Maha Bua"],
      canonicalLanguages: ["Pāḷi", "Thai", "Isan"],
      keyTexts: ["Pāḷi Suttas & Vinaya", "Autobiography of Ajahn Mun", "A Still Forest Pool (Ajahn Chah)"],
      corePhilosophy: "Rejection of academic scholasticism in favor of direct wilderness contemplation. Upholds the luminous, unconditioned nature of the purified mind (citta) once liberated from adventitious defilements (kilesas).",
      practiceType: "Dhutaṅga Asceticism & Direct Mind Observation",
      corePractices: [
        "13 Ascetic practices (Dhutaṅga): one meal a day from bowl, rag-robes, forest/cemetery dwelling",
        "Continuous recitation of the mantra 'Buddho' with the breath",
        "Walking meditation on dirt paths (jongrom)",
        "Direct observation of the arising and dissolving of the citta"
      ],
      soteriologicalGoal: "Arahantship / Eradication of the defilements in the wild",
      institutionalForm: "Forest monasteries (Wat Pah) governed by senior Ajahns; global international branch monasteries (Amaravati, Abhayagiri, Wat Pah Nanachat)",
      description: "Founded in the northeastern Isan jungle by Ajahn Sao and Ajahn Mun to restore the ascetic wilderness lifestyle of the early Sangha. Ajahn Chah's lineage produced numerous prominent Western monastics (Ajahn Sumedho, Ajahn Amaro, Ajahn Pasanno, Ajahn Brahm) who established forest monasteries globally.",
      parentLineage: "classical-theravada",
      relatedLineages: ["sri-lanka-nikayas", "western-insight"],
      links: [
        { title: "Thai Forest Tradition (Wikipedia)", url: "https://en.wikipedia.org/wiki/Thai_Forest_Tradition", type: "Overview" },
        { title: "Forest Sangha Official Portal", url: "https://forestsangha.org/", type: "Official" },
        { title: "Ajahn Chah Teachings (Access to Insight)", url: "https://www.accesstoinsight.org/lib/authors/chah/", type: "Texts" }
      ]
    },
    {
      id: "thai-dhammayuttika",
      name: "Thai Royal Dhammayuttika Nikāya & State Sangha",
      nativeName: "ธรรมยุติกนิกาย",
      transliteration: "Thammayut Nikai",
      vehicle: "Theravāda",
      stream: "theravada",
      region: "Southeast Asia",
      countries: ["Thailand", "Cambodia", "Laos"],
      period: "1833 to Present",
      founders: ["King Mongkut (Rama IV / Phra Chom Klao)"],
      canonicalLanguages: ["Pāḷi", "Thai"],
      keyTexts: ["Pāḷi Tipiṭaka", "Vinayamukha (Prince Wachirayan)"],
      corePhilosophy: "Canonical rationalism and strict scriptural revival. Purged vernacular folk superstitions, standardized Pāli chanting pronunciation, and instituted strict compliance with monastic code rules.",
      practiceType: "Orthodox Monastic Discipline & Scriptural Scholasticism",
      corePractices: [
        "Strict robe-wearing and ordination platform standards",
        "Canonical chanting in corrected Magadha pronunciation",
        "Standardized national ecclesiastical examinations (Nak Tham)",
        "State ceremonial blessings and court rituals"
      ],
      soteriologicalGoal: "Preservation of the Sāsana (Dispensation) & Spiritual purity",
      institutionalForm: "State-recognized royal monastic order headed by the Supreme Patriarch (Somdet Phra Sangharaja) and the Sangha Supreme Council (Mahathera Samakhom)",
      description: "Created by Prince Monk Mongkut before ascending the throne of Siam. Served as the administrative vehicle for modernizing Siamese monasticism and centralizing religious authority across regional provinces.",
      parentLineage: "classical-theravada",
      relatedLineages: ["thai-forest", "cambodian-lao-theravada"],
      links: [
        { title: "Dhammayuttika Nikaya (Wikipedia)", url: "https://en.wikipedia.org/wiki/Dhammayuttika_Nikaya", type: "Overview" },
        { title: "Buddhism in Thailand (Wikipedia)", url: "https://en.wikipedia.org/wiki/Buddhism_in_Thailand", type: "Overview" }
      ]
    },
    {
      id: "cambodian-lao-theravada",
      name: "Cambodian & Lao Theravāda (Post-War Revival)",
      nativeName: "ពុទ្ធសាសនានៅកម្ពុជា / ພຸດທະສາດສະໜາໃນລາວ",
      transliteration: "Buddhasāsana Kampuchea / Phutthasatsana Lao",
      vehicle: "Theravāda",
      stream: "theravada",
      region: "Southeast Asia",
      countries: ["Cambodia", "Laos"],
      period: "14th Century to Present",
      founders: ["Maha Ghosananda", "Chuon Nath", "Huot Tat"],
      canonicalLanguages: ["Pāḷi", "Khmer", "Lao"],
      keyTexts: ["Pāḷi Tipiṭaka", "Trai Phum Phra Ruang / Traibhumikatha", "Gītisāra"],
      corePhilosophy: "Theravāda integration with local protective guardian cults (Neak Ta in Cambodia, Phi in Laos). Post-1979 focus on trauma healing, peace activism, and monastic reconstruction.",
      practiceType: "Village Pastoral Rites, Peace Walks (Dhammayietra) & Merit-Making",
      corePractices: [
        "Dhammayietra annual interfaith peace walks through conflict zones",
        "Ancestral deliverance ceremonies (Pchum Ben / Boun Khao Padap Din)",
        "Temple water blessings and protective thread rituals",
        "Rebuilding devastated monastic libraries and pagodas"
      ],
      soteriologicalGoal: "National reconciliation, karmic merit, and peace",
      institutionalForm: "Maha Nikaya and Thommayut orders under national Sangharajas",
      description: "Suffered catastrophic destruction under the Khmer Rouge (1975–1979), where over 95% of monks were disrobed or executed. Rebuilt from the 1980s onward, spearheaded by Ven. Maha Ghosananda (the 'Gandhi of Cambodia') through mass non-violent pilgrimage.",
      parentLineage: "classical-theravada",
      relatedLineages: ["esoteric-theravada", "thai-dhammayuttika"],
      links: [
        { title: "Maha Ghosananda (Wikipedia)", url: "https://en.wikipedia.org/wiki/Maha_Ghosananda", type: "Overview" },
        { title: "Buddhism in Cambodia (Wikipedia)", url: "https://en.wikipedia.org/wiki/Buddhism_in_Cambodia", type: "Overview" },
        { title: "Dhammayietra Peace Walks (Tricycle)", url: "https://tricycle.org/magazine/the-dhammayietra-peace-walks/", type: "Article" }
      ]
    },
    {
      id: "esoteric-theravada",
      name: "Esoteric Theravāda / Boran Kammaṭṭhāna (Yogāvacara)",
      nativeName: "โบราณกัมมัฏฐาน / យោគាវចរ",
      transliteration: "Boran Kammaṭṭhāna / Yogāvacara",
      vehicle: "Theravāda",
      stream: "theravada",
      region: "Southeast Asia",
      countries: ["Cambodia", "Thailand", "Laos", "Sri Lanka"],
      period: "Pre-modern (c. 10th–19th Century CE)",
      founders: ["Traditional Anonymous Lineages", "Studied by François Bizot & Kate Crosby"],
      canonicalLanguages: ["Pāḷi", "Old Khmer", "Northern Thai (Lanna)", "Sinhala"],
      keyTexts: ["The Manual of the Yogāvacara", "Mūla Kammaṭṭhāna", "Dharmarājika manuals"],
      corePhilosophy: "A pre-reform Southern esoteric tradition. Operates on the transmutation of the practitioner's physical body into the unconditioned crystalline body of the Buddha (Dhammakāya) through internal embryological processes.",
      practiceType: "Internal Embryology, Syllable Mapping & Subtle Anatomy",
      corePractices: [
        "Visualizing sacred Pāli sacred syllables (NA MO BUD DHĀ YA) stationed in internal bodily chakras",
        "Balancing the four internal material elements (earth, water, fire, wind)",
        "Internal generation of the spiritual fetus (Dhammakāya)",
        "Esoteric initiation and recitation of protective yantras"
      ],
      soteriologicalGoal: "Attaining the incorruptible Golden Body of the Buddha inside the physical frame",
      institutionalForm: "Secretive master-disciple lineages; largely marginalized by 19th-century modernist rationalist reforms",
      description: "Documented extensively by scholars François Bizot and Kate Crosby. Represents a widespread pre-colonial esoteric system across mainland Southeast Asia and Sri Lanka that used visualization techniques resembling Tantra while remaining grounded in the Pāli language.",
      parentLineage: "classical-theravada",
      relatedLineages: ["burmese-weizza", "japanese-shingon"],
      links: [
        { title: "Boran Kammatthana (Wikipedia)", url: "https://en.wikipedia.org/wiki/Boran_kamma%E1%B9%AD%E1%B9%ADh%C4%81na", type: "Overview" },
        { title: "Esoteric Theravada Book Overview (Shambhala)", url: "https://www.shambhala.com/esoteric-theravada.html", type: "Resource" },
        { title: "The Yogavacara's Manual (Sacred Texts)", url: "https://www.sacred-texts.com/bud/ym/index.htm", type: "Texts" }
      ]
    },
    {
      id: "burmese-weizza",
      name: "Burmese Weizza / Weikza Occult Lineages",
      nativeName: "ဝိဇ္ဇာလမ်းစဉ်",
      transliteration: "Weizza-lam-sin",
      vehicle: "Theravāda",
      stream: "theravada",
      region: "Southeast Asia",
      countries: ["Myanmar"],
      period: "18th Century to Present",
      founders: ["Bo Bo Aung", "Bo Min Gaung"],
      canonicalLanguages: ["Burmese", "Pāḷi"],
      keyTexts: ["Weikza grimoires", "Talismanic Yantra (In) treatises", "Metteyya devotional scrolls"],
      corePhilosophy: "Attainment of supernatural semi-immortality and esoteric wizardry through Buddhist moral discipline, samādhi, alchemy, and sacred spells, allowing the practitioner to survive until the advent of the future Buddha Metteyya.",
      practiceType: "Esoteric Folk Alchemy, Yantras & Longevity Magic",
      corePractices: [
        "Inscribed magical grid diagrams (In) and metal amulets",
        "Mercury and iron alchemy (pyan-say)",
        "Intensive Samatha and protective mantra recitation",
        "Spirit possession and visionary communion with Weikza masters"
      ],
      soteriologicalGoal: "Longevity to receive direct teachings from Buddha Metteyya",
      institutionalForm: "Folk esoteric brotherhoods (gaings) led by charismatic masters outside the formal Sangha hierarchy",
      description: "A unique semi-esoteric Burmese tradition coexisting alongside mainstream monasticism. Devotees revere legendary wizards (Weizzas) whose statues are placed alongside the Buddha in urban and village shrines across Myanmar.",
      parentLineage: "classical-theravada",
      relatedLineages: ["esoteric-theravada", "burmese-vipassana-mahasi"],
      links: [
        { title: "Weizza (Wikipedia)", url: "https://en.wikipedia.org/wiki/Weizza", type: "Overview" },
        { title: "Burmese Cult of Amulets (Anthropology Overview)", url: "https://en.wikipedia.org/wiki/Buddhism_in_Myanmar", type: "Overview" }
      ]
    },

    // ==========================================
    // EASTERN STREAM: MAHĀYĀNA
    // ==========================================
    {
      id: "early-mahayana",
      name: "Indian Mahāyāna Roots (Madhyamaka & Yogācāra)",
      nativeName: "मध्यमक / योगाचार",
      transliteration: "Madhyamaka / Yogācāra",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "South Asia",
      countries: ["India", "Pakistan (Gandhara)", "Afghanistan"],
      period: "c. 1st Century BCE – 6th Century CE",
      founders: ["Ārya Nāgārjuna", "Candrakīrti", "Ārya Asaṅga", "Vasubandhu", "Dignāga"],
      canonicalLanguages: ["Sanskrit", "Prakrit"],
      keyTexts: ["Prajñāpāramitā Sūtras (Heart, Diamond)", "Mūlamadhyamakakārikā", "Triṃśikā-vijñaptimātratā", "Lotus Sūtra"],
      corePhilosophy: "Madhyamaka establishes Emptiness (Śūnyatā) and the Two Truths (Conventional vs. Ultimate). Yogācāra establishes Mind-Only (Vijñaptimātra), the 8 Consciousnesses (including Ālayavijñāna), and the 3 Natures (Trisvabhāva).",
      practiceType: "Bodhisattva Path, Pāramitā Perfection & Non-Dual Dialectics",
      corePractices: [
        "Generating the Mind of Awakening (Bodhicitta)",
        "Cultivating the Six Perfections (Dāna, Śīla, Kṣānti, Vīrya, Dhyāna, Prajñā)",
        "Dialectical refutation of inherent existence (Svabhāva)",
        "Yoga of mental perception and seed purification"
      ],
      soteriologicalGoal: "Samyaksambodhi (Complete Buddhahood for all beings)",
      institutionalForm: "Great monastic universities of ancient India (Nālandā, Valabhī, Vikramashīla)",
      description: "Emerged in ancient India with the Prajñāpāramitā literature, elevating the Bodhisattva ideal over personal cessation. The philosophical systems forged at Nālandā University by Nāgārjuna and Asaṅga became the twin doctrinal pillars for all East Asian and Tibetan Buddhism.",
      parentLineage: "early-buddhism",
      relatedLineages: ["chinese-chan-linji", "chinese-pure-land", "tiantai", "tibetan-nyingma", "tibetan-gelug"],
      links: [
        { title: "Madhyamaka (Stanford Encyclopedia of Philosophy)", url: "https://plato.stanford.edu/entries/madhyamaka/", type: "Scholarly" },
        { title: "Yogacara (Stanford Encyclopedia of Philosophy)", url: "https://plato.stanford.edu/entries/buddhism-yogacara/", type: "Scholarly" },
        { title: "Nāgārjuna (Stanford Encyclopedia of Philosophy)", url: "https://plato.stanford.edu/entries/nagarjuna/", type: "Scholarly" }
      ]
    },
    {
      id: "chinese-chan-linji",
      name: "Chinese Chan — Linji School (Rinzai Lineage)",
      nativeName: "臨濟宗",
      transliteration: "Línjì Zōng",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "East Asia",
      countries: ["China", "Taiwan", "Japan", "Global"],
      period: "9th Century CE to Present",
      founders: ["Bodhidharma", "Huineng (Sixth Patriarch)", "Linji Yixuan (Rinzai Gigen)"],
      canonicalLanguages: ["Classical Chinese"],
      keyTexts: ["Platform Sūtra of the Sixth Patriarch", "Linji Lu (Record of Linji)", "Blue Cliff Record (Biyan Lu)", "The Gateless Gate (Wumenguan)"],
      corePhilosophy: "Direct pointing to the human mind; seeing into one's nature and attaining Buddhahood. Rejects conceptual scaffolding through explosive dynamic actions, shouting (katsu), strikes, and paradoxical inquiry.",
      practiceType: "Gong'an (Kōan) Investigation & Shock Breakthrough",
      corePractices: [
        "Contemplation of Gong'an (Kōan) encounters",
        "Investigating the critical phrase (Huātóu)",
        "Sitting meditation (Zuochan / Zazen)",
        "Daily communal manual labor (Zuowu / Samu)"
      ],
      soteriologicalGoal: "Kenshō / Wu (Awakening to inherent Buddha-nature)",
      institutionalForm: "Large communal monasteries under the Chan monastic code (Baizhang Qinggui)",
      description: "Founded by Master Linji Yixuan during the late Tang dynasty. Known as the 'dynamic' or martial house of Chan, using unexpected blows, shouts, and sharp verbal duels to force students beyond intellectual deliberation into direct insight.",
      parentLineage: "early-mahayana",
      relatedLineages: ["chinese-chan-caodong", "japanese-rinzai", "korean-seon-jogye", "humanistic-buddhism"],
      links: [
        { title: "Chan Buddhism (Stanford Encyclopedia of Philosophy)", url: "https://plato.stanford.edu/entries/buddhism-chan/", type: "Scholarly" },
        { title: "Linji school (Wikipedia)", url: "https://en.wikipedia.org/wiki/Linji_school", type: "Overview" },
        { title: "The Record of Linji (Terebess Translation Archive)", url: "https://terebess.hu/zen/linji-eng.html", type: "Texts" }
      ]
    },
    {
      id: "chinese-chan-caodong",
      name: "Chinese Chan — Caodong School (Sōtō Lineage)",
      nativeName: "曹洞宗",
      transliteration: "Cáodòng Zōng",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "East Asia",
      countries: ["China", "Taiwan", "Japan"],
      period: "9th Century CE to Present",
      founders: ["Dongshan Liangjie", "Caoshan Benji", "Hongzhi Zhengjue"],
      canonicalLanguages: ["Classical Chinese"],
      keyTexts: ["Song of the Precious Mirror Samādhi", "Hongzhi's Inscription on Silent Illumination", "Book of Equanimity (Congrong Lu)"],
      corePhilosophy: "Silent Illumination (Mòzhào Chán): resting in the innate, radiant awareness of Buddha-nature without striving, objectification, or conceptual intervention. The Five Ranks (Wǔwèi) dialectic.",
      practiceType: "Silent Illumination (Mòzhào Chán) & Non-Dual Sitting",
      corePractices: [
        "Objectless seated meditation (Zuochan)",
        "Five Ranks (Wǔwèi) contemplation of Relative and Absolute",
        "Communal monastic chanting and liturgical repentance",
        "Mindful engagement in routine physical work"
      ],
      soteriologicalGoal: "Direct manifestation of inherent enlightenment in daily posture",
      institutionalForm: "Monastic training centers emphasizing subtle refinement and gentle guidance",
      description: "Founded in the Tang dynasty by Dongshan and Caoshan. Hongzhi Zhengjue later refined the 'Silent Illumination' contemplative doctrine, which traveled to Japan with Dōgen in the 13th century to become Sōtō Zen.",
      parentLineage: "early-mahayana",
      relatedLineages: ["chinese-chan-linji", "japanese-soto", "humanistic-buddhism"],
      links: [
        { title: "Caodong school (Wikipedia)", url: "https://en.wikipedia.org/wiki/Caodong_school", type: "Overview" },
        { title: "Silent Illumination (Dharma Drum Mountain)", url: "https://www.dharmadrum.org/portal_d1_cnt.php?folder_id=28&cnt_id=105", type: "Resource" },
        { title: "Hongzhi Zhengjue (Wikipedia)", url: "https://en.wikipedia.org/wiki/Hongzhi_Zhengjue", type: "Overview" }
      ]
    },
    {
      id: "japanese-soto",
      name: "Japanese Sōtō Zen (Dōgen Lineage)",
      nativeName: "曹洞宗",
      transliteration: "Sōtō-shū",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "East Asia",
      countries: ["Japan", "USA", "Europe", "Global"],
      period: "13th Century CE to Present",
      founders: ["Eihei Dōgen", "Keizan Jōkin (Fourth Patriarch / Consolidation)"],
      canonicalLanguages: ["Classical Chinese", "Old Japanese"],
      keyTexts: ["Shōbōgenzō (Treasury of the True Dharma Eye)", "Eihei Kōroku", "Fukanzazengi", "Denkōroku"],
      corePhilosophy: "The Oneness of Practice and Realization (Shushō Ittō): zazen is not a method to gain awakening; sitting itself is the actualization of enlightened nature. Impermanence as Time-Being (Uji).",
      practiceType: "Shikantaza ('Just Sitting') & Every-Action-as-Practice",
      corePractices: [
        "Shikantaza (objectless, goal-less facing the wall)",
        "Kinhin (slow walking meditation)",
        "Oryoki (formal ritual mindful eating)",
        "Strict monastic choreography governing every bodily action"
      ],
      soteriologicalGoal: "Genjōkōan (Actualizing the fundamental point in the present moment)",
      institutionalForm: "Two head temples: Eihei-ji (deep mountain discipline) and Sōji-ji (popular institutional outreach); married temple priests (jūshoku)",
      description: "Founded by Dōgen Zenji after returning from China in 1227. Later popularized across provincial Japan by Keizan Jōkin through incorporating local memorial rites, healing liturgies, and lay precept ceremonies. It is currently the largest Zen denomination in Japan.",
      parentLineage: "chinese-chan-caodong",
      relatedLineages: ["japanese-rinzai", "western-zen"],
      links: [
        { title: "Dōgen (Stanford Encyclopedia of Philosophy)", url: "https://plato.stanford.edu/entries/dogen/", type: "Scholarly" },
        { title: "Sōtō Zen Official Portal", url: "https://www.sotozen.com/", type: "Official" },
        { title: "Shōbōgenzō (Stanford Translations)", url: "https://scdd.stanford.edu/sotoshu-translations", type: "Texts" }
      ]
    },
    {
      id: "japanese-rinzai",
      name: "Japanese Rinzai Zen (Hakuin Revival)",
      nativeName: "臨済宗",
      transliteration: "Rinzai-shū",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "East Asia",
      countries: ["Japan", "USA", "Europe"],
      period: "12th Century CE / 18th Century Systematization to Present",
      founders: ["Myōan Eisai", "Shūhō Myōchō (Daitō Kokushi)", "Hakuin Ekaku"],
      canonicalLanguages: ["Classical Chinese", "Japanese"],
      keyTexts: ["Mumonkan (Gateless Gate)", "Hekiganroku (Blue Cliff Record)", "Hakuin's Song of Zazen", "Yasenkanna"],
      corePhilosophy: "Rigorous breakthrough into Kenshō (seeing into one's true nature) through the systematic traversal of a standardized, multi-tiered kōan curriculum under the strict supervision of a certified Rōshi.",
      practiceType: "Systematic Kōan Curriculum & Breath Focus (Tanden)",
      corePractices: [
        "Dokusan / Sanzen (private, intense interview with the master)",
        "Kōan contemplation ('Mu', 'Sound of One Hand', 'Original Face')",
        "Tanden breathing (centering psychic energy in the lower abdomen)",
        "Sesshin (intensive 7-day silent retreats with minimal sleep)"
      ],
      soteriologicalGoal: "Kenshō / Satori followed by post-awakening integration (Gogo no shugyō)",
      institutionalForm: "14 autonomous traditional branches centered at grand Kyoto/Kamakura head temples (Myōshin-ji, Daitoku-ji, Tenryū-ji, Engaku-ji)",
      description: "Initially brought to Japan by Eisai and championed by samurai aristocrats. In the 18th century, Hakuin Ekaku completely revitalized the school, reforming the kōan curriculum into a graded educational path from breakthrough kōans to five-rank integrations.",
      parentLineage: "chinese-chan-linji",
      relatedLineages: ["japanese-soto", "japanese-obaku", "western-zen"],
      links: [
        { title: "Rinzai school (Wikipedia)", url: "https://en.wikipedia.org/wiki/Rinzai_school", type: "Overview" },
        { title: "Hakuin Ekaku (Stanford Encyclopedia of Philosophy)", url: "https://plato.stanford.edu/entries/hakuin/", type: "Scholarly" },
        { title: "Zen Buddhism (Stanford Encyclopedia of Philosophy)", url: "https://plato.stanford.edu/entries/japanese-zen/", type: "Scholarly" }
      ]
    },
    {
      id: "japanese-obaku",
      name: "Japanese Ōbaku Zen",
      nativeName: "黃檗宗",
      transliteration: "Ōbaku-shū",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "East Asia",
      countries: ["Japan"],
      period: "1661 to Present",
      founders: ["Ingen Ryūki (Yinyuan Longqi)"],
      canonicalLanguages: ["Ming-period Chinese", "Japanese"],
      keyTexts: ["Ōbaku Shingi (Monastic Code)", "Linji Lu", "Amitābha Sūtra"],
      corePhilosophy: "Dual Practice of Chan and Pure Land (Chán-Jìng Shuāngxiū): chanting the Nembutsu while simultaneously investigating the question 'Who is the one reciting the Buddha's name?'",
      practiceType: "Dual Chan Meditation & Musical Nembutsu Chanting",
      corePractices: [
        "Reciting the Nembutsu with Chinese rhythmic percussion (Foyue)",
        "Zazen combined with Pure Land devotion",
        "Preserving Ming dynasty Chinese monastic dress, cuisine (Fucha Ryōri), and ritual architecture",
        "Sencha tea ceremony traditions"
      ],
      soteriologicalGoal: "Enlightenment through realizing the Mind-Only Pure Land",
      institutionalForm: "Head temple Manpuku-ji in Uji, Kyoto",
      description: "Established during the early Edo period by Chinese Chan master Ingen, who fled the fall of the Ming dynasty. Introduced Ming architecture, vegetarian culinary art, Chinese chanting styles, and literati culture to Japan.",
      parentLineage: "chinese-chan-linji",
      relatedLineages: ["japanese-rinzai", "japanese-pure-land-jodo"],
      links: [
        { title: "Obaku (Wikipedia)", url: "https://en.wikipedia.org/wiki/%C5%8Cbaku", type: "Overview" },
        { title: "Manpuku-ji Official Site", url: "https://www.obakusan.or.jp/", type: "Official" }
      ]
    },
    {
      id: "korean-seon-jogye",
      name: "Korean Seon (Jogye & Taego Orders)",
      nativeName: "대한불교 조계종 / 태고종",
      transliteration: "Jogye-jong / Taego-jong",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "East Asia",
      countries: ["South Korea", "Global Diaspora"],
      period: "9th Century CE / Unified 12th Century to Present",
      founders: ["Doui", "Bojo Jinul", "Taego Bou", "Gyeongheo (Modern Revival)"],
      canonicalLanguages: ["Classical Chinese", "Korean"],
      keyTexts: ["Treatise on the Secrets of Cultivating the Mind (Jinul)", "Diamond Sūtra", "Hwadu Anthologies"],
      corePhilosophy: "Sudden Awakening, Gradual Cultivation (Dono Jeomsu): reconciling Seon meditation with Hwaeom scriptural scholasticism. Relies on Ganhwa Seon (Kōan-investigation meditation).",
      practiceType: "Ganhwa Seon (Hwadu Inquiry) & 108 Bows",
      corePractices: [
        "Incessant inquiry into the Hwadu (e.g., 'What is this? / I-mwo-kko')",
        "Three-month intensive summer and winter retreats (Kyolche)",
        "Daily prostrations (108 bows or 3,000 bows) to dismantle pride",
        "Temple Stay cultural immersion programs"
      ],
      soteriologicalGoal: "Complete Awakening and unified mind-nature realization",
      institutionalForm: "Jogye Order (dominant, celibate monasticism headquartered at Jogyesa) and Taego Order (permits married clergy)",
      description: "The primary representative of Korean Buddhism, synthesized by Jinul at Songgwangsa. Revitalized in the late 19th and 20th centuries by Master Gyeongheo and his disciples (Mangong, Hanam) following centuries of Joseon-era Confucian suppression.",
      parentLineage: "early-mahayana",
      relatedLineages: ["chinese-chan-linji", "korean-hwaeom", "japanese-rinzai"],
      links: [
        { title: "Jogye Order Official Portal", url: "http://www.koreanbuddhism.net/", type: "Official" },
        { title: "Korean Seon (Wikipedia)", url: "https://en.wikipedia.org/wiki/Korean_Seon", type: "Overview" },
        { title: "Jinul (Wikipedia)", url: "https://en.wikipedia.org/wiki/Jinul", type: "Overview" }
      ]
    },
    {
      id: "vietnamese-thien",
      name: "Vietnamese Thiền & Trúc Lâm Lineage",
      nativeName: "Thiền Tông / Trúc Lâm Yên Tử",
      transliteration: "Thiền Trúc Lâm",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "East Asia",
      countries: ["Vietnam", "USA", "France", "Global"],
      period: "13th Century to Present",
      founders: ["King Trần Nhân Tông", "Thích Thanh Từ (Modern Trúc Lâm Revival)", "Thích Nhất Hạnh (Plum Village)"],
      canonicalLanguages: ["Classical Chinese", "Vietnamese", "French", "English"],
      keyTexts: ["Cư Trần Lạc Đạo Phú", "Diamond Sūtra", "Platform Sūtra", "The Miracle of Mindfulness"],
      corePhilosophy: "Living the Dharma in the ordinary world (Cư Trần Lạc Đạo). Harmonious synthesis of Chan non-attachment, Pure Land devotions, Daoist simplicity, and modern Engaged mindfulness.",
      practiceType: "Mindful Living, Breath Harmonization & Engaged Dharma",
      corePractices: [
        "Sitting and mindful walking meditation in nature (Yên Tử mountain)",
        "Recitation of Five Mindfulness Trainings (Plum Village)",
        "Dharma sharing circles and deep listening",
        "Socially engaged peace activism and environmental relief"
      ],
      soteriologicalGoal: "Interbeing (Tiếp Hiện) and liberation in the present moment",
      institutionalForm: "Trúc Lâm monastic hermitages; Unified Buddhist Church of Vietnam; Plum Village monasteries",
      description: "Founded on Mount Yên Tử by King Trần Nhân Tông, who abdicated his throne to become a forest hermit after repelling the Mongol invasions. In the modern era, Ven. Thích Nhất Hạnh expanded this into the global Order of Interbeing, popularizing 'Engaged Buddhism'.",
      parentLineage: "early-mahayana",
      relatedLineages: ["chinese-chan-linji", "socially-engaged-buddhism"],
      links: [
        { title: "Plum Village Community of Engaged Buddhism", url: "https://plumvillage.org/", type: "Official" },
        { title: "Truc Lam (Wikipedia)", url: "https://en.wikipedia.org/wiki/Tr%C3%BAc_L%C3%A2m", type: "Overview" },
        { title: "Thich Nhat Hanh (Wikipedia)", url: "https://en.wikipedia.org/wiki/Th%C3%ADch_Nh%E1%BA%A5t_H%E1%BA%A1nh", type: "Overview" }
      ]
    },
    {
      id: "chinese-pure-land",
      name: "Chinese Pure Land (Jìngtǔ Tradition)",
      nativeName: "淨土宗",
      transliteration: "Jìngtǔ Zōng",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "East Asia",
      countries: ["China", "Taiwan", "Singapore", "Malaysia", "Global Diaspora"],
      period: "4th–7th Century CE to Present",
      founders: ["Huiyuan (Mount Lu)", "Tanluan", "Daochuo", "Shandao", "Master Yinguang"],
      canonicalLanguages: ["Classical Chinese"],
      keyTexts: ["Infinite Life Sūtra (Larger Sukhāvatīvyūha)", "Amitābha Sūtra (Shorter)", "Contemplation Sūtra (Guan Wuliangshou Jing)", "Shandao's Commentaries"],
      corePhilosophy: "Rebirth in the Western Paradise (Sukhāvatī) through the Other-Power (Tālì) of Amitābha's 48 vows. Sukhāvatī serves as an unexcelled training ground where awakening is guaranteed without backsliding.",
      practiceType: "Nianfo (Buddha Name Recitation) & Visualization",
      corePractices: [
        "Nianfo: Chanting 'Námó Āmítuófó' aloud, softly, or mentally",
        "Continuous 24-hour Buddha-recitation retreats (Bozhou Samādhi)",
        "Visualization of the 16 contemplations (sun, water, lapis lazuli ground, Amitābha)",
        "Deathbed chanting squads (Zhùniàn) to ensure focused final thoughts"
      ],
      soteriologicalGoal: "Rebirth in Sukhāvatī on a lotus flower in the highest of 9 grades",
      institutionalForm: "Integrated across virtually all Chinese Buddhist temples and dedicated Pure Land recitation societies (Donglin Temple, Lushan)",
      description: "Originating with Huiyuan's White Lotus Society on Mount Lu (402 CE) and codified by Shandao in Chang'an. It represents the most pervasive devotional practice in Chinese Buddhism, widely integrated into Chan monastic liturgies.",
      parentLineage: "early-mahayana",
      relatedLineages: ["japanese-pure-land-jodo", "japanese-jodo-shinshu", "humanistic-buddhism"],
      links: [
        { title: "Pure Land Buddhism (Stanford Encyclopedia of Philosophy)", url: "https://plato.stanford.edu/entries/buddhism-pureland/", type: "Scholarly" },
        { title: "Pure Land Buddhism (Wikipedia)", url: "https://en.wikipedia.org/wiki/Pure_Land_Buddhism", type: "Overview" },
        { title: "Amitabha Sutra (City of Ten Thousand Buddhas)", url: "http://www.cttbusa.org/amitabhaye/amitabha.asp", type: "Texts" }
      ]
    },
    {
      id: "japanese-pure-land-jodo",
      name: "Japanese Jōdo-shū (Hōnen Lineage)",
      nativeName: "浄土宗",
      transliteration: "Jōdo-shū",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "East Asia",
      countries: ["Japan", "USA", "Brazil"],
      period: "1175 to Present",
      founders: ["Hōnen Shōnin (Genkū)"],
      canonicalLanguages: ["Classical Chinese", "Old Japanese"],
      keyTexts: ["Senchaku Hongan Nembutsu Shū (Passages on the Selection of the Nembutsu)", "Three Pure Land Sūtras"],
      corePhilosophy: "The Exclusive Nembutsu (Senju Nembutsu): in the degenerate Latter Day of the Law (Mappō), human beings lack capacity for arduous monastic meditation (Jiriki / Self-power) and must rely solely on Amida's Primal Vow (Tariki / Other-power).",
      practiceType: "Exclusive Nembutsu Recitation (Senju Nembutsu)",
      corePractices: [
        "Continuous, devotional recitation of 'Namu Amida Butsu'",
        "Gongyō daily liturgical services chanting the Jūsan Nembutsu",
        "Deathbed ceremonies holding five-colored cords tied to Amida's hand",
        "Memorial services (Hōji) for departed ancestors"
      ],
      soteriologicalGoal: "Birth in Sukhāvatī (Ōjō)",
      institutionalForm: "Head temple Chion-in in Kyoto; married and celibate temple priesthood",
      description: "Founded by Hōnen after breaking away from the Tendai establishment on Mt. Hiei. Hōnen preached that simple recitation of the Nembutsu, accessible to fishermen, outcasts, and nobles alike, was the single supreme vehicle for salvation in the age of Mappō.",
      parentLineage: "chinese-pure-land",
      relatedLineages: ["japanese-jodo-shinshu", "japanese-ji-shu", "tiantai-tendai"],
      links: [
        { title: "Hōnen (Stanford Encyclopedia of Philosophy)", url: "https://plato.stanford.edu/entries/honen/", type: "Scholarly" },
        { title: "Jōdo-shū Official Site", url: "https://jodo.or.jp/", type: "Official" },
        { title: "Senchakushū Translation (BDK America)", url: "https://www.bdkamerica.org/product/senchakushu/", type: "Texts" }
      ]
    },
    {
      id: "japanese-jodo-shinshu",
      name: "Jōdo Shinshū ('True Pure Land' / Shinran Lineage)",
      nativeName: "浄土真宗",
      transliteration: "Jōdo Shinshū",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "East Asia",
      countries: ["Japan", "USA (BCA)", "Canada", "Brazil", "Europe"],
      period: "1224 to Present",
      founders: ["Shinran Shōnin", "Rennyo Shōnin (Eighth Head Priest / Consolidation)"],
      canonicalLanguages: ["Old Japanese"],
      keyTexts: ["Kyōgyōshinshō", "Tannishō (Notes Lamenting Differences)", "Ofumi (Letters of Rennyo)"],
      corePhilosophy: "Absolute Other-Power (Tariki). Even the faith (Shinjin) to say the Nembutsu is not one's own achievement, but the direct gift of Amida's Primal Vow. Abolished the distinction between monastic and lay: 'Neither monk nor layman' (Hiso Hizoku).",
      practiceType: "Shinjin (Pure Trust) & Nembutsu of Gratitude",
      corePractices: [
        "Saying the Nembutsu as an expression of spontaneous gratitude (Hōon), not a calculation to earn merit",
        "Listening deeply to the Dharma (Monyō)",
        "Daily recitation of the Shōshin Nembutsuge (Hymn of True Faith)",
        "Community fellowship in temple halls (Dōjō / Otera)"
      ],
      soteriologicalGoal: "Immediate attainment of non-retrogression (Shōjōju) in this life, Buddhahood in Sukhāvatī at death",
      institutionalForm: "Hereditary married priesthood headed by the Monshu (descendants of Shinran); Hongwanji-ha (Nishi) and Ōtani-ha (Higashi) in Kyoto; Buddhist Churches of America (BCA)",
      description: "Founded by Hōnen's disciple Shinran, who married Eshinni and openly broke traditional monastic vinaya. Rennyo later organized it into the most popular democratic Buddhist movement in medieval Japan. It remains the largest single Buddhist denomination in contemporary Japan.",
      parentLineage: "japanese-pure-land-jodo",
      relatedLineages: ["japanese-ji-shu"],
      links: [
        { title: "Shinran (Stanford Encyclopedia of Philosophy)", url: "https://plato.stanford.edu/entries/shinran/", type: "Scholarly" },
        { title: "Jodo Shinshu (Wikipedia)", url: "https://en.wikipedia.org/wiki/J%C5%8Ddo_Shinsh%C5%AB", type: "Overview" },
        { title: "Collected Works of Shinran", url: "http://shinranworks.net/", type: "Texts" }
      ]
    },
    {
      id: "japanese-ji-shu",
      name: "Japanese Ji-shū (Ippen Dancing Nembutsu)",
      nativeName: "時宗",
      transliteration: "Ji-shū",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "East Asia",
      countries: ["Japan"],
      period: "1274 to Present",
      founders: ["Ippen Shōnin (Chishin)"],
      canonicalLanguages: ["Old Japanese"],
      keyTexts: ["Ippen Shōnin Goroku", "Ippen Hijiri-e (Illustrated Biography)"],
      corePhilosophy: "The moment of reciting the Nembutsu is absolute: in that single instant (Ji), self and Buddha disappear entirely, leaving only Namu Amida Butsu.",
      practiceType: "Dancing Nembutsu (Odori Nembutsu) & Fuda Talisman Distribution",
      corePractices: [
        "Odori Nembutsu (ecstatic communal chanting and rhythmic dancing with bells and drums)",
        "Itinerant wandering pilgrimage (Yugyō) distributing wooden Nembutsu slips (Fuda)",
        "Abandoning all personal property and dwelling",
        "Regular 6-period daily chanting services"
      ],
      soteriologicalGoal: "Universal salvation guaranteed solely by the presence of Amida's name",
      institutionalForm: "Head temple Yugyō-ji in Fujisawa, Kanagawa; headed by the Yugyō Shōnin (itinerant abbot)",
      description: "Founded by the charismatic wanderer Ippen, who walked thousands of miles across medieval Japan distributing millions of Nembutsu slips to peasants, samurai, and outcasts alike, leading mass ecstatic dancing rituals in town squares.",
      parentLineage: "japanese-pure-land-jodo",
      relatedLineages: ["japanese-jodo-shinshu"],
      links: [
        { title: "Ji-shū (Wikipedia)", url: "https://en.wikipedia.org/wiki/Ji-sh%C5%AB", type: "Overview" },
        { title: "Ippen (Wikipedia)", url: "https://en.wikipedia.org/wiki/Ippen", type: "Overview" },
        { title: "Yugyo-ji Official Site", url: "http://www.jishu.or.jp/", type: "Official" }
      ]
    },
    {
      id: "tiantai-tendai",
      name: "Tiantai / Japanese Tendai (Lotus Sūtra Synthesis)",
      nativeName: "天台宗",
      transliteration: "Tiāntái Zōng / Tendai-shū",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "East Asia",
      countries: ["China", "Japan", "Korea (Cheontae)", "Taiwan"],
      period: "6th Century CE (China) / 806 CE (Japan) to Present",
      founders: ["Zhiyi (The Great Master of Tiantai)", "Saichō (Dengyō Daishi)"],
      canonicalLanguages: ["Classical Chinese", "Japanese"],
      keyTexts: ["Lotus Sūtra (Saddharmapuṇḍarīka)", "Mohe Zhiguan (Great Calming and Contemplation)", "Fahua Xuanyi"],
      corePhilosophy: "The Threefold Truth (Empty, Provisional, Middle) and 'Three Thousand Realms in a Single Thought-Moment' (Yīniàn Sānqiān). Establishes the Lotus Sūtra as the supreme unifying vehicle (Ekayāna).",
      practiceType: "Four Samādhis, Calming & Contemplation (Zhǐguān), Kaihōgyō",
      corePractices: [
        "Four Forms of Samādhi (Constantly Sitting, Constantly Walking, Half-Walking Half-Sitting, Neither)",
        "Mohe Zhiguan analytical introspection",
        "Kaihōgyō (1,000-day circumambulation mountain marathon around Mt. Hiei)",
        "Esoteric Mikkyō mudrā and mantra liturgies (Taimitsu)"
      ],
      soteriologicalGoal: "Universal Buddhahood through realizing the innate purity of all phenomena",
      institutionalForm: "Mount Tiantai (Zhejiang, China) and Mount Hiei (Enryaku-ji, Kyoto, Japan); Bodhisattva-precept clergy",
      description: "Systematized by Zhiyi in China to reconcile conflicting sūtras into a grand hierarchical taxonomy (Panjiao). Saichō brought it to Japan, establishing Enryaku-ji on Mt. Hiei—the historic mother monastery where Hōnen, Shinran, Dōgen, Eisai, and Nichiren originally trained.",
      parentLineage: "early-mahayana",
      relatedLineages: ["nichiren-shoshu-sgi", "japanese-shingon", "japanese-soto"],
      links: [
        { title: "Tiantai (Stanford Encyclopedia of Philosophy)", url: "https://plato.stanford.edu/entries/buddhism-tiantai/", type: "Scholarly" },
        { title: "Tendai-shū Official Portal", url: "http://www.tendai.or.jp/", type: "Official" },
        { title: "Zhiyi (Wikipedia)", url: "https://en.wikipedia.org/wiki/Zhiyi", type: "Overview" }
      ]
    },
    {
      id: "huayan-kegon",
      name: "Huayan / Japanese Kegon (Avataṃsaka Interpenetration)",
      nativeName: "華嚴宗 / 華厳宗",
      transliteration: "Huáyán Zōng / Kegon-shū",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "East Asia",
      countries: ["China", "Japan", "Korea (Hwaeom)"],
      period: "7th Century CE to Present",
      founders: ["Dushun", "Zhiyan", "Fazang", "Chengguan", "Rōben (Japan)"],
      canonicalLanguages: ["Classical Chinese", "Japanese"],
      keyTexts: ["Avataṃsaka Sūtra (Flower Garland Sūtra)", "Treatise on the Golden Lion (Fazang)", "Fajie Guanmen"],
      corePhilosophy: "The Four Dharmadhātus and the Mutual Interpenetration and Non-Obstruction of all Phenomena (Shì-Shì Wú'ài). Reality as a vast, holographic, interconnected cosmic web (Indra's Net).",
      practiceType: "Holographic Contemplation of Indra's Net & Universal Harmony",
      corePractices: [
        "Contemplation of the complete interpenetration of Principle (Li) and Phenomenon (Shi)",
        "Veneration of the Cosmic Buddha Vairocana (Dainichi Nyorai)",
        "Chanting the Chapter on the Conduct and Vows of Samantabhadra",
        "Rituals of the Ten Mysterious Gates (Shixuanmen)"
      ],
      soteriologicalGoal: "Entering the Dharmadhātu and awakening to cosmic intercausality",
      institutionalForm: "Grand temples in Chang'an; Tōdai-ji (The Great Eastern Temple) in Nara, Japan (housing the Daibutsu colossal bronze Buddha)",
      description: "Formulated by Fazang under Empress Wu Zetian in Tang China. Articulates the most sophisticated metaphysical vision in Mahāyāna philosophy, teaching that the entire universe is present inside a single speck of dust without shrinkage or distortion.",
      parentLineage: "early-mahayana",
      relatedLineages: ["korean-seon-jogye", "tiantai-tendai"],
      links: [
        { title: "Huayan (Stanford Encyclopedia of Philosophy)", url: "https://plato.stanford.edu/entries/buddhism-huayan/", type: "Scholarly" },
        { title: "Kegon (Wikipedia)", url: "https://en.wikipedia.org/wiki/Kegon", type: "Overview" },
        { title: "Todai-ji Official Site", url: "http://www.todaiji.or.jp/", type: "Official" }
      ]
    },
    {
      id: "japanese-shingon",
      name: "Japanese Shingon (Kūkai Esoteric Mikkyō)",
      nativeName: "真言宗",
      transliteration: "Shingon-shū",
      vehicle: "Vajrayāna",
      stream: "vajrayana",
      region: "East Asia",
      countries: ["Japan", "USA"],
      period: "806 CE to Present",
      founders: ["Kūkai (Kōbō Daishi)"],
      canonicalLanguages: ["Sanskrit (Siddhaṃ script)", "Classical Chinese", "Japanese"],
      keyTexts: ["Mahāvairocana Sūtra", "Vajraśekhara Sūtra", "Jūjūshinron (Ten Stages of Mind)", "Sokushin Jōbutsugi"],
      corePhilosophy: "Attaining Buddhahood in This Very Body (Sokushin Jōbutsu). Reality is the direct preaching of the Dharmakāya Mahāvairocana, accessible through uniting the Three Mysteries (Sanmitsu): Body (mudrā), Speech (mantra), and Mind (mandala).",
      practiceType: "The Three Mysteries (Sanmitsu), Goma Fire Rituals & Mandalas",
      corePractices: [
        "Contemplation of the Two Realms: Womb Mandala (Taizōkai) & Diamond Mandala (Kongōkai)",
        "Goma sacred fire oblations to consume defilements",
        "Ajikan meditation (visualizing the Sanskrit syllable 'A' upon a moon disc and white lotus)",
        "Recitation of Sanskrit dhāraṇīs and mudrā hand gestures"
      ],
      soteriologicalGoal: "Sokushin Jōbutsu (Becoming a Buddha in this immediate biological lifespan)",
      institutionalForm: "Headquarters on Mount Kōya (Kongōbu-ji) and Tō-ji in Kyoto; Kōgi (Old) and Shingi (New) Shingon sub-sects",
      description: "Brought from Tang China by polymath monk Kūkai. Preserves the early Indian Mantrayāna tradition (Caryā and Yoga tantras) that died out in India and was absorbed in China, featuring extensive esoteric rituals, Sanskrit Siddhaṃ calligraphy, and mountain hermitages on Mt. Kōya.",
      parentLineage: "early-mahayana",
      relatedLineages: ["japanese-shugendo", "tiantai-tendai", "tibetan-nyingma"],
      links: [
        { title: "Kūkai (Stanford Encyclopedia of Philosophy)", url: "https://plato.stanford.edu/entries/kukai/", type: "Scholarly" },
        { title: "Shingon Buddhism (Wikipedia)", url: "https://en.wikipedia.org/wiki/Shingon_Buddhism", type: "Overview" },
        { title: "Koyasan Official Portal", url: "https://www.koyasan.or.jp/", type: "Official" }
      ]
    },
    {
      id: "japanese-shugendo",
      name: "Japanese Shugendō (Yamabushi Mountain Asceticism)",
      nativeName: "修験道",
      transliteration: "Shugendō",
      vehicle: "Vajrayāna",
      stream: "vajrayana",
      region: "East Asia",
      countries: ["Japan"],
      period: "7th–8th Century CE to Present",
      founders: ["En no Gyōja (En no Ozunu)"],
      canonicalLanguages: ["Japanese", "Classical Chinese"],
      keyTexts: ["Fudō Myōō liturgies", "Hannya Shingyō", "Shugendō Secret Manuals"],
      corePhilosophy: "Attaining spiritual power (Gen) through experiential mountain austerities (Shu). Syncretizes esoteric Vajrayāna Buddhism (Mikkyō), indigenous mountain kami veneration (Shinto), and Daoist physical cultivation.",
      practiceType: "Waterfall Purification (Takigyō) & Mountain Austerities",
      corePractices: [
        "Takigyō: Standing under freezing sacred waterfalls chanting mantras",
        "Traversing perilous mountain razor-crests (e.g., Mount Ōmine / Dewa Sanzan)",
        "Hanging over cliffs while confessing moral misdeeds (Nishi-no-nozoki)",
        "Saitō Goma outdoor fire rituals and blowing the conch shell (Horagai)"
      ],
      soteriologicalGoal: "Sokushin Jōbutsu and cosmic alignment with Zaō Gongen / Fudō Myōō",
      institutionalForm: "Yamabushi ascetic brotherhoods affiliated with Honzan-ha (Shōgo-in) and Tōzan-ha (Daigo-ji Sanbō-in)",
      description: "A unique mountain ascetic order whose practitioners (Yamabushi) enter sacred mountain ranges to undergo symbolic death and rebirth. Banned during the Meiji Restoration (1872) for syncretism, it revived post-WWII and continues active pilgrimages today.",
      parentLineage: "japanese-shingon",
      relatedLineages: ["tiantai-tendai"],
      links: [
        { title: "Shugendō (Wikipedia)", url: "https://en.wikipedia.org/wiki/Shugend%C5%8D", type: "Overview" },
        { title: "Yamabushi (Wikipedia)", url: "https://en.wikipedia.org/wiki/Yamabushi", type: "Overview" },
        { title: "Mount Omine Asceticism (Japan Travel)", url: "https://www.japan.travel/en/spot/1004/", type: "Resource" }
      ]
    },
    {
      id: "nichiren-shoshu-sgi",
      name: "Nichiren Traditions & Soka Gakkai (SGI)",
      nativeName: "日蓮宗 / 日蓮正宗 / 創価学会",
      transliteration: "Nichiren-shū / Nichiren Shōshū / Sōka Gakkai",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "East Asia",
      countries: ["Japan", "USA", "Worldwide (192 countries)"],
      period: "1253 CE to Present",
      founders: ["Nichiren Shōnin", "Nikkō Shōnin", "Tsunesaburo Makiguchi", "Josei Toda", "Daisaku Ikeda"],
      canonicalLanguages: ["Classical Japanese", "Vernacular languages"],
      keyTexts: ["Lotus Sūtra (Myōhō Renge Kyō)", "Risshō Ankoku Ron (On Establishing the Correct Teaching)", "Gosho (Writings of Nichiren)"],
      corePhilosophy: "The Lotus Sūtra contains the ultimate, exclusive truth for the Latter Day of the Law (Mappō). Chanting the title activates the innate Buddha-nature (Nam-myoho-renge-kyo) to overcome daily obstacles and transform society ('Human Revolution').",
      practiceType: "Chanting Daimoku & Veneration of the Gohonzon Mandala",
      corePractices: [
        "Chanting Daimoku: 'Namu Myōhō Renge Kyō' facing the Gohonzon",
        "Gongyō: Daily morning and evening recitation of excerpts from the Lotus Sūtra",
        "Shakubuku: Propagation and dialogue to alleviate suffering",
        "Zadankai: Grassroots monthly small-group community discussion meetings"
      ],
      soteriologicalGoal: "Attaining Buddhahood in this lifetime & Kōsen-rufu (World Peace)",
      institutionalForm: "Traditional monastic schools (Nichiren-shū, Nichiren Shōshū at Taiseki-ji) and the global autonomous lay democratic movement (Soka Gakkai International)",
      description: "Founded by Nichiren during Kamakura Japan amid plagues and Mongol invasions. In the 20th century, the Soka Gakkai emerged from educational reform into the largest lay Buddhist movement in the world, emphasizing inner transformation for social justice.",
      parentLineage: "tiantai-tendai",
      relatedLineages: ["humanistic-buddhism", "socially-engaged-buddhism"],
      links: [
        { title: "Soka Gakkai International (SGI)", url: "https://www.sgi.org/", type: "Official" },
        { title: "Nichiren Buddhism (Wikipedia)", url: "https://en.wikipedia.org/wiki/Nichiren_Buddhism", type: "Overview" },
        { title: "Writings of Nichiren Daishonin", url: "https://www.nichirenlibrary.org/", type: "Texts" }
      ]
    },
    {
      id: "humanistic-buddhism",
      name: "Humanistic Buddhism (Rénjiān Fójiào)",
      nativeName: "人間佛教",
      transliteration: "Rénjiān Fójiào",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "East Asia",
      countries: ["Taiwan", "China", "Global Diaspora"],
      period: "Early 20th Century to Present",
      founders: ["Taixu", "Ven. Yin Shun", "Master Hsing Yun (Fo Guang Shan)", "Master Sheng Yen (Dharma Drum)", "Master Cheng Yen (Tzu Chi)"],
      canonicalLanguages: ["Modern Chinese", "English"],
      keyTexts: ["The Way to Buddhahood (Yin Shun)", "Platform Sūtra", "Diamond Sūtra"],
      corePhilosophy: "Reorientation of Buddhism from funerary rites and otherworldly rebirth back into active human society, education, environmental protection, and poverty relief in the present world.",
      practiceType: "Civic Charity, Education, Cultural Dharma & Applied Mindfulness",
      corePractices: [
        "Disaster relief and healthcare provision (Tzu Chi International)",
        "University founding, secular education, and publishing",
        "Chan meditation integrated with modern psychology (Dharma Drum)",
        "Global intercultural exchange and community welfare (Fo Guang Shan)"
      ],
      soteriologicalGoal: "Building a Pure Land on Earth (Rénjiān Jìngtǔ)",
      institutionalForm: "Massive international non-profit monastic-lay federations headquartered in Taiwan with thousands of global branch chapters",
      description: "Initiated by reformer Taixu in republican China and philosophically grounded by scholar-monk Yin Shun. Flourished in Taiwan through Fo Guang Shan, Dharma Drum Mountain, and Buddhist Compassion Relief Tzu Chi, transforming East Asian Buddhist engagement globally.",
      parentLineage: "early-mahayana",
      relatedLineages: ["chinese-chan-linji", "chinese-pure-land", "socially-engaged-buddhism"],
      links: [
        { title: "Fo Guang Shan International", url: "https://www.fgs.org.tw/en/", type: "Official" },
        { title: "Tzu Chi Global", url: "https://www.tzuchi.org.tw/en/", type: "Official" },
        { title: "Dharma Drum Mountain", url: "https://www.dharmadrum.org/", type: "Official" }
      ]
    },

    // ==========================================
    // NORTHERN STREAM: VAJRAYĀNA (TIBETAN & HIMALAYAN)
    // ==========================================
    {
      id: "tibetan-nyingma",
      name: "Nyingma ('The Ancient School' & Dzogchen)",
      nativeName: "རྙིང་མ།",
      transliteration: "rNying-ma",
      vehicle: "Vajrayāna",
      stream: "vajrayana",
      region: "Himalayas & Central Asia",
      countries: ["Tibet", "Bhutan", "Nepal", "India", "Global"],
      period: "8th Century CE to Present",
      founders: ["Padmasambhava (Guru Rinpoche)", "Śāntarakṣita", "Vimalamitra", "Longchenpa", "Jigme Lingpa"],
      canonicalLanguages: ["Classical Tibetan", "Sanskrit"],
      keyTexts: ["Seven Treasuries of Longchenpa", "Longchen Nyingthig", "Guhyagarbha Tantra", "Bardo Thodol (Tibetan Book of the Dead)"],
      corePhilosophy: "The Nine Yānas culminating in Atiyoga / Dzogchen (The Great Perfection). Mind's fundamental nature is Primordial Purity (Ka dag) and Spontaneous Presence (Lhun grub), unconditioned and pristinely awake (Rigpa).",
      practiceType: "Dzogchen (Trekchö & Tögal) & Terma Treasure Revelations",
      corePractices: [
        "Trekchö ('Cutting Through' discursive thoughts into naked Rigpa)",
        "Tögal ('Direct Crossing' visionary integration of spontaneous luminous display)",
        "Terma: Discovering hidden mind-treasures by Tertöns",
        "Ngöndro (500,000 preliminary prostrations, vajrasattva mantras, mandala offerings, guru yoga)"
      ],
      soteriologicalGoal: "Rainbow Body ('Ja' lus) / Complete Buddhahood in one lifetime",
      institutionalForm: "Six Mother Monasteries (Mindrolling, Dorje Drak, Kathok, Palyul, Dzogchen, Shechen); red-hat monastics & white-robed yogic householders (Ngakpas)",
      description: "The oldest school of Tibetan Buddhism, preserving the initial imperial translation transmission. Renowned for its Terma (revealed treasure) tradition and the non-gradual contemplation of Dzogchen.",
      parentLineage: "early-mahayana",
      relatedLineages: ["tibetan-kagyu", "tibetan-bon", "tibetan-jonang"],
      links: [
        { title: "Nyingma (Wikipedia)", url: "https://en.wikipedia.org/wiki/Nyingma", type: "Overview" },
        { title: "Dzogchen (Wikipedia)", url: "https://en.wikipedia.org/wiki/Dzogchen", type: "Overview" },
        { title: "84000 Translating the Words of the Buddha", url: "https://84000.co/", type: "Texts" }
      ]
    },
    {
      id: "tibetan-kagyu",
      name: "Kagyu ('The Oral Lineage' & Mahāmudrā)",
      nativeName: "བཀའ་བརྒྱུད།",
      transliteration: "bKa'-brgyud",
      vehicle: "Vajrayāna",
      stream: "vajrayana",
      region: "Himalayas & Central Asia",
      countries: ["Tibet", "Bhutan (State Religion)", "Nepal", "India", "Global"],
      period: "11th Century CE to Present",
      founders: ["Tilopa", "Naropa", "Marpa Lotsawa", "Milarepa", "Gampopa", "The 1st Karmapa (Dusum Khyenpa)"],
      canonicalLanguages: ["Classical Tibetan"],
      keyTexts: ["The Hundred Thousand Songs of Milarepa", "Jewel Ornament of Liberation (Gampopa)", "Hevajra & Cakrasaṃvara Tantras", "Mahāmudrā Ocean of Definitive Meaning"],
      corePhilosophy: "Mahāmudrā (The Great Seal): directly realizing the innate, unconditioned nature of mind (Sahaja) as indivisible Luminosity and Emptiness. Devotion to the Guru as the direct catalyst for realization.",
      practiceType: "Mahāmudrā & The Six Yogas of Naropa",
      corePractices: [
        "Mahāmudrā 4 Stages: One-pointedness, Simplicity, One Taste, Non-meditation",
        "Tummo (Inner psychic heat yoga melting white and red drops)",
        "Dream Yoga (Milam) and Clear Light (Ösel) dreamless awareness",
        "Phowa (Consciousness transference at death) & Bardo guidance"
      ],
      soteriologicalGoal: "Mahāmudrā Siddhi & Complete Buddhahood",
      institutionalForm: "Karma Kagyu (headed by the Gyalwang Karmapa; Tsurphu & Rumtek monasteries); Drukpa Kagyu (state religion of Bhutan); Drikung, Taklung branches; Tulku recognition system",
      description: "Traced from the Indian Mahāsiddhas to Tibetan mountain hermit Milarepa and monastic organizer Gampopa. The Karma Kagyu lineage instituted the first reincarnate lama (Tulku) recognition system in Tibet.",
      parentLineage: "early-mahayana",
      relatedLineages: ["tibetan-nyingma", "tibetan-sakya"],
      links: [
        { title: "Kagyu (Wikipedia)", url: "https://en.wikipedia.org/wiki/Kagyu", type: "Overview" },
        { title: "Mahamudra (Wikipedia)", url: "https://en.wikipedia.org/wiki/Mahamudra", type: "Overview" },
        { title: "Six Dharmas of Naropa (Wikipedia)", url: "https://en.wikipedia.org/wiki/Six_Dharmas_of_Naropa", type: "Overview" }
      ]
    },
    {
      id: "tibetan-sakya",
      name: "Sakya ('The Pale Earth' & Lamdré Lineage)",
      nativeName: "ས་སྐྱ།",
      transliteration: "Sa-skya",
      vehicle: "Vajrayāna",
      stream: "vajrayana",
      region: "Himalayas & Central Asia",
      countries: ["Tibet", "Nepal", "India", "Global"],
      period: "1073 CE to Present",
      founders: ["Khön Khönchok Gyalpo", "Five Venerable Masters (Sachen Kunga Nyingpo, Sakya Paṇḍita, Drogön Chögyal Phagpa)"],
      canonicalLanguages: ["Classical Tibetan", "Sanskrit"],
      keyTexts: ["Hevajra Tantra", "Lamdré (Path and Its Fruit) treatises", "Clarifying the Sage's Intent (Sakya Paṇḍita)", "Treasury of Valid Cognition (Tshad ma rigs gter)"],
      corePhilosophy: "Lamdré (The Path and Its Fruit): non-differentiation of Saṃsāra and Nirvāṇa ('Khor 'das dbyer med). The mind in its natural state is the indivisible union of luminosity and emptiness.",
      practiceType: "Lamdré Hevajra System & Rigorous Scholastic Epistemology",
      corePractices: [
        "Hevajra and Vajrayoginī Generation and Completion stages",
        "The Three Appearances and Three Continuums contemplation",
        "Pramāṇa formal logical debate and textual exegesis",
        "Vajrakīlaya obstacle-clearing rituals"
      ],
      soteriologicalGoal: "Buddhahood achieved through the union of clarity and voidness",
      institutionalForm: "Hereditary leadership passed within the noble Khön lineage (alternating between the Drolma and Phuntsok Palaces headed by the Sakya Trizin); Sakya Monastery",
      description: "Established by the Khön family in southern Tibet. Sakya scholars, particularly Sakya Paṇḍita, established premier standards of Tibetan epistemology and logic, and served as imperial preceptors to the Mongol Yuan dynasty court.",
      parentLineage: "early-mahayana",
      relatedLineages: ["tibetan-gelug", "tibetan-kagyu"],
      links: [
        { title: "Sakya (Wikipedia)", url: "https://en.wikipedia.org/wiki/Sakya", type: "Overview" },
        { title: "H.H. The Sakya Trichen Official Site", url: "https://www.sakyatrizen.org/", type: "Official" },
        { title: "Lamdre (Wikipedia)", url: "https://en.wikipedia.org/wiki/Lamdre", type: "Overview" }
      ]
    },
    {
      id: "tibetan-gelug",
      name: "Gelug ('The Virtuous Tradition' & Lamrim)",
      nativeName: "དགེ་ལུགས།",
      transliteration: "dGe-lugs",
      vehicle: "Vajrayāna",
      stream: "vajrayana",
      region: "Himalayas & Central Asia",
      countries: ["Tibet", "Mongolia", "Buryatia", "Kalmykia", "Tuva", "Ladakh", "India", "Global"],
      period: "1409 CE to Present",
      founders: ["Je Tsongkhapa (Losang Drakpa)", "Gyeltsap Je", "Khedrup Je", "The 1st Dalai Lama (Gendun Drup)"],
      canonicalLanguages: ["Classical Tibetan"],
      keyTexts: ["Lamrim Chenmo (Great Treatise on the Stages of the Path)", "Ngagrim Chenmo", "Guhyasamāja, Cakrasaṃvara, & Yamāntaka Tantras"],
      corePhilosophy: "Prāsaṅgika Madhyamaka: radical reductionism where all phenomena are merely conceptually imputed (rtog pas btags tsam). Synthesizes strict Vinaya monasticism with gradual Sūtra stages (Lamrim) and Anuttarayoga Tantra.",
      practiceType: "Lamrim Graduated Path, Formal Debate & Tantric Synthesis",
      corePractices: [
        "Lamrim analytical contemplation of the Three Scopes of practitioner",
        "Formal courtyard dialectical debate (Tsodpa) with clapping gestures",
        "Yamāntaka, Guhyasamāja, and Kālacakra Tantric deity sadhanas",
        "Guru Puja (Lama Chopa) and protective deity propitiations"
      ],
      soteriologicalGoal: "Complete Enlightenment through the union of Calm Abiding and Special Insight",
      institutionalForm: "Massive monastic universities (Ganden, Sera, Drepung, Tashilhunpo); Geshe / Geshema academic degree; leadership by the Ganden Tripa, Dalai Lama, and Panchen Lama",
      description: "Founded by Je Tsongkhapa as a reform movement revitalizing monastic discipline and systematic scholarship. In the 17th century, under the 5th Dalai Lama, the Gelug school established the Ganden Phodrang government, becoming the dominant political and spiritual authority in Tibet and Mongolia.",
      parentLineage: "early-mahayana",
      relatedLineages: ["tibetan-sakya", "tibetan-jonang", "mongolian-buddhism"],
      links: [
        { title: "His Holiness the Dalai Lama Official Site", url: "https://www.dalailama.com/", type: "Official" },
        { title: "Gelug (Wikipedia)", url: "https://en.wikipedia.org/wiki/Gelug", type: "Overview" },
        { title: "Tsongkhapa (Stanford Encyclopedia of Philosophy)", url: "https://plato.stanford.edu/entries/tsongkhapa/", type: "Scholarly" }
      ]
    },
    {
      id: "tibetan-jonang",
      name: "Jonang (Shentong & Kālacakra Tradition)",
      nativeName: "ཇོ་ནང་།",
      transliteration: "Jo-nang",
      vehicle: "Vajrayāna",
      stream: "vajrayana",
      region: "Himalayas & Central Asia",
      countries: ["Tibet (Amdo / Golok)", "India", "USA"],
      period: "13th Century CE to Present",
      founders: ["Kunkhyen Dolpopa Sherab Gyaltsen", "Jetsun Tāranātha"],
      canonicalLanguages: ["Classical Tibetan"],
      keyTexts: ["Mountain Doctrine (Ri chos nges don rgya mtsho)", "Kālacakra Tantra & Vimalaprabhā Commentary", "Tāranātha's History of Buddhism in India"],
      corePhilosophy: "Shentong ('Other-Emptiness'): ultimate reality (the Buddha-nature / Dharmadhātu) is not empty of its own radiant, eternal enlightened qualities; it is empty only of extrinsic, defiled conditioned phenomena.",
      practiceType: "Kālacakra Six-Branch Completion Stage & Shentong View",
      corePractices: [
        "Kālacakra Six Yogas (Soruk): Withdrawal, Concentration, Breath Control, Retention, Recollection, Samādhi",
        "Dark retreat contemplation of empty-form visions (Śūnyabimba)",
        "Dro Kālacakra lineage transmission",
        "Shentong dialectical philosophy"
      ],
      soteriologicalGoal: "Attainment of the Rainbow Body and the Realm of Shambhala",
      institutionalForm: "Over 70 active monasteries preserved in Amdo (Main monastery: Tsangwa in Dzamthang); Mainkalika recognized lineage",
      description: "Suppressed and sealed in central Tibet in the 17th century by the 5th Dalai Lama due to doctrinal conflicts and political alliances. The tradition survived intact in the remote eastern Amdo/Golok mountains and was formally re-recognized by the 14th Dalai Lama in 2001.",
      parentLineage: "early-mahayana",
      relatedLineages: ["tibetan-nyingma", "tibetan-gelug"],
      links: [
        { title: "Jonang (Wikipedia)", url: "https://en.wikipedia.org/wiki/Jonang", type: "Overview" },
        { title: "Jonang Foundation", url: "http://www.jonangfoundation.org/", type: "Official" },
        { title: "Dolpopa (Stanford Encyclopedia of Philosophy)", url: "https://plato.stanford.edu/entries/dolpopa/", type: "Scholarly" }
      ]
    },
    {
      id: "tibetan-bon",
      name: "Yungdrung Bon (Indigenous Himalayan Tradition)",
      nativeName: "གཡུང་དྲུང་བོན།",
      transliteration: "gYung-drung Bon",
      vehicle: "Vajrayāna",
      stream: "vajrayana",
      region: "Himalayas & Central Asia",
      countries: ["Tibet", "Nepal", "India", "Global"],
      period: "Pre-historic / Parallel codification 11th Century to Present",
      founders: ["Tonpa Shenrab Miwoche", "Nyame Sherab Gyaltsen"],
      canonicalLanguages: ["Zhangzhung", "Classical Tibetan"],
      keyTexts: ["Bon Kangyur & Tengyur", "Zhangzhung Nyengyud (Oral Transmission of Zhangzhung)", "Gal Mdo"],
      corePhilosophy: "The Nine Ways of Bon culminating in Dzogchen. Mind is the Primordial Base (Gzhi), awake and unconditioned. Shares extensive ritual, cosmological, and monastic forms with Tibetan Buddhism while maintaining distinct mythic lineage.",
      practiceType: "Bonpo Dzogchen, Tsa Lung Trul Khor & Counter-Clockwise Rites",
      corePractices: [
        "Zhangzhung Nyengyud Dzogchen contemplation",
        "Tsa Lung Trul Khor (sacred energetic yogic body movements)",
        "Counter-clockwise circumambulation (Kora) around holy peaks (Mt. Kailash)",
        "Divination, soul-retrieval (La-guk), and environmental spirit propitiation"
      ],
      soteriologicalGoal: "Attaining the Body of Light (Rainbow Body)",
      institutionalForm: "Menri Monastery (headquarters in Dolanji, India) headed by the Menri Trizin; Triten Norbutse in Nepal",
      description: "The native pre-Buddhist religious tradition of Tibet, tracing its origins to the ancient empire of Zhangzhung. Over centuries of mutual interaction, Bon developed an institutional architecture, monastic Vinaya, and Dzogchen system mirroring Tibetan Buddhism.",
      parentLineage: "tibetan-nyingma",
      relatedLineages: ["tibetan-nyingma", "tibetan-kagyu"],
      links: [
        { title: "Bon (Wikipedia)", url: "https://en.wikipedia.org/wiki/Bon", type: "Overview" },
        { title: "Yungdrung Bon Monastic Center", url: "https://yungdrungbon.org/", type: "Official" },
        { title: "Tenzin Wangyal Rinpoche (Ligmincha International)", url: "https://ligmincha.org/", type: "Resource" }
      ]
    },
    {
      id: "newar-buddhism",
      name: "Newar Buddhism (Kathmandu Sanskrit Tantra)",
      nativeName: "नेवार बौद्ध धर्म",
      transliteration: "Nevār Bauddha Dharma",
      vehicle: "Vajrayāna",
      stream: "vajrayana",
      region: "South Asia",
      countries: ["Nepal (Kathmandu Valley)"],
      period: "1st Millennium CE to Present",
      founders: ["Ancient Indian Mahāsiddha Lineages", "Hereditary Vajrācārya Priesthood"],
      canonicalLanguages: ["Sanskrit", "Nepal Bhasa (Newari)"],
      keyTexts: ["The Nine Dharma Texts (Navagrantha, including Prajñāpāramitā, Saddharmapuṇḍarīka, Lalitavistara, Kāraṇḍavyūha, Daśabhūmika)"],
      corePhilosophy: "The only surviving direct unbroken transmission of North Indian Sanskrit Tantric Mahāyāna. Non-monastic: integrates esoteric Vajrayāna ritualism with a hereditary urban caste structure.",
      practiceType: "Sanskrit Chanting (Caryāgīti), Secret Tantric Pūjās & Mandalas",
      corePractices: [
        "Caryānṛtya / Charya Nritya (sacred Tantric masked ritual dance)",
        "Daily Sanskrit sūtra and dhāraṇī chanting (Caryāgīti)",
        "Elaborate powder and metal mandala consecrations in secret shrines (Agam)",
        "Guñlā month dawn musical processions to Swayambhunāth Stupa"
      ],
      soteriologicalGoal: "Tantric realization through the transformation of the psycho-physical organism",
      institutionalForm: "Courtyard monastic compounds (Bāhā and Bahī) managed by hereditary married castes: Vajrācārya (priests) and Śākya (temple custodians)",
      description: "Preserved in the Kathmandu Valley across two millennia. It is unique for retaining the original Sanskrit manuscripts of Mahāyāna and Tantric Buddhism without converting them into Tibetan or Chinese, organized around hereditary caste lineages.",
      parentLineage: "early-mahayana",
      relatedLineages: ["early-mahayana", "tibetan-sakya"],
      links: [
        { title: "Newar Buddhism (Wikipedia)", url: "https://en.wikipedia.org/wiki/Newar_Buddhism", type: "Overview" },
        { title: "Dance of the Mahasiddhas: Charya Nritya", url: "https://en.wikipedia.org/wiki/Charya_Nritya", type: "Overview" },
        { title: "Himalayan Art Resources - Newar Art & Ritual", url: "https://www.himalayanart.org/", type: "Resource" }
      ]
    },
    {
      id: "mongolian-buddhism",
      name: "Mongolian & Russian Gelug Buddhism",
      nativeName: "Монголын Буддын шашин",
      transliteration: "Mongolyn Buddyn Shashin",
      vehicle: "Vajrayāna",
      stream: "vajrayana",
      region: "Himalayas & Central Asia",
      countries: ["Mongolia", "Russia (Buryatia, Kalmykia, Tuva)"],
      period: "16th Century CE to Present",
      founders: ["Altan Khan", "The 3rd Dalai Lama (Sonam Gyatso)", "Zanabazar (1st Bogd Gegeen)", "Agvan Dorjiev"],
      canonicalLanguages: ["Classical Mongolian", "Classical Tibetan", "Russian"],
      keyTexts: ["Mongolian Kangyur & Tengyur", "Lamrim Chenmo", "Jebtsundamba Ritual Treatises"],
      corePhilosophy: "Classical Tibetan Gelug scholasticism and Tantra integrated with nomadic pastoral customs, Ovoo shrine veneration, and Mongolian religious art.",
      practiceType: "Monastic Scholasticism, Tsam Mask Dances & Mongolian Medicine",
      corePractices: [
        "Tsam: Elaborate masked sacred Buddhist mystery dances",
        "Traditional Mongolian-Tibetan pulse diagnosis and herbal medicine",
        "Dialectical monastic debate in Tibetan and Mongolian",
        "Ovoo cairn circumambulations for territorial blessings"
      ],
      soteriologicalGoal: "Enlightenment via Lamrim stages and Tantric deity realization",
      institutionalForm: "Historic monasteries (Gandantegchinlen in Ulaanbaatar, Erdene Zuu, Ivolginsky Datsan in Buryatia, Golden Temple in Elista); headed by the Bogd Gegeen (Jebtsundamba Khutuktu) and Khambo Lamas",
      description: "Adopted as state religion under Altan Khan in 1578. Despite severe 20th-century communist purges in Mongolia and the USSR, it underwent a dramatic post-1990 revival, rebuilding hundreds of monasteries across the steppe.",
      parentLineage: "tibetan-gelug",
      relatedLineages: ["tibetan-gelug"],
      links: [
        { title: "Buddhism in Mongolia (Wikipedia)", url: "https://en.wikipedia.org/wiki/Buddhism_in_Mongolia", type: "Overview" },
        { title: "Buddhism in Kalmykia (Wikipedia)", url: "https://en.wikipedia.org/wiki/Buddhism_in_Kalmykia", type: "Overview" },
        { title: "Gandantegchinlen Monastery", url: "https://www.gandan.mn/", type: "Official" }
      ]
    },

    // ==========================================
    // MODERNIST, ENGAGED & EMANCIPATORY STREAMS
    // ==========================================
    {
      id: "buddhist-modernism",
      name: "Buddhist Modernism ('Protestant Buddhism')",
      nativeName: "බෞද්ධ පුනরুදය",
      transliteration: "Bauddha Punarudaya",
      vehicle: "Modernist / Engaged",
      stream: "modernist",
      region: "Global / Modern",
      countries: ["Sri Lanka", "Japan", "USA", "Europe", "India"],
      period: "Late 19th – 20th Century CE",
      founders: ["Anagarika Dharmapala", "Colonel Henry Steel Olcott", "D. T. Suzuki", "Paul Carus"],
      canonicalLanguages: ["English", "Sinhala", "Japanese"],
      keyTexts: ["The Buddhist Catechism (Olcott)", "The Gospel of Buddha (Carus)", "Essays in Zen Buddhism (D.T. Suzuki)"],
      corePhilosophy: "Reinterprets Buddhism as a rational, psychological, empirical philosophy fully compatible with modern science, evolution, and humanism. De-emphasizes mythology, hells, rituals, and scholastic scholasticism in favor of universal ethics and direct meditation.",
      practiceType: "Democratized Lay Meditation & Rationalist Study",
      corePractices: [
        "Sunday Buddhist schools (Dhamma schools)",
        "Lay study of canonical suttas in vernacular translations",
        "Public lecturing and global missionary outreach",
        "Reframing meditation as psychological self-cultivation"
      ],
      soteriologicalGoal: "Rational moral flourishing, cultural revival, and psychological awakening",
      institutionalForm: "Maha Bodhi Society, Theosophical Buddhist schools, urban lay associations",
      description: "Formed in Sri Lanka, Japan, and the West in response to Christian colonial hegemony and scientific rationalism. It produced the modern global image of Buddhism as a non-dogmatic 'science of the mind'.",
      parentLineage: "classical-theravada",
      relatedLineages: ["secular-buddhism", "burmese-vipassana-mahasi", "western-zen"],
      links: [
        { title: "Buddhist Modernism (Wikipedia)", url: "https://en.wikipedia.org/wiki/Buddhist_modernism", type: "Overview" },
        { title: "Anagarika Dharmapala (Wikipedia)", url: "https://en.wikipedia.org/wiki/Anagarika_Dharmapala", type: "Overview" },
        { title: "The Making of Buddhist Modernism (Oxford Scholarship)", url: "https://academic.oup.com/book/7504", type: "Scholarly" }
      ]
    },
    {
      id: "secular-buddhism",
      name: "Secular Buddhism & Clinical Mindfulness",
      nativeName: "Secular Dharma / MBSR",
      transliteration: "Secular Buddhism / MBSR",
      vehicle: "Modernist / Engaged",
      stream: "modernist",
      region: "Global / Modern",
      countries: ["USA", "UK", "Europe", "Australia", "Global"],
      period: "1979 to Present",
      founders: ["Stephen Batchelor", "Jon Kabat-Zinn", "Mark Williams", "John Teasdale"],
      canonicalLanguages: ["English", "European Vernaculars"],
      keyTexts: ["Buddhism Without Beliefs (Batchelor)", "Full Catastrophe Living (Kabat-Zinn)", "Mindfulness-Based Cognitive Therapy for Depression"],
      corePhilosophy: "Naturalism and agnosticism: sets aside metaphysical claims (reincarnation, karma, realms, cosmic beings) as ancient cultural baggage. Focuses on the Four Noble Truths as practical tasks for everyday human flourishing.",
      practiceType: "Standardized Clinical Mindfulness (MBSR/MBCT) & Naturalized Sati",
      corePractices: [
        "8-Week MBSR protocol (body scan, sitting breath meditation, gentle hatha yoga)",
        "MBCT cognitive decentering from depressive rumination loops",
        "Everyday mindful presence without religious vows or devotional liturgy",
        "Existential inquiry into contingency and mortality"
      ],
      soteriologicalGoal: "Psychological resilience, reduction of anxiety/stress, pragmatic awakening",
      institutionalForm: "Clinical therapy practices, medical centers, secular retreat centers (Bodhi College, Barre Center for Buddhist Studies), smartphone meditation apps",
      description: "Pioneered by Jon Kabat-Zinn at UMass Medical School (extracting satipaṭṭhāna into clinical medicine) and formalized philosophically by former monk Stephen Batchelor. It represents the fastest-growing form of contemplative practice in the Western world.",
      parentLineage: "buddhist-modernism",
      relatedLineages: ["western-insight", "socially-engaged-buddhism"],
      links: [
        { title: "Secular Buddhism (Wikipedia)", url: "https://en.wikipedia.org/wiki/Secular_Buddhism", type: "Overview" },
        { title: "Stephen Batchelor Official Site", url: "https://www.stephenbatchelor.org/", type: "Official" },
        { title: "Mindfulness-Based Stress Reduction (Wikipedia)", url: "https://en.wikipedia.org/wiki/Mindfulness-based_stress_reduction", type: "Overview" }
      ]
    },
    {
      id: "navayana-ambedkarite",
      name: "Navayāna ('New Vehicle' / Dalit Buddhist Movement)",
      nativeName: "नवयान / दलित बौद्ध आंदोलन",
      transliteration: "Navayāna",
      vehicle: "Modernist / Engaged",
      stream: "modernist",
      region: "South Asia",
      countries: ["India (Maharashtra, Uttar Pradesh, Tamil Nadu)"],
      period: "1956 to Present",
      founders: ["Dr. Bhimrao Ramji Ambedkar (Babasaheb)"],
      canonicalLanguages: ["Marathi", "Hindi", "English", "Pāḷi"],
      keyTexts: ["The Buddha and His Dhamma (Ambedkar)", "The 22 Vows (Nagpur 1956)"],
      corePhilosophy: "Reinterprets suffering (Duḥkha) not as metaphysical ignorance, but as institutional, political, and caste-based social oppression. Buddhism as a radical gospel of liberty, equality, fraternity, and anti-caste human emancipation.",
      practiceType: "22 Anti-Caste Vows, Social Uplift & Democratic Morality",
      corePractices: [
        "Administering the 22 Vows explicitly rejecting Hindu caste hierarchy, deities, and rituals",
        "Community education, legal literacy, and civic organizing",
        "Public celebration of Dhammachakra Pravartan Din (Nagpur Deekshabhoomi)",
        "Daily chanting of the Triśaraṇa and Pañcaśīla in Pāli and Marathi"
      ],
      soteriologicalGoal: "Annihilation of caste oppression, human dignity, and social liberation",
      institutionalForm: "Massive community-led lay movement comprising millions of Dalit converts; Trailokya Bauddha Mahasangha Sahayaka Gana (TBMSG / Triratna affiliate)",
      description: "Founded on October 14, 1956, when Dr. B. R. Ambedkar led ~500,000 Dalits ('Untouchables') in a historic mass conversion at Nagpur. It resurrected Buddhism in its Indian homeland as a powerful egalitarian social revolution.",
      parentLineage: "early-buddhism",
      relatedLineages: ["socially-engaged-buddhism"],
      links: [
        { title: "Dalit Buddhist Movement (Wikipedia)", url: "https://en.wikipedia.org/wiki/Dalit_Buddhist_movement", type: "Overview" },
        { title: "Navayana (Wikipedia)", url: "https://en.wikipedia.org/wiki/Navayana", type: "Overview" },
        { title: "The Buddha and His Dhamma (Columbia University Archive)", url: "http://www.columbia.edu/itc/mealac/pritchett/00ambedkar/ambedkar_buddha/", type: "Texts" }
      ]
    },
    {
      id: "socially-engaged-buddhism",
      name: "Socially Engaged Buddhism (INEB & Sarvodaya)",
      nativeName: "สมาคมพุทธศาสนิกสัมพันธ์เพื่อสังคม",
      transliteration: "INEB / Sarvodaya",
      vehicle: "Modernist / Engaged",
      stream: "modernist",
      region: "Global / Modern",
      countries: ["Thailand", "Sri Lanka", "Vietnam", "India", "USA", "Global"],
      period: "1960s to Present",
      founders: ["Sulak Sivaraksa", "A. T. Ariyaratne", "Thích Nhất Hạnh", "The 14th Dalai Lama", "Bhikkhu Bodhi"],
      canonicalLanguages: ["English", "Thai", "Sinhala", "Vietnamese"],
      keyTexts: ["Seeds of Peace (Sulak Sivaraksa)", "Love in Action (Thich Nhat Hanh)", "Buddhist Global Relief Newsletters"],
      corePhilosophy: "Structural Duḥkha: recognizing that suffering is produced not only in individual minds but through institutional greed (consumer capitalism), hatred (militarism/war), and delusion (propaganda/racism). Applying non-violence (Ahiṃsā) to systemic justice.",
      practiceType: "Non-Violent Activism, Village Self-Reliance & Eco-Dharma",
      corePractices: [
        "Sarvodaya Shramadana: 'Sharing of labor' village self-reliance work camps in Sri Lanka",
        "Ecological tree-ordination rituals ('Monk Trees') by Thai forest activists to stop logging",
        "Buddhist Global Relief campaigns funding international food security and girls' education",
        "Interfaith peace advocacy, prison mindfulness outreach, and climate protests"
      ],
      soteriologicalGoal: "Collective liberation from structural violence and ecological destruction",
      institutionalForm: "International Network of Engaged Buddhists (INEB), Sarvodaya Shramadana Movement, Buddhist Peace Fellowship (BPF), Buddhist Global Relief (BGR)",
      description: "A worldwide network applying contemplative values directly to structural injustice, war, environmental collapse, and poverty. Emphasizes that personal inner peace and external social transformation are mutually interdependent.",
      parentLineage: "vietnamese-thien",
      relatedLineages: ["humanistic-buddhism", "navayana-ambedkarite", "secular-buddhism"],
      links: [
        { title: "International Network of Engaged Buddhists (INEB)", url: "https://www.inebnetwork.org/", type: "Official" },
        { title: "Engaged Buddhism (Wikipedia)", url: "https://en.wikipedia.org/wiki/Engaged_Buddhism", type: "Overview" },
        { title: "Sarvodaya Shramadana Movement", url: "https://www.sarvodaya.org/", type: "Official" }
      ]
    },
    {
      id: "western-insight",
      name: "Western Insight Meditation (IMS & Spirit Rock)",
      nativeName: "Insight Meditation Society",
      transliteration: "Western Vipassanā",
      vehicle: "Modernist / Engaged",
      stream: "modernist",
      region: "Global / Modern",
      countries: ["USA", "UK", "Europe", "Australia"],
      period: "1975 to Present",
      founders: ["Joseph Goldstein", "Sharon Salzberg", "Jack Kornfield", "Ruth Denison"],
      canonicalLanguages: ["English"],
      keyTexts: ["Seeking the Heart of Wisdom (Goldstein & Kornfield)", "Lovingkindness (Salzberg)", "A Path with Heart (Kornfield)"],
      corePhilosophy: "Synthesizes Burmese Mahasi Vipassanā noting, Thai Forest natural awareness (Ajahn Chah), and Western depth psychology into an accessible, non-monastic lay contemplative path.",
      practiceType: "Silent Vipassanā Retreats & Heart Practices (Mettā)",
      corePractices: [
        "Silent residential retreats alternating sitting and walking meditation",
        "Systematic Loving-Kindness (Mettā) and Compassion (Karuṇā) cultivation",
        "Integration of somatic awareness and psychological shadow work",
        "Community Dharma Leader (CDL) lay mentoring programs"
      ],
      soteriologicalGoal: "Awakening of wisdom and compassion in contemporary lay life",
      institutionalForm: "Insight Meditation Society (IMS, Barre MA), Spirit Rock Meditation Center (Woodacre CA), Gaia House (UK)",
      description: "Founded in the mid-1970s by young American seekers returning from monastic training in Burma, Thailand, and India. Created a thriving, democratic lay culture that birthed the mainstream mindfulness movement.",
      parentLineage: "burmese-vipassana-mahasi",
      relatedLineages: ["thai-forest", "secular-buddhism"],
      links: [
        { title: "Insight Meditation Society (IMS)", url: "https://www.dharma.org/", type: "Official" },
        { title: "Spirit Rock Meditation Center", url: "https://www.spiritrock.org/", type: "Official" },
        { title: "Insight Meditation (Wikipedia)", url: "https://en.wikipedia.org/wiki/Vipassana_movement", type: "Overview" }
      ]
    },
    {
      id: "western-zen",
      name: "Western Zen Lineages (San Francisco Zen Center & White Plum)",
      nativeName: "Western Zen Communities",
      transliteration: "Western Zen",
      vehicle: "Mahāyāna",
      stream: "mahayana",
      region: "Global / Modern",
      countries: ["USA", "Europe", "Latin America", "Australia"],
      period: "1950s to Present",
      founders: ["Shunryu Suzuki", "Taizan Maezumi", "Robert Aitken", "Philip Kapleau"],
      canonicalLanguages: ["English", "Japanese"],
      keyTexts: ["Zen Mind, Beginner's Mind (Shunryu Suzuki)", "The Three Pillars of Zen (Philip Kapleau)", "Taking the Path of Zen (Robert Aitken)"],
      corePhilosophy: "Integration of Sōtō Shikantaza, Rinzai kōan practice (via Sanbo Kyodan), feminist egalitarian leadership, and psychoanalytic awareness in an egalitarian lay and ordained community.",
      practiceType: "Zazen, Sesshin Retreats & Everyday Work Mind",
      corePractices: [
        "Daily Zazen and Kinhin walking meditation",
        "Intensive 7-day silent Sesshin retreats with Dokusan interviews",
        "Jukai lay precept taking and sewing the Rakusu robe",
        "Eco-Dharma, socially engaged hospice care, and organic farming (Green Gulch Farm)"
      ],
      soteriologicalGoal: "Actualizing 'Beginner's Mind' and non-dual wisdom in lay vocations",
      institutionalForm: "San Francisco Zen Center (City Center, Green Gulch, Tassajara); White Plum Asanga; Rochester Zen Center",
      description: "Catalyzed by Japanese missionary masters such as Shunryu Suzuki and Taizan Maezumi in the 1960s. Established America's first Zen monastery (Tassajara) and evolved into an egalitarian, gender-inclusive, and socially active Western contemplative movement.",
      parentLineage: "japanese-soto",
      relatedLineages: ["japanese-rinzai", "socially-engaged-buddhism"],
      links: [
        { title: "San Francisco Zen Center", url: "https://www.sfzc.org/", type: "Official" },
        { title: "White Plum Asanga", url: "https://www.whiteplum.org/", type: "Official" },
        { title: "Zen Mind, Beginner's Mind (Wikipedia)", url: "https://en.wikipedia.org/wiki/Zen_Mind,_Beginner%27s_Mind", type: "Overview" }
      ]
    }
  ],
  linksData: [
    { source: "early-buddhism", target: "classical-theravada" },
    { source: "early-buddhism", target: "early-mahayana" },
    { source: "classical-theravada", target: "sri-lanka-nikayas" },
    { source: "classical-theravada", target: "thai-forest" },
    { source: "classical-theravada", target: "thai-dhammayuttika" },
    { source: "classical-theravada", target: "cambodian-lao-theravada" },
    { source: "classical-theravada", target: "esoteric-theravada" },
    { source: "classical-theravada", target: "burmese-vipassana-mahasi" },
    { source: "classical-theravada", target: "burmese-vipassana-goenka" },
    { source: "classical-theravada", target: "burmese-pa-auk" },
    { source: "classical-theravada", target: "burmese-weizza" },
    { source: "classical-theravada", target: "buddhist-modernism" },

    // Mahayana branches
    { source: "early-mahayana", target: "chinese-chan-linji" },
    { source: "early-mahayana", target: "chinese-chan-caodong" },
    { source: "early-mahayana", target: "chinese-pure-land" },
    { source: "early-mahayana", target: "tiantai-tendai" },
    { source: "early-mahayana", target: "huayan-kegon" },
    { source: "early-mahayana", target: "korean-seon-jogye" },
    { source: "early-mahayana", target: "vietnamese-thien" },
    { source: "early-mahayana", target: "newar-buddhism" },
    { source: "early-mahayana", target: "tibetan-nyingma" },

    // Zen transmissions
    { source: "chinese-chan-linji", target: "japanese-rinzai" },
    { source: "chinese-chan-linji", target: "japanese-obaku" },
    { source: "chinese-chan-caodong", target: "japanese-soto" },
    { source: "japanese-soto", target: "western-zen" },
    { source: "japanese-rinzai", target: "western-zen" },
    { source: "chinese-chan-linji", target: "humanistic-buddhism" },

    // Pure Land transmissions
    { source: "chinese-pure-land", target: "japanese-pure-land-jodo" },
    { source: "japanese-pure-land-jodo", target: "japanese-jodo-shinshu" },
    { source: "japanese-pure-land-jodo", target: "japanese-ji-shu" },

    // Tiantai & Nichiren
    { source: "tiantai-tendai", target: "nichiren-shoshu-sgi" },
    { source: "tiantai-tendai", target: "japanese-shingon" },
    { source: "japanese-shingon", target: "japanese-shugendo" },

    // Tibetan transmissions
    { source: "tibetan-nyingma", target: "tibetan-kagyu" },
    { source: "early-mahayana", target: "tibetan-sakya" },
    { source: "tibetan-sakya", target: "tibetan-gelug" },
    { source: "early-mahayana", target: "tibetan-jonang" },
    { source: "tibetan-nyingma", target: "tibetan-bon" },
    { source: "tibetan-gelug", target: "mongolian-buddhism" },

    // Modernist transmissions
    { source: "burmese-vipassana-mahasi", target: "western-insight" },
    { source: "buddhist-modernism", target: "secular-buddhism" },
    { source: "early-buddhism", target: "navayana-ambedkarite" },
    { source: "vietnamese-thien", target: "socially-engaged-buddhism" },
    { source: "western-insight", target: "secular-buddhism" }
  ]
};
