import { useState, useEffect, useCallback } from "react";
import { VoiceCommand, MenuItem } from "../types";
import { gptVoiceAnalyzer } from "../utils/gptVoiceAnalyzer";

// Web Speech API 타입 확장
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
  error: string | null;
  processCommand: (text: string) => VoiceCommand | null;
  processCommandWithGPT: (
    text: string,
    availableMenus: MenuItem[]
  ) => Promise<VoiceCommand | null>;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  // 브라우저 지원 여부 확인
  const isSupported =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.continuous = false; // 한 번에 하나의 명령만 처리
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = "ko-KR";

    recognitionInstance.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    recognitionInstance.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
      }
    };

    recognitionInstance.onerror = (event: any) => {
      setError(event.error);
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript("");
      setError(null);
      recognition.start();
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  // 한글 숫자 → 숫자 변환 함수
  const koreanNumberToDigit = (text: string): number | null => {
    const map: { [key: string]: number } = {
      한: 1,
      하나: 1,
      두: 2,
      둘: 2,
      세: 3,
      셋: 3,
      네: 4,
      넷: 4,
      다섯: 5,
      여섯: 6,
      일곱: 7,
      여덟: 8,
      아홉: 9,
      열: 10,
    };
    return map[text] || null;
  };

  // 음성 명령 처리 함수
  const processCommand = useCallback((text: string): VoiceCommand | null => {
    const lowerText = text.toLowerCase().trim();

    // 메뉴 추가 명령
    if (
      lowerText.includes("추가") ||
      lowerText.includes("주문") ||
      lowerText.includes("넣어")
    ) {
      // 더 구체적인 메뉴명을 먼저 매칭하도록 순서 조정
      const menuKeywords = [
        "치킨버거",
        "비프버거",
        "감자튀김",
        "콜라",
        // 일반적인 키워드는 마지막에
        "버거",
        "감자",
        "음료",
      ];

      // 정확한 매칭을 위해 가장 구체적인 것부터 찾기
      let foundMenu = null;
      for (const keyword of menuKeywords) {
        if (lowerText.includes(keyword)) {
          foundMenu = keyword;
          break;
        }
      }

      // 수량 추출 (숫자+개/잔/번 또는 한글 숫자+개/잔/번)
      let quantity = 1;
      const quantityMatch = lowerText.match(
        /([0-9]+|한|두|세|네|다섯|여섯|일곱|여덟|아홉|열)(개|잔|번)/
      );
      if (quantityMatch) {
        if (quantityMatch[1].match(/[0-9]+/)) {
          quantity = parseInt(quantityMatch[1]);
        } else {
          const kNum = koreanNumberToDigit(quantityMatch[1]);
          if (kNum) quantity = kNum;
        }
      }

      if (foundMenu) {
        return {
          intent: "add_item",
          entity: foundMenu,
          quantity: quantity,
        };
      }
    }

    // 메뉴 제거 명령
    if (
      lowerText.includes("빼") ||
      lowerText.includes("제거") ||
      lowerText.includes("삭제")
    ) {
      // 더 구체적인 메뉴명을 먼저 매칭하도록 순서 조정
      const menuKeywords = [
        "치킨버거",
        "비프버거",
        "감자튀김",
        "콜라",
        // 일반적인 키워드는 마지막에
        "버거",
        "감자",
        "음료",
      ];

      // 정확한 매칭을 위해 가장 구체적인 것부터 찾기
      let foundMenu = null;
      for (const keyword of menuKeywords) {
        if (lowerText.includes(keyword)) {
          foundMenu = keyword;
          break;
        }
      }

      if (foundMenu) {
        return {
          intent: "remove_item",
          entity: foundMenu,
        };
      }
    }

    // 메뉴 보기 명령
    if (
      lowerText.includes("메뉴") &&
      (lowerText.includes("보여") ||
        lowerText.includes("알려") ||
        lowerText.includes("뭐"))
    ) {
      return {
        intent: "show_menu",
      };
    }

    // 결제 명령
    if (
      lowerText.includes("결제") ||
      lowerText.includes("계산") ||
      lowerText.includes("주문완료")
    ) {
      return {
        intent: "checkout",
      };
    }

    // 도움말 명령
    if (
      lowerText.includes("도움") ||
      lowerText.includes("help") ||
      lowerText.includes("어떻게")
    ) {
      return {
        intent: "help",
      };
    }

    return null;
  }, []);

  // GPT API를 사용한 음성 명령 처리 (비동기)
  const processCommandWithGPT = useCallback(
    async (
      text: string,
      availableMenus: MenuItem[]
    ): Promise<VoiceCommand | null> => {
      return await gptVoiceAnalyzer.analyzeVoiceCommand(text, availableMenus);
    },
    []
  );

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
    processCommand,
    processCommandWithGPT,
  };
};
