import { type ReactNode, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookmarkPlus,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  Clipboard,
  Copy,
  Eraser,
  HeartHandshake,
  Library,
  Lightbulb,
  ListChecks,
  MessageSquareText,
  FolderOpen,
  Save,
  Search,
  Shield,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { analyzeDialogue } from "@/lib/dialogueAnalyzer";

type ContextId = "partner" | "family" | "friend" | "work";
type ToneId = "soft" | "honest" | "vulnerable" | "boundary" | "short";
type FormState = {
  situation: string;
  draft: string;
  fear: string;
  want: string;
};
type QuickOption = {
  label: string;
  value: string;
};
type SavedCase = {
  id: string;
  title: string;
  context: ContextId;
  form: FormState;
  createdAt: string;
};
type LibraryBucket =
  | "triggers"
  | "automaticReactions"
  | "alternativeReactions"
  | "safePhrases"
  | "pausePhrases";
type LibraryItem = {
  id: string;
  label: string;
  value: string;
  createdAt: string;
};
type PersonalLibrary = Record<LibraryBucket, LibraryItem[]>;
type CommunicationTechnique = {
  id: string;
  title: string;
  tag: string;
  principle: string;
  steps: string[];
  example: string;
};
type DialogueAnalysis = ReturnType<typeof analyzeDialogue>;

const STORAGE_KEY = "braintrainings-dialogue-coach-saved-cases";
const LIBRARY_STORAGE_KEY = "braintrainings-dialogue-coach-personal-library";

const contexts: Array<{ id: ContextId; label: string }> = [
  { id: "partner", label: "Партнер" },
  { id: "family", label: "Семья" },
  { id: "friend", label: "Друг" },
  { id: "work", label: "Работа" },
];

const libraryBucketConfig: Record<LibraryBucket, { label: string; field: keyof FormState; placeholder: string }> = {
  triggers: {
    label: "Триггеры",
    field: "situation",
    placeholder: "Вставить триггер",
  },
  automaticReactions: {
    label: "Авто-реакции",
    field: "draft",
    placeholder: "Вставить авто-реакцию",
  },
  alternativeReactions: {
    label: "Альтернативы",
    field: "draft",
    placeholder: "Вставить альтернативу",
  },
  safePhrases: {
    label: "Опорные фразы",
    field: "draft",
    placeholder: "Вставить фразу",
  },
  pausePhrases: {
    label: "Паузы",
    field: "draft",
    placeholder: "Вставить паузу",
  },
};

const emptyPersonalLibrary: PersonalLibrary = {
  triggers: [],
  automaticReactions: [],
  alternativeReactions: [],
  safePhrases: [],
  pausePhrases: [],
};

const emptyForm: FormState = {
  situation: "",
  draft: "",
  fear: "",
  want: "",
};

const pausePhraseByContext: Record<ContextId, string> = {
  partner:
    "Я сейчас не готов(а) отвечать из первой волны. Я не ухожу из контакта, вернусь к разговору завтра после 12:00.",
  family:
    "Мне нужна пауза, чтобы не говорить резко. Я вернусь к этому разговору вечером и скажу спокойнее.",
  friend:
    "Мне важно не обесценить нашу связь резким ответом. Я возьму паузу и вернусь к разговору завтра.",
  work:
    "Мне нужно проверить детали и не отвечать на эмоциях. Вернусь с конкретным предложением по срокам сегодня до конца дня.",
};

const communicationTechniques: CommunicationTechnique[] = [
  {
    id: "cbt-diary",
    title: "КПТ-дневник реакции",
    tag: "мысль не команда",
    principle:
      "Автоматическая мысль фиксируется как гипотеза, а не как приказ. Между импульсом и ответом появляется место для выбора.",
    steps: [
      "Факт: что реально произошло.",
      "Автоматическая мысль: какой смысл мозг достроил.",
      "Импульс: что хочется сделать сразу.",
      "Альтернатива: какая мысль и реакция точнее и бережнее.",
    ],
    example:
      "Не только «меня игнорируют», а «я не знаю мотив молчания; я могу попросить срок ответа и не писать второе сообщение из паники».",
  },
  {
    id: "validation-boundary",
    title: "Валидация + граница",
    tag: "тепло без сдачи позиции",
    principle:
      "Сначала признается понятная часть поведения другого, затем спокойно обозначается условие, без которого связь становится небезопасной.",
    steps: [
      "Признать: почему человеку могло быть сложно.",
      "Назвать влияние: что это делает с контактом.",
      "Попросить формат: как можно иначе в следующий раз.",
    ],
    example:
      "Я понимаю, что тебе легче закрыться. Мне подходит пауза, если у нее есть берег: напиши, когда вернешься к разговору.",
  },
  {
    id: "pause-bridge",
    title: "Пауза с мостом обратно",
    tag: "не исчезать",
    principle:
      "Пауза регулирует нервную систему, а срок возвращения защищает связь от тревожного провала.",
    steps: [
      "Назвать паузу без наказания.",
      "Сказать, что контакт не разрывается.",
      "Дать срок или следующий конкретный шаг.",
    ],
    example:
      "Я перегружен(а) и не хочу ранить. Я вернусь к этому через 2 дня и тогда отвечу по сути.",
  },
  {
    id: "pedagogical-bridge",
    title: "Педагогический мост",
    tag: "показать другой способ",
    principle:
      "Когда прямой разговор о чувствах вызывает сопротивление, можно предложить человеку конкретный навык поведения вместо анализа личности.",
    steps: [
      "Убрать обвинение из входа.",
      "Показать альтернативную фразу или действие.",
      "Договориться о маленьком правиле на следующий раз.",
    ],
    example:
      "Можно не отвечать сразу. Но вместо молчания напиши: «я не готов, вернусь через 3 дня». Тогда пауза не разрушает связь.",
  },
  {
    id: "assumption-check",
    title: "Проверка гипотезы",
    tag: "мотив не факт",
    principle:
      "Интерпретация выносится наружу как предположение, чтобы разговор не начинался с суда.",
    steps: [
      "Отделить наблюдение от вывода.",
      "Назвать свою гипотезу мягко.",
      "Попросить поправить или уточнить.",
    ],
    example:
      "Я додумываю, что ты отдаляешься, но могу ошибаться. Скажи, пожалуйста, что на самом деле происходит.",
  },
  {
    id: "trauma-informed",
    title: "Trauma-informed темп",
    tag: "выбор и безопасность",
    principle:
      "При перегрузке, freeze, диссоциации или parts/system activation важнее ясность, выбор и малые шаги, чем немедленный глубокий разговор.",
    steps: [
      "Сначала ориентация: где я, какой сегодня день, что вокруг безопасно.",
      "Только 10% темы: один факт, одно чувство, одна просьба.",
      "Выбор формата: пауза, короткий ответ или возврат позже.",
    ],
    example:
      "Сейчас не нужно решать все отношения. Можно выбрать один безопасный шаг и вернуться к разговору, когда тело снова здесь.",
  },
];

const placeholdersByContext: Record<ContextId, FormState> = {
  partner: {
    situation:
      "Мы расстались, он то пишет тепло, то снова отдаляется. Мне больно и хочется срочно доказать, что я важна.",
    draft:
      "Можно вставить резкий черновик партнеру. Тренажер отделит боль от импульса и подскажет, писать ли вообще.",
    fear: "меня не выберут, меня легко оставить...",
    want: "ясность, достоинство, не писать из паники...",
  },
  family: {
    situation:
      "Мама при родственниках сказала, что я опять все усложняю. Я почувствовала злость, стыд и желание закрыться.",
    draft:
      "Можно вставить фразу родителю или близкому. Тренажер поможет сохранить уважение и границу.",
    fear: "меня не воспринимают всерьез...",
    want: "уважение, спокойный тон, право на границу...",
  },
  friend: {
    situation:
      "Подруга отменила встречу в последний момент и потом написала как ни в чем не бывало. Мне стало обидно.",
    draft:
      "Можно вставить черновик другу. Тренажер поможет сказать о боли без проверки любви.",
    fear: "я навязываюсь, дружба уже не важна...",
    want: "честность, тепло, ясность ожиданий...",
  },
  work: {
    situation:
      "Коллега отменил встречу за десять минут и не предложил новое время. Из-за этого завис мой срок.",
    draft:
      "Можно вставить рабочий черновик. Тренажер соберет факт, влияние, просьбу и следующий шаг.",
    fear: "на мне останется чужая ответственность...",
    want: "рабочая ясность, сроки, уважение к вкладу...",
  },
};

const examplesByContext: Record<ContextId, FormState[]> = {
  partner: [
    {
      situation:
        "Партнер сказал, что не готов продолжать отношения, и мы расстались. После этого он то выходит на связь тепло, то снова отдаляется. Мне больно, тревожно и хочется понять, была ли я ему важна.",
      draft: "Ты просто использовал меня и опять исчез. Если тебе все равно, так и скажи.",
      fear: "меня не выбрали и легко оставили",
      want: "ясность, уважение к моей боли и возможность не разрушать себя",
    },
    {
      situation:
        "Партнер прочитал сообщение днем, не ответил до вечера, а потом написал: «ты опять драматизируешь». Мне стало тревожно и обидно.",
      draft:
        "Ты всегда пропадаешь, тебе вообще все равно на меня. Нормальный человек так не делает.",
      fear: "меня легко оставить",
      want: "контакт и бережность",
    },
    {
      situation:
        "Партнерша сказала, что ей нужно больше свободы и она не уверена в отношениях. Я почувствовал злость, стыд и страх, что меня сравнивают с кем-то лучше.",
      draft:
        "Если тебе нужен кто-то другой, так и скажи. Я не собираюсь унижаться и выпрашивать внимание.",
      fear: "меня заменят, я окажусь недостаточно хорошим",
      want: "ясность без унижения и возможность сохранить достоинство",
    },
    {
      situation:
        "Я написал девушке спокойное сообщение после ссоры, а она ответила только сухим «ок». Меня задело, захотелось доказать, что я тоже могу быть холодным.",
      draft: "Ок, значит мне тоже все равно. Не пиши тогда.",
      fear: "если я покажу боль, меня посчитают слабым",
      want: "сказать о боли без демонстративной холодности",
    },
  ],
  family: [
    {
      situation:
        "Ребенок резко ответил учительнице после конфликта с братом и сестрой утром. Я хочу помочь ему понять, что реакция была не только на учительницу.",
      draft: "Нельзя так разговаривать со взрослыми.",
      fear: "он будет думать, что его просто ругают",
      want: "помочь ребенку доформулировать, что с ним произошло",
    },
    {
      situation:
        "Отец без предупреждения пришел ко мне домой и сказал, что семья имеет право знать, что со мной происходит. Я напряглась и разозлилась.",
      draft: "Ты вообще не понимаешь границ. Перестань лезть в мою жизнь.",
      fear: "мои границы снова не будут считаться настоящими",
      want: "теплый контакт, но с уважением к моему пространству",
    },
    {
      situation:
        "Отец сказал, что мужчина должен справляться сам и не жаловаться. Я почувствовал злость и одновременно стыд за то, что мне нужна поддержка.",
      draft: "Ты вообще не умеешь говорить нормально. С тобой только молчать.",
      fear: "если я покажу уязвимость, меня перестанут уважать",
      want: "сохранить уважение к себе и обозначить, что поддержка мне нужна",
    },
    {
      situation:
        "Брат в семейном чате пошутил, что я опять все драматизирую. Я хотел ответить жестко, чтобы все наконец поняли, что это не смешно.",
      draft: "Ты всегда лезешь со своими тупыми шутками. Повзрослей уже.",
      fear: "меня не воспринимают всерьез",
      want: "остановить шутки без унижения и без семейной войны",
    },
  ],
  friend: [
    {
      situation:
        "Подруга второй раз отменила встречу в последний момент и потом написала как ни в чем не бывало. Я почувствовала обиду и сомнение, важна ли ей наша дружба.",
      draft: "Если тебе все равно, так и скажи. Я устала подстраиваться.",
      fear: "я навязываюсь, а дружба важна только мне",
      want: "честность, тепло и понятные договоренности",
    },
    {
      situation:
        "Друг пошутил про мою личную тему в компании. Все засмеялись, а я замолчала и потом весь вечер чувствовала стыд.",
      draft: "Спасибо, что выставил меня смешной перед всеми.",
      fear: "если я скажу, меня назовут слишком чувствительной",
      want: "бережность, уважение и возможность сказать, что это задело",
    },
    {
      situation:
        "Друг несколько раз не позвал меня на встречи общей компании, а потом сказал, что я сам редко проявляюсь. Мне стало обидно, но я не хочу выглядеть нуждающимся.",
      draft: "Да ладно, мне все равно. Просто теперь понятно, кто кому друг.",
      fear: "если я скажу, что мне обидно, это будет выглядеть слабостью",
      want: "прояснить дружбу без проверки значимости и без сарказма",
    },
    {
      situation:
        "Близкий друг рассказал другим то, что я говорил ему лично. Я почувствовал злость и желание просто оборвать контакт.",
      draft: "После такого я тебе больше ничего не расскажу. Делай вид, что все нормально.",
      fear: "моей уязвимостью воспользуются",
      want: "обозначить границу доверия и понять, можно ли его восстановить",
    },
  ],
  work: [
    {
      situation:
        "Коллега отменил встречу за десять минут до начала и не предложил новое время. Из-за этого завис мой срок, а ответственность может лечь на меня.",
      draft: "Это из-за тебя мы опять все сорвали. Делай что хочешь.",
      fear: "на мне останется чужая ответственность",
      want: "рабочую ясность, срок и следующий шаг",
    },
    {
      situation:
        "Руководитель в общем чате написал, что задача сделана небрежно, хотя до этого не давал критерии. Я почувствовала злость и желание защищаться.",
      draft: "Если бы вы нормально объясняли, что хотите, не было бы проблем.",
      fear: "мою работу обесценят публично",
      want: "конкретные критерии, уважительный тон и возможность исправить без стыда",
    },
    {
      situation:
        "На встрече руководитель перебил меня и сказал, что я слишком эмоционально защищаю идею. Я замолчал, хотя хотел объяснить данные.",
      draft: "Если вы не хотите слушать аргументы, тогда решайте сами.",
      fear: "меня сочтут слабым или непрофессиональным, если я буду настаивать",
      want: "вернуть разговор к данным и сохранить спокойный профессиональный тон",
    },
    {
      situation:
        "Коллега взял мою часть презентации и представил ее как свою. Я почувствовал злость и желание публично поставить его на место.",
      draft: "Классно присвоил мою работу. В следующий раз хотя бы постарайся не палиться.",
      fear: "мой вклад снова станет невидимым",
      want: "зафиксировать авторство и договориться о правилах без публичной атаки",
    },
  ],
};

const fearOptionsByContext: Record<ContextId, QuickOption[]> = {
  partner: [
    { label: "Меня не выберут", value: "меня не выберут и легко оставят" },
    { label: "Я была не важна", value: "я была/был не важен/не важна" },
    { label: "Меня используют", value: "меня используют, а потом исчезают" },
    { label: "Я навязываюсь", value: "я навязываюсь и меня терпят" },
    { label: "Связь исчезнет", value: "если я не напишу сейчас, связь исчезнет" },
  ],
  family: [
    { label: "Меня не слышат", value: "меня не слышат и снова ставят в старую роль" },
    { label: "Мои границы не важны", value: "мои границы не будут считаться настоящими" },
    { label: "Я плохой ребенок", value: "меня увидят плохим ребенком/плохой дочерью/плохим сыном" },
    { label: "Контакт разрушится", value: "если я поставлю границу, связь разрушится" },
  ],
  friend: [
    { label: "Я не важна", value: "я не важен/не важна для этой дружбы" },
    { label: "Я слишком чувствительная", value: "меня назовут слишком чувствительным/чувствительной" },
    { label: "Меня заменят", value: "меня легко заменить и не заметить" },
    { label: "Я навязываюсь", value: "я навязываюсь, а дружба важна только мне" },
  ],
  work: [
    { label: "Вина останется на мне", value: "на мне останется чужая ответственность" },
    { label: "Меня обесценят", value: "мою работу обесценят публично" },
    { label: "Я потеряю контроль", value: "я потеряю контроль над сроками и ожиданиями" },
    { label: "Мне нельзя ошибаться", value: "если я ошибусь, меня перестанут уважать" },
  ],
};

const wantOptionsByContext: Record<ContextId, QuickOption[]> = {
  partner: [
    { label: "Ясность без давления", value: "ясность без давления и без второго сообщения из паники" },
    { label: "Срок возвращения", value: "контакт без давления и понятный срок возвращения" },
    { label: "Достоинство", value: "сохранить достоинство и не доказывать свою ценность" },
    { label: "Граница после расставания", value: "понятные границы после расставания" },
  ],
  family: [
    { label: "Спокойная граница", value: "спокойная граница без разрыва связи" },
    { label: "Уважительный тон", value: "уважение, спокойный тон и право не оправдываться" },
    { label: "Помочь сформулировать", value: "помочь другому человеку доформулировать, что с ним произошло" },
  ],
  friend: [
    { label: "Теплая честность", value: "честность, тепло и понятные договоренности" },
    { label: "Бережность", value: "бережность и возможность сказать, что это задело" },
    { label: "Не проверять любовь", value: "сказать о боли без проверки значимости дружбы" },
  ],
  work: [
    { label: "Следующий шаг", value: "рабочая ясность, срок и следующий шаг" },
    { label: "Критерии", value: "конкретные критерии и уважительный тон" },
    { label: "Ответственность", value: "распределить ответственность без обвинения" },
  ],
};

const stateOptions: QuickOption[] = [
  { label: "Меня трясет", value: "меня трясет, накрывает паника и хочется срочно писать" },
  { label: "Как в тумане", value: "все как в тумане, я не чувствую тело и мне трудно решать сейчас" },
  { label: "Хочу исчезнуть", value: "я хочу закрыться, исчезнуть и ничего не объяснять" },
  { label: "Замерла система", value: "части внутри спорят, система замерла, никому внутри не нужно решать отношения сейчас" },
];

const otherReactionOptions: QuickOption[] = [
  { label: "Закрывается", value: "другой человек закрывается, избегает разговора и не называет срок возвращения" },
  { label: "Защищается", value: "другой человек защищается, спорит и слышит в моих словах обвинение" },
  { label: "Обесценивает", value: "другой человек обесценивает мою боль и говорит, что я драматизирую" },
  { label: "Давит", value: "другой человек давит на быстрый ответ, хотя мне нужна пауза" },
];

const coachModuleLabels: Record<string, string> = {
  prep_coach: "Подготовка",
  stabilization_coach: "Стабилизация",
  message_coach: "Формулировка",
  rehearsal_coach: "Репетиция",
  reflection_coach: "Рефлексия",
};

const neutralPatternText: Record<string, string> = {
  criticism: "Нет явного «ты всегда / ты никогда». Можно говорить о событии, а не о характере.",
  contempt: "Нет явного унижения или ярлыка. Так у разговора остается шанс на уважение.",
  defensiveness: "Нет заметной контратаки. Фокус остается на факте и своей части.",
  stonewalling: "Нет резкого закрытия контакта. Если нужна пауза, лучше назвать время возвращения.",
};

const hasContent = (form: FormState) =>
  Object.values(form).some((value) => value.trim().length > 0);

const anonymizeText = (value: string) =>
  value.replace(/(^|[^\p{L}])Ром(?:а|у|е|ой|ы)(?=$|[^\p{L}])/giu, "$1партнер");

const anonymizeForm = (form: FormState): FormState => ({
  situation: anonymizeText(form.situation || ""),
  draft: anonymizeText(form.draft || ""),
  fear: anonymizeText(form.fear || ""),
  want: anonymizeText(form.want || ""),
});

const anonymizeSavedCase = (saved: SavedCase): SavedCase => ({
  ...saved,
  title: anonymizeText(saved.title || ""),
  form: anonymizeForm(saved.form || emptyForm),
});

const anonymizeLibraryItem = (item: LibraryItem): LibraryItem => ({
  ...item,
  label: anonymizeText(item.label || ""),
  value: anonymizeText(item.value || ""),
});

const readSavedCases = (): SavedCase[] => {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];

    const sanitized = parsed.slice(0, 12).map(anonymizeSavedCase);
    if (JSON.stringify(parsed.slice(0, 12)) !== JSON.stringify(sanitized)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch {
    return [];
  }
};

const writeSavedCases = (cases: SavedCase[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
};

const readPersonalLibrary = (): PersonalLibrary => {
  if (typeof window === "undefined") return emptyPersonalLibrary;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(LIBRARY_STORAGE_KEY) || "{}") as Partial<
      Record<LibraryBucket, LibraryItem[]>
    >;
    const sanitized = (Object.keys(emptyPersonalLibrary) as LibraryBucket[]).reduce<PersonalLibrary>(
      (acc, bucket) => {
        const rawItems = Array.isArray(parsed[bucket]) ? parsed[bucket] : [];
        acc[bucket] = rawItems
          .slice(0, 10)
          .map((item) =>
            anonymizeLibraryItem({
              id: String(item.id || `${bucket}-${Date.now()}`),
              label: String(item.label || item.value || "Запись"),
              value: String(item.value || item.label || ""),
              createdAt: String(item.createdAt || new Date().toISOString()),
            }),
          )
          .filter((item) => item.value.trim().length > 0);
        return acc;
      },
      { ...emptyPersonalLibrary },
    );

    if (JSON.stringify(parsed) !== JSON.stringify(sanitized)) {
      window.localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch {
    return emptyPersonalLibrary;
  }
};

const writePersonalLibrary = (library: PersonalLibrary) => {
  window.localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library));
};

const appendText = (current: string, addition: string) => {
  if (!addition) return current;
  if (!current.trim()) return addition;
  if (current.includes(addition)) return current;
  return `${current.trim()}; ${addition}`;
};

const makeLibraryLabel = (value: string) => {
  const cleanValue = anonymizeText(value).replace(/\s+/g, " ").trim();
  const firstPart = cleanValue.split(/[.!?;]/)[0].trim();
  return firstPart.slice(0, 64) || "Запись";
};

const makeSavedTitle = (context: ContextId, form: FormState) => {
  const source = form.situation || form.draft || form.fear || "Новый разбор";
  const firstPart = source.split(/[.!?;]/)[0].trim();
  const contextLabel = contexts.find((item) => item.id === context)?.label || "Кейс";
  return `${contextLabel}: ${firstPart.slice(0, 58) || "без названия"}`;
};

const getContextLabel = (context: ContextId) =>
  contexts.find((item) => item.id === context)?.label || "Кейс";

const formatSavedDate = (createdAt: string) => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
};

const DialogueCoach = () => {
  const [context, setContext] = useState<ContextId>("partner");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [savedCases, setSavedCases] = useState<SavedCase[]>(readSavedCases);
  const [personalLibrary, setPersonalLibrary] = useState<PersonalLibrary>(readPersonalLibrary);
  const [savedSearch, setSavedSearch] = useState("");
  const [exampleIndexes, setExampleIndexes] = useState<Record<ContextId, number>>({
    partner: 0,
    family: 0,
    friend: 0,
    work: 0,
  });
  const [selectedTone, setSelectedTone] = useState<ToneId>("soft");
  const [copyLabel, setCopyLabel] = useState("Скопировать");
  const [saveLabel, setSaveLabel] = useState("Сохранить");
  const [libraryNotice, setLibraryNotice] = useState("Личная библиотека");
  const [selectVersion, setSelectVersion] = useState(0);

  const analysis = useMemo(() => {
    if (!hasContent(form)) return null;
    return analyzeDialogue({ ...form, context });
  }, [context, form]);
  const activeTone = (analysis?.formulations[selectedTone] ? selectedTone : analysis?.defaultTone || "soft") as ToneId;
  const finalMessage = analysis?.formulations[activeTone] || "";
  const placeholders = placeholdersByContext[context];
  const totalLibraryItems = Object.values(personalLibrary).reduce((sum, items) => sum + items.length, 0);
  const filteredSavedCases = useMemo(() => {
    const query = savedSearch.trim().toLowerCase();
    if (!query) return savedCases;

    return savedCases.filter((item) => {
      const searchable = [
        item.title,
        getContextLabel(item.context),
        item.form.situation,
        item.form.draft,
        item.form.fear,
        item.form.want,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [savedCases, savedSearch]);

  const getDiaryDetail = (title: string) =>
    analysis?.cbtDiary.find(([itemTitle]) => itemTitle === title)?.[1] || "";

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const appendField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: appendText(current[field], value) }));
    setSelectVersion((current) => current + 1);
  };

  const insertLibraryItem = (bucket: LibraryBucket, value: string) => {
    appendField(libraryBucketConfig[bucket].field, value);
  };

  const insertExample = () => {
    const examples = examplesByContext[context];
    const currentIndex = exampleIndexes[context] || 0;
    setForm(examples[currentIndex % examples.length]);
    setExampleIndexes((current) => ({ ...current, [context]: currentIndex + 1 }));
    setSelectedTone("soft");
  };

  const clearForm = () => {
    setForm(emptyForm);
    setSelectedTone("soft");
    setCopyLabel("Скопировать");
    setSaveLabel("Сохранить");
  };

  const saveToLibrary = (bucket: LibraryBucket, rawValue: string) => {
    const value = anonymizeText(rawValue || "").replace(/\s+/g, " ").trim();
    if (!value) return;

    const item: LibraryItem = {
      id: `${bucket}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label: makeLibraryLabel(value),
      value,
      createdAt: new Date().toISOString(),
    };
    const nextBucket = [
      item,
      ...personalLibrary[bucket].filter((existing) => existing.value !== value),
    ].slice(0, 10);
    const nextLibrary = { ...personalLibrary, [bucket]: nextBucket };
    setPersonalLibrary(nextLibrary);
    writePersonalLibrary(nextLibrary);
    setLibraryNotice(`${libraryBucketConfig[bucket].label}: сохранено`);
    window.setTimeout(() => setLibraryNotice("Личная библиотека"), 1200);
  };

  const saveCurrentCase = () => {
    if (!hasContent(form)) return;

    const saved: SavedCase = {
      id: `${Date.now()}`,
      title: anonymizeText(makeSavedTitle(context, form)),
      context,
      form: anonymizeForm(form),
      createdAt: new Date().toISOString(),
    };
    const nextCases = [saved, ...savedCases].slice(0, 12);
    updateSavedCases(nextCases);
    setSaveLabel("Сохранено");
    window.setTimeout(() => setSaveLabel("Сохранить"), 1200);
  };

  const updateSavedCases = (cases: SavedCase[]) => {
    setSavedCases(cases);
    writeSavedCases(cases);
  };

  const loadSavedCase = (id: string) => {
    const saved = savedCases.find((item) => item.id === id);
    if (!saved) return;

    setContext(saved.context);
    setForm(saved.form);
    setSelectedTone("soft");
    setCopyLabel("Скопировать");
    setSelectVersion((current) => current + 1);
  };

  const deleteSavedCase = (id: string) => {
    updateSavedCases(savedCases.filter((item) => item.id !== id));
  };

  const clearSavedCases = () => {
    updateSavedCases([]);
    setSavedSearch("");
  };

  const clearPersonalLibrary = () => {
    const emptyLibrary = { ...emptyPersonalLibrary };
    setPersonalLibrary(emptyLibrary);
    writePersonalLibrary(emptyLibrary);
    setLibraryNotice("Библиотека очищена");
    window.setTimeout(() => setLibraryNotice("Личная библиотека"), 1200);
  };

  const copyMessage = async () => {
    if (!analysis || !finalMessage.trim()) return;
    if (!analysis.coachState.sendReadiness.canCopy) {
      setCopyLabel("Сначала пауза");
      window.setTimeout(() => setCopyLabel("Пока не копировать"), 1200);
      return;
    }

    await navigator.clipboard?.writeText(finalMessage);
    setCopyLabel("Скопировано");
    window.setTimeout(() => setCopyLabel("Скопировать"), 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/95 px-5 py-4 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
              Difficult Conversations Coach
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">
              Тренажер сложного разговора
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {contexts.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={context === item.id ? "default" : "outline"}
                size="sm"
                onClick={() => setContext(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="space-y-4">
          <Card className="border-primary/20 bg-card/95 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquareText className="h-4 w-4 text-primary" />
                Ситуация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <QuickSelect
                  resetKey={`fear-${context}-${selectVersion}`}
                  label="Страх"
                  placeholder="Добавить страх"
                  options={fearOptionsByContext[context]}
                  onSelect={(value) => appendField("fear", value)}
                />
                <QuickSelect
                  resetKey={`want-${context}-${selectVersion}`}
                  label="Цель"
                  placeholder="Добавить цель"
                  options={wantOptionsByContext[context]}
                  onSelect={(value) => appendField("want", value)}
                />
                <QuickSelect
                  resetKey={`state-${context}-${selectVersion}`}
                  label="Состояние"
                  placeholder="Что с телом"
                  options={stateOptions}
                  onSelect={(value) => appendField("situation", value)}
                />
                <QuickSelect
                  resetKey={`reaction-${context}-${selectVersion}`}
                  label="Реакция другого"
                  placeholder="Что делает другой"
                  options={otherReactionOptions}
                  onSelect={(value) => appendField("situation", value)}
                />
              </div>
              <Field
                id="situation"
                label="Что произошло"
                value={form.situation}
                placeholder={placeholders.situation}
                onChange={(value) => updateField("situation", value)}
                rows={5}
              />
              <Field
                id="draft"
                label="Черновик сообщения"
                value={form.draft}
                placeholder={placeholders.draft}
                onChange={(value) => updateField("draft", value)}
                rows={4}
              />
              <Field
                id="fear"
                label="Самый болезненный страх"
                value={form.fear}
                placeholder={placeholders.fear}
                onChange={(value) => updateField("fear", value)}
                rows={2}
              />
              <Field
                id="want"
                label="Чего хочется на самом деле"
                value={form.want}
                placeholder={placeholders.want}
                onChange={(value) => updateField("want", value)}
                rows={2}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                <Button type="button" onClick={insertExample}>
                  <Sparkles className="h-4 w-4" />
                  Пример
                </Button>
                <Button type="button" variant="secondary" onClick={saveCurrentCase} disabled={!hasContent(form)}>
                  <Save className="h-4 w-4" />
                  {saveLabel}
                </Button>
                <Button type="button" variant="outline" onClick={clearForm}>
                  <Eraser className="h-4 w-4" />
                  Очистить
                </Button>
              </div>
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <FolderOpen className="h-3.5 w-3.5" />
                    Сохраненные разборы
                  </span>
                  <div className="flex items-center gap-2">
                    <span>Сохранено: {savedCases.length}</span>
                    {savedCases.length > 0 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={clearSavedCases}
                      >
                        Очистить разборы
                      </Button>
                    )}
                  </div>
                </div>
                {savedCases.length > 0 ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={savedSearch}
                        onChange={(event) => setSavedSearch(event.target.value)}
                        placeholder="Найти сохраненный разбор"
                        className="h-9 bg-card pl-8 text-xs"
                      />
                    </div>
                    {filteredSavedCases.length > 0 ? (
                      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                        {filteredSavedCases.map((item) => (
                          <div key={item.id} className="rounded-md border border-border bg-card p-2">
                            <div className="flex items-start justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => loadSavedCase(item.id)}
                                className="min-w-0 flex-1 text-left text-xs font-medium leading-relaxed text-foreground hover:text-primary"
                              >
                                {item.title}
                              </button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 shrink-0"
                                aria-label={`Удалить разбор ${item.title}`}
                                onClick={() => deleteSavedCase(item.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                              <Badge variant="outline">{getContextLabel(item.context)}</Badge>
                              {formatSavedDate(item.createdAt) && <span>{formatSavedDate(item.createdAt)}</span>}
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="ml-auto h-7 px-2 text-xs"
                                onClick={() => loadSavedCase(item.id)}
                              >
                                Открыть
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-md border border-dashed border-primary/20 bg-card p-3 text-xs leading-relaxed text-muted-foreground">
                        Ничего не нашлось. Попробуйте другое слово из ситуации, страха или цели.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed border-primary/20 bg-card p-3 text-xs leading-relaxed text-muted-foreground">
                    Пока ничего нет. Сохраните разбор, чтобы вернуться к нему позже.
                  </p>
                )}
              </div>
              <div className="rounded-md border border-warning/25 bg-warning/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Library className="h-3.5 w-3.5" />
                    {libraryNotice}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>Записей: {totalLibraryItems}</span>
                    {totalLibraryItems > 0 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={clearPersonalLibrary}
                      >
                        Очистить библиотеку
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(Object.keys(libraryBucketConfig) as LibraryBucket[]).map((bucket) => (
                    <LibrarySelect
                      key={bucket}
                      resetKey={`library-${bucket}-${totalLibraryItems}-${selectVersion}`}
                      label={libraryBucketConfig[bucket].label}
                      placeholder={libraryBucketConfig[bucket].placeholder}
                      items={personalLibrary[bucket]}
                      onSelect={(value) => insertLibraryItem(bucket, value)}
                    />
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => saveToLibrary("triggers", form.fear || form.situation)}
                    disabled={!form.fear.trim() && !form.situation.trim()}
                  >
                    <BookmarkPlus className="h-3.5 w-3.5" />
                    Триггер
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => saveToLibrary("automaticReactions", getDiaryDetail("Автоматическая реакция") || form.draft)}
                    disabled={!analysis && !form.draft.trim()}
                  >
                    <BookmarkPlus className="h-3.5 w-3.5" />
                    Авто
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      saveToLibrary("alternativeReactions", getDiaryDetail("Альтернативная реакция") || finalMessage)
                    }
                    disabled={!analysis && !finalMessage.trim()}
                  >
                    <BookmarkPlus className="h-3.5 w-3.5" />
                    Альтернатива
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => saveToLibrary("safePhrases", finalMessage)}
                    disabled={!finalMessage.trim()}
                  >
                    <BookmarkPlus className="h-3.5 w-3.5" />
                    Сохранить фразу
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => saveToLibrary("pausePhrases", pausePhraseByContext[context])}
                  >
                    <BookmarkPlus className="h-3.5 w-3.5" />
                    Пауза
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {!analysis && <EmptyHint />}
        </section>

        <section className="space-y-4">
          {analysis?.safety && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm leading-relaxed text-destructive">
              <div className="mb-1 flex items-center gap-2 font-semibold">
                <Shield className="h-4 w-4" />
                Сначала безопасность
              </div>
              Если есть угрозы, контроль, принуждение или самоповреждение, тренажер не помогает убеждать себя
              терпеть и не подталкивает отправлять сообщение.
            </div>
          )}

          {!analysis ? (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <PlaceholderPanel
                  icon={Brain}
                  title="Разбор появится здесь"
                  text="Факт, интерпретация, эмоция, импульс и потребность соберутся после первого ввода."
                />
                <PlaceholderPanel
                  icon={BookOpenCheck}
                  title="КПТ-дневник"
                  text="Автоматическая мысль, первая реакция и более сбалансированная альтернатива."
                />
                <PlaceholderPanel
                  icon={Shield}
                  title="Регуляция"
                  text="При перегрузке, freeze или диссоциации сначала появится план стабилизации."
                />
                <PlaceholderPanel
                  icon={HeartHandshake}
                  title="Педагогический мост"
                  text="Для сопротивления, избегания и случаев, где человеку нужен пример другого поведения."
                />
              </div>
              <TechniqueLibrary />
            </>
          ) : (
            <>
              <FocusPanel analysis={analysis} finalMessage={finalMessage} copyLabel={copyLabel} onCopy={copyMessage} />

              <Accordion type="multiple" defaultValue={["phrase"]} className="space-y-3">
                <AccordionPanel icon={Clipboard} title="Фраза" value="phrase">
                  <Tabs value={activeTone} onValueChange={(value) => setSelectedTone(value as ToneId)}>
                    <TabsList className="mb-3 flex h-auto flex-wrap justify-start">
                      {Object.entries(analysis.toneLabels).map(([tone, label]) => (
                        <TabsTrigger key={tone} value={tone} className="text-xs">
                          {label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                  <Textarea readOnly value={finalMessage} className="min-h-32 resize-none bg-background leading-relaxed" />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                      {analysis.coachState.sendReadiness.canCopy ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                      )}
                      <span>{analysis.coachState.sendReadiness.detail}</span>
                    </div>
                    <Button
                      type="button"
                      variant={analysis.coachState.sendReadiness.canCopy ? "default" : "outline"}
                      onClick={copyMessage}
                    >
                      <Copy className="h-4 w-4" />
                      {analysis.coachState.sendReadiness.canCopy ? copyLabel : "Пока не копировать"}
                    </Button>
                  </div>
                </AccordionPanel>

                <AccordionPanel icon={Brain} title="Карта реакции" value="map">
                  <div className="grid gap-3 md:grid-cols-2">
                    {analysis.reflection.map(([title, detail]) => (
                      <InfoBlock key={title} title={title} detail={detail} />
                    ))}
                  </div>
                </AccordionPanel>

                <AccordionPanel icon={Shield} title={analysis.regulationPlan.title} value="regulation">
                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                    {analysis.regulationPlan.principle}
                  </p>
                  <div className="grid gap-3 lg:grid-cols-3">
                    {analysis.regulationPlan.steps.map(([title, detail]) => (
                      <InfoBlock key={title} title={title} detail={detail} />
                    ))}
                    <div className="rounded-md border border-warning/35 bg-warning/10 p-3">
                      <h3 className="text-sm font-semibold">Не делать</h3>
                      <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground">
                        {analysis.regulationPlan.avoid.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AccordionPanel>

                <AccordionPanel icon={BookOpenCheck} title="Эмоциональный дневник КПТ" value="cbt">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {analysis.cbtDiary.map(([title, detail]) => (
                      <InfoBlock key={title} title={title} detail={detail} />
                    ))}
                  </div>
                </AccordionPanel>

                <AccordionPanel icon={AlertTriangle} title="Паттерны в черновике" value="patterns">
                  <div className="grid gap-3 md:grid-cols-2">
                    {analysis.patterns.map((pattern) => (
                      <div
                        key={pattern.id}
                        className={cn(
                          "rounded-md border p-3",
                          pattern.hit ? "border-warning/45 bg-warning/10" : "border-border bg-background",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold">{pattern.title}</h3>
                          <Badge variant={pattern.hit ? "default" : "outline"}>
                            {pattern.hit ? "замечено" : pattern.marker}
                          </Badge>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {pattern.hit ? pattern.antidote : neutralPatternText[pattern.id]}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionPanel>

                <AccordionPanel icon={HeartHandshake} title="Педагогический мост" value="pedagogical">
                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">{analysis.pedagogicalBridge.title}.</span>{" "}
                    {analysis.pedagogicalBridge.principle}
                  </p>
                  <div className="grid gap-3 lg:grid-cols-3">
                    {analysis.pedagogicalBridge.cards.map(([title, detail]) => (
                      <InfoBlock key={title} title={title} detail={detail} />
                    ))}
                    {analysis.pedagogicalBridge.examples.map((example) => (
                      <div key={example.title} className="rounded-md border border-primary/25 bg-primary/5 p-3">
                        <h3 className="text-sm font-semibold text-primary">{example.title}</h3>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{example.text}</p>
                      </div>
                    ))}
                  </div>
                </AccordionPanel>

                <AccordionPanel icon={Lightbulb} title="Коммуникационные приемы" value="techniques">
                  <TechniqueCards />
                </AccordionPanel>
              </Accordion>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

const Field = ({
  id,
  label,
  value,
  placeholder,
  onChange,
  rows,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  rows: number;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Textarea
      id={id}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="resize-none leading-relaxed"
    />
  </div>
);

const QuickSelect = ({
  resetKey,
  label,
  placeholder,
  options,
  onSelect,
}: {
  resetKey: string;
  label: string;
  placeholder: string;
  options: QuickOption[];
  onSelect: (value: string) => void;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <Select key={resetKey} onValueChange={onSelect}>
      <SelectTrigger className="h-9 bg-card text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const LibrarySelect = ({
  resetKey,
  label,
  placeholder,
  items,
  onSelect,
}: {
  resetKey: string;
  label: string;
  placeholder: string;
  items: LibraryItem[];
  onSelect: (value: string) => void;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <Select
      key={resetKey}
      disabled={!items.length}
      onValueChange={(id) => {
        const item = items.find((entry) => entry.id === id);
        if (item) onSelect(item.value);
      }}
    >
      <SelectTrigger className="h-9 bg-card text-xs">
        <SelectValue placeholder={items.length ? placeholder : "Пока пусто"} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const AccordionPanel = ({
  icon: Icon,
  title,
  value,
  children,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  children: ReactNode;
}) => (
  <AccordionItem value={value} className="rounded-lg border border-border bg-card px-4 shadow-sm">
    <AccordionTrigger className="gap-3 py-4 text-left text-base font-semibold hover:no-underline">
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        <span className="truncate">{title}</span>
      </span>
    </AccordionTrigger>
    <AccordionContent className="pb-4 pt-0">{children}</AccordionContent>
  </AccordionItem>
);

const FocusPanel = ({
  analysis,
  finalMessage,
  copyLabel,
  onCopy,
}: {
  analysis: DialogueAnalysis;
  finalMessage: string;
  copyLabel: string;
  onCopy: () => void;
}) => (
  <Card
    className={cn(
      "border-l-4 bg-card/95 shadow-sm",
      analysis.coachState.sendReadiness.canCopy ? "border-l-success" : "border-l-warning",
    )}
  >
    <CardContent className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant={analysis.safety ? "destructive" : "secondary"}>
          {coachModuleLabels[analysis.coachState.module] || "Коуч"}
        </Badge>
        <Badge variant="outline">{analysis.coachState.sendReadiness.label}</Badge>
      </div>
      <div>
        <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
          <ListChecks className="h-4 w-4 text-primary" />
          Главный следующий шаг
        </div>
        <h2 className="text-lg font-semibold">{analysis.coachState.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{analysis.coachState.nextStep}</p>
      </div>
      <p className="rounded-md bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        {analysis.coachState.focus}
      </p>
      {finalMessage.trim() && (
        <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
          <div className="mb-2 text-xs font-semibold text-primary">Короткая рабочая фраза</div>
          <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{finalMessage}</p>
          <Button
            type="button"
            size="sm"
            variant={analysis.coachState.sendReadiness.canCopy ? "default" : "outline"}
            className="mt-3"
            onClick={onCopy}
          >
            <Copy className="h-3.5 w-3.5" />
            {analysis.coachState.sendReadiness.canCopy
              ? copyLabel === "Скопировать"
                ? "Скопировать фразу"
                : copyLabel
              : "Сначала пауза"}
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

const TechniqueCards = () => (
  <div className="grid gap-3 lg:grid-cols-2">
    {communicationTechniques.map((technique) => (
      <div key={technique.id} className="rounded-md border border-border bg-background p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-semibold">{technique.title}</h3>
          <Badge variant="outline">{technique.tag}</Badge>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{technique.principle}</p>
        <ul className="mt-3 space-y-1 text-xs leading-relaxed text-muted-foreground">
          {technique.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
        <p className="mt-3 rounded-md bg-primary/5 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {technique.example}
        </p>
      </div>
    ))}
  </div>
);

const TechniqueLibrary = () => (
  <Card>
    <Accordion type="single" collapsible>
      <AccordionItem value="techniques" className="border-0 px-5">
        <AccordionTrigger className="py-5 text-left hover:no-underline">
          <span className="flex items-center gap-2 text-base font-semibold">
            <Lightbulb className="h-4 w-4 text-primary" />
            Коммуникационные приемы
          </span>
        </AccordionTrigger>
        <AccordionContent className="pb-5 pt-0">
          <TechniqueCards />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </Card>
);

const InfoBlock = ({ title, detail }: { title: string; detail: string }) => (
  <div className="rounded-md border border-border bg-background p-3">
    <h3 className="text-sm font-semibold">{title}</h3>
    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
  </div>
);

const PlaceholderPanel = ({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) => (
  <div className="rounded-lg border border-dashed border-primary/25 bg-card/80 p-5">
    <Icon className="mb-3 h-5 w-5 text-primary" />
    <h2 className="text-sm font-semibold">{title}</h2>
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
  </div>
);

const EmptyHint = () => (
  <Card className="border-dashed border-primary/30 bg-card/80">
    <CardContent className="p-5 text-sm leading-relaxed text-muted-foreground">
      Заполните ситуацию или вставьте пример. Разбор строится локально: сначала регуляция, потом смысл,
      потребность и фраза.
    </CardContent>
  </Card>
);

export { DialogueCoach };
