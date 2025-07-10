import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { KioskProvider } from "./context/KioskContext";
import { AdminPanel } from "./components/AdminPanel";
import { CustomerView } from "./components/CustomerView";
import { GlobalStyle, theme } from "./styles/GlobalStyle";
import { LanguageSelect } from "./components/LanguageSelect";

// 키오스크 메인 컴포넌트
const KioskMain: React.FC<{ lang: string }> = ({ lang }) => {
  // useKiosk를 이 위치에서 import
  const { useKiosk } = require("./context/KioskContext");
  const { state } = useKiosk();

  return (
    <>
      <GlobalStyle />
      {state.mode === "admin" ? <AdminPanel /> : <CustomerView lang={lang} />}
    </>
  );
};

// App 컴포넌트
const App: React.FC = () => {
  const [lang, setLang] = useState<string | null>(null);

  return (
    <ThemeProvider theme={theme}>
      <KioskProvider>
        {!lang ? (
          <LanguageSelect onSelect={setLang} />
        ) : (
          <KioskMain lang={lang} />
        )}
      </KioskProvider>
    </ThemeProvider>
  );
};

export default App;
