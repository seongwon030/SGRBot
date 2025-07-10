import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { KioskProvider } from "./context/KioskContext";
import { AdminPanel } from "./components/AdminPanel";
import { CustomerView } from "./components/CustomerView";
import { GlobalStyle, theme } from "./styles/GlobalStyle";

// 키오스크 메인 컴포넌트
const KioskMain: React.FC<{ lang: string; setLang: (lang: string) => void }> = ({ lang, setLang }) => {
  const { useKiosk } = require("./context/KioskContext");
  const { state } = useKiosk();

  return (
    <>
      <GlobalStyle />
      {state.mode === "admin" ? <AdminPanel /> : <CustomerView lang={lang} setLang={setLang} />}
    </>
  );
};

// App 컴포넌트
const App: React.FC = () => {
  const [lang, setLang] = useState<string>("ko-KR");

  return (
    <ThemeProvider theme={theme}>
      <KioskProvider>
        <KioskMain lang={lang} setLang={setLang} />
      </KioskProvider>
    </ThemeProvider>
  );
};

export default App;
