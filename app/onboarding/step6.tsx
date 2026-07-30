import { PostureFigure } from '@/components/PostureFigure';
import { QuizSingleSelectScreen } from '@/components/QuizSingleSelectScreen';
import { color } from '@/theme/tokens';

/** Étape 6/14 — tenue spontanée (options illustrées). */
export default function PostureTypeScreen() {
  return (
    <QuizSingleSelectScreen
      step={6}
      title="Comment te tiens-tu spontanément ?"
      answerKey="postureType"
      options={[
        {
          value: 'droit',
          label: 'Droit',
          icon: (selected) => (
            <PostureFigure
              variant="droit"
              color={selected ? color.accent : color.textMuted}
            />
          ),
        },
        {
          value: 'legerement-voute',
          label: 'Légèrement voûté',
          icon: (selected) => (
            <PostureFigure
              variant="legerement-voute"
              color={selected ? color.accent : color.textMuted}
            />
          ),
        },
        {
          value: 'tres-voute',
          label: 'Très voûté',
          icon: (selected) => (
            <PostureFigure
              variant="tres-voute"
              color={selected ? color.accent : color.textMuted}
            />
          ),
        },
      ]}
      nextHref="/onboarding/step7"
    />
  );
}
