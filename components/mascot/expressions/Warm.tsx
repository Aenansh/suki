import { Circle, Ellipse, Path } from 'react-native-svg';

/** Soft-concerned mood — the over-limit recovery card. Never a shame face, just gentle. */
export function Warm() {
  return (
    <>
      <Ellipse cx={34} cy={36} rx={11} ry={29} fill="#f9f4ed" stroke="#dcd3c4" strokeWidth={2} transform="rotate(-26 34 36)" />
      <Ellipse cx={34} cy={38} rx={5} ry={19} fill="#ffe1d0" transform="rotate(-26 34 38)" />
      <Ellipse cx={66} cy={38} rx={11} ry={27} fill="#f9f4ed" stroke="#dcd3c4" strokeWidth={2} transform="rotate(28 66 38)" />
      <Ellipse cx={66} cy={40} rx={5} ry={17} fill="#ffe1d0" transform="rotate(28 66 40)" />
      <Circle cx={50} cy={80} r={33} fill="#f9f4ed" stroke="#dcd3c4" strokeWidth={2} />
      <Ellipse cx={28} cy={88} rx={7} ry={5} fill="#ffc6a5" opacity={0.75} />
      <Ellipse cx={72} cy={88} rx={7} ry={5} fill="#ffc6a5" opacity={0.75} />
      <Circle cx={39} cy={77} r={4.6} fill="#201e1d" />
      <Circle cx={61} cy={77} r={4.6} fill="#201e1d" />
      <Circle cx={40.6} cy={75.4} r={1.5} fill="#fff" />
      <Circle cx={62.6} cy={75.4} r={1.5} fill="#fff" />
      <Path d="M32 68q7-4 13-1" fill="none" stroke="#82796a" strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M68 68q-7-4-13-1" fill="none" stroke="#82796a" strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M46 87h8l-4 4.5z" fill="#d67f48" />
      <Path d="M43 96q7 4 14 0" fill="none" stroke="#201e1d" strokeWidth={2.6} strokeLinecap="round" />
    </>
  );
}
