import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';

import { fonts, space } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

import { Button } from '../ui/Button';

type Props = {
  onBack?: () => void;
  backLabel?: string;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
};

/** The persistent back-text + full-width primary-CTA row at the bottom of every onboarding step. */
export function OnboardingFooter({ onBack, backLabel = 'Back', onNext, nextLabel, nextDisabled }: Props) {
  const t = useAppTheme();
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={8} style={styles.backButton}>
          <Text style={[styles.backLabel, { color: t.faint }]}>{backLabel}</Text>
        </Pressable>
      ) : (
        <View style={styles.backButton} />
      )}
      <Button label={nextLabel} onPress={onNext} disabled={nextDisabled} style={styles.nextButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingTop: space[4],
  },
  backButton: {
    padding: 14,
  },
  backLabel: {
    fontFamily: fonts.heading,
    fontSize: 14,
  },
  nextButton: {
    flex: 1,
  },
});
