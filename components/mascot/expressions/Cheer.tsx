import { Circle, Ellipse, Path } from 'react-native-svg';

/** Celebrating/excited mood — onboarding "done" step, streak screen, badge unlocks. */
export function Cheer() {
  return (
    <>
      <Ellipse cx={32} cy={30} rx={11} ry={30} fill="#f9f4ed" stroke="#dcd3c4" strokeWidth={2} transform="rotate(-20 32 30)" />
      <Ellipse cx={32} cy={32} rx={5} ry={20} fill="#ffe1d0" transform="rotate(-20 32 32)" />
      <Ellipse cx={68} cy={30} rx={11} ry={30} fill="#f9f4ed" stroke="#dcd3c4" strokeWidth={2} transform="rotate(20 68 30)" />
      <Ellipse cx={68} cy={32} rx={5} ry={20} fill="#ffe1d0" transform="rotate(20 68 32)" />
      <Circle cx={50} cy={80} r={33} fill="#f9f4ed" stroke="#dcd3c4" strokeWidth={2} />
      <Ellipse cx={27} cy={88} rx={8} ry={5.5} fill="#ffc6a5" />
      <Ellipse cx={73} cy={88} rx={8} ry={5.5} fill="#ffc6a5" />
      <Path d="M33 78q6-8 12 0" fill="none" stroke="#201e1d" strokeWidth={3} strokeLinecap="round" />
      <Path d="M55 78q6-8 12 0" fill="none" stroke="#201e1d" strokeWidth={3} strokeLinecap="round" />
      <Path d="M40 88q10 14 20 0z" fill="#8c491a" />
      <Circle cx={16} cy={52} r={3.4} fill="#d29a3c" />
      <Circle cx={86} cy={46} r={4.4} fill="#d29a3c" />
      <Circle cx={88} cy={70} r={2.6} fill="#8fa073" />
    </>
  );
}
