import React, { useEffect, useState, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { useKiosk } from "../context/KioskContext";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { VoiceCommand } from "../types";
import { Button, Card, Flex, theme } from "../styles/GlobalStyle";

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const VoiceBotContainer = styled(Card)<{ isActive: boolean }>`
  position: fixed;
  bottom: ${theme.spacing.xl};
  right: ${theme.spacing.xl};
  width: 350px;
  z-index: 1000;
  transition: all 0.3s ease;
  border: 3px solid
    ${(props) =>
      props.isActive ? theme.colors.success : theme.colors.gray[300]};

  ${(props) =>
    props.isActive &&
    css`
      animation: ${pulse} 2s infinite;
      box-shadow: 0 0 20px ${theme.colors.success}50;
    `}
`;

const VoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const VoiceStatus = styled.div<{ isListening: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${(props) =>
    props.isListening ? theme.colors.success : theme.colors.gray[600]};
  font-weight: 500;
`;

const StatusIndicator = styled.div<{ isListening: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) =>
    props.isListening ? theme.colors.success : theme.colors.gray[400]};

  ${(props) =>
    props.isListening &&
    css`
      animation: ${pulse} 1s infinite;
    `}
`;

const TranscriptArea = styled.div<{
  hasContent: boolean;
  isListening: boolean;
}>`
  min-height: 60px;
  padding: ${theme.spacing.md};
  background: ${(props) =>
    props.hasContent
      ? theme.colors.success + "10"
      : props.isListening
      ? theme.colors.primary + "10"
      : theme.colors.gray[100]};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
  border: 2px dashed
    ${(props) =>
      props.hasContent
        ? theme.colors.success
        : props.isListening
        ? theme.colors.primary
        : theme.colors.gray[300]};
  transition: all 0.3s ease;
`;

const TranscriptText = styled.p`
  color: ${theme.colors.gray[700]};
  font-style: italic;
  margin: 0;
`;

const ResponseArea = styled.div`
  min-height: 80px;
  padding: ${theme.spacing.md};
  background: ${theme.colors.primary}10;
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
  border-left: 4px solid ${theme.colors.primary};
`;

const ResponseText = styled.p`
  color: ${theme.colors.black};
  margin: 0;
  line-height: 1.5;
`;

const VoiceControls = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const HelpCommands = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.gray[100]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
`;

const CommandList = styled.ul`
  margin: ${theme.spacing.sm} 0 0 0;
  padding-left: ${theme.spacing.lg};
  color: ${theme.colors.gray[600]};
`;

interface VoiceBotProps {
  isVisible: boolean;
  onClose: () => void;
}

export const VoiceBot: React.FC<VoiceBotProps> = ({ isVisible, onClose }) => {
  const { state, dispatch } = useKiosk();
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
    processCommand,
    processCommandWithGPT,
  } = useSpeechRecognition();
  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();

  const [response, setResponse] = useState(
    "안녕하세요! 음성으로 주문을 도와드리겠습니다."
  );
  const [showHelp, setShowHelp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCommands, setProcessedCommands] = useState<Set<string>>(
    new Set()
  );
  const [gptResult, setGptResult] = useState(null);

  // 음성 명령 처리
  const handleVoiceCommand = useCallback(
    (command: VoiceCommand) => {
      setIsProcessing(true);
      let responseMessage = "";

      switch (command.intent) {
        case "add_item":
          if (command.entity) {
            // 더 정확한 메뉴 매칭 로직
            const menuItem = state.menuItems.find((item) => {
              const itemName = item.name.toLowerCase();
              const entity = command.entity!.toLowerCase();

              // 정확한 이름 매칭 우선
              if (itemName === entity) return true;

              // 키워드가 메뉴 이름을 포함하는 경우
              if (itemName.includes(entity)) return true;

              // 특별한 키워드 매칭
              if (entity === "버거" && itemName.includes("버거")) return true;
              if (entity === "감자" && itemName.includes("감자")) return true;
              if (
                entity === "음료" &&
                (itemName.includes("콜라") || itemName.includes("음료"))
              )
                return true;

              return false;
            });

            if (menuItem && menuItem.available) {
              dispatch({
                type: "ADD_TO_CART",
                payload: { menuItem, quantity: command.quantity || 1 },
              });
              responseMessage = `${menuItem.name} ${
                command.quantity || 1
              }개를 장바구니에 담았습니다.`;
            } else if (menuItem && !menuItem.available) {
              responseMessage = `죄송합니다. ${menuItem.name}은(는) 현재 품절입니다.`;
            } else {
              responseMessage = `죄송합니다. "${command.entity}" 메뉴를 찾을 수 없습니다.`;
            }
          }
          break;

        case "remove_item":
          if (command.entity) {
            // 더 정확한 메뉴 매칭 로직
            const cartItem = state.cart.find((item) => {
              const itemName = item.menuItem.name.toLowerCase();
              const entity = command.entity!.toLowerCase();

              // 정확한 이름 매칭 우선
              if (itemName === entity) return true;

              // 키워드가 메뉴 이름을 포함하는 경우
              if (itemName.includes(entity)) return true;

              // 특별한 키워드 매칭
              if (entity === "버거" && itemName.includes("버거")) return true;
              if (entity === "감자" && itemName.includes("감자")) return true;
              if (
                entity === "음료" &&
                (itemName.includes("콜라") || itemName.includes("음료"))
              )
                return true;

              return false;
            });

            if (cartItem) {
              dispatch({
                type: "REMOVE_FROM_CART",
                payload: cartItem.menuItem.id,
              });
              responseMessage = `${cartItem.menuItem.name}을(를) 장바구니에서 제거했습니다.`;
            } else {
              responseMessage = `장바구니에서 "${command.entity}" 메뉴를 찾을 수 없습니다.`;
            }
          }
          break;

        case "show_menu":
          const availableMenus = state.menuItems.filter(
            (item) => item.available
          );
          responseMessage = `현재 주문 가능한 메뉴는 ${availableMenus
            .map((item) => item.name)
            .join(", ")} 입니다.`;
          break;

        case "checkout":
          if (state.cart.length > 0) {
            responseMessage = `총 ${state.cart.length}개 상품, ${state.cart
              .reduce(
                (total, item) => total + item.menuItem.price * item.quantity,
                0
              )
              .toLocaleString()}원입니다. 주문하기 버튼을 눌러주세요.`;
          } else {
            responseMessage =
              "장바구니가 비어있습니다. 먼저 메뉴를 선택해주세요.";
          }
          break;

        case "help":
          responseMessage =
            "치킨버거 추가, 콜라 2개 주문, 감자튀김 빼기, 메뉴 보여줘, 결제하기 등의 명령을 사용할 수 있습니다.";
          setShowHelp(true);
          break;

        default:
          responseMessage =
            '죄송합니다. 명령을 이해하지 못했습니다. "도움말"이라고 말씀해보세요.';
      }

      setResponse(responseMessage);
      speak(responseMessage);
      setIsProcessing(false);
    },
    [state.menuItems, state.cart, dispatch, speak]
  );

  // 음성 인식 결과 처리 (Claude API 사용)
  useEffect(() => {
    const trimmedTranscript = transcript.trim();
    if (
      trimmedTranscript &&
      !isProcessing &&
      !processedCommands.has(trimmedTranscript)
    ) {
      // 처리된 명령으로 추가
      setProcessedCommands((prev) => new Set(prev).add(trimmedTranscript));

      // GPT API로 음성 명령 분석
      const analyzeCommand = async () => {
        setIsProcessing(true);
        try {
          const command = await processCommandWithGPT(
            trimmedTranscript,
            state.menuItems.filter((item) => item.available)
          );

          if (command) {
            handleVoiceCommand(command);
          } else {
            setResponse("명령을 이해하지 못했습니다. 다시 말씀해주세요.");
            speak("명령을 이해하지 못했습니다. 다시 말씀해주세요.");
          }
        } catch (error) {
          console.error("음성 명령 분석 실패:", error);
          setResponse("음성 분석 중 오류가 발생했습니다. 다시 시도해주세요.");
          speak("음성 분석 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
          setIsProcessing(false);
        }
      };

      analyzeCommand();

      // 5초 후 transcript와 처리된 명령 기록 클리어
      const clearTimer = setTimeout(() => {
        resetTranscript();
        setProcessedCommands(new Set());
        if (!isProcessing && isVisible) {
          startListening();
        }
      }, 5000);

      return () => clearTimeout(clearTimer);
    }
  }, [
    transcript,
    processCommandWithGPT,
    handleVoiceCommand,
    speak,
    resetTranscript,
    isProcessing,
    startListening,
    isVisible,
    processedCommands,
    state.menuItems,
  ]);

  // 초기 안내 메시지
  useEffect(() => {
    if (isVisible) {
      speak(
        "음성 주문 모드가 활성화되었습니다. 시작 버튼을 누르고 원하는 메뉴를 말씀해주세요."
      );
      setResponse("🎤 시작 버튼을 눌러 음성 주문을 시작하세요!");
    }
  }, [isVisible, speak]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      stopSpeaking();
    } else {
      startListening();
    }
  };

  if (!isVisible) return null;

  if (!isSupported) {
    return (
      <VoiceBotContainer isActive={false} padding="lg">
        <VoiceHeader>
          <h3>음성 주문</h3>
          <Button size="sm" onClick={onClose}>
            닫기
          </Button>
        </VoiceHeader>
        <ResponseArea>
          <ResponseText>
            죄송합니다. 이 브라우저는 음성 인식을 지원하지 않습니다.
            <br />
            <br />
            💡 참고: 음성 인식은 HTTPS 사이트 또는 localhost에서만 작동합니다.
            크롬, 엣지, 사파리 최신 버전을 사용해주세요.
          </ResponseText>
        </ResponseArea>
      </VoiceBotContainer>
    );
  }

  return (
    <VoiceBotContainer isActive={isListening} padding="lg">
      <VoiceHeader>
        <VoiceStatus isListening={isListening}>
          <StatusIndicator isListening={isListening} />
          <span>
            {isProcessing
              ? "처리 중..."
              : isListening
              ? "듣는 중..."
              : "대기 중"}
          </span>
        </VoiceStatus>
        <Button size="sm" onClick={onClose}>
          닫기
        </Button>
      </VoiceHeader>

      <TranscriptArea hasContent={!!transcript} isListening={isListening}>
        <TranscriptText>
          {transcript
            ? `"${transcript}"`
            : isListening
            ? "음성을 듣고 있습니다. 말씀해주세요..."
            : "음성 인식 결과가 여기에 표시됩니다..."}
        </TranscriptText>
      </TranscriptArea>

      <ResponseArea>
        <ResponseText>{response}</ResponseText>
      </ResponseArea>

      <VoiceControls>
        <Button
          variant={isListening ? "error" : "success"}
          onClick={toggleListening}
          disabled={isSpeaking || isProcessing}
        >
          {isProcessing ? "⏳ 처리중" : isListening ? "🛑 중지" : "🎤 시작"}
        </Button>

        <Button variant="secondary" onClick={() => setShowHelp(!showHelp)}>
          도움말
        </Button>

        {isSpeaking && (
          <Button variant="warning" onClick={stopSpeaking}>
            🔇 음성 중지
          </Button>
        )}
      </VoiceControls>

      {error && (
        <div
          style={{
            marginTop: theme.spacing.md,
            padding: theme.spacing.sm,
            background: theme.colors.error + "20",
            borderRadius: theme.borderRadius.md,
            color: theme.colors.error,
          }}
        >
          오류: {error}
        </div>
      )}

      {showHelp && (
        <HelpCommands>
          <strong>🎤 사용 가능한 음성 명령:</strong>
          <CommandList>
            <li>
              <strong>메뉴 추가:</strong> "치킨버거 추가", "콜라 2개 주문해줘"
            </li>
            <li>
              <strong>복합 주문:</strong> "비프버거 두 개랑 콜라 한 잔 주문"
            </li>
            <li>
              <strong>메뉴 제거:</strong> "감자튀김 빼줘", "콜라 제거"
            </li>
            <li>
              <strong>메뉴 확인:</strong> "메뉴 보여줘", "메뉴 뭐 있어?"
            </li>
            <li>
              <strong>결제:</strong> "결제", "주문 완료", "계산해줘"
            </li>
            <li>
              <strong>도움말:</strong> "도움말", "어떻게 써?"
            </li>
          </CommandList>
          <p
            style={{
              marginTop: theme.spacing.md,
              fontSize: theme.fontSize.xs,
              color: theme.colors.gray[600],
            }}
          >
            💡 GPT AI 분석으로 더 자연스러운 음성 명령이 가능합니다.
            <br />
            명령어를 말한 후 5초간 결과가 표시됩니다.
          </p>
        </HelpCommands>
      )}
      <div>GPT 결과: {gptResult}</div>
    </VoiceBotContainer>
  );
};
