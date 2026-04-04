import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { useCart } from "@/hooks/useCart";
import { products } from "@/data/mockProducts";
import { ArcSlider } from "@/components/onboarding/ArcSlider";
import type { CartItemType } from "@/components/cart/CartItem";
import type { Product } from "@/components/products/ProductCard";

type Gender = "female" | "male";
type Concern =
  | "pcos"
  | "egg_quality"
  | "conceive"
  | "menopause"
  | "sperm"
  | "fertility"
  | "sexual_health";
type Duration = "just_started" | "3_6months" | "6_12months" | "over_year";
type StepId = "gender" | "concern" | "age" | "weight" | "duration" | "results";
type PlanId = "starter" | "focused" | "complete";

interface Answers {
  gender?: Gender;
  concern?: Concern;
  age: number;
  weight: number;
  duration?: Duration;
}

interface PlanOption {
  id: PlanId;
  badgeKey: string;
  nameKey: string;
  descriptionKey: string;
  products: Product[];
  monthlyPrice: number;
}

const AGE_RANGE = {
  min: 18,
  max: 52,
  defaultValue: 31,
};

const WEIGHT_RANGE = {
  min: 45,
  max: 120,
  defaultValue: 68,
};

const RECOMMENDATIONS: Record<Concern, string[]> = {
  pcos: ["4", "5", "7", "8"],
  egg_quality: ["1", "2", "3", "26"],
  conceive: ["3", "26", "27", "21"],
  menopause: ["28", "22", "13"],
  sperm: ["11", "12", "16", "17"],
  fertility: ["21", "23", "24", "25"],
  sexual_health: ["14", "15", "20", "18"],
};

const RECOMMENDATION_EXTRAS: Partial<Record<Concern, string[]>> = {
  pcos: ["10", "6", "9"],
  egg_quality: ["21", "10", "27"],
  conceive: ["1", "2", "25"],
  menopause: ["21", "24", "23"],
  sperm: ["13", "19", "20"],
  fertility: ["11", "12", "13"],
  sexual_health: ["19", "17", "14"],
};

const CONCERN_HUES: Record<Concern, number> = {
  pcos: 152,
  egg_quality: 36,
  conceive: 14,
  menopause: 336,
  sperm: 218,
  fertility: 194,
  sexual_health: 24,
};

function getStepIds(answers: Answers): StepId[] {
  const steps: StepId[] = ["gender", "concern", "age", "weight"];
  if (answers.concern !== "menopause") steps.push("duration");
  steps.push("results");
  return steps;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildRankedRecommendations(answers: Answers) {
  if (!answers.concern) return [];

  const scores = new Map<string, number>();

  [...RECOMMENDATIONS[answers.concern], ...(RECOMMENDATION_EXTRAS[answers.concern] ?? [])].forEach(
    (id, index) => {
      if (!scores.has(id)) {
        scores.set(id, 120 - index * 12);
      }
    },
  );

  const boost = (ids: string[], amount: number) => {
    ids.forEach((id) => {
      scores.set(id, (scores.get(id) ?? 28) + amount);
    });
  };

  if (answers.age >= 35) {
    if (answers.concern === "pcos") boost(["7", "10", "3"], 18);
    if (answers.concern === "egg_quality") boost(["1", "3", "21"], 24);
    if (answers.concern === "conceive") boost(["21", "3", "1"], 18);
    if (answers.concern === "menopause") boost(["28", "22", "24"], 18);
    if (answers.concern === "sperm") boost(["11", "16", "13"], 18);
    if (answers.concern === "fertility") boost(["23", "24", "11"], 18);
    if (answers.concern === "sexual_health") boost(["18", "15", "20"], 18);
  }

  if (answers.weight >= 82) {
    if (answers.concern === "pcos") boost(["7", "4", "8"], 22);
    if (answers.concern === "fertility") boost(["24", "25", "23"], 16);
    if (answers.concern === "sexual_health") boost(["15", "18", "19"], 16);
  }

  if (answers.duration === "6_12months" || answers.duration === "over_year") {
    if (answers.concern === "egg_quality") boost(["21", "27"], 16);
    if (answers.concern === "conceive") boost(["21", "25", "1"], 18);
    if (answers.concern === "sperm") boost(["16", "17"], 14);
    if (answers.concern === "fertility") boost(["23", "24"], 14);
  }

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => products.find((product) => product.id === id))
    .filter(Boolean) as Product[];
}

function buildPlans(recommended: Product[]): PlanOption[] {
  const planBlueprints: Array<{
    id: PlanId;
    count: number;
    badgeKey: string;
    nameKey: string;
    descriptionKey: string;
  }> = [
    {
      id: "starter",
      count: 2,
      badgeKey: "onboarding.results.badges.starter",
      nameKey: "onboarding.results.plans.starter.name",
      descriptionKey: "onboarding.results.plans.starter.description",
    },
    {
      id: "focused",
      count: 3,
      badgeKey: "onboarding.results.badges.focused",
      nameKey: "onboarding.results.plans.focused.name",
      descriptionKey: "onboarding.results.plans.focused.description",
    },
    {
      id: "complete",
      count: 4,
      badgeKey: "onboarding.results.badges.complete",
      nameKey: "onboarding.results.plans.complete.name",
      descriptionKey: "onboarding.results.plans.complete.description",
    },
  ];

  const seenCounts = new Set<number>();

  return planBlueprints
    .map((plan) => {
      const planProducts = recommended.slice(0, Math.min(plan.count, recommended.length));

      return {
        ...plan,
        products: planProducts,
        monthlyPrice: planProducts.reduce((total, product) => total + product.price, 0),
      };
    })
    .filter((plan) => {
      if (!plan.products.length || seenCounts.has(plan.products.length)) return false;
      seenCounts.add(plan.products.length);
      return true;
    });
}

interface OptionCardProps {
  label: string;
  description?: string;
  eyebrow?: string;
  selected?: boolean;
  onClick: () => void;
}

function OptionCard({ label, description, eyebrow, selected, onClick }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full rounded-[28px] border p-5 text-start transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2",
        selected
          ? "border-primary/40 bg-white/90 shadow-[0_24px_60px_-34px_rgba(74,58,255,0.45)]"
          : "border-white/70 bg-white/72 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-white/90 hover:shadow-[0_20px_45px_-34px_rgba(74,58,255,0.38)]",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary/70 shadow-[0_0_0_6px_rgba(74,58,255,0.08)]" />
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <p className="text-base font-semibold leading-snug text-foreground">{label}</p>
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "mt-1 flex h-6 w-6 items-center justify-center rounded-full border transition-all",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-white/90 text-transparent",
          )}
        >
          <Check className="h-3.5 w-3.5" />
        </div>
      </div>
    </button>
  );
}

export default function Onboarding() {
  const { t, locale } = useI18n();
  const { setItems } = useCart();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Answers>({
    age: AGE_RANGE.defaultValue,
    weight: WEIGHT_RANGE.defaultValue,
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>("focused");

  const steps = getStepIds(answers);
  const currentStep = steps[stepIndex];
  const isResults = currentStep === "results";
  const progressSteps = steps.filter((step) => step !== "results");
  const recommended = useMemo(() => buildRankedRecommendations(answers), [answers]);
  const plans = useMemo(() => buildPlans(recommended), [recommended]);
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];
  const concernHue = answers.concern ? CONCERN_HUES[answers.concern] : 258;
  const ageProgress = (answers.age - AGE_RANGE.min) / (AGE_RANGE.max - AGE_RANGE.min);
  const weightProgress = (answers.weight - WEIGHT_RANGE.min) / (WEIGHT_RANGE.max - WEIGHT_RANGE.min);
  const currentSliderProgress =
    currentStep === "weight" ? weightProgress : currentStep === "age" ? ageProgress : 0.38;

  useEffect(() => {
    setStepIndex((index) => Math.min(index, steps.length - 1));
  }, [steps.length]);

  useEffect(() => {
    if (!plans.length) return;
    if (!plans.some((plan) => plan.id === selectedPlanId)) {
      setSelectedPlanId(plans.find((plan) => plan.id === "focused")?.id ?? plans[0].id);
    }
  }, [plans, selectedPlanId]);

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);

  const screenStyle: CSSProperties = {
    backgroundImage: `
      radial-gradient(circle at 50% 0%, hsla(${concernHue}, 72%, ${95 - currentSliderProgress * 10}%, 0.55), transparent 32%),
      linear-gradient(180deg, hsl(${concernHue} 34% 98%) 0%, hsl(${concernHue + 12} 18% 96%) 100%)
    `,
  };

  const femaleOptions: Array<{ value: Concern; label: string; description: string }> = [
    {
      value: "pcos",
      label: t("onboarding.concern.pcos"),
      description: t("onboarding.concern.pcos_desc"),
    },
    {
      value: "egg_quality",
      label: t("onboarding.concern.egg_quality"),
      description: t("onboarding.concern.egg_quality_desc"),
    },
    {
      value: "conceive",
      label: t("onboarding.concern.conceive"),
      description: t("onboarding.concern.conceive_desc"),
    },
    {
      value: "menopause",
      label: t("onboarding.concern.menopause"),
      description: t("onboarding.concern.menopause_desc"),
    },
  ];

  const maleOptions: Array<{ value: Concern; label: string; description: string }> = [
    {
      value: "sperm",
      label: t("onboarding.concern.sperm"),
      description: t("onboarding.concern.sperm_desc"),
    },
    {
      value: "fertility",
      label: t("onboarding.concern.fertility"),
      description: t("onboarding.concern.fertility_desc"),
    },
    {
      value: "sexual_health",
      label: t("onboarding.concern.sexual_health"),
      description: t("onboarding.concern.sexual_health_desc"),
    },
  ];

  const durationOptions: Array<{ value: Duration; label: string }> = [
    { value: "just_started", label: t("onboarding.duration.just_started") },
    { value: "3_6months", label: t("onboarding.duration.3_6months") },
    { value: "6_12months", label: t("onboarding.duration.6_12months") },
    { value: "over_year", label: t("onboarding.duration.over_year") },
  ];

  const profileTags = [
    answers.concern ? t(`onboarding.concern.${answers.concern}`) : null,
    t("onboarding.results.summary.age", { value: answers.age }),
    t("onboarding.results.summary.weight", { value: answers.weight }),
    answers.duration ? t(`onboarding.duration.${answers.duration}`) : null,
  ].filter(Boolean) as string[];

  const selectedPlanReasons = [
    t("onboarding.results.reasons.focus", {
      focus: answers.concern ? t(`onboarding.concern.${answers.concern}`) : "",
    }),
    answers.age >= 35
      ? t("onboarding.results.reasons.ageMature")
      : t("onboarding.results.reasons.ageFoundational"),
    answers.weight >= 82
      ? t("onboarding.results.reasons.weightElevated")
      : t("onboarding.results.reasons.weightBalanced"),
    answers.duration === "6_12months" || answers.duration === "over_year"
      ? t("onboarding.results.reasons.durationLonger")
      : answers.duration
        ? t("onboarding.results.reasons.durationEarly")
        : null,
  ].filter(Boolean) as string[];

  function advance() {
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  }

  function back() {
    if (stepIndex === 0) {
      navigate("/");
      return;
    }

    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function pick<K extends keyof Answers>(key: K, value: Answers[K]) {
    const nextAnswers: Answers = { ...answers, [key]: value };

    if (key === "gender") nextAnswers.concern = undefined;

    setAnswers(nextAnswers);

    if (key === "gender" || key === "concern" || key === "duration") {
      window.setTimeout(advance, 160);
    }
  }

  function continueWithPlan(plan: PlanOption) {
    const cartItems: CartItemType[] = plan.products.map((product) => ({
      id: product.id,
      nameKey: product.nameKey,
      packSizeKey: product.packSizeKey,
      price: product.price,
      currency: product.currency,
      quantity: 1,
      image: product.image,
    }));

    setItems(cartItems);
    navigate("/checkout", { state: { items: cartItems } });
  }

  return (
    <div
      className="min-h-screen transition-[background-image] duration-700 ease-out"
      style={screenStyle}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <button
            onClick={back}
            className="inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/70 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{stepIndex > 0 ? t("onboarding.back") : t("onboarding.exit")}</span>
          </button>

          <Link to="/" className="text-lg font-semibold tracking-[0.22em] text-foreground/90">
            DietCo
          </Link>

          <div className="w-[92px]" />
        </div>

        {!isResults ? (
          <div className="mx-auto mt-8 w-full max-w-3xl">
            <div className="rounded-full border border-white/70 bg-white/60 p-2 shadow-[0_24px_60px_-40px_rgba(74,58,255,0.38)] backdrop-blur">
              <div className="flex gap-2">
                {progressSteps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-2 flex-1 rounded-full transition-all duration-500",
                      index <= stepIndex ? "bg-primary" : "bg-primary/10",
                    )}
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-right text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {t("onboarding.stepOf", {
                current: stepIndex + 1,
                total: progressSteps.length,
              })}
            </p>
          </div>
        ) : null}

        <div
          className={cn(
            "flex-1 py-8",
            isResults ? "flex items-start" : "flex items-center justify-center",
          )}
        >
          {!isResults ? (
            <div className="mx-auto w-full max-w-2xl">
              <div className="rounded-[32px] border border-black/5 bg-white/88 p-6 shadow-[0_24px_60px_-42px_rgba(24,20,44,0.28)] backdrop-blur-md sm:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/80">
                  {t("onboarding.eyebrow")}
                </p>

                {currentStep === "gender" ? (
                  <>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                      {t("onboarding.gender.title")}
                    </h1>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                      {t("onboarding.gender.subtitle")}
                    </p>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      <OptionCard
                        label={t("onboarding.gender.female")}
                        description={t("onboarding.gender.female_hint")}
                        eyebrow={t("onboarding.gender.optionLabel")}
                        selected={answers.gender === "female"}
                        onClick={() => pick("gender", "female")}
                      />
                      <OptionCard
                        label={t("onboarding.gender.male")}
                        description={t("onboarding.gender.male_hint")}
                        eyebrow={t("onboarding.gender.optionLabel")}
                        selected={answers.gender === "male"}
                        onClick={() => pick("gender", "male")}
                      />
                    </div>
                  </>
                ) : null}

                {currentStep === "concern" ? (
                  <>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                      {t("onboarding.concern.title")}
                    </h1>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                      {t("onboarding.concern.subtitle")}
                    </p>
                    <div className="mt-8 space-y-4">
                      {(answers.gender === "female" ? femaleOptions : maleOptions).map((option) => (
                        <OptionCard
                          key={option.value}
                          label={option.label}
                          description={option.description}
                          eyebrow={t("onboarding.concern.optionLabel")}
                          selected={answers.concern === option.value}
                          onClick={() => pick("concern", option.value)}
                        />
                      ))}
                    </div>
                  </>
                ) : null}

                {currentStep === "age" ? (
                  <>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                      {t("onboarding.age.title")}
                    </h1>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                      {t("onboarding.age.subtitle")}
                    </p>
                    {!!profileTags.length ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {profileTags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-primary/6 px-3 py-1.5 text-sm font-medium text-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-6 rounded-[28px] bg-[#fcfcff] p-4">
                      <ArcSlider
                        value={answers.age}
                        min={AGE_RANGE.min}
                        max={AGE_RANGE.max}
                        unit={t("onboarding.age.unit")}
                        lowLabel={t("onboarding.age.minLabel", { value: AGE_RANGE.min })}
                        highLabel={t("onboarding.age.maxLabel", { value: AGE_RANGE.max })}
                        hue={concernHue}
                        onChange={(value) => setAnswers((current) => ({ ...current, age: value }))}
                      />
                    </div>
                    <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                      {t("onboarding.age.helper")}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Button
                        variant="clinical"
                        size="lg"
                        onClick={advance}
                        className="min-w-[220px]"
                      >
                        {t("onboarding.actions.continue")}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : null}

                {currentStep === "weight" ? (
                  <>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                      {t("onboarding.weight.title")}
                    </h1>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                      {t("onboarding.weight.subtitle")}
                    </p>
                    {!!profileTags.length ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {profileTags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-primary/6 px-3 py-1.5 text-sm font-medium text-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-6 rounded-[28px] bg-[#fcfcff] p-4">
                      <ArcSlider
                        value={answers.weight}
                        min={WEIGHT_RANGE.min}
                        max={WEIGHT_RANGE.max}
                        unit={t("onboarding.weight.unit")}
                        lowLabel={t("onboarding.weight.minLabel", { value: WEIGHT_RANGE.min })}
                        highLabel={t("onboarding.weight.maxLabel", { value: WEIGHT_RANGE.max })}
                        hue={concernHue + 20}
                        onChange={(value) => setAnswers((current) => ({ ...current, weight: value }))}
                      />
                    </div>
                    <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                      {t("onboarding.weight.helper")}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Button
                        variant="clinical"
                        size="lg"
                        onClick={advance}
                        className="min-w-[220px]"
                      >
                        {t("onboarding.actions.continue")}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : null}

                {currentStep === "duration" ? (
                  <>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                      {t("onboarding.duration.title")}
                    </h1>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                      {t("onboarding.duration.subtitle")}
                    </p>
                    {!!profileTags.length ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {profileTags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-primary/6 px-3 py-1.5 text-sm font-medium text-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-8 space-y-4">
                      {durationOptions.map((option) => (
                        <OptionCard
                          key={option.value}
                          label={option.label}
                          eyebrow={t("onboarding.duration.optionLabel")}
                          selected={answers.duration === option.value}
                          onClick={() => pick("duration", option.value)}
                        />
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="w-full space-y-8">
              <div className="rounded-[32px] border border-black/5 bg-white/88 p-6 shadow-[0_24px_60px_-42px_rgba(24,20,44,0.28)] backdrop-blur-md sm:p-8">
                <div className="max-w-3xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary/80">
                    {t("onboarding.results.eyebrow")}
                  </p>
                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                    {t("onboarding.results.title")}
                  </h1>
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                    {t("onboarding.results.subtitle")}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {profileTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/6 px-4 py-2 text-sm font-medium text-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {selectedPlan ? (
                    <div className="mt-8 rounded-[24px] bg-[#fcfcff] p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                            {t("onboarding.results.monthlyLabel")}
                          </p>
                          <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
                            {formatPrice(selectedPlan.monthlyPrice, selectedPlan.products[0]?.currency ?? "SAR")}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {t("onboarding.results.monthlyFootnote")}
                          </p>
                        </div>
                        <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground">
                          {t(selectedPlan.badgeKey)}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {plans.map((plan) => {
                  const isSelected = selectedPlan?.id === plan.id;

                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={cn(
                        "rounded-[28px] border border-black/5 bg-white/88 p-6 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2",
                        isSelected
                          ? "shadow-[0_24px_60px_-42px_rgba(24,20,44,0.28)] ring-1 ring-primary/20"
                          : "hover:bg-white",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">
                          {t(plan.badgeKey)}
                        </span>
                        {isSelected ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : null}
                      </div>

                      <h2 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
                        {t(plan.nameKey)}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {t(plan.descriptionKey)}
                      </p>

                      <p className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
                        {formatPrice(plan.monthlyPrice, plan.products[0]?.currency ?? "SAR")}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t("onboarding.results.includesCount", { count: plan.products.length })}
                      </p>

                      <div className="mt-6 space-y-2">
                        {plan.products.map((product) => (
                          <div key={product.id} className="text-sm text-foreground">
                            {t(product.nameKey)}
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedPlan ? (
                <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[32px] border border-black/5 bg-white/88 p-6 shadow-[0_24px_60px_-42px_rgba(24,20,44,0.28)] backdrop-blur-md">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/80">
                          {t("onboarding.results.includedLabel")}
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                          {t("onboarding.results.includedTitle", {
                            name: t(selectedPlan.nameKey),
                          })}
                        </h2>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {formatPrice(selectedPlan.monthlyPrice, selectedPlan.products[0]?.currency ?? "SAR")}
                      </p>
                    </div>

                    <div className="mt-6 space-y-4">
                      {selectedPlan.products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-4 rounded-[20px] bg-[#fcfcff] p-4"
                        >
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-muted/40">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={t(product.nameKey)}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-base font-semibold text-foreground">
                              {t(product.nameKey)}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {t(product.packSizeKey)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-semibold text-foreground">
                              {formatPrice(product.price, product.currency)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-[32px] border border-black/5 bg-white/88 p-6 shadow-[0_24px_60px_-42px_rgba(24,20,44,0.28)] backdrop-blur-md">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/80">
                        {t("onboarding.results.reasonLabel")}
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                        {t("onboarding.results.reasonTitle")}
                      </h2>
                      <div className="mt-6 space-y-3">
                        {selectedPlanReasons.map((reason) => (
                          <div
                            key={reason}
                            className="rounded-2xl bg-[#fcfcff] px-4 py-3 text-sm leading-relaxed text-foreground"
                          >
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[32px] border border-black/5 bg-white/88 p-6 shadow-[0_24px_60px_-42px_rgba(24,20,44,0.28)] backdrop-blur-md">
                      <div className="flex flex-col gap-3">
                        <Button
                          size="lg"
                          variant="clinical"
                          onClick={() => continueWithPlan(selectedPlan)}
                          className="w-full"
                        >
                          {t("onboarding.actions.continueWithPlan", {
                            name: t(selectedPlan.nameKey),
                          })}
                        </Button>
                        <Button asChild size="lg" variant="clinical-outline" className="w-full">
                          <Link to="/order">{t("onboarding.actions.browseCatalog")}</Link>
                        </Button>
                        <Button asChild size="lg" variant="ghost" className="w-full">
                          <Link to="/contact">{t("onboarding.actions.talkToTeam")}</Link>
                        </Button>
                      </div>

                      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                        {t("onboarding.results.disclaimer")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
