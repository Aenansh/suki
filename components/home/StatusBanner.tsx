import { StyleSheet, Text, View } from 'react-native';

import { radii } from '@/constants/theme';
import { useSugarStatus } from '@/hooks/useSugarStatus';

type Props = {
  sugar: number;
  limit: number;
};

/** The pill row under the ring — sage "under budget" / gold "cutting it close" / accent "over, recovery mode". */
export function StatusBanner({ sugar, limit }: Props) {
  const { bg, ink, iconBg, Icon, text } = useSugarStatus(sugar, limit);

  return (
    <View style={[styles.row, { backgroundColor: bg }]}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Icon size={14} color="#fff" strokeWidth={2.75} />
      </View>
      <Text style={[styles.text, { color: ink }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: radii.lg - 6,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 18.9,
  },
});
