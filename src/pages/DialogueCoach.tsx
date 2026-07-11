import { type ReactNode, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  Copy,
  HeartHandshake,
  Lightbulb,
  ListChecks,
  MessageSquareText,
  RotateCcw,
  Shield,
  Wand2,
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
type DialogueAnalysis = ReturnType<typeof analyzeDialogue>;

const contexts: Array<{ id: ContextId; label: string; hint: string }> = [
  { id: "partner", label: "Партнёр", hint: "близкие отношения, расставание, ссора" },
  { id: "family", label: "Семья", hint: "родители, дети, братья и сёстры" },
  { id: "friend", label: "Друг", hint: "дружба, обида, отдаление" },
  { id: "work", label: "Работа", hint: "коллеги, руководитель, границы" },
];

const emptyForm: FormState = { situation: "", draft: "", fear: "", want: "" };

const examplesByContext: Record<ContextId, FormState[]> = {
  partner: [
    {
      situation:
        "Партнёр сказал, что не готов продолжать отношения, и мы расстались. После этого он то выходит на связь тепло, то снова отдаляется. Мне больно, тревожно и хочется понять, была ли я ему важна.",
      draft: "Ты просто использовал меня и опять исчез. Если тебе всё равно, так и скажи.",
      fear: "меня не выбрали и легко оставили",
      want: "ясность, уважение к моей боли и возможность не разрушать себя",
    },
    {
      situation:
        "Партнёр прочитал сообщение утром, весь день молчал, а вечером написал сухое «я занят». Я почувствовала тревогу, злость и желание отправить ещё десять сообщений.",
      draft: "Ты всегда так делаешь. Тебе просто плевать, что я переживаю.",
      fear: "если я не напомню о себе, связь исчезнет",
      want: "понятный срок ответа и контакт без давления",
    },
    {
      situation:
        "Партнёрша сказала, что ей нужно больше свободы и она не уверена в отношениях. Я почувствовал злость, стыд и страх, что меня сравнивают с кем-то лучше.",
      draft:
        "Если тебе нужен кто-то другой, так и скажи. Я не собираюсь унижаться и выпрашивать внимание.",
      fear: "меня заменят, я окажусь недостаточно хорошим",
      want: "ясность без унижения и возможность сохранить достоинство",
    },
    {
      situation:
        "После ссоры партнёр закрылся и сказал, что не хочет сейчас разговаривать. Он не назвал, когда вернётся к теме, и я зависла в тревоге.",
      draft: "Опять сбегаешь. Нормально поговорить с тобой невозможно.",
      fear: "пауза превратится в исчезновение",
      want: "пауза с конкретным сроком возвращения",
    },
    {
      situation:
        "Партнёр при друзьях пошутил о моей ревности. Все засмеялись, а мне стало стыдно и захотелось наказать его холодом.",
      draft: "Спасибо, что унизил меня перед всеми. Очень взрослый поступок.",
      fear: "мою уязвимость выставят смешной",
      want: "сказать, что это задело, без публичной мести",
    },
    {
      situation:
        "Мы договаривались провести вечер вместе, но партнёр в последний момент остался на встрече с друзьями и написал об этом уже по факту.",
      draft: "Классно, что твои друзья всегда важнее меня.",
      fear: "я снова окажусь запасным вариантом",
      want: "уважение к договорённостям и предупреждение заранее",
    },
    {
      situation:
        "Партнёр говорит, что я слишком остро реагирую, когда прошу обсуждать деньги заранее. Мне хочется доказать, что я не меркантильная.",
      draft: "Если тебе всё равно на общие расходы, тогда сам всё и оплачивай.",
      fear: "мои потребности назовут жадностью или контролем",
      want: "спокойный разговор о бюджете и ответственности",
    },
    {
      situation:
        "После расставания партнёр лайкает мои сторис и иногда пишет нейтральные сообщения. Я снова начинаю надеяться и теряю опору.",
      draft: "Зачем ты это делаешь, если не хочешь быть со мной? Оставь меня в покое.",
      fear: "меня держат рядом без выбора",
      want: "граница после расставания и меньше эмоциональных качелей",
    },
    {
      situation:
        "Партнёр сказал, что ему неприятно, когда я обсуждаю наши ссоры с подругой. Я почувствовала вину и одновременно злость, потому что мне нужна поддержка.",
      draft: "Тебе просто удобно, чтобы я молчала и никому ничего не рассказывала.",
      fear: "моё право на поддержку назовут предательством",
      want: "договориться о приватности без запрета на поддержку",
    },
    {
      situation:
        "Партнёр резко ответил на мою просьбу о помощи по дому: «я и так устаю». Я замолчала, но внутри накопилась обида.",
      draft: "Ну да, конечно, устаёшь только ты. Я тут просто мебель.",
      fear: "мой труд снова станет невидимым",
      want: "разделение нагрузки без соревнования, кому тяжелее",
    },
  ],
  family: [
    {
      situation:
        "Мама при родственниках сказала, что я опять всё усложняю. Я почувствовала злость, стыд и желание закрыться.",
      draft: "Ты всегда меня стыдишь при других. Хватит уже.",
      fear: "меня не воспринимают всерьёз",
      want: "уважение, спокойный тон, право на границу",
    },
    {
      situation:
        "Отец без предупреждения пришёл ко мне домой и сказал, что семья имеет право знать, что со мной происходит. Я напряглась и разозлилась.",
      draft: "Ты вообще не понимаешь границ. Перестань лезть в мою жизнь.",
      fear: "мои границы снова не будут считаться настоящими",
      want: "тёплый контакт, но с уважением к моему пространству",
    },
    {
      situation:
        "Ребёнок резко ответил учительнице после конфликта с братом и сестрой утром. Я хочу помочь ему понять, что реакция была не только на учительницу.",
      draft: "Нельзя так разговаривать со взрослыми.",
      fear: "он будет думать, что его просто ругают",
      want: "помочь ребёнку доформулировать, что с ним произошло",
    },
    {
      situation:
        "Сестра в семейном чате написала, что я опять пропала и всё на неё свалила. Я почувствовала вину и желание оправдываться длинным сообщением.",
      draft: "Ты даже не представляешь, что у меня происходит. Не надо делать из себя жертву.",
      fear: "меня увидят эгоистичной и неблагодарной",
      want: "признать её нагрузку и обозначить свои реальные возможности",
    },
    {
      situation:
        "Родители настаивают, чтобы я приехала на праздник, хотя я заранее сказала, что не могу. Они говорят, что семья должна быть на первом месте.",
      draft: "Вы всегда давите чувством вины. Делайте праздник без меня.",
      fear: "если я откажусь, связь разрушится",
      want: "сказать нет без обрыва контакта",
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
        "Свекровь без спроса дала советы по воспитанию ребёнка и сказала, что в её время дети были спокойнее. Я почувствовала злость и беспомощность.",
      draft: "Спасибо, но мы как-нибудь сами разберёмся без ваших лекций.",
      fear: "моё родительство обесценят",
      want: "остановить советы и сохранить рабочий семейный контакт",
    },
    {
      situation:
        "Брат в семейном чате пошутил, что я опять всё драматизирую. Я хотел ответить жёстко, чтобы все наконец поняли, что это не смешно.",
      draft: "Ты всегда лезешь со своими шутками. Повзрослей уже.",
      fear: "меня не воспринимают всерьёз",
      want: "остановить шутки без унижения и без семейной войны",
    },
    {
      situation:
        "Подросток хлопнул дверью и сказал, что я ничего не понимаю. Я испугалась, что теряю контакт, и захотела сразу наказать.",
      draft: "Раз так разговариваешь, можешь забыть про свои планы на выходные.",
      fear: "если я не поставлю жёсткую границу, меня перестанут уважать",
      want: "сохранить родительскую границу и не потерять контакт",
    },
    {
      situation:
        "Мама сравнила меня с братом и сказала, что он хотя бы умеет строить жизнь. Я почувствовала стыд и желание доказать, что я не хуже.",
      draft: "Ну конечно, он у тебя всегда идеальный, а я вечная проблема.",
      fear: "меня любят только за достижения",
      want: "не участвовать в сравнении и попросить говорить со мной напрямую",
    },
  ],
  friend: [
    {
      situation:
        "Подруга второй раз отменила встречу в последний момент и потом написала как ни в чём не бывало. Мне обидно.",
      draft: "Если тебе всё равно, так и скажи. Я устала подстраиваться.",
      fear: "я навязываюсь, дружба важна только мне",
      want: "честность, тепло и понятные договорённости",
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
        "Близкая подруга стала отвечать реже и коротко. Я понимаю, что у неё может быть много дел, но внутри растёт тревога, что дружба закончилась.",
      draft: "Ты уже просто не хочешь общаться, да? Можно было сказать прямо.",
      fear: "меня тихо заменят и не скажут",
      want: "прояснить дистанцию без обвинения",
    },
    {
      situation:
        "Друг рассказал другим то, что я говорил ему лично. Я почувствовал злость и желание просто оборвать контакт.",
      draft: "После такого я тебе больше ничего не расскажу. Делай вид, что всё нормально.",
      fear: "моей уязвимостью воспользуются",
      want: "обозначить границу доверия и понять, можно ли его восстановить",
    },
    {
      situation:
        "Подруга попросила занять денег, хотя прошлый долг ещё не вернула. Я боюсь отказать и выглядеть мелочной.",
      draft: "Может, сначала старый долг вспомнишь, прежде чем просить новый?",
      fear: "если я откажу, меня сочтут плохой подругой",
      want: "денежная граница без стыда и скрытой злости",
    },
    {
      situation:
        "Друг несколько раз не позвал меня на встречи общей компании, а потом сказал, что я сам редко проявляюсь. Мне стало обидно, но я не хочу выглядеть нуждающимся.",
      draft: "Да ладно, мне всё равно. Теперь понятно, кто кому друг.",
      fear: "если я скажу, что мне обидно, это будет выглядеть слабостью",
      want: "прояснить дружбу без проверки значимости и без сарказма",
    },
    {
      situation:
        "Подруга во время моего рассказа сразу начала давать советы и перебивать. Я хотела поддержки, а почувствовала себя проектом для исправления.",
      draft: "Я вообще-то не просила тебя меня лечить.",
      fear: "мои чувства снова не выдержат и начнут чинить",
      want: "попросить сначала выслушать, а потом уже советовать",
    },
    {
      situation:
        "Друг пришёл на встречу на сорок минут позже и сказал, что я слишком серьёзно отношусь ко времени. Я почувствовала, что мной пренебрегли.",
      draft: "Если тебе всё равно на моё время, больше не договариваемся.",
      fear: "мои договорённости не важны",
      want: "уважение ко времени и предупреждение заранее",
    },
    {
      situation:
        "В компании обсуждали отпуск, и подруга сказала: «тебя всё равно сложно куда-то вытащить». Мне стало больно, потому что меня даже не спросили.",
      draft: "Очень удобно решить за меня и потом сделать вид, что я сама виновата.",
      fear: "меня исключают, а потом обвиняют в дистанции",
      want: "быть приглашённой напрямую и иметь право выбрать",
    },
    {
      situation:
        "Друг поддержал другого человека в споре, не спросив мою сторону. Я почувствовала предательство и желание отстраниться.",
      draft: "Спасибо, что даже не попытался понять, что было на самом деле.",
      fear: "меня не защитят и не услышат",
      want: "сказать о боли и попросить сначала уточнять мою сторону",
    },
  ],
  work: [
    {
      situation:
        "Коллега отменил встречу за десять минут и не предложил новое время. Из-за этого завис мой срок.",
      draft: "Ты вообще думаешь о том, что у других тоже сроки?",
      fear: "на мне останется чужая ответственность",
      want: "рабочая ясность, сроки, уважение к моему вкладу",
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
        "Коллега взял мою часть презентации и представил её как свою. Я почувствовал злость и желание публично поставить его на место.",
      draft: "Классно присвоил мою работу. В следующий раз хотя бы постарайся не палиться.",
      fear: "мой вклад снова станет невидимым",
      want: "зафиксировать авторство и договориться о правилах без публичной атаки",
    },
    {
      situation:
        "Команда снова принесла срочную задачу в пятницу вечером. Формально это важно, но я уже несколько недель перерабатываю.",
      draft: "Конечно, давайте опять спасать всё за мой счёт.",
      fear: "если я откажу, меня сочтут ненадёжной",
      want: "приоритеты, срок и граница по переработкам",
    },
    {
      situation:
        "Клиент написал резко и поставил в копию руководителя. Мне захотелось ответить так же жёстко и доказать, что проблема не во мне.",
      draft: "Вы сами затянули согласование, а теперь перекладываете ответственность.",
      fear: "меня сделают виноватым перед руководителем",
      want: "зафиксировать факты и следующий шаг без эскалации",
    },
    {
      situation:
        "Коллега постоянно пишет мне в личные сообщения после рабочего дня с мелкими вопросами. Я отвечаю, а потом злюсь на себя.",
      draft: "У тебя вообще есть понимание, что рабочий день закончился?",
      fear: "если я не отвечу, меня назовут некомандной",
      want: "граница по времени и понятный канал для несрочных вопросов",
    },
    {
      situation:
        "На performance review руководитель сказал, что мне нужно быть более заметной, но не объяснил, что именно это значит. Я растерялась.",
      draft: "Очень удобно давать такие абстрактные претензии без критериев.",
      fear: "от меня ждут невозможного, а оценят субъективно",
      want: "конкретные ожидания, примеры и план роста",
    },
    {
      situation:
        "Новый коллега регулярно просит меня объяснять базовые вещи, хотя это не моя зона ответственности. Я хочу помочь, но мои задачи стоят.",
      draft: "Я не могу постоянно быть твоей службой поддержки.",
      fear: "если я ограничу помощь, меня посчитают грубой",
      want: "помочь без потери своих сроков и договориться о формате",
    },
    {
      situation:
        "На созвоне мою идею проигнорировали, а через неделю похожее предложение другого коллеги поддержали. Я почувствовала злость и невидимость.",
      draft: "Интересно, когда это говорю я — тишина, а когда он — отличная идея.",
      fear: "мой вклад заметят только через чужой голос",
      want: "вернуть авторство и обсудить идею по существу",
    },
  ],
};

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

type StepId = "context" | "situation" | "feelings" | "draft" | "result";

const stepOrder: StepId[] = ["context", "situation", "feelings", "draft", "result"];

const stepMeta: Record<StepId, { index: number; title: string; hint: string }> = {
  context: { index: 1, title: "С кем разговор", hint: "Выбери, чтобы подстроить примеры и тон." },
  situation: { index: 2, title: "Что произошло", hint: "Только факт: что видно и слышно, без выводов." },
  feelings: { index: 3, title: "Страх и цель", hint: "Что болит внутри и чего хочется на самом деле." },
  draft: { index: 4, title: "Черновик (необязательно)", hint: "Первая версия, которая просится наружу." },
  result: { index: 5, title: "Разбор", hint: "Регуляция, смысл, паттерны и рабочая фраза." },
};

const DialogueCoach = () => {
  const [step, setStep] = useState<StepId>("context");
  const [context, setContext] = useState<ContextId | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedTone, setSelectedTone] = useState<ToneId>("soft");
  const [copyLabel, setCopyLabel] = useState("Скопировать");
  const [exampleIndexes, setExampleIndexes] = useState<Record<ContextId, number>>({
    partner: 0,
    family: 0,
    friend: 0,
    work: 0,
  });

  const analysis = useMemo(() => {
    if (!context) return null;
    if (!form.situation.trim() && !form.draft.trim()) return null;
    return analyzeDialogue({ ...form, context });
  }, [context, form]);

  const activeTone = (analysis?.formulations[selectedTone]
    ? selectedTone
    : analysis?.defaultTone || "soft") as ToneId;
  const finalMessage = analysis?.formulations[activeTone] || "";

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const goNext = () => {
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex < stepOrder.length - 1) setStep(stepOrder[currentIndex + 1]);
  };

  const goBack = () => {
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) setStep(stepOrder[currentIndex - 1]);
  };

  const restart = () => {
    setStep("context");
    setContext(null);
    setForm(emptyForm);
    setSelectedTone("soft");
    setCopyLabel("Скопировать");
    setExampleIndexes({ partner: 0, family: 0, friend: 0, work: 0 });
  };

  const insertExample = () => {
    if (!context) return;
    const examples = examplesByContext[context];
    const currentIndex = exampleIndexes[context] || 0;
    setForm(examples[currentIndex % examples.length]);
    setExampleIndexes((current) => ({ ...current, [context]: currentIndex + 1 }));
    setSelectedTone("soft");
  };

  const copyMessage = async () => {
    if (!analysis || !finalMessage.trim()) return;
    if (!analysis.coachState.sendReadiness.canCopy) {
      setCopyLabel("Сначала пауза");
      window.setTimeout(() => setCopyLabel("Пока не копировать"), 1500);
      return;
    }
    await navigator.clipboard?.writeText(finalMessage);
    setCopyLabel("Скопировано");
    window.setTimeout(() => setCopyLabel("Скопировать"), 1500);
  };

  const canProceed =
    (step === "context" && Boolean(context)) ||
    (step === "situation" && form.situation.trim().length > 5) ||
    step === "feelings" ||
    step === "draft" ||
    step === "result";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-4">
          <div className="min-w-0">
            <div className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
              Difficult Conversations Coach
            </div>
            <h1 className="mt-0.5 truncate text-lg font-semibold text-foreground">
              Тренажер сложного разговора
            </h1>
          </div>
          {(context || form.situation) && (
            <Button variant="ghost" size="sm" onClick={restart} className="shrink-0 whitespace-nowrap text-xs">
              <RotateCcw className="h-3.5 w-3.5" />
              Заново
            </Button>
          )}
        </div>
        <StepBar current={step} />
      </header>

      <main className="mx-auto max-w-2xl px-5 py-8">
        <StepShell step={step}>
          {step === "context" && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {contexts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setContext(item.id);
                      setStep("situation");
                    }}
                    className={cn(
                      "rounded-lg border p-4 text-left transition-colors",
                      context === item.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <div className="text-base font-semibold text-foreground">{item.label}</div>
                    <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {item.hint}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "situation" && (
            <div className="space-y-4">
              <Textarea
                autoFocus
                rows={7}
                value={form.situation}
                onChange={(event) => updateField("situation", event.target.value)}
                placeholder="Опиши, что реально произошло. Один эпизод, без выводов о мотивах другого."
                className="resize-none leading-relaxed"
              />
              <button
                type="button"
                onClick={insertExample}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Заполнить примером
              </button>
            </div>
          )}

          {step === "feelings" && (
            <div className="space-y-5">
              <FieldBlock
                label="Самый болезненный страх"
                hint="Что мозг достраивает в самой худшей версии."
                value={form.fear}
                placeholder="меня не выбрали, я не важна, меня легко оставить..."
                onChange={(value) => updateField("fear", value)}
              />
              <FieldBlock
                label="Чего хочется на самом деле"
                hint="Не действие другого — а состояние, которое ты защищаешь."
                value={form.want}
                placeholder="ясность, уважение, спокойный тон, не разрушать себя..."
                onChange={(value) => updateField("want", value)}
              />
            </div>
          )}

          {step === "draft" && (
            <div className="space-y-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Резкий и «неправильный» — то, что нужно. Тренажер отделит боль от импульса и покажет
                паттерны.
              </p>
              <Textarea
                autoFocus
                rows={6}
                value={form.draft}
                onChange={(event) => updateField("draft", event.target.value)}
                placeholder="Можно вставить первую версию сообщения или пропустить этот шаг."
                className="resize-none leading-relaxed"
              />
            </div>
          )}

          {step === "result" && analysis && (
            <AnalysisView
              analysis={analysis}
              activeTone={activeTone}
              onToneChange={(tone) => setSelectedTone(tone)}
              finalMessage={finalMessage}
              copyLabel={copyLabel}
              onCopy={copyMessage}
            />
          )}

          {step === "result" && !analysis && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Не хватает данных для разбора. Вернись назад и опиши ситуацию хотя бы одним
              предложением.
            </p>
          )}
        </StepShell>

        {step !== "context" && (
          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={goBack} className="shrink-0 whitespace-nowrap">
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
            {step !== "result" ? (
              <Button onClick={goNext} disabled={!canProceed} className="shrink-0 whitespace-nowrap">
                {step === "draft" ? "Показать разбор" : "Далее"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" onClick={restart} className="shrink-0 whitespace-nowrap">
                <RotateCcw className="h-4 w-4" />
                Новый разбор
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const StepBar = ({ current }: { current: StepId }) => {
  const currentIndex = stepOrder.indexOf(current);
  return (
    <div className="mx-auto flex max-w-2xl items-center gap-1.5 px-5 pb-4">
      {stepOrder.map((id, index) => (
        <div
          key={id}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            index <= currentIndex ? "bg-primary" : "bg-border",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
};

const StepShell = ({ step, children }: { step: StepId; children: ReactNode }) => {
  const meta = stepMeta[step];
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7">
      <div className="mb-5">
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Шаг {meta.index} из {stepOrder.length}
        </div>
        <h2 className="mt-1 text-xl font-semibold text-foreground">{meta.title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{meta.hint}</p>
      </div>
      {children}
    </section>
  );
};

const FieldBlock = ({
  label,
  hint,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) => (
  <div className="space-y-2">
    <div>
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
    <Textarea
      rows={3}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="resize-none leading-relaxed"
    />
  </div>
);

const AnalysisView = ({
  analysis,
  activeTone,
  onToneChange,
  finalMessage,
  copyLabel,
  onCopy,
}: {
  analysis: DialogueAnalysis;
  activeTone: ToneId;
  onToneChange: (tone: ToneId) => void;
  finalMessage: string;
  copyLabel: string;
  onCopy: () => void;
}) => (
  <div className="space-y-5">
    {analysis.safety && (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm leading-relaxed text-destructive">
        <div className="mb-1 flex items-center gap-2 font-semibold">
          <Shield className="h-4 w-4" />
          Сначала безопасность
        </div>
        Если есть угрозы, контроль, принуждение или самоповреждение, тренажёр не помогает убеждать
        себя терпеть и не подталкивает отправлять сообщение.
      </div>
    )}

    <div
      className={cn(
        "rounded-lg border-l-4 bg-card p-4",
        analysis.coachState.sendReadiness.canCopy ? "border-l-success" : "border-l-warning",
      )}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <Badge variant={analysis.safety ? "destructive" : "secondary"}>
          {coachModuleLabels[analysis.coachState.module] || "Коуч"}
        </Badge>
        <Badge variant="outline">{analysis.coachState.sendReadiness.label}</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <ListChecks className="h-4 w-4 text-primary" />
        Главный следующий шаг
      </div>
      <h3 className="mt-1 text-base font-semibold">{analysis.coachState.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {analysis.coachState.nextStep}
      </p>
    </div>

    <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <MessageSquareText className="h-4 w-4 text-primary" />
        Рабочая фраза
      </div>
      <Tabs value={activeTone} onValueChange={(value) => onToneChange(value as ToneId)}>
        <TabsList className="mb-3 flex h-auto flex-wrap justify-start">
          {Object.entries(analysis.toneLabels).map(([tone, label]) => (
            <TabsTrigger key={tone} value={tone} className="text-xs">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Textarea
        readOnly
        value={finalMessage}
        className="min-h-32 resize-none bg-card leading-relaxed"
      />
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
          size="sm"
          variant={analysis.coachState.sendReadiness.canCopy ? "default" : "outline"}
          onClick={onCopy}
        >
          <Copy className="h-3.5 w-3.5" />
          {analysis.coachState.sendReadiness.canCopy ? copyLabel : "Пока не копировать"}
        </Button>
      </div>
    </div>

    <Accordion type="single" collapsible className="space-y-2">
      <AccordionPanel icon={Brain} title="Карта реакции" value="map">
        <div className="grid gap-3 sm:grid-cols-2">
          {analysis.reflection.map(([title, detail]) => (
            <InfoBlock key={title} title={title} detail={detail} />
          ))}
        </div>
      </AccordionPanel>

      <AccordionPanel icon={Shield} title={analysis.regulationPlan.title} value="regulation">
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          {analysis.regulationPlan.principle}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {analysis.regulationPlan.steps.map(([title, detail]) => (
            <InfoBlock key={title} title={title} detail={detail} />
          ))}
          <div className="rounded-md border border-warning/35 bg-warning/10 p-3 sm:col-span-2">
            <h4 className="text-sm font-semibold">Не делать</h4>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground">
              {analysis.regulationPlan.avoid.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </AccordionPanel>

      <AccordionPanel icon={BookOpenCheck} title="Эмоциональный дневник КПТ" value="cbt">
        <div className="grid gap-3 sm:grid-cols-2">
          {analysis.cbtDiary.map(([title, detail]) => (
            <InfoBlock key={title} title={title} detail={detail} />
          ))}
        </div>
      </AccordionPanel>

      <AccordionPanel icon={AlertTriangle} title="Паттерны в черновике" value="patterns">
        <div className="grid gap-3 sm:grid-cols-2">
          {analysis.patterns.map((pattern) => (
            <div
              key={pattern.id}
              className={cn(
                "rounded-md border p-3",
                pattern.hit
                  ? "border-warning/45 bg-warning/10"
                  : "border-border bg-background",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold">{pattern.title}</h4>
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

      <AccordionPanel
        icon={HeartHandshake}
        title="Педагогический мост"
        value="pedagogical"
      >
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">
            {analysis.pedagogicalBridge.title}.
          </span>{" "}
          {analysis.pedagogicalBridge.principle}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {analysis.pedagogicalBridge.cards.map(([title, detail]) => (
            <InfoBlock key={title} title={title} detail={detail} />
          ))}
          {analysis.pedagogicalBridge.examples.map((example) => (
            <div
              key={example.title}
              className="rounded-md border border-primary/25 bg-primary/5 p-3"
            >
              <h4 className="text-sm font-semibold text-primary">{example.title}</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {example.text}
              </p>
            </div>
          ))}
        </div>
      </AccordionPanel>
    </Accordion>

    <p className="flex items-start gap-2 rounded-md border border-dashed border-primary/20 bg-card px-3 py-2 text-xs leading-relaxed text-muted-foreground">
      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      Не обязательно отправлять. Разбор — сначала для тебя, потом для другого человека.
    </p>
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
  <AccordionItem
    value={value}
    className="rounded-lg border border-border bg-card px-4 shadow-sm"
  >
    <AccordionTrigger className="gap-3 py-3.5 text-left text-sm font-semibold hover:no-underline">
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        <span className="truncate">{title}</span>
      </span>
    </AccordionTrigger>
    <AccordionContent className="pb-4 pt-0">{children}</AccordionContent>
  </AccordionItem>
);

const InfoBlock = ({ title, detail }: { title: string; detail: string }) => (
  <div className="rounded-md border border-border bg-background p-3">
    <h4 className="text-sm font-semibold">{title}</h4>
    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
  </div>
);

export { DialogueCoach };
