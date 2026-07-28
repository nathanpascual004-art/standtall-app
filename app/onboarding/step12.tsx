import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';

/** Étape 12/14 — temps disponible par jour. */
export default function DailyMinutesScreen() {
  return (
    <QuizSingleSelectScreen
      step={12}
      title="Combien de temps par jour peux-tu y consacrer ?"
      answerKey="dailyMinutes"
      options={[
        { value: 5, label: '5 min / jour' },
        { value: 10, label: '10 min / jour' },
        { value: 15, label: '15 min / jour' },
      ]}
      nextHref="/onboarding/step13"
    />
  );
}
