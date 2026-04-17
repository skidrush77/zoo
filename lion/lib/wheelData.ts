export interface WheelSection {
  id: number;
  label: string;
  sublabel: string;
  color: string;
  textColor: string;
}

export const WHEEL_SECTIONS: WheelSection[] = [
  { id: 0, label: "원샷!", sublabel: "One Shot!", color: "#C41E3A", textColor: "#FFD700" },
  { id: 1, label: "두 잔", sublabel: "Drink 2", color: "#6B0000", textColor: "#FFFFFF" },
  { id: 2, label: "옆사람!", sublabel: "Next Person", color: "#C41E3A", textColor: "#FFD700" },
  { id: 3, label: "건배사!", sublabel: "Make a Toast", color: "#6B0000", textColor: "#FFFFFF" },
  { id: 4, label: "춤추기", sublabel: "Dance!", color: "#C41E3A", textColor: "#FFD700" },
  { id: 5, label: "노래!", sublabel: "Sing!", color: "#6B0000", textColor: "#FFFFFF" },
  { id: 6, label: "폭탄주!", sublabel: "Bomb Shot", color: "#C41E3A", textColor: "#FFD700" },
  { id: 7, label: "통과!", sublabel: "Pass!", color: "#1A1A2E", textColor: "#FFD700" },
];

export const SECTION_COUNT = WHEEL_SECTIONS.length;
export const SECTION_ANGLE = (Math.PI * 2) / SECTION_COUNT;
