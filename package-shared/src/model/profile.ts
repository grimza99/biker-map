import type { Tproficiency } from "../types";

export const proficiencyMap: Record<Tproficiency, string> = {
  beginner: "초급자",
  intermediate: "중급자",
  advanced: "고급자",
};

export const proficiencyClassNameMap = (proficiency: Tproficiency | null) => {
  const classNameMap: Record<Tproficiency, string> = {
    beginner: "bg-green-300/10 border-green-300/20 text-green-300",
    intermediate: "bg-blue-300/10 border-blue-300/20 text-blue-300",
    advanced: "bg-red-300/10 border-red-300/20 text-red-300",
  };
  return proficiency ? classNameMap[proficiency] : "";
};

export const proficiencySelectOptions = [
  { value: "beginner", label: "초급자" },
  { value: "intermediate", label: "중급자" },
  { value: "advanced", label: "고급자" },
];
