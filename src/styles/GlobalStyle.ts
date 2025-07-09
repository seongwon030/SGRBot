import styled, { createGlobalStyle } from "styled-components";

export const theme = {
  colors: {
    primary: "#FF6B35",
    primaryDark: "#E55A2B",
    secondary: "#4ECDC4",
    success: "#45B7D1",
    warning: "#FFA726",
    error: "#EF5350",
    white: "#FFFFFF",
    black: "#2C3E50",
    gray: {
      100: "#F8F9FA",
      200: "#E9ECEF",
      300: "#DEE2E6",
      400: "#CED4DA",
      500: "#6C757D",
      600: "#495057",
      700: "#343A40",
      800: "#212529",
    },
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  },
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    round: "50%",
  },
  shadows: {
    sm: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
    md: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
    lg: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
    xl: "0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)",
  },
  fontSize: {
    xs: "12px",
    sm: "14px",
    md: "16px",
    lg: "18px",
    xl: "20px",
    xxl: "24px",
    xxxl: "32px",
  },
};

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${theme.colors.gray[100]};
    color: ${theme.colors.black};
    line-height: 1.6;
  }

  button {
    border: none;
    outline: none;
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea {
    border: none;
    outline: none;
    font-family: inherit;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

// 공통 버튼 스타일
export const Button = styled.button<{
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}>`
  padding: ${(props) =>
    props.size === "sm"
      ? `${theme.spacing.sm} ${theme.spacing.md}`
      : props.size === "lg"
      ? `${theme.spacing.lg} ${theme.spacing.xl}`
      : `${theme.spacing.md} ${theme.spacing.lg}`};
  border-radius: ${theme.borderRadius.md};
  font-size: ${(props) =>
    props.size === "sm"
      ? theme.fontSize.sm
      : props.size === "lg"
      ? theme.fontSize.lg
      : theme.fontSize.md};
  font-weight: 500;
  transition: all 0.2s ease;
  width: ${(props) => (props.fullWidth ? "100%" : "auto")};

  background-color: ${(props) => {
    switch (props.variant) {
      case "secondary":
        return theme.colors.secondary;
      case "success":
        return theme.colors.success;
      case "warning":
        return theme.colors.warning;
      case "error":
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  }};

  color: ${theme.colors.white};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
    opacity: 0.9;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// 카드 컴포넌트
export const Card = styled.div<{
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
}>`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.sm};
  padding: ${(props) =>
    props.padding === "sm"
      ? theme.spacing.md
      : props.padding === "lg"
      ? theme.spacing.xl
      : theme.spacing.lg};
  transition: all 0.2s ease;

  ${(props) =>
    props.hover &&
    `
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${theme.shadows.lg};
    }
  `}
`;

// 입력 필드
export const Input = styled.input`
  padding: ${theme.spacing.md};
  border: 2px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.md};
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.gray[500]};
  }
`;

// 그리드 레이아웃
export const Grid = styled.div<{
  columns?: number;
  gap?: string;
}>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.columns || 2}, 1fr);
  gap: ${(props) => props.gap || theme.spacing.lg};
`;

// 플렉스 컨테이너
export const Flex = styled.div<{
  direction?: "row" | "column";
  justify?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around";
  align?: "flex-start" | "center" | "flex-end" | "stretch";
  gap?: string;
  wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${(props) => props.direction || "row"};
  justify-content: ${(props) => props.justify || "flex-start"};
  align-items: ${(props) => props.align || "stretch"};
  gap: ${(props) => props.gap || "0"};
  flex-wrap: ${(props) => (props.wrap ? "wrap" : "nowrap")};
`;
