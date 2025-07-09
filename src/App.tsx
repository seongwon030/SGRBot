import React from "react";
import { ThemeProvider } from "styled-components";
import { KioskProvider, useKiosk } from "./context/KioskContext";
import { AdminPanel } from "./components/AdminPanel";
import { CustomerView } from "./components/CustomerView";
import { GlobalStyle, theme } from "./styles/GlobalStyle";

// 키오스크 메인 컴포넌트
const KioskMain: React.FC = () => {
  const { state } = useKiosk();

  return (
    <>
      <GlobalStyle />
      {state.mode === "admin" ? <AdminPanel /> : <CustomerView />}
    </>
  );
};

// App 컴포넌트
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <KioskProvider>
        <KioskMain />
      </KioskProvider>
    </ThemeProvider>
  );
};

export default App;
