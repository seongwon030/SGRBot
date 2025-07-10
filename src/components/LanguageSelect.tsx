import React from "react";

const LANGUAGES = [
  { label: "한국어", value: "ko-KR" },
  { label: "영어", value: "en-US" },
  { label: "중국어", value: "zh-CN" },
  { label: "일본어", value: "ja-JP" },
  { label: "스페인어", value: "es-ES" },
  { label: "프랑스어", value: "fr-FR" },
  { label: "독일어", value: "de-DE" },
  { label: "러시아어", value: "ru-RU" },
  { label: "베트남어", value: "vi-VN" },
  { label: "태국어", value: "th-TH" },
];

interface LanguageSelectProps {
  onSelect: (lang: string) => void;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({ onSelect }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <h2>언어를 선택하세요</h2>
      <select
        defaultValue=""
        style={{ fontSize: 24, padding: 8 }}
        onChange={e => {
          if (e.target.value) onSelect(e.target.value);
        }}
      >
        <option value="" disabled>
          언어 선택
        </option>
        {LANGUAGES.map(l => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}; 