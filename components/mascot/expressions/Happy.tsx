import { Circle, Ellipse, Path } from 'react-native-svg';

/** Default/content mood — used across onboarding, home ring, empty states. */
export function Happy() {
  return (
    <>
      <Ellipse cx={34} cy={34} rx={11} ry={30} fill="#f9f4ed" stroke="#dcd3c4" strokeWidth={2} transform="rotate(-9 34 34)" />
      <Ellipse cx={34} cy={36} rx={5} ry={20} fill="#ffe1d0" transform="rotate(-9 34 36)" />
      <Ellipse cx={66} cy={34} rx={11} ry={30} fill="#f9f4ed" stroke="#dcd3c4" strokeWidth={2} transform="rotate(9 66 34)" />
      <Ellipse cx={66} cy={36} rx={5} ry={20} fill="#ffe1d0" transform="rotate(9 66 36)" />
      <Circle cx={50} cy={80} r={33} fill="#f9f4ed" stroke="#dcd3c4" strokeWidth={2} />
      <Ellipse cx={28} cy={88} rx={7} ry={5} fill="#ffc6a5" opacity={0.75} />
      <Ellipse cx={72} cy={88} rx={7} ry={5} fill="#ffc6a5" opacity={0.75} />
      <Circle cx={39} cy={76} r={4.6} fill="#201e1d" />
      <Circle cx={61} cy={76} r={4.6} fill="#201e1d" />
      <Circle cx={40.6} cy={74.4} r={1.5} fill="#fff" />
      <Circle cx={62.6} cy={74.4} r={1.5} fill="#fff" />
      <Path d="M46 86.5h8l-4 4.5z" fill="#d67f48" />
      <Path d="M42 94q8 7 16 0" fill="none" stroke="#201e1d" strokeWidth={2.6} strokeLinecap="round" />
    </>
  );
}
