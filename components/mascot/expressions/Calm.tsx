import { Circle, Ellipse, Path } from 'react-native-svg';

/** Sleepy/breathing mood — the SOS craving screen. */
export function Calm() {
  return (
    <>
      <Ellipse cx={36} cy={38} rx={10.5} ry={28} fill="#f9f4ed" stroke="#dcd3c4" strokeWidth={2} transform="rotate(-32 36 38)" />
      <Ellipse cx={36} cy={40} rx={4.8} ry={18} fill="#e1eecc" transform="rotate(-32 36 40)" />
      <Ellipse cx={64} cy={38} rx={10.5} ry={28} fill="#f9f4ed" stroke="#dcd3c4" strokeWidth={2} transform="rotate(32 64 38)" />
      <Ellipse cx={64} cy={40} rx={4.8} ry={18} fill="#e1eecc" transform="rotate(32 64 40)" />
      <Circle cx={50} cy={80} r={33} fill="#f9f4ed" stroke="#dcd3c4" strokeWidth={2} />
      <Ellipse cx={28} cy={88} rx={7} ry={5} fill="#ccdbb2" opacity={0.9} />
      <Ellipse cx={72} cy={88} rx={7} ry={5} fill="#ccdbb2" opacity={0.9} />
      <Path d="M33 77q6 6 12 0" fill="none" stroke="#201e1d" strokeWidth={3} strokeLinecap="round" />
      <Path d="M55 77q6 6 12 0" fill="none" stroke="#201e1d" strokeWidth={3} strokeLinecap="round" />
      <Path d="M46 88h8l-4 4.5z" fill="#d67f48" />
      <Ellipse cx={50} cy={97} rx={4} ry={3} fill="none" stroke="#201e1d" strokeWidth={2.2} />
    </>
  );
}
