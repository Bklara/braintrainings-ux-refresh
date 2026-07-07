import { type ReactNode, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  Clipboard,
  Copy,
  Eraser,
  HeartHandshake,
  MessageSquareText,
  Shield,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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

const contexts: Array<{ id: ContextId; label: string }> = [
  { id: "partner", label: "Партнер" },
  { id: "family", label: "Семья" },
  { id: "friend", label: "Друг" },
  { id: "work", label: "Работа" },
];

const emptyForm: FormState = {
  situation: "",
  draft: "",
  fear: "",
  want: "",
};

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
        "Рома сказал, что не готов продолжать отношения, и мы расстались. После этого он то выходит на связь тепло, то снова отдаляется. Мне больно, тревожно и хочется понять, была ли я ему важна.",
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

const hasContent = (form: FormState) =>
  Object.values(form).some((value) => value.trim().length > 0);

const DialogueCoach = () => {
  const [context, setContext] = useState<ContextId>("partner");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [exampleIndexes, setExampleIndexes] = useState<Record<ContextId, number>>({
    partner: 0,
    family: 0,
    friend: 0,
    work: 0,
  });
  const [selectedTone, setSelectedTone] = useState<ToneId>("soft");
  const [copyLabel, setCopyLabel] = useState("Скопировать");

  const analysis = useMemo(() => {
    if (!hasContent(form)) return null;
    return analyzeDialogue({ ...form, context });
  }, [context, form]);
  const activeTone = (analysis?.formulations[selectedTone] ? selectedTone : analysis?.defaultTone || "soft") as ToneId;
  const finalMessage = analysis?.formulations[activeTone] || "";
  const placeholders = placeholdersByContext[context];

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
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
    <div className="min-h-screen bg-[hsl(38_28%_97%)]">
      <div className="border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquareText className="h-4 w-4 text-primary" />
                Ситуация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Button type="button" variant="outline" onClick={clearForm}>
                  <Eraser className="h-4 w-4" />
                  Очистить
                </Button>
              </div>
            </CardContent>
          </Card>

          {analysis ? (
            <Card
              className={cn(
                "border-l-4",
                analysis.coachState.sendReadiness.canCopy ? "border-l-success" : "border-l-warning",
              )}
            >
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant={analysis.safety ? "destructive" : "secondary"}>
                    {coachModuleLabels[analysis.coachState.module] || "Коуч"}
                  </Badge>
                  <Badge variant="outline">{analysis.coachState.sendReadiness.label}</Badge>
                </div>
                <h2 className="text-lg font-semibold">{analysis.coachState.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{analysis.coachState.nextStep}</p>
                <p className="rounded-md bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  {analysis.coachState.focus}
                </p>
              </CardContent>
            </Card>
          ) : (
            <EmptyHint />
          )}
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
          ) : (
            <>
              <Panel icon={Brain} title="Карта реакции">
                <div className="grid gap-3 md:grid-cols-2">
                  {analysis.reflection.map(([title, detail]) => (
                    <InfoBlock key={title} title={title} detail={detail} />
                  ))}
                </div>
              </Panel>

              <Panel icon={Shield} title={analysis.regulationPlan.title}>
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
              </Panel>

              <Panel icon={BookOpenCheck} title="Эмоциональный дневник КПТ">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {analysis.cbtDiary.map(([title, detail]) => (
                    <InfoBlock key={title} title={title} detail={detail} />
                  ))}
                </div>
              </Panel>

              <Panel icon={AlertTriangle} title="Паттерны в черновике">
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
              </Panel>

              <Panel icon={HeartHandshake} title="Педагогический мост">
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
              </Panel>

              <Panel icon={Clipboard} title="Фраза">
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
              </Panel>
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

const Panel = ({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) => (
  <Card>
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2 text-base">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
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
  <div className="rounded-lg border border-dashed border-border bg-card p-5">
    <Icon className="mb-3 h-5 w-5 text-primary" />
    <h2 className="text-sm font-semibold">{title}</h2>
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
  </div>
);

const EmptyHint = () => (
  <Card className="border-dashed">
    <CardContent className="p-5 text-sm leading-relaxed text-muted-foreground">
      Заполните ситуацию или вставьте пример. Разбор строится локально: сначала регуляция, потом смысл,
      потребность и фраза.
    </CardContent>
  </Card>
);

export { DialogueCoach };
