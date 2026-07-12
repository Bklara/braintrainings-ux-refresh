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
type Language = "ru" | "en";
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

const contextsByLanguage: Record<Language, Array<{ id: ContextId; label: string; hint: string }>> = {
  ru: contexts,
  en: [
    { id: "partner", label: "Partner", hint: "close relationships, breakup, conflict" },
    { id: "family", label: "Family", hint: "parents, children, siblings" },
    { id: "friend", label: "Friend", hint: "friendship, hurt, distance" },
    { id: "work", label: "Work", hint: "colleagues, manager, boundaries" },
  ],
};

const emptyForm: FormState = { situation: "", draft: "", fear: "", want: "" };
const initialExampleIndexes: Record<ContextId, number> = {
  partner: 0,
  family: 0,
  friend: 0,
  work: 0,
};

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

const englishExamplesByContext: Record<ContextId, FormState[]> = {
  partner: [
    {
      situation:
        "My partner said he was not ready to continue the relationship, and we broke up. Since then he sometimes reaches out warmly and then pulls away again. I feel hurt, anxious, and I want to understand whether I mattered to him.",
      draft: "You just used me and disappeared again. If you do not care, just say it.",
      fear: "I was not chosen and can be left easily",
      want: "clarity, respect for my pain, and a way not to destroy myself",
    },
    {
      situation:
        "My partner read my message in the morning, stayed silent all day, and wrote a dry 'I am busy' in the evening. I felt anxious, angry, and wanted to send ten more messages.",
      draft: "You always do this. You just do not care that I am struggling.",
      fear: "if I do not remind him about me, the connection will disappear",
      want: "a clear response window and contact without pressure",
    },
    {
      situation:
        "My girlfriend said she needs more freedom and is not sure about the relationship. I felt anger, shame, and fear that she is comparing me with someone better.",
      draft:
        "If you want someone else, just say it. I am not going to humiliate myself and beg for attention.",
      fear: "I will be replaced and I am not good enough",
      want: "clarity without humiliation and a way to keep my dignity",
    },
    {
      situation:
        "After an argument, my partner shut down and said he did not want to talk right now. He did not say when he would come back to the topic, and I got stuck in anxiety.",
      draft: "You are running away again. It is impossible to have a normal conversation with you.",
      fear: "the pause will turn into disappearance",
      want: "a pause with a specific time to return",
    },
    {
      situation:
        "My partner joked about my jealousy in front of friends. Everyone laughed, and I felt ashamed and wanted to punish him with coldness.",
      draft: "Thanks for humiliating me in front of everyone. Very mature.",
      fear: "my vulnerability will be made ridiculous",
      want: "say that it hurt without public revenge",
    },
    {
      situation:
        "We had agreed to spend the evening together, but my partner stayed with friends at the last minute and told me only after it had happened.",
      draft: "Great to know your friends are always more important than me.",
      fear: "I will be the backup option again",
      want: "respect for agreements and advance notice",
    },
    {
      situation:
        "My partner says I react too strongly when I ask to discuss money in advance. I want to prove that I am not greedy or controlling.",
      draft: "If you do not care about shared expenses, then pay for everything yourself.",
      fear: "my needs will be called greed or control",
      want: "a calm conversation about budget and responsibility",
    },
    {
      situation:
        "After the breakup, my ex likes my stories and sometimes sends neutral messages. I start hoping again and lose my balance.",
      draft: "Why are you doing this if you do not want to be with me? Leave me alone.",
      fear: "I am being kept close without a real choice",
      want: "a boundary after the breakup and fewer emotional swings",
    },
    {
      situation:
        "My partner said it bothers him when I discuss our fights with a friend. I felt guilty and also angry, because I need support.",
      draft: "It is just convenient for you if I stay silent and tell no one anything.",
      fear: "my right to support will be called betrayal",
      want: "agree on privacy without banning support",
    },
    {
      situation:
        "My partner snapped at my request for help at home: 'I am tired too.' I went silent, but resentment built up inside.",
      draft: "Right, of course only you get tired. I am just furniture here.",
      fear: "my labor will become invisible again",
      want: "share the load without competing over who has it harder",
    },
  ],
  family: [
    {
      situation:
        "My mother said in front of relatives that I am making everything complicated again. I felt anger, shame, and wanted to shut down.",
      draft: "You always shame me in front of people. Stop it already.",
      fear: "I am not taken seriously",
      want: "respect, a calm tone, and the right to have a boundary",
    },
    {
      situation:
        "My father came to my home without warning and said that family has the right to know what is happening with me. I got tense and angry.",
      draft: "You do not understand boundaries at all. Stop getting into my life.",
      fear: "my boundaries will not be treated as real",
      want: "warm contact with respect for my space",
    },
    {
      situation:
        "My child answered the teacher sharply after a conflict with siblings that morning. I want to help him understand that the reaction was not only about the teacher.",
      draft: "You cannot talk to adults like that.",
      fear: "he will think he is only being scolded",
      want: "help the child find more precise words for what happened inside",
    },
    {
      situation:
        "My sister wrote in the family chat that I disappeared again and dumped everything on her. I felt guilty and wanted to justify myself with a long message.",
      draft: "You have no idea what is happening with me. Do not turn yourself into the victim.",
      fear: "I will be seen as selfish and ungrateful",
      want: "acknowledge her load and state my real capacity",
    },
    {
      situation:
        "My parents insist that I come to a celebration even though I said in advance that I cannot. They say family should come first.",
      draft: "You always pressure me with guilt. Have the celebration without me.",
      fear: "if I say no, the connection will break",
      want: "say no without cutting off contact",
    },
    {
      situation:
        "My father said that a man should handle things alone and not complain. I felt anger and also shame that I need support.",
      draft: "You do not know how to talk normally. With you, silence is the only option.",
      fear: "if I show vulnerability, I will lose respect",
      want: "keep respect for myself and say that I do need support",
    },
    {
      situation:
        "My mother-in-law gave parenting advice without being asked and said children were calmer in her time. I felt angry and helpless.",
      draft: "Thanks, but we will somehow manage without your lectures.",
      fear: "my parenting will be devalued",
      want: "stop the advice and keep workable family contact",
    },
    {
      situation:
        "My brother joked in the family chat that I am dramatizing again. I wanted to answer sharply so everyone would finally understand it is not funny.",
      draft: "You always jump in with your jokes. Grow up already.",
      fear: "I am not taken seriously",
      want: "stop the jokes without humiliating him and without a family war",
    },
    {
      situation:
        "My teenager slammed the door and said I understand nothing. I got scared that I was losing contact and wanted to punish him immediately.",
      draft: "If you talk like that, forget your weekend plans.",
      fear: "if I do not set a hard boundary, I will lose respect",
      want: "keep a parental boundary without losing contact",
    },
    {
      situation:
        "My mother compared me with my brother and said at least he knows how to build a life. I felt shame and wanted to prove I am not worse.",
      draft: "Of course, he is always perfect to you, and I am the eternal problem.",
      fear: "I am loved only for achievement",
      want: "not participate in comparison and ask her to speak to me directly",
    },
  ],
  friend: [
    {
      situation:
        "My friend canceled our meeting at the last minute for the second time and then wrote as if nothing had happened. I feel hurt.",
      draft: "If you do not care, just say it. I am tired of adjusting.",
      fear: "I am imposing myself and the friendship matters only to me",
      want: "honesty, warmth, and clear agreements",
    },
    {
      situation:
        "A friend joked about a personal topic of mine in a group. Everyone laughed, and I went quiet and felt ashamed all evening.",
      draft: "Thanks for making me look ridiculous in front of everyone.",
      fear: "if I say something, I will be called too sensitive",
      want: "care, respect, and a chance to say that it hurt",
    },
    {
      situation:
        "A close friend has started replying less often and very briefly. I understand she may be busy, but anxiety grows inside me that the friendship is over.",
      draft: "You just do not want to talk anymore, right? You could have said it directly.",
      fear: "I will be quietly replaced and not told",
      want: "clarify the distance without accusation",
    },
    {
      situation:
        "A friend told other people something I had said to him privately. I felt angry and wanted to cut off contact.",
      draft: "After this I will never tell you anything again. Pretend everything is normal.",
      fear: "my vulnerability will be used against me",
      want: "name a trust boundary and understand whether it can be rebuilt",
    },
    {
      situation:
        "My friend asked to borrow money even though she has not paid back the previous debt. I am afraid to say no and look petty.",
      draft: "Maybe remember the old debt before asking for a new one?",
      fear: "if I refuse, I will be seen as a bad friend",
      want: "a money boundary without shame and hidden anger",
    },
    {
      situation:
        "A friend did not invite me to several group meetups and then said I rarely initiate either. I felt hurt, but I do not want to look needy.",
      draft: "Sure, I do not care. Now it is clear who is a real friend to whom.",
      fear: "if I say I am hurt, it will look weak",
      want: "clarify the friendship without testing my importance and without sarcasm",
    },
    {
      situation:
        "My friend immediately started giving advice and interrupting while I was telling her something. I wanted support and felt like a project to fix.",
      draft: "I did not ask you to treat me like a problem.",
      fear: "my feelings will be repaired instead of held",
      want: "ask her to listen first and advise later",
    },
    {
      situation:
        "A friend arrived forty minutes late and said I take time too seriously. I felt disregarded.",
      draft: "If my time does not matter to you, let us stop making plans.",
      fear: "my agreements do not matter",
      want: "respect for time and advance warning",
    },
    {
      situation:
        "People in the group were discussing a vacation, and my friend said, 'You are hard to get out anyway.' It hurt because no one had even asked me.",
      draft: "Very convenient to decide for me and then act like it is my fault.",
      fear: "I am being excluded and then blamed for distance",
      want: "be invited directly and have the right to choose",
    },
    {
      situation:
        "A friend supported another person in an argument without asking my side. I felt betrayed and wanted to withdraw.",
      draft: "Thanks for not even trying to understand what actually happened.",
      fear: "I will not be protected or heard",
      want: "speak about the hurt and ask him to clarify my side first",
    },
  ],
  work: [
    {
      situation:
        "A colleague canceled a meeting ten minutes before it started and did not offer a new time. Because of that, my deadline got stuck.",
      draft: "Do you ever think that other people also have deadlines?",
      fear: "someone else's responsibility will land on me",
      want: "work clarity, deadlines, and respect for my contribution",
    },
    {
      situation:
        "My manager wrote in the shared chat that the task was sloppy, although he had not given criteria before. I felt angry and wanted to defend myself.",
      draft: "If you explained what you wanted properly, there would be no problem.",
      fear: "my work will be devalued publicly",
      want: "specific criteria, a respectful tone, and a chance to fix it without shame",
    },
    {
      situation:
        "In a meeting, my manager interrupted me and said I was defending the idea too emotionally. I went silent, although I wanted to explain the data.",
      draft: "If you do not want to hear arguments, then decide by yourself.",
      fear: "I will look weak or unprofessional if I insist",
      want: "return the conversation to the data and keep a calm professional tone",
    },
    {
      situation:
        "A colleague took my part of the presentation and presented it as his own. I felt angry and wanted to call him out publicly.",
      draft: "Nice job taking my work. Next time at least try not to make it obvious.",
      fear: "my contribution will become invisible again",
      want: "record authorship and agree on rules without a public attack",
    },
    {
      situation:
        "The team brought another urgent task on Friday evening. Formally it matters, but I have been working overtime for weeks.",
      draft: "Of course, let us save everything at my expense again.",
      fear: "if I refuse, I will be considered unreliable",
      want: "priorities, a deadline, and a boundary around overtime",
    },
    {
      situation:
        "A client wrote sharply and copied my manager. I wanted to answer just as sharply and prove that the problem was not mine.",
      draft: "You delayed the approval yourself, and now you are shifting responsibility.",
      fear: "I will be made guilty in front of my manager",
      want: "state the facts and the next step without escalation",
    },
    {
      situation:
        "A colleague keeps messaging me after working hours with small questions. I answer and then get angry at myself.",
      draft: "Do you understand that the workday is over?",
      fear: "if I do not answer, I will be called not a team player",
      want: "a time boundary and a clear channel for non-urgent questions",
    },
    {
      situation:
        "In a performance review, my manager said I need to be more visible but did not explain what exactly that means. I got confused.",
      draft: "Very convenient to give such abstract criticism without criteria.",
      fear: "I am expected to do the impossible and will be judged subjectively",
      want: "specific expectations, examples, and a growth plan",
    },
    {
      situation:
        "A new colleague regularly asks me to explain basic things even though it is not my area of responsibility. I want to help, but my own tasks are slipping.",
      draft: "I cannot keep being your support desk.",
      fear: "if I limit my help, I will be seen as rude",
      want: "help without losing my deadlines and agree on a format",
    },
    {
      situation:
        "On a call, my idea was ignored, and a week later a similar suggestion from another colleague was supported. I felt angry and invisible.",
      draft: "Interesting that when I say it, there is silence, and when he says it, it is a great idea.",
      fear: "my contribution will only be noticed through someone else's voice",
      want: "restore authorship and discuss the idea on its merits",
    },
  ],
};

const examplesByContextByLanguage: Record<Language, Record<ContextId, FormState[]>> = {
  ru: examplesByContext,
  en: englishExamplesByContext,
};

const coachModuleLabels: Record<string, string> = {
  prep_coach: "Подготовка",
  stabilization_coach: "Стабилизация",
  message_coach: "Формулировка",
  rehearsal_coach: "Репетиция",
  reflection_coach: "Рефлексия",
};

const coachModuleLabelsByLanguage: Record<Language, Record<string, string>> = {
  ru: coachModuleLabels,
  en: {
    prep_coach: "Preparation",
    stabilization_coach: "Stabilization",
    message_coach: "Message",
    rehearsal_coach: "Rehearsal",
    reflection_coach: "Reflection",
  },
};

const neutralPatternText: Record<string, string> = {
  criticism: "Нет явного «ты всегда / ты никогда». Можно говорить о событии, а не о характере.",
  contempt: "Нет явного унижения или ярлыка. Так у разговора остается шанс на уважение.",
  defensiveness: "Нет заметной контратаки. Фокус остается на факте и своей части.",
  stonewalling: "Нет резкого закрытия контакта. Если нужна пауза, лучше назвать время возвращения.",
};

const neutralPatternTextByLanguage: Record<Language, Record<string, string>> = {
  ru: neutralPatternText,
  en: {
    criticism: "No clear 'you always / you never'. You can speak about the event, not the person's character.",
    contempt: "No obvious humiliation or label. The conversation still has a chance to stay respectful.",
    defensiveness: "No strong counterattack. The focus can stay on the fact and your part.",
    stonewalling: "No hard shutdown. If you need a pause, name when you will return.",
  },
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

const stepMetaByLanguage: Record<Language, Record<StepId, { index: number; title: string; hint: string }>> = {
  ru: stepMeta,
  en: {
    context: { index: 1, title: "Who is the conversation with?", hint: "Choose a context to tune examples and tone." },
    situation: { index: 2, title: "What happened", hint: "Only the observable fact: what was seen or heard." },
    feelings: { index: 3, title: "Fear and goal", hint: "What hurts inside and what you actually want." },
    draft: { index: 4, title: "Draft (optional)", hint: "The first version that wants to come out." },
    result: { index: 5, title: "Analysis", hint: "Regulation, meaning, patterns, and a working phrase." },
  },
};

const pageCopy = {
  ru: {
    appTitle: "Тренажер сложного разговора",
    restart: "Заново",
    languageLabel: "Язык",
    stepOf: (index: number, total: number) => `Шаг ${index} из ${total}`,
    situationPlaceholder:
      "Опиши, что реально произошло. Один эпизод, без выводов о мотивах другого.",
    fillExample: "Заполнить примером",
    demoNoticeTitle: "Сейчас это демо на примерах",
    demoNoticeText:
      "На текущий момент работает только корпус примеров. Можно много раз нажимать «Заполнить примером» и смотреть разные разборы, но ваш собственный запрос пока не может быть корректно обработан.",
    fearLabel: "Самый болезненный страх",
    fearHint: "Что мозг достраивает в самой худшей версии.",
    fearPlaceholder: "меня не выбрали, я не важна, меня легко оставить...",
    wantLabel: "Чего хочется на самом деле",
    wantHint: "Не действие другого — а состояние, которое ты защищаешь.",
    wantPlaceholder: "ясность, уважение, спокойный тон, не разрушать себя...",
    draftHelp:
      "Резкий и «неправильный» — то, что нужно. Тренажер отделит боль от импульса и покажет паттерны.",
    draftPlaceholder: "Можно вставить первую версию сообщения или пропустить этот шаг.",
    missingData:
      "Не хватает данных для разбора. Вернись назад и опиши ситуацию хотя бы одним предложением.",
    back: "Назад",
    next: "Далее",
    showAnalysis: "Показать разбор",
    newAnalysis: "Новый разбор",
    copy: "Скопировать",
    copied: "Скопировано",
    copyPause: "Сначала пауза",
    copyBlocked: "Пока не копировать",
    coachFallback: "Коуч",
    analysis: {
      safetyTitle: "Сначала безопасность",
      safetyText:
        "Если есть угрозы, контроль, принуждение или самоповреждение, тренажёр не помогает убеждать себя терпеть и не подталкивает отправлять сообщение.",
      mainNextStep: "Главный следующий шаг",
      workingPhrase: "Рабочая фраза",
      reactionMap: "Карта реакции",
      cbtDiary: "Эмоциональный дневник КПТ",
      patterns: "Паттерны в черновике",
      pedagogicalBridge: "Педагогический мост",
      doNotDo: "Не делать",
      noticed: "замечено",
      finalNote: "Не обязательно отправлять. Разбор — сначала для тебя, потом для другого человека.",
    },
  },
  en: {
    appTitle: "Difficult Conversation Coach",
    restart: "Restart",
    languageLabel: "Language",
    stepOf: (index: number, total: number) => `Step ${index} of ${total}`,
    situationPlaceholder:
      "Describe what actually happened. One episode, without conclusions about the other person's motives.",
    fillExample: "Fill with an example",
    demoNoticeTitle: "This is an example-only demo right now",
    demoNoticeText:
      "At the moment, only the example set works. You can click “Fill with an example” many times to browse different analyses, but your own request cannot be processed correctly yet.",
    fearLabel: "Most painful fear",
    fearHint: "What your mind adds in the worst-case version.",
    fearPlaceholder: "I was not chosen, I do not matter, I can be left easily...",
    wantLabel: "What you actually want",
    wantHint: "Not the other person's action, but the state you are protecting.",
    wantPlaceholder: "clarity, respect, a calmer tone, not destroying myself...",
    draftHelp:
      "Sharp and 'wrong' is useful here. The coach separates pain from impulse and shows patterns.",
    draftPlaceholder: "Paste the first version of the message or skip this step.",
    missingData:
      "There is not enough data for analysis. Go back and describe the situation in at least one sentence.",
    back: "Back",
    next: "Next",
    showAnalysis: "Show analysis",
    newAnalysis: "New analysis",
    copy: "Copy",
    copied: "Copied",
    copyPause: "Pause first",
    copyBlocked: "Do not copy yet",
    coachFallback: "Coach",
    analysis: {
      safetyTitle: "Safety first",
      safetyText:
        "If there are threats, control, coercion, or self-harm risk, this coach does not help you convince yourself to endure it and does not push you to send a message.",
      mainNextStep: "Main next step",
      workingPhrase: "Working phrase",
      reactionMap: "Reaction map",
      cbtDiary: "CBT emotional diary",
      patterns: "Patterns in the draft",
      pedagogicalBridge: "Pedagogical bridge",
      doNotDo: "Do not do",
      noticed: "noticed",
      finalNote: "You do not have to send it. The analysis is first for you, then for the other person.",
    },
  },
};

const englishToneLabels: Record<ToneId, string> = {
  soft: "Soft",
  honest: "Honest",
  vulnerable: "Vulnerable",
  boundary: "With a boundary",
  short: "Short",
};

const englishPatternCopy: Record<
  string,
  { title: string; marker: string; antidote: string; neutral: string }
> = {
  criticism: {
    title: "Criticism",
    marker: "generalization",
    antidote:
      "Narrow it to one event: what happened, what hurt, and what request matters now.",
    neutral:
      "No clear 'you always / you never'. You can speak about the event, not the person's character.",
  },
  contempt: {
    title: "Contempt",
    marker: "jab",
    antidote:
      "Remove the label and keep the other person's dignity: I am hurt and angry, but I do not want to humiliate you.",
    neutral:
      "No obvious humiliation or label. The conversation still has a chance to stay respectful.",
  },
  defensiveness: {
    title: "Defensiveness",
    marker: "counterattack",
    antidote:
      "Name your part and return to the topic: I may have sounded sharp too, and I still want to discuss this event.",
    neutral:
      "No strong counterattack. The focus can stay on the fact and your part.",
  },
  stonewalling: {
    title: "Shutdown",
    marker: "closing contact",
    antidote:
      "Take a pause with a bridge back: I am overloaded and will return to this conversation at a specific time.",
    neutral: "No hard shutdown. If you need a pause, name when you will return.",
  },
};

const englishContextWant: Record<ContextId, string> = {
  partner: "connection and mutual respect",
  family: "connection and respect for boundaries",
  friend: "friendship and honesty",
  work: "work clarity and professional contact",
};

const englishEmotionRules: Array<[RegExp, string]> = [
  [/anxious|anxiety|panic|worried|worry/i, "anxiety"],
  [/angry|anger|rage|furious|resentment/i, "anger"],
  [/hurt|pain|painful/i, "hurt"],
  [/shame|ashamed|embarrassed/i, "shame"],
  [/fear|afraid|scared/i, "fear"],
  [/guilt|guilty/i, "guilt"],
  [/sad|grief|grieving/i, "sadness"],
  [/jealous|jealousy/i, "jealousy"],
  [/helpless|invisible|disregarded/i, "helplessness"],
];

function localizeAnalysis(
  analysis: DialogueAnalysis,
  language: Language,
  form: FormState,
  context: ContextId | null,
): DialogueAnalysis {
  if (language === "ru") return analysis;

  const safeContext = context || "partner";
  const emotions = detectEnglishEmotions(form);
  const need = englishNeed(form, safeContext);
  const fact = englishFact(form.situation);
  const interpretation = englishInterpretation(form.fear);
  const impulse = englishImpulse(form.draft);

  return {
    ...analysis,
    coachState: makeEnglishCoachState(analysis),
    regulationPlan: makeEnglishRegulationPlan(analysis),
    pedagogicalBridge: makeEnglishPedagogicalBridge(analysis),
    reflection: [
      ["Fact", fact],
      ["Interpretation", interpretation],
      ["Emotion", emotions.join(", ")],
      ["Impulse", impulse],
      ["Need", need],
    ],
    cbtDiary: makeEnglishCbtDiary({ analysis, form, fact, emotions, impulse, need }),
    patterns: analysis.patterns.map(localizeEnglishPattern),
    formulations: makeEnglishFormulations({ analysis, form, context: safeContext, emotions, need }),
    toneLabels: englishToneLabels,
  };
}

function detectEnglishEmotions(form: FormState) {
  const combined = [form.situation, form.draft, form.fear, form.want].join(" ");
  const found = englishEmotionRules
    .filter(([rule]) => rule.test(combined))
    .map(([, emotion]) => emotion);

  return Array.from(new Set(found)).slice(0, 4).length
    ? Array.from(new Set(found)).slice(0, 4)
    : ["hurt", "anxiety"];
}

function englishNeed(form: FormState, context: ContextId) {
  return form.want.trim() || englishContextWant[context] || "clarity, respect, and a workable next step";
}

function englishFact(situation: string) {
  if (!situation.trim()) {
    return "First write one observable event: who did or said what, without guessing their motives.";
  }

  return `Check the observable fact: ${trimEnglish(situation, 190)}`;
}

function englishInterpretation(fear: string) {
  if (fear.trim()) {
    return `The mind may be reading this as: ${trimEnglish(fear, 150)}. This is a hypothesis, not proven motive.`;
  }

  return "Possible story on top of the fact: the connection is at risk or I am not being considered. Treat it as a hypothesis to check.";
}

function englishImpulse(draft: string) {
  if (!draft.trim()) {
    return "Reply from the first wave, shut down, or start proving your point.";
  }

  return `Say it directly from the first wave: ${trimEnglish(draft, 150)}`;
}

function makeEnglishCoachState(analysis: DialogueAnalysis) {
  const state = analysis.coachState;
  const base = {
    ...state,
    sendReadiness: {
      ...state.sendReadiness,
    },
  };

  if (state.mode === "safety") {
    return {
      ...base,
      title: "Safety first",
      nextStep: "Choose one physically safe next step and contact live support if the risk is high.",
      focus: "This is not about crafting a beautiful message. It is about protection and support.",
      sendReadiness: {
        ...base.sendReadiness,
        label: "Do not send a message",
        detail: "While there is risk of threat, control, violence, or self-harm, the focus is not dialogue.",
      },
    };
  }

  if (state.mode === "dissociation") {
    return {
      ...base,
      title: "Grounding first",
      nextStep: "Take 60 seconds for orientation: date, place, age, and three neutral objects around you.",
      focus: "The draft can wait. Right now the priority is returning to the present.",
      sendReadiness: {
        ...base.sendReadiness,
        label: "Draft for later",
        detail: "Do not send from fog, numbness, freeze, or parts/system activation.",
      },
    };
  }

  if (state.mode === "overwhelm") {
    return {
      ...base,
      title: "Lower intensity first",
      nextStep: "Set a 10-minute timer and write the automatic thought as a pain signal, not as an instruction.",
      focus: "Choose words after the first wave drops.",
      sendReadiness: {
        ...base.sendReadiness,
        label: "Pause first",
        detail: "Check the draft after intensity lowers, not from the emotional peak.",
      },
    };
  }

  if (state.mode === "closure") {
    return {
      ...base,
      title: "Breakup: keep yourself intact",
      nextStep: "Write the phrase for yourself first and decide later whether contact is actually needed.",
      focus: "A mature result can be not sending from panic.",
      sendReadiness: {
        ...base.sendReadiness,
        label: "You do not have to send it",
        detail: "This can be a draft for yourself or a pause phrase if contact is truly needed later.",
      },
    };
  }

  return {
    ...base,
    title: "You can plan the dialogue",
    nextStep: "Build one short phrase: fact, feeling, need, request, or boundary.",
    focus: "Check that the message is not trying to punish, prove, or urgently remove pain.",
    sendReadiness: {
      ...base.sendReadiness,
      label: "Usable as a draft",
      detail: "Before sending, reread it and choose the tone you will not feel ashamed of tomorrow.",
    },
  };
}

function makeEnglishRegulationPlan(analysis: DialogueAnalysis) {
  const mode = analysis.regulationPlan.mode;

  if (mode === "safety") {
    return {
      ...analysis.regulationPlan,
      title: "Safety first",
      principle:
        "This is not the moment to practice dialogue. You need live support, distance from danger, and one concrete safe next step.",
      signals: ["threat, coercion, control, self-harm risk, or another safety concern"],
      steps: [
        ["Stop", "Do not continue arguing or try to soften dangerous behavior when there is a safety risk."],
        ["Orientation", "Say out loud where you are, what day it is, how old you are, and what is safe around you right now."],
        ["Support", "Contact a trusted person, a local crisis service, or emergency help if the risk is high."],
        ["Minimum", "Choose one physically safe step: go to a public place, remove sharp objects, or avoid being alone if there is self-risk."],
      ],
      avoid: [
        "do not analyze trauma deeper right now",
        "do not write to a partner from a threat state",
        "do not convince yourself to endure danger",
      ],
    };
  }

  if (mode === "dissociation") {
    return {
      ...analysis.regulationPlan,
      title: "Grounding first",
      principle:
        "If the system goes into fog, numbness, freeze, parts activation, or unreality, the task is not relationship analysis. It is returning to the present through small safe steps.",
      signals: ["possible dissociation, freeze, derealization/depersonalization, or parts/system activation"],
      steps: [
        ["Orientation", "Name the date, place, age, and three neutral objects around you. Add: 'I am here now, this is today, the danger is not happening right now.'"],
        ["Sensory anchor", "Feel your feet, the chair, or an object texture. Choose a gentle stimulus: water, blanket, cup, smell, or sound."],
        ["System/parts", "Say internally: 'No one inside has to solve the relationship right now. First we return to the room and choose one safe step.'"],
        ["Titration", "Process only 10% of the topic: one fact, one feeling, one need. If fog or numbness grows, return to orientation."],
        ["Delay contact", "Do not send a message for at least 20 minutes. First write the draft for yourself and check whether your body feels more here."],
      ],
      avoid: [
        "do not force yourself to remember details",
        "do not deepen breathing if it makes you dizzy or more scared",
        "do not make big decisions from fog, numbness, or lost time",
      ],
    };
  }

  if (mode === "overwhelm") {
    return {
      ...analysis.regulationPlan,
      title: "Lower intensity first",
      principle:
        "When the nervous system is flooded, the first thought can sound like an order. Lower intensity first, then choose words.",
      signals: ["high nervous-system activation"],
      steps: [
        ["Pause", "Set a 10-minute timer and do not send the message while the body is at the peak."],
        ["Container", "Write the automatic thought in one line and add: 'this is a pain signal, not an instruction.'"],
        ["Support", "Feel your feet, shoulders, and back. Look around and name five colors or five straight lines."],
        ["Small choice", "Choose the goal: calm down, clarify, set a boundary, or do nothing until tomorrow."],
      ],
      avoid: [
        "do not argue with yourself for having an emotion",
        "do not send a second message from panic",
        "do not turn body anxiety into proof of the other person's motive",
      ],
    };
  }

  return {
    ...analysis.regulationPlan,
    title: "Regulation before dialogue",
    principle:
      "Before wording the message, a short pause is enough: notice the body, name the emotion, and choose the goal.",
    signals: ["no clear markers of acute overwhelm were found"],
    steps: [
      ["Check", "Ask yourself: do I want to understand, reconnect, set a boundary, or remove pain right now?"],
      ["Pause", "Make one calm cycle: fact, feeling, need, request."],
      ["Choice", "Send only the wording you will not feel ashamed to reread tomorrow."],
    ],
    avoid: [
      "do not read motives as facts",
      "do not write from a wish to punish",
      "do not cancel your need for the sake of softness",
    ],
  };
}

function makeEnglishPedagogicalBridge(analysis: DialogueAnalysis) {
  const mode = analysis.pedagogicalBridge.mode;

  if (mode === "safety") {
    return {
      ...analysis.pedagogicalBridge,
      title: "No pedagogical bridge is needed",
      principle:
        "If there are threats, control, coercion, or self-harm risk, the task is not teaching the other person a better contact format.",
      cards: [
        ["Focus", "Safety, distance, and live support come first."],
        ["Do not do", "Do not explain to a dangerous person how to handle your vulnerability better."],
        ["Boundary", "Conversation is possible only where there is no pressure, threat, or coercion."],
      ],
      examples: [
        {
          title: "Short",
          text: "I am not continuing this conversation in an unsafe format. Right now I need to protect myself.",
        },
      ],
    };
  }

  if (mode === "child_scaffold") {
    return {
      ...analysis.pedagogicalBridge,
      title: "Help formulate without pressure",
      principle:
        "When someone reacts sharply, sometimes they do not need a moral lesson. They need language for what already happened inside.",
      cards: [
        ["Warm-up", "Start with facts, not feelings: what happened before the sharp reaction, who was there, what was the last straw."],
        ["Hypothesis", "Offer a gentle version: 'Maybe it was not only about the teacher, but also about what happened with your sibling earlier?'"],
        ["Skill", "Help build a phrase: 'I answered sharply because I was already overloaded. Next time I need a pause.'"],
      ],
      examples: [
        {
          title: "Good parent",
          text:
            "Let us understand not who is guilty, but what built up. The teacher said one thing, but it seems the sibling situation had already hurt you. Then the sharpness was not only about her. How could we say it more precisely?",
        },
        {
          title: "Warm frame",
          text:
            "I am not scolding you for anger. I am helping you understand what it was trying to protect, so next time you have more options than answering sharply.",
        },
      ],
    };
  }

  if (mode === "avoidance") {
    return {
      ...analysis.pedagogicalBridge,
      title: "When the other person shuts down",
      principle:
        "Avoidance can be a way not to overload. It becomes a problem when a pause turns into disappearance and the connection has no support.",
      cards: [
        ["Recognize", "Show that a pause itself is not wrong: the person may truly need to step back first."],
        ["Retrain the format", "Do not demand 'talk now'. Ask for a clear bridge back."],
        ["Timeframe", "Ask for the smallest agreement: when they will return with an answer or a status update."],
      ],
      examples: [
        {
          title: "Soft",
          text:
            "I understand it may feel safer for you to shut down and not answer immediately. That is okay. I only need the pause not to put our connection at risk. Could it sound like: 'I cannot answer now; I will come back in 3 days'?",
        },
        {
          title: "With a boundary",
          text:
            "A pause works for me when it has a shore. If you are not ready to talk now, please name when you will return to the conversation.",
        },
      ],
    };
  }

  if (mode === "defense") {
    return {
      ...analysis.pedagogicalBridge,
      title: "When the other person gets defensive",
      principle:
        "Defense often appears when a person hears blame. The bridge helps move from trial to a conversation skill.",
      cards: [
        ["Warm-up", "Begin with the shared goal: 'I am not trying to prove you are bad. I want a format where both of us are safer.'"],
        ["Shift focus", "Talk about the next repeatable action, not the person's character."],
        ["Example", "Offer one simple alternative behavior for next time."],
      ],
      examples: [
        {
          title: "When they argue",
          text:
            "I am not asking you to admit you are completely guilty. I am asking for one small skill: if you disagree, first say 'I heard you, I need to think', and then answer the substance.",
        },
        {
          title: "When they dismiss",
          text:
            "You can disagree with my interpretation, but please do not dismiss the fact that it hurt. Otherwise we are not discussing the situation, but whether I am allowed to feel anything.",
        },
      ],
    };
  }

  return {
    ...analysis.pedagogicalBridge,
    title: "Warm-up for the conversation",
    principle:
      "If a direct conversation about feelings is too sharp, start pedagogically: through an example, a format, and one small next skill.",
    cards: [
      ["Start simpler", "Do not ask 'what do you feel?' right away. Ask: 'what was the hardest moment?'"],
      ["Show an option", "Offer a phrase the person could use instead of leaving, snapping, or going silent."],
      ["Make an agreement", "End not with personality analysis, but with one small rule for next time."],
    ],
    examples: [
      {
        title: "Warm-up",
        text:
          "Let us not go too deep right away. Let us find one point: where the conversation became too hard, and what small pause would be better than disappearing or hitting with words?",
      },
      {
        title: "Rule for next time",
        text:
          "If one of us is not ready to answer immediately, we do not vanish silently. We write: 'I cannot do this now, I will come back to it at this time.'",
      },
    ],
  };
}

function makeEnglishCbtDiary({
  analysis,
  form,
  fact,
  emotions,
  impulse,
  need,
}: {
  analysis: DialogueAnalysis;
  form: FormState;
  fact: string;
  emotions: string[];
  impulse: string;
  need: string;
}) {
  const trigger = fact.replace(/^Check the observable fact:\s*/i, "");

  if (analysis.safety) {
    return [
      ["Situation", trigger],
      ["Emotion", emotions.join(", ")],
      ["Automatic thought", "This may be unsafe, and I need to take it seriously."],
      ["Automatic reaction", "Stop arguing, seek support, and do not try to soften dangerous behavior."],
      ["Reality check", "With threat, control, or coercion, a CBT diary should not convince you to endure it."],
      ["Alternative thought", "This is not an ordinary conflict. I can protect myself and reach live support."],
      ["Alternative reaction", "Choose a safe next step: pause, support, distance, or emergency help if there is risk."],
    ];
  }

  return [
    ["Situation", trigger],
    ["Emotion", emotions.join(", ")],
    [
      "Automatic thought",
      form.fear.trim()
        ? `The first thought may sound like: ${trimEnglish(form.fear, 150)}.`
        : "The first thought may be: the connection is at risk, I am not considered, or I must defend myself now.",
    ],
    ["Automatic reaction", impulse],
    [
      "What supports it",
      "There is a real trigger and a real feeling. The draft shows the first reaction, not the final truth.",
    ],
    [
      "What it does not prove",
      "The fact does not reveal the other person's full motive. Several explanations are possible, and pain may amplify the reaction.",
    ],
    [
      "Alternative thought",
      `My first reaction matters as a signal, but it does not have to be an instruction. I can choose wording that protects ${need}.`,
    ],
    [
      "Alternative reaction",
      `Pause, name the fact and feeling, then say that I need ${need} without accusing or canceling my boundary.`,
    ],
  ];
}

function localizeEnglishPattern(pattern: DialogueAnalysis["patterns"][number]) {
  const copy = englishPatternCopy[pattern.id];
  if (!copy) return pattern;

  return {
    ...pattern,
    title: copy.title,
    marker: copy.marker,
    antidote: copy.antidote,
  };
}

function makeEnglishFormulations({
  analysis,
  form,
  context,
  emotions,
  need,
}: {
  analysis: DialogueAnalysis;
  form: FormState;
  context: ContextId;
  emotions: string[];
  need: string;
}): Record<ToneId, string> {
  const fact = compactEnglishFact(form.situation);
  const emotion = formatEnglishEmotionObject(emotions);
  const want = form.want.trim() || englishContextWant[context];

  if (analysis.safety) {
    return {
      soft:
        "I am not ready to discuss this under pressure or threat. First I need to make sure I have safety and support.",
      honest:
        "What is happening feels unsafe to me. I am not continuing the conversation in this format, and I will reach for help.",
      vulnerable:
        "I am scared, and I do not want to pretend this is an ordinary conflict. Right now safety matters more than convincing you to understand me.",
      boundary:
        "I am ending this conversation while there are threats, control, or coercion. Next I will act in a way that protects me.",
      short: "This is not safe right now. I am ending the conversation and looking for support.",
    };
  }

  if (analysis.coachState.mode === "closure") {
    return {
      soft:
        `I am not sending this from the first wave. When ${lowerFirst(fact)}, I felt ${emotion}. I need ${need}. First I am getting my balance back, and later I will decide whether contact is needed.`,
      honest:
        `This situation hurts: ${fact}. I do not want to prove my worth from panic. My task now is to keep dignity, clarity, and not destroy myself.`,
      vulnerable:
        `A strong reaction came up in me, as if I might not matter. I will not argue with that pain, but I will not let it drive. First I need support and ${need}.`,
      boundary:
        `I can admit that the breakup hurts and still not write from panic. If contact is needed later, it has to happen in a format with ${need}.`,
      short: "I am not sending a message from the first wave. I am returning to myself first, then I will decide whether contact is needed.",
    };
  }

  return {
    soft:
      `I want to say this calmly. When ${lowerFirst(fact)}, I felt ${emotion}. I need ${need}. Can we talk in a way that keeps ${want}?`,
    honest:
      `This situation hurts: ${fact}. I do not want to attack, but I do want to understand what happened and agree on how we handle it next.`,
    vulnerable:
      `A strong reaction came up in me, as if I might not matter. I know that may not be the whole truth, and right now I need ${need}.`,
    boundary:
      `I understand you may have your reasons. At the same time, it is painful for me when ${lowerFirst(fact)}. I need a format where there is ${need}.`,
    short: `I felt ${emotion}. I want to talk calmly, without accusations, and understand how we can agree on the next step.`,
  };
}

function formatEnglishEmotionObject(emotions: string[]) {
  const values = (emotions.length ? emotions : ["hurt", "anxiety"]).slice(0, 2);
  if (values.length === 1) return values[0];
  return `${values[0]} and ${values[1]}`;
}

function compactEnglishFact(text: string) {
  const sentence = splitEnglishSentences(text)[0] || text || "this happened";
  return sentence.replace(/[.!?]+$/u, "").trim();
}

function splitEnglishSentences(text: string) {
  return (
    text
      .match(/[^.!?]+[.!?]?/gu)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) || []
  );
}

function lowerFirst(text: string) {
  if (!text) return text;
  return `${text[0].toLocaleLowerCase("en-US")}${text.slice(1)}`;
}

function trimEnglish(text: string, maxLength: number) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const trimmed = normalized.slice(0, maxLength - 3);
  const lastSpace = trimmed.lastIndexOf(" ");
  const safeCut = lastSpace > Math.floor(maxLength * 0.65) ? trimmed.slice(0, lastSpace) : trimmed;
  return `${safeCut.trim()}...`;
}

const DialogueCoach = () => {
  const [language, setLanguage] = useState<Language>("ru");
  const [step, setStep] = useState<StepId>("context");
  const [context, setContext] = useState<ContextId | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedTone, setSelectedTone] = useState<ToneId>("soft");
  const [copyLabel, setCopyLabel] = useState("Скопировать");
  const [exampleIndexes, setExampleIndexes] = useState<Record<ContextId, number>>(
    initialExampleIndexes,
  );
  const copy = pageCopy[language];
  const activeContexts = contextsByLanguage[language];
  const activeExamples = examplesByContextByLanguage[language];

  const analysis = useMemo(() => {
    if (!context) return null;
    if (!form.situation.trim() && !form.draft.trim()) return null;
    const rawAnalysis = analyzeDialogue({ ...form, context });
    return localizeAnalysis(rawAnalysis, language, form, context);
  }, [context, form, language]);

  const activeTone = (analysis?.formulations[selectedTone]
    ? selectedTone
    : analysis?.defaultTone || "soft") as ToneId;
  const finalMessage = analysis?.formulations[activeTone] || "";

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const changeLanguage = (nextLanguage: Language) => {
    if (nextLanguage === language) return;
    setLanguage(nextLanguage);
    setStep("context");
    setContext(null);
    setForm(emptyForm);
    setSelectedTone("soft");
    setCopyLabel(pageCopy[nextLanguage].copy);
    setExampleIndexes(initialExampleIndexes);
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
    setCopyLabel(copy.copy);
    setExampleIndexes(initialExampleIndexes);
  };

  const insertExample = () => {
    if (!context) return;
    const examples = activeExamples[context];
    const currentIndex = exampleIndexes[context] || 0;
    setForm(examples[currentIndex % examples.length]);
    setExampleIndexes((current) => ({ ...current, [context]: currentIndex + 1 }));
    setSelectedTone("soft");
  };

  const copyMessage = async () => {
    if (!analysis || !finalMessage.trim()) return;
    if (!analysis.coachState.sendReadiness.canCopy) {
      setCopyLabel(copy.copyPause);
      window.setTimeout(() => setCopyLabel(copy.copyBlocked), 1500);
      return;
    }
    await navigator.clipboard?.writeText(finalMessage);
    setCopyLabel(copy.copied);
    window.setTimeout(() => setCopyLabel(copy.copy), 1500);
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
              {copy.appTitle}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div
              className="flex rounded-md border border-border bg-background p-0.5"
              aria-label={copy.languageLabel}
            >
              {(["ru", "en"] as Language[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => changeLanguage(item)}
                  className={cn(
                    "rounded px-2 py-1 text-[11px] font-semibold uppercase transition-colors",
                    language === item
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={language === item}
                >
                  {item}
                </button>
              ))}
            </div>
            {(context || form.situation) && (
              <Button variant="ghost" size="sm" onClick={restart} className="shrink-0 whitespace-nowrap text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                {copy.restart}
              </Button>
            )}
          </div>
        </div>
        <StepBar current={step} />
      </header>

      <main className="mx-auto max-w-2xl px-5 py-8">
        <StepShell step={step} language={language}>
          {step === "context" && (
            <div className="space-y-4">
              <div
                role="status"
                className="rounded-lg border border-warning/35 bg-warning/10 p-4 text-sm leading-relaxed"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <div>
                    <div className="font-semibold text-foreground">{copy.demoNoticeTitle}</div>
                    <p className="mt-1 text-muted-foreground">{copy.demoNoticeText}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {activeContexts.map((item) => (
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
                placeholder={copy.situationPlaceholder}
                className="resize-none leading-relaxed"
              />
              <button
                type="button"
                onClick={insertExample}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                <Wand2 className="h-3.5 w-3.5" />
                {copy.fillExample}
              </button>
            </div>
          )}

          {step === "feelings" && (
            <div className="space-y-5">
              <FieldBlock
                label={copy.fearLabel}
                hint={copy.fearHint}
                value={form.fear}
                placeholder={copy.fearPlaceholder}
                onChange={(value) => updateField("fear", value)}
              />
              <FieldBlock
                label={copy.wantLabel}
                hint={copy.wantHint}
                value={form.want}
                placeholder={copy.wantPlaceholder}
                onChange={(value) => updateField("want", value)}
              />
            </div>
          )}

          {step === "draft" && (
            <div className="space-y-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {copy.draftHelp}
              </p>
              <Textarea
                autoFocus
                rows={6}
                value={form.draft}
                onChange={(event) => updateField("draft", event.target.value)}
                placeholder={copy.draftPlaceholder}
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
              copy={copy.analysis}
              copyBlocked={copy.copyBlocked}
              coachModuleLabels={coachModuleLabelsByLanguage[language]}
              coachFallback={copy.coachFallback}
              neutralPatternText={neutralPatternTextByLanguage[language]}
            />
          )}

          {step === "result" && !analysis && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {copy.missingData}
            </p>
          )}
        </StepShell>

        {step !== "context" && (
          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={goBack} className="shrink-0 whitespace-nowrap">
              <ArrowLeft className="h-4 w-4" />
              {copy.back}
            </Button>
            {step !== "result" ? (
              <Button onClick={goNext} disabled={!canProceed} className="shrink-0 whitespace-nowrap">
                {step === "draft" ? copy.showAnalysis : copy.next}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" onClick={restart} className="shrink-0 whitespace-nowrap">
                <RotateCcw className="h-4 w-4" />
                {copy.newAnalysis}
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

const StepShell = ({ step, language, children }: { step: StepId; language: Language; children: ReactNode }) => {
  const meta = stepMetaByLanguage[language][step];
  const copy = pageCopy[language];
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7">
      <div className="mb-5">
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {copy.stepOf(meta.index, stepOrder.length)}
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
  copy,
  copyBlocked,
  coachModuleLabels,
  coachFallback,
  neutralPatternText,
}: {
  analysis: DialogueAnalysis;
  activeTone: ToneId;
  onToneChange: (tone: ToneId) => void;
  finalMessage: string;
  copyLabel: string;
  onCopy: () => void;
  copy: (typeof pageCopy)["ru"]["analysis"];
  copyBlocked: string;
  coachModuleLabels: Record<string, string>;
  coachFallback: string;
  neutralPatternText: Record<string, string>;
}) => (
  <div className="space-y-5">
    {analysis.safety && (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm leading-relaxed text-destructive">
        <div className="mb-1 flex items-center gap-2 font-semibold">
          <Shield className="h-4 w-4" />
          {copy.safetyTitle}
        </div>
        {copy.safetyText}
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
          {coachModuleLabels[analysis.coachState.module] || coachFallback}
        </Badge>
        <Badge variant="outline">{analysis.coachState.sendReadiness.label}</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <ListChecks className="h-4 w-4 text-primary" />
        {copy.mainNextStep}
      </div>
      <h3 className="mt-1 text-base font-semibold">{analysis.coachState.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {analysis.coachState.nextStep}
      </p>
    </div>

    <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <MessageSquareText className="h-4 w-4 text-primary" />
        {copy.workingPhrase}
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
          {analysis.coachState.sendReadiness.canCopy ? copyLabel : copyBlocked}
        </Button>
      </div>
    </div>

    <Accordion type="single" collapsible className="space-y-2">
      <AccordionPanel icon={Brain} title={copy.reactionMap} value="map">
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
            <h4 className="text-sm font-semibold">{copy.doNotDo}</h4>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground">
              {analysis.regulationPlan.avoid.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </AccordionPanel>

      <AccordionPanel icon={BookOpenCheck} title={copy.cbtDiary} value="cbt">
        <div className="grid gap-3 sm:grid-cols-2">
          {analysis.cbtDiary.map(([title, detail]) => (
            <InfoBlock key={title} title={title} detail={detail} />
          ))}
        </div>
      </AccordionPanel>

      <AccordionPanel icon={AlertTriangle} title={copy.patterns} value="patterns">
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
                  {pattern.hit ? copy.noticed : pattern.marker}
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
        title={copy.pedagogicalBridge}
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
      {copy.finalNote}
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

const dialogueCoachExamples = examplesByContextByLanguage;

export { DialogueCoach, dialogueCoachExamples, localizeAnalysis };
