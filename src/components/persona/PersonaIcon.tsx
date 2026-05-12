import { Gamepad2, Coffee, Briefcase, Music, Smartphone } from "lucide-react";

const ICON_META = [
  { bg: "#eef3ff", color: "#2f66ff" },
  { bg: "#eef3ff", color: "#2f66ff" },
  { bg: "#eef3ff", color: "#2f66ff" },
  { bg: "#eef3ff", color: "#2f66ff" },
  { bg: "#eef3ff", color: "#2f66ff" },
];

interface PersonaIconProps {
  iconKey: number;
  size?: number;
}

export function PersonaIcon({ iconKey, size = 20 }: PersonaIconProps) {
  const icons = [
    <Gamepad2 size={size} />,
    <Coffee size={size} />,
    <Briefcase size={size} />,
    <Music size={size} />,
    <Smartphone size={size} />,
  ];
  return <span style={{ color: ICON_META[iconKey % 5].color }}>{icons[iconKey % 5]}</span>;
}
