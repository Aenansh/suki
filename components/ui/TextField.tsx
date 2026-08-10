import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { fonts, radii, space } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = TextInputProps & {
  label?: string;
};

/** Matches .field + .input — pill-radius surface field, accent border on focus. */
export function TextField({ label, style, ...inputProps }: Props) {
  const t = useAppTheme();

  return (
    <View style={styles.field}>
      {label ? <Text style={[styles.label, { color: t.muted }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={t.faint}
        style={[
          styles.input,
          { backgroundColor: t.surface, borderColor: t.line, color: t.text },
          style,
        ]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 5,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 12,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    fontFamily: fonts.body,
    fontSize: 15,
  },
});
