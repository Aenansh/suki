/** The redeem-shelf quick-tap treats (exact copy from the design's `shelfDefs`). Tapping one
 * pre-fills the redeem item name; quantity + sugar are still estimated fresh each time. */
export type TreatIcon = 'drop' | 'cup' | 'star' | 'leaf';
export type TreatSwatch = 'accent' | 'sage' | 'gold';

export interface StarterTreat {
  name: string;
  icon: TreatIcon;
  swatch: TreatSwatch;
}

export const STARTER_TREATS: StarterTreat[] = [
  { name: 'Gulab jamun', icon: 'drop', swatch: 'accent' },
  { name: 'Rasgulla', icon: 'drop', swatch: 'sage' },
  { name: 'Ice cream', icon: 'cup', swatch: 'gold' },
  { name: 'Cola', icon: 'cup', swatch: 'accent' },
  { name: 'Chocolate bar', icon: 'star', swatch: 'sage' },
  { name: 'Halwa', icon: 'leaf', swatch: 'gold' },
  { name: 'Ladoo', icon: 'star', swatch: 'accent' },
  { name: 'Jalebi', icon: 'leaf', swatch: 'sage' },
];
