  const SAFETY_RE =
    /(удар|бь[её]т|угрож|насили|принужд|(?:меня\s+)?застав(?:ляет|ляют|ил|ила|лял|ляла)|контролир|запретил|запретила|следит|слежк|шантаж|изолир|забрал(?:а)? документы|забрал(?:а)? деньги|боюсь идти домой|сексуальн|суицид|не хочу жить|убить себя|самоповреж|порезать себя|\bhits?\b|\bbeating\b|threat(?:en|s|ened|ening)?|violence|abuse|coerc|forced?|controlling|forbid|forbade|stalk|blackmail|isolat|took (?:my )?(?:documents|money)|afraid to go home|sexual|suicid|do not want to live|don't want to live|kill myself|self[-\s]?harm|cut myself)/i;

  const DISSOCIATION_RE =
    /(диссоц|отключа|отключил|отключилась|провал|провалива|как в тумане|нереальн|дереал|деперсонал|вне тела|не чувствую тело|онемел|онемела|немею|замер|замира|меня нет|я исчез|я исчезла|теряю время|потеря времени|не помню|фл[еэ]шбек|flashback|част[ьи]|часть меня|система|переключа|dissociat|foggy|in a fog|unreal|dereal|depersonal|out of body|outside my body|cannot feel my body|can't feel my body|numb|frozen|froze|lost time|do not remember|don't remember|parts?\b|part of me|system|switch(?:ing|ed)?)/i;

  const OVERWHELM_RE =
    /(накрывает|разносит|тряс[её]т|паник|не могу дышать|задыхаюсь|перегруз|не выдерж|истерик|ступор|замороз|freeze|fawn|бей беги замри|бей-беги-замри|flooded|overwhelm|shak(?:e|ing)|panic|cannot breathe|can't breathe|overload|cannot handle|can't handle|hysteric|stupor|fight[-\s]?flight[-\s]?freeze)/i;

  const EMOTIONS = [
    ["тревог", "тревога"],
    ["тревожно", "тревога"],
    ["зл", "злость"],
    ["обид", "обида"],
    ["боль", "боль"],
    ["больно", "боль"],
    ["страш", "страх"],
    ["груст", "грусть"],
    ["стыд", "стыд"],
    ["вин", "вина"],
    ["разочар", "разочарование"],
    ["одинок", "одиночество"],
    ["ревн", "ревность"],
    ["беспомощ", "беспомощность"],
    ["anxious|anxiety|worried|worry", "тревога"],
    ["angry|anger|rage|furious|resentment", "злость"],
    ["hurt|pain|painful", "боль"],
    ["afraid|scared|fear", "страх"],
    ["sad|grief", "грусть"],
    ["shame|ashamed|embarrassed", "стыд"],
    ["guilt|guilty", "вина"],
    ["jealous", "ревность"],
    ["helpless|invisible|disregarded", "беспомощность"]
  ];

  const NEED_RULES = [
    {
      re: /(расстал|расстались|расставан|разошл|разрыв|бывш|не готов(?:а)? (?:к отношениям|продолжать)|broke up|breakup|break up|ex\b|not ready (?:to continue|for (?:a )?relationship)|end(?:ed)? the relationship|relationship ended)/i,
      need: "ясность, уважение к боли и понятные границы после расставания"
    },
    {
      re: /(не ответ|прочитал|прочитала|молч|пропал|пропала|исчез|не пишет|не звон|did not answer|didn't answer|no answer|read my message|silent|stayed silent|disappear|ghost|not texting|not calling|pull(?:s|ed)? away)/i,
      need: "предсказуемость, подтверждение контакта и ясность"
    },
    {
      re: /(опозд|отмени(?:л|ла|ли)|отмена|забыл|забыла|не приш[её]л|не пришла|сорвал|late|cancel(?:ed|led|lation)?|forgot|did not come|didn't come|no[-\s]?show)/i,
      need: "надежность, учет договоренностей и уважение к времени"
    },
    {
      re: /(крич|груб|тон|оскорб|униж|сарказ|насмеш|shout|yell|rude|tone|insult|humiliat|mock|joke|sarcas)/i,
      need: "уважение, спокойный тон и эмоциональная безопасность"
    },
    {
      re: /(соврал|соврала|лож|скрыл|скрыла|измен|предал|предала|lied|lie\b|hidden|hid\b|cheat|betray|used)/i,
      need: "честность, восстановление доверия и понятные границы"
    },
    {
      re: /(деньг|бюджет|работ|карьер|план|ответствен|money|budget|work|career|plan|responsib|deadline|manager|colleague|client)/i,
      need: "ясные договоренности, распределение ответственности и уважение к вкладу"
    },
    {
      re: /(родител|реб[её]н|дет|школ|учител|педагог|воспитател|parent|child|children|teacher|school|sibling|brother|sister|pedagog|educat)/i,
      need: "сотрудничество, уважение ролей и фокус на благополучии ребенка"
    }
  ];

  const INTERPRETATIONS: Array<[RegExp, string]> = [
    [/не важн/i, "я не важен/не важна"],
    [/вс[её] равно/i, "ему/ей все равно"],
    [/не любит/i, "меня не любят"],
    [/специально|назло/i, "это сделали специально"],
    [/брос|остав|не выбрал|не выбрала|не выбрали/i, "меня могут оставить или не выбрать"],
    [/предал|предала/i, "меня предали"],
    [/использ/i, "меня используют"],
    [/не слыш/i, "меня не слышат"],
    [/не уваж/i, "меня не уважают"],
    [/do not matter|don't matter|not important|not chosen/i, "я не важен/не важна"],
    [/do not care|don't care/i, "ему/ей все равно"],
    [/not loved|does not love|doesn't love/i, "меня не любят"],
    [/on purpose|deliberately|to hurt me/i, "это сделали специально"],
    [/left|leave|abandon|replace|replaced/i, "меня могут оставить или не выбрать"],
    [/betray|betrayed/i, "меня предали"],
    [/used|using me/i, "меня используют"],
    [/not heard|not listen/i, "меня не слышат"],
    [/not respect|disrespect/i, "меня не уважают"]
  ];

  const PATTERN_DEFS = [
    {
      id: "criticism",
      title: "Критика",
      marker: "обобщение",
      re: /(ты\s+)?(всегда|никогда|постоянно|опять|вообще)|нормальный человек|\b(you\s+)?(always|never|constantly|again|ever|at all)\b|normal person/i,
      antidote:
        "Сузить до одного события: когда это произошло, что именно было больно и какая просьба сейчас важна."
    },
    {
      id: "contempt",
      title: "Презрение",
      marker: "укол",
      re: /(коз[её]л|идиот|дурак|дура|туп|мерз|жалк|нормальный (?:бы|человек)|смешно слушать|idiot|stupid|pathetic|ridiculous|humiliat|very mature|lectures?|support desk|furniture)/i,
      antidote:
        "Убрать ярлык и оставить достоинство собеседника: мне больно, я злюсь, но не хочу унижать."
    },
    {
      id: "defensiveness",
      title: "Защита",
      marker: "контратака",
      re: /(а ты|сам(?:а)? виноват|это ты|из-за тебя|не я|ты сам|ты сама|and you|what about you|your fault|because of you|not me|you yourself)/i,
      antidote:
        "Назвать свою часть и вернуться к теме: я тоже мог(ла) сказать резче, но хочу обсудить это событие."
    },
    {
      id: "stonewalling",
      title: "Уход",
      marker: "закрытие",
      re: /(делай что хочешь|мне все равно|отстань|не хочу говорить|закрываю тему|больше не пиши|я молчу|do whatever you want|I do not care|I don't care|leave me alone|do not want to talk|don't want to talk|topic closed|do not write|don't write|I am silent|go silent|shut down)/i,
      antidote:
        "Взять паузу с мостиком обратно: я перегружен(а), вернусь к разговору в конкретное время."
    }
  ];

  const TONE_LABELS = {
    soft: "Мягко",
    honest: "Честно",
    vulnerable: "Уязвимо",
    boundary: "С границей",
    short: "Коротко"
  };

  function analyzeDialogue(input) {
    const normalized = normalizeInput(input);
    const combined = [
      normalized.situation,
      normalized.draft,
      normalized.fear,
      normalized.want
    ].join(" ");

    const safety = SAFETY_RE.test(combined);
    const regulationState = detectRegulationState(combined, safety);
    const emotions = detectEmotions(combined);
    const need = detectNeed(combined, normalized.context);
    const fact = makeFact(normalized.situation);
    const interpretationLabels = detectInterpretations(combined);
    const interpretation = makeInterpretation(interpretationLabels);
    const impulse = makeImpulse(normalized.draft);
    const patterns = detectPatterns(normalized.draft || normalized.situation);
    const ladder = makeLadder({
      fact,
      interpretation,
      emotions,
      impulse,
      need,
      fear: normalized.fear,
      want: normalized.want,
      safety
    });
    const formulations = makeFormulations({
      fact,
      interpretation,
      emotions,
      need,
      fear: normalized.fear,
      want: normalized.want,
      context: normalized.context,
      regulationState,
      safety
    });
    const cbtDiary = makeCbtDiary({
      fact,
      interpretationLabels,
      emotions,
      impulse,
      need,
      draft: normalized.draft,
      safety
    });
    const regulationPlan = makeRegulationPlan({
      fact,
      emotions,
      impulse,
      safety,
      regulationState
    });
    const coachState = makeCoachState({
      need,
      normalized,
      regulationState
    });
    const pedagogicalBridge = makePedagogicalBridge({
      combined,
      context: normalized.context,
      need,
      safety,
      regulationState
    });

    return {
      safety,
      coachState,
      regulationPlan,
      pedagogicalBridge,
      reflection: [
        ["Факт", fact],
        ["Интерпретация", interpretation],
        ["Эмоция", formatEmotions(emotions)],
        ["Импульс", impulse],
        ["Потребность", need]
      ],
      ladder,
      cbtDiary,
      patterns,
      formulations,
      defaultTone: safety ? "boundary" : "soft",
      toneLabels: TONE_LABELS
    };
  }

  function normalizeInput(input) {
    return {
      situation: clean(input && input.situation),
      draft: clean(input && input.draft),
      fear: clean(input && input.fear),
      want: clean(input && input.want),
      context: clean(input && input.context) || "partner"
    };
  }

  function clean(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function detectEmotions(text) {
    const found = [];
    for (const [needle, emotion] of EMOTIONS) {
      if (new RegExp(needle, "i").test(text) && !found.includes(emotion)) {
        found.push(emotion);
      }
    }

    return found.length ? found.slice(0, 4) : ["боль", "тревога"];
  }

  function formatEmotions(emotions) {
    return emotions.join(", ");
  }

  function detectNeed(text, context) {
    for (const rule of NEED_RULES) {
      if (rule.re.test(text)) {
        return rule.need;
      }
    }

    if (context === "work") {
      return "уважение, ясность ролей и конкретная договоренность";
    }

    if (context === "family") {
      return "бережность, уважение границ и ощущение, что связь не рвется";
    }

    return "ясность, уважение и подтверждение значимости связи";
  }

  function makeFact(situation) {
    if (!situation) {
      return "Сначала запишите одно наблюдаемое событие: кто что сделал или сказал, без вывода о мотивах.";
    }

    return `Проверьте факт: ${trimSentence(extractObservableFact(situation), 180)}`;
  }

  function detectInterpretations(text) {
    return unique(INTERPRETATIONS.filter(([re]) => re.test(text)).map(([, label]) => label));
  }

  function makeInterpretation(labels) {
    if (labels.length) {
      return `Сейчас это может читаться как: ${labels.join(", ")}. Это гипотеза, не доказанный мотив другого человека.`;
    }

    return "Возможная история поверх факта: связь под угрозой или меня не учитывают. Проверьте, правда ли это про текущую ситуацию.";
  }

  function makeImpulse(draft) {
    if (!draft) {
      return "Ответить из первой волны, закрыться или начать доказывать правоту.";
    }

    if (PATTERN_DEFS.some((pattern) => pattern.re.test(draft))) {
      return "Отправить обвинение, контратаку или фразу, после которой контакт станет жестче.";
    }

    return `Сказать прямо: ${trimSentence(draft, 140)}`;
  }

  function detectPatterns(text) {
    return PATTERN_DEFS.map((pattern) => ({
      id: pattern.id,
      title: pattern.title,
      marker: pattern.marker,
      hit: pattern.re.test(text),
      antidote: pattern.antidote
    }));
  }

  function detectRegulationState(text, safety) {
    if (safety) {
      return {
        mode: "safety",
        label: "сначала безопасность",
        priority: 3,
        signs: ["угроза, принуждение, самоповреждение или риск безопасности"]
      };
    }

    const signs = [];
    if (DISSOCIATION_RE.test(text)) {
      signs.push("возможная диссоциация, freeze, derealization/depersonalization или parts/system activation");
    }
    if (OVERWHELM_RE.test(text)) {
      signs.push("сильная перегрузка нервной системы");
    }

    if (signs.length) {
      return {
        mode: DISSOCIATION_RE.test(text) ? "dissociation" : "overwhelm",
        label: DISSOCIATION_RE.test(text) ? "сначала заземление" : "сначала снижение интенсивности",
        priority: DISSOCIATION_RE.test(text) ? 2 : 1,
        signs
      };
    }

    return {
      mode: "steady",
      label: "можно разбирать диалог",
      priority: 0,
      signs: ["явных маркеров диссоциации или острой перегрузки не найдено"]
    };
  }

  function makeLadder(data) {
    if (data.safety) {
      return [
        ["Стоп", "Есть сигналы угрозы, контроля или принуждения."],
        ["Опора", "Свяжитесь с человеком или службой, где можно получить живую поддержку."],
        ["Граница", "Разговор возможен только при безопасных условиях и без давления."],
        ["Выбор", "Вы не обязаны сохранять контакт ценой своей безопасности."]
      ];
    }

    const fear = data.fear || "меня не услышат, не выберут или оставят";
    const want = data.want || "контакт, уважение и возможность договориться";

    return [
      ["Реакция", data.impulse],
      ["Смысл", data.interpretation],
      ["Чувство", `Под первой реакцией могут быть ${formatEmotions(data.emotions)}.`],
      ["Рана", `Проверьте, не задевает ли это старую боль: ${fear}. Можно не идти глубже, если сейчас нет ресурса.`],
      ["Просьба", `Сформулировать просьбу так, чтобы сохранить ${want}, но не отказаться от границы.`]
    ];
  }

  function makeFormulations(data) {
    if (data.safety) {
      return {
        soft:
          "Я не готов(а) обсуждать это в ситуации давления или угроз. Сначала мне нужно обеспечить себе безопасность и поддержку.",
        honest:
          "То, что происходит, для меня небезопасно. Я не буду продолжать разговор в таком формате и обращусь за помощью.",
        vulnerable:
          "Мне страшно, и я не хочу делать вид, что это обычный конфликт. Сейчас мне важнее безопасность, чем убедить тебя понять меня.",
        boundary:
          "Я прекращаю этот разговор, пока есть угрозы, контроль или принуждение. Дальше я буду действовать так, чтобы защитить себя.",
        short: "Сейчас небезопасно. Я прекращаю разговор и ищу поддержку."
      };
    }

    const fact = compactFactForMessage(stripFactPrefix(data.fact));
    const emotion = formatEmotionObject(data.emotions);
    const need = data.need;
    const want = data.want || contextWant(data.context);
    const closure = isBreakupNeed(need) && wantsClosureOrPause(want);

    if (closure) {
      return {
        soft:
          `Я пока не буду отправлять это из первой волны. Когда ${clauseStart(fact)}, я почувствовал(а) ${emotion}. Мне важны ${need}. Сначала я возвращаю себе опору и позже решу, нужен ли контакт.`,
        honest:
          `Мне больно из-за этой ситуации: ${fact}. Я не хочу доказывать свою значимость из паники. Сейчас моя задача - сохранить достоинство, ясность и не разрушать себя.`,
        vulnerable:
          `Во мне поднялась сильная реакция, будто я могу быть неважен/неважна. Я не буду спорить с этой болью, но и не буду отдавать ей управление. Сначала мне нужны опора и ${need}.`,
        boundary:
          `Я могу признать, что расставание болит, и при этом не писать из паники. Если контакт будет нужен позже, он должен быть в формате, где есть ${need}.`,
        short:
          "Я не отправляю сообщение из первой волны. Сначала возвращаюсь к себе, потом решу, нужен ли контакт."
      };
    }

    return {
      soft:
        `Я хочу сказать это спокойно. Когда ${clauseStart(fact)}, я почувствовал(а) ${emotion}. Мне важны ${need}. Можем поговорить так, чтобы сохранить ${want}?`,
      honest:
        `Мне больно из-за этой ситуации: ${fact}. Я не хочу нападать, но хочу понять, что произошло, и договориться, как нам обходиться с этим дальше.`,
      vulnerable:
        `Во мне поднялась сильная реакция, будто я могу быть неважен/неважна. Я понимаю, что это может быть не вся правда, но мне сейчас нужны ${need}.`,
      boundary:
        `Я понимаю, что у тебя могут быть свои причины. При этом для меня болезненно, когда ${clauseStart(fact)}. Мне важно договориться о формате, где есть ${need}.`,
      short: `Я почувствовал(а) ${emotion}. Хочу поговорить спокойно, без обвинений, и понять, как нам договориться дальше.`
    };
  }

  function makeCoachState(data) {
    const mode = data.regulationState.mode;
    const breakup = isBreakupNeed(data.need);
    const closure = breakup && wantsClosureOrPause(data.normalized.want);

    if (mode === "safety") {
      return {
        mode: "safety",
        title: "Сначала безопасность",
        module: "stabilization_coach",
        nextStep: "Выбрать один физически безопасный шаг и обратиться к живой поддержке, если риск высокий.",
        focus: "Это не тренировка красивой фразы, а защита и опора.",
        sendReadiness: {
          status: "safety_first",
          label: "Сообщение не отправлять",
          detail: "Пока есть риск угроз, контроля, насилия или самоповреждения, фокус не на диалоге.",
          canCopy: false
        }
      };
    }

    if (mode === "dissociation") {
      return {
        mode: "dissociation",
        title: "Сначала заземление",
        module: "stabilization_coach",
        nextStep: "60 секунд ориентировки: дата, место, возраст и три нейтральных предмета вокруг.",
        focus: "Черновик можно оставить на потом; сейчас важнее вернуть ощущение настоящего.",
        sendReadiness: {
          status: "pause_first",
          label: "Черновик на потом",
          detail: "Не отправлять из тумана, онемения, freeze или parts/system activation.",
          canCopy: false
        }
      };
    }

    if (mode === "overwhelm") {
      return {
        mode: "overwhelm",
        title: "Сначала снизить интенсивность",
        module: "stabilization_coach",
        nextStep: "Поставить таймер на 10 минут и записать автоматическую мысль как сигнал боли, не как приказ.",
        focus: "Слова выбирать после спада первой волны.",
        sendReadiness: {
          status: "pause_first",
          label: "Сначала пауза",
          detail: "Черновик стоит проверить после снижения интенсивности, а не отправлять из пика.",
          canCopy: false
        }
      };
    }

    if (closure) {
      return {
        mode: "closure",
        title: "Расставание: сохранить себя",
        module: "reflection_coach",
        nextStep: "Записать фразу себе и проверить, нужен ли контакт позже, когда тело будет спокойнее.",
        focus: "Зрелый результат может быть не сообщением, а отказом писать из паники.",
        sendReadiness: {
          status: "draft_only",
          label: "Не обязательно отправлять",
          detail: "Это может быть черновик для себя или фраза-пауза, если контакт правда нужен позже.",
          canCopy: true
        }
      };
    }

    return {
      mode: "steady",
      title: "Можно планировать диалог",
      module: breakup ? "message_coach" : "prep_coach",
      nextStep: "Собрать одну короткую фразу: факт, чувство, потребность, просьба или граница.",
      focus: "Проверить, что сообщение не пытается наказать, доказать правоту или срочно снять боль.",
      sendReadiness: {
        status: "ready",
        label: "Можно использовать как черновик",
        detail: "Перед отправкой перечитать и выбрать тон, который будет не стыдно видеть завтра.",
        canCopy: true
      }
    };
  }

  function makePedagogicalBridge(data) {
    if (data.safety) {
      return {
        mode: "safety",
        title: "Педагогический мост не нужен",
        principle:
          "Если есть угрозы, контроль, принуждение или самоповреждение, задача не в том, чтобы обучить другого человека формату контакта.",
        cards: [
          ["Фокус", "Сначала безопасность, дистанция и живая поддержка."],
          ["Не делать", "Не объяснять опасному человеку, как ему лучше обращаться с вашей уязвимостью."],
          ["Граница", "Разговор возможен только там, где нет давления, угроз и принуждения."]
        ],
        examples: [
          {
            title: "Коротко",
            text: "Я не продолжаю этот разговор в небезопасном формате. Сейчас мне нужно защитить себя."
          }
        ]
      };
    }

    const mode = detectPedagogicalMode(data.combined, data.context);

    if (mode === "child_scaffold") {
      return {
        mode,
        title: "Доформулировать без давления",
        principle:
          "Когда человек реагирует резко, иногда ему не хватает не морали, а языка для того, что внутри уже произошло.",
        cards: [
          ["Разогрев", "Начать не с вопроса о чувствах, а с фактов: что случилось до резкой реакции, кто был рядом, что стало последней каплей."],
          ["Гипотеза", "Предложить мягкую версию: 'Может, дело было не только в учительнице, а еще в том, что тебя уже задела ситуация с братом или сестрой?'"],
          ["Навык", "Помочь собрать фразу: 'Я резко ответил(а), потому что был(а) уже перегружен(а). В следующий раз мне нужна пауза'."]
        ],
        examples: [
          {
            title: "Хороший родитель",
            text:
              "Давай разберем не кто виноват, а что накопилось. Учительница сказала одно, но, похоже, тебя уже задела история с братом/сестрой. Тогда резкость была не про нее одну. Как можно было бы сказать это точнее?"
          },
          {
            title: "Теплая рамка",
            text:
              "Я не ругаю тебя за злость. Я помогаю понять, что она пыталась защитить, чтобы в следующий раз у тебя было больше вариантов, чем резко отвечать."
          }
        ]
      };
    }

    if (mode === "avoidance") {
      return {
        mode,
        title: "Если человек закрывается",
        principle:
          "Избегание может быть способом не перегрузиться. Проблема начинается там, где пауза превращается в исчезновение и связь остается без опоры.",
        cards: [
          ["Признать", "Показать, что пауза сама по себе не плохая: человеку правда может быть комфортнее и безопаснее сначала отойти."],
          ["Переобучить формат", "Предложить не 'говори сейчас', а 'дай понятный мост обратно'."],
          ["Срок", "Попросить минимальную договоренность: когда человек вернется с ответом или статусом."]
        ],
        examples: [
          {
            title: "Мягко",
            text:
              "Я понимаю, что тебе может быть комфортнее закрыться и не отвечать сразу. Это ок. Мне важно только, чтобы пауза не ставила нашу связь в опасность. Можно так: 'сейчас не могу, вернусь с ответом через 3 дня'."
          },
          {
            title: "С границей",
            text:
              "Мне подходит пауза, если у нее есть берег. Если ты не готов(а) говорить сейчас, пожалуйста, назови срок, когда вернешься к разговору."
          }
        ]
      };
    }

    if (mode === "defense") {
      return {
        mode,
        title: "Если человек защищается",
        principle:
          "Защита часто появляется, когда человек слышит обвинение. Мост помогает перейти от суда к навыку разговора.",
        cards: [
          ["Разогрев", "Начать с общей цели: 'я не хочу доказать, что ты плохой/плохая; я хочу найти формат, где нам обоим безопаснее'."],
          ["Сместить фокус", "Говорить не о характере человека, а о следующем повторяемом действии."],
          ["Пример", "Дать простую альтернативу поведения, которую можно сделать в следующий раз."]
        ],
        examples: [
          {
            title: "Когда спорит",
            text:
              "Я не прошу тебя признать себя виноватым/виноватой целиком. Я прошу маленький навык: если ты не согласен/не согласна, сначала скажи 'я услышал(а), мне нужно подумать', а потом отвечай по сути."
          },
          {
            title: "Когда обесценивает",
            text:
              "Можно не соглашаться с моей интерпретацией, но не обесценивать сам факт, что мне больно. Иначе мы спорим не о ситуации, а о праве вообще что-то чувствовать."
          }
        ]
      };
    }

    return {
      mode: "warmup",
      title: "Разогрев к разговору",
      principle:
        "Если прямой разговор о чувствах слишком резкий, можно начать педагогически: через пример, формат и следующий маленький навык.",
      cards: [
        ["Начать проще", "Не спрашивать сразу 'что ты чувствуешь?', а спросить: 'что было самым трудным моментом?'"],
        ["Показать вариант", "Предложить пример фразы, которую человек мог бы использовать вместо ухода, резкости или молчания."],
        ["Сделать договоренность", "Закончить не анализом личности, а маленьким правилом на следующий раз."]
      ],
      examples: [
        {
          title: "Разогрев",
          text:
            "Давай не будем сразу глубоко. Просто найдем один момент: где разговор стал слишком трудным и какой маленький способ паузы был бы лучше, чем исчезнуть или ударить словами?"
        },
        {
          title: "Правило на будущее",
          text:
            "Если кто-то из нас не готов отвечать сразу, мы не пропадаем молча, а пишем: 'я сейчас не могу, вернусь к этому тогда-то'."
        }
      ]
    };
  }

  function makeCbtDiary(data) {
    const trigger = stripFactPrefix(data.fact);

    if (data.safety) {
      return [
        ["Ситуация", trigger],
        ["Эмоция", formatEmotions(data.emotions)],
        ["Автоматическая мысль", "Мне может быть небезопасно, нужно отнестись к этому всерьез."],
        ["Автоматическая реакция", "Прекратить спор, искать опору и не пытаться смягчить опасное поведение."],
        ["Проверка", "При угрозах, контроле или принуждении КПТ-дневник не должен убеждать себя терпеть."],
        ["Альтернативная мысль", "Это не обычная ссора. Я могу защищать себя и обращаться за живой помощью."],
        ["Альтернативная реакция", "Выбрать безопасный следующий шаг: пауза, поддержка, дистанция, экстренная помощь при риске."]
      ];
    }

    const automaticThought = makeAutomaticThought(data.interpretationLabels);
    const alternativeThought = makeAlternativeThought(data.interpretationLabels, data.need);
    const alternativeReaction = makeAlternativeReaction(data.need);

    return [
      ["Ситуация", trigger],
      ["Эмоция", formatEmotions(data.emotions)],
      ["Автоматическая мысль", automaticThought],
      ["Автоматическая реакция", data.impulse],
      ["Что подтверждает", makeEvidenceFor(data.draft, data.interpretationLabels)],
      ["Что не доказывает", "Факт не раскрывает весь мотив другого человека. Возможны несколько объяснений, и часть реакции может быть усилена болью или страхом."],
      ["Альтернативная мысль", alternativeThought],
      ["Альтернативная реакция", alternativeReaction]
    ];
  }

  function makeRegulationPlan(data) {
    if (data.regulationState.mode === "safety") {
      return {
        mode: "safety",
        title: "Сначала безопасность",
        principle:
          "Это не момент для тренировки диалога. Нужна живая опора, дистанция от опасности и конкретный безопасный следующий шаг.",
        signals: data.regulationState.signs,
        steps: [
          ["Стоп", "Не продолжать спор и не пытаться смягчить поведение человека, если есть риск угроз, контроля или самоповреждения."],
          ["Ориентировка", "Назвать вслух: где я, какой сегодня день, сколько мне лет, что прямо сейчас вокруг меня безопасно."],
          ["Опора", "Связаться с доверенным человеком, локальной кризисной службой или экстренной помощью, если риск высокий."],
          ["Минимум", "Выбрать один физически безопасный шаг: выйти в людное место, убрать острые предметы, не оставаться одному/одной при риске себе."]
        ],
        avoid: [
          "не разбирать травму глубже прямо сейчас",
          "не писать партнеру из состояния угрозы",
          "не убеждать себя терпеть опасность"
        ]
      };
    }

    if (data.regulationState.mode === "dissociation") {
      return {
        mode: "dissociation",
        title: "Сначала заземление",
        principle:
          "Если система уходит в туман, онемение, freeze, parts activation или ощущение нереальности, задача не в анализе отношений, а в возвращении в настоящее маленькими безопасными шагами.",
        signals: data.regulationState.signs,
        steps: [
          ["Ориентировка", "Назвать дату, место, возраст и три нейтральных предмета вокруг. Можно добавить: 'сейчас я здесь, это сегодняшний день, опасность не происходит прямо сейчас'."],
          ["Сенсорный якорь", "Почувствовать стопы, опору стула или текстуру предмета в руке. Выбрать мягкий, не шоковый стимул: вода, плед, чашка, запах, звук."],
          ["Система/части", "Сказать внутренне: 'Никому внутри не нужно решать отношения сейчас. Сначала возвращаемся в комнату и выбираем один безопасный шаг'."],
          ["Титрация", "Разбирать только 10% темы: один факт, одно чувство, одна потребность. Если мутнеет или немеет сильнее, вернуться к ориентации."],
          ["Отложить контакт", "Не отправлять сообщение минимум 20 минут. Сначала записать черновик себе и проверить, стало ли тело больше здесь."]
        ],
        avoid: [
          "не заставлять себя вспоминать подробности",
          "не делать дыхание глубже, если от него кружится голова или становится страшнее",
          "не принимать больших решений из тумана, онемения или потери времени"
        ]
      };
    }

    if (data.regulationState.mode === "overwhelm") {
      return {
        mode: "overwhelm",
        title: "Сначала снизить интенсивность",
        principle:
          "Когда нервную систему накрывает, первая мысль может звучать как приказ. Сначала снижаем интенсивность, потом выбираем слова.",
        signals: data.regulationState.signs,
        steps: [
          ["Пауза", "Поставить таймер на 10 минут и не отправлять сообщение, пока тело в пике."],
          ["Контейнер", "Записать автоматическую мысль одной строкой и добавить: 'это сигнал боли, не инструкция к действию'."],
          ["Опора", "Почувствовать стопы, плечи, спину. Посмотреть вокруг и назвать пять цветов или пять прямых линий."],
          ["Маленький выбор", "Выбрать цель: успокоиться, прояснить, поставить границу или ничего не делать до завтра."]
        ],
        avoid: [
          "не спорить с собой за эмоцию",
          "не отправлять второе сообщение из паники",
          "не превращать телесную тревогу в доказательство мотива другого человека"
        ]
      };
    }

    return {
      mode: "steady",
      title: "Регуляция перед диалогом",
      principle:
        "Перед формулировкой достаточно короткой паузы: заметить тело, назвать эмоцию и выбрать цель сообщения.",
      signals: data.regulationState.signs,
      steps: [
        ["Проверка", "Спросить себя: я сейчас хочу понять, сблизиться, поставить границу или снять боль?"],
        ["Пауза", "Сделать один спокойный цикл: факт, чувство, потребность, просьба."],
        ["Выбор", "Отправлять только ту формулировку, которую не стыдно перечитать завтра."]
      ],
      avoid: [
        "не читать мотивы как факт",
        "не писать из желания наказать",
        "не отменять свою потребность ради мягкости"
      ]
    };
  }

  function makeAutomaticThought(labels) {
    if (labels.length) {
      return `Первая мысль может звучать так: ${labels.join(", ")}.`;
    }

    return "Первая мысль может звучать так: связь под угрозой, меня не учитывают или сейчас нужно срочно защититься.";
  }

  function makeEvidenceFor(draft, labels) {
    if (draft && labels.length) {
      return "Есть боль и факты, которые запускают такую историю. Но черновик показывает первую реакцию, а не окончательную правду.";
    }

    if (labels.length) {
      return "Есть детали ситуации, которые делают эту мысль понятной. Но понятная мысль все еще остается гипотезой.";
    }

    return "Есть сильная эмоция и желание быстро объяснить происходящее. Этого достаточно, чтобы остановиться и проверить мысль.";
  }

  function makeAlternativeThought(labels, need) {
    if (labels.some((label) => /оставить|выбрать|все равно|не важен/.test(label))) {
      return `Мне больно, и мысль о том, что меня не выбирают, понятна. Но я пока не знаю всей картины; я могу попросить ясности и беречь свои границы. Мне важны ${need}.`;
    }

    if (labels.some((label) => /используют|предали|специально/.test(label))) {
      return `Я могу признать боль и злость, не превращая гипотезу о мотивах в факт. Мне важны ${need}, и я могу говорить из этого места.`;
    }

    return `Моя первая реакция важна как сигнал, но не обязана быть инструкцией к действию. Я могу выбрать формулировку, где есть ${need}.`;
  }

  function makeAlternativeReaction(need) {
    return `Сделать паузу, назвать факт и чувство, затем сказать, что мне важны ${need}, не обвиняя и не отменяя свою границу.`;
  }

  function contextWant(context) {
    if (context === "work") return "рабочий контакт и ясность";
    if (context === "family") return "связь и уважение границ";
    if (context === "friend") return "дружбу и честность";
    return "контакт и уважение друг к другу";
  }

  function isBreakupNeed(need) {
    return /расставан|расставания|разрыв|после расставания|breakup|break up|after the breakup|relationship ended/i.test(need);
  }

  function wantsClosureOrPause(text) {
    return /(не писать|не отправ|из паник|сохранить себя|не разрушать|достоинств|отпустить|заверш|границ|not send|not write|from panic|keep myself|protect myself|save myself|not (?:to )?destroy|destroy myself|dignity|let go|finish|closure|boundary|boundaries|after breakup)/i.test(
      text || ""
    );
  }

  function detectPedagogicalMode(text, context) {
    if (/(учител|школ|реб[её]нок|дет|сын|дочь|брат|сестр|резко ответил|резко ответила|teacher|school|child|children|son|daughter|sibling|brother|sister|answered sharply|talk to adults)/i.test(text)) {
      return "child_scaffold";
    }

    if (
      /(не готов(?:а)? говорить|не хочу говорить|закрыва|закрылся|закрылась|молчит|молчал|молчала|пропал|пропала|исчез|не отвечает|избега|отдаля|пауза|not ready to talk|not ready to speak|do not want to talk|don't want to talk|shut down|went silent|stayed silent|goes silent|disappear|ghost|does not answer|doesn't answer|avoid|pull(?:s|ed)? away|distant|pause|come back|return to)/i.test(
        text
      )
    ) {
      return "avoidance";
    }

    if (/(драматиз|сама виновата|сам виноват|обвиня|защища|спорит|обесцен|не соглас|ты тоже|а ты|dramatiz|your fault|blame|defensive|argue|dismiss|disagree|you too|and you)/i.test(text)) {
      return "defense";
    }

    if (context === "family") {
      return "child_scaffold";
    }

    return "warmup";
  }

  function formatEmotionObject(emotions) {
    const emotionObjects = {
      тревога: "тревогу",
      злость: "злость",
      обида: "обиду",
      боль: "боль",
      страх: "страх",
      грусть: "грусть",
      стыд: "стыд",
      вина: "вину",
      разочарование: "разочарование",
      одиночество: "одиночество",
      ревность: "ревность",
      беспомощность: "беспомощность"
    };
    const values = (emotions.length ? emotions : ["боль", "тревога"])
      .slice(0, 2)
      .map((emotion) => emotionObjects[emotion] || emotion);

    if (values.length === 1) return values[0];
    return `${values[0]} и ${values[1]}`;
  }

  function stripFactPrefix(fact) {
    return fact.replace(/^Проверьте факт:\s*/i, "");
  }

  function clauseStart(text) {
    if (!text) return text;
    return text.replace(/^(Он|Она|Они|Мы|Я|Коллега|Партнер|Партнерша)(?=\s|$)/u, (match) =>
      match.toLocaleLowerCase("ru-RU")
    );
  }

  function trimSentence(text, maxLength) {
    if (text.length <= maxLength) return text;
    const trimmed = text.slice(0, maxLength - 3);
    const lastSpace = trimmed.lastIndexOf(" ");
    const safeCut = lastSpace > Math.floor(maxLength * 0.65) ? trimmed.slice(0, lastSpace) : trimmed;
    return `${safeCut.trim()}...`;
  }

  function extractObservableFact(situation) {
    const sentences = splitSentences(situation);
    const observable = sentences.filter((sentence) => !looksLikeInnerState(sentence));

    return (observable.length ? observable : sentences).join(" ").trim();
  }

  function compactFactForMessage(fact) {
    const cleaned = fact.replace(/\s+/g, " ").trim();
    const firstSentence = splitSentences(cleaned)[0] || cleaned;

    return firstSentence.replace(/[.!?]+$/u, "").replace(/\.\.\.$/, "").trim();
  }

  function splitSentences(text) {
    return (
      text
        .match(/[^.!?]+[.!?]?/gu)
        ?.map((sentence) => sentence.trim())
        .filter(Boolean) || []
    );
  }

  function looksLikeInnerState(sentence) {
    return /^(мне|я\s+(?:почув|подум|хочу|хотел|хотела|боюсь|злюсь|переживаю)|хочется|кажется|моя история)(?=\s|$|[,.])/i.test(
      sentence.trim()
    );
  }

  function unique(values) {
    return Array.from(new Set(values));
  }
export { analyzeDialogue, detectPatterns, detectEmotions, detectRegulationState };
