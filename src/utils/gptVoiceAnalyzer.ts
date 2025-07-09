import { VoiceCommand, MenuItem } from "../types";

interface GPTAnalysisResult {
  intent: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  confidence: number;
}

export class GPTVoiceAnalyzer {
  private apiKey: string;
  private apiUrl = "https://api.openai.com/v1/chat/completions";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.REACT_APP_OPENAI_API_KEY || "";
  }

  async analyzeVoiceCommand(
    transcript: string,
    availableMenus: MenuItem[]
  ): Promise<VoiceCommand | null> {
    if (!this.apiKey) {
      console.warn(
        "OpenAI API 키가 설정되지 않았습니다. 기본 키워드 매칭을 사용합니다."
      );
      return this.fallbackKeywordMatching(transcript, availableMenus);
    }

    try {
      const menuList = availableMenus
        .map((item) => `- ${item.name} (${item.name_en}): ${item.price}원`)
        .join("\n");

      const systemPrompt = `You are a kiosk voice order expert. Analyze the user's speech and extract the order intent in either Korean or English.

Available menus:
${menuList}

Respond ONLY in the following JSON format:
{
  "intent": "add_item|remove_item|show_menu|checkout|help|unknown",
  "items": [
    {
      "name": "정확한_메뉴명_한글",
      "quantity": 숫자
    },
    ...
  ],
  "confidence": 0.0-1.0
}

Rules:
1. If the user speaks in English, match the English menu name to the corresponding Korean menu name in the menu list and use the Korean name in the response.
2. Only use exact menu names from the list above.
3. If the menu is not available, do not include it.
4. If quantity is not specified, set it to 1.
5. For ambiguous expressions, set confidence low.
6. If the user orders multiple menus at once (e.g., "치킨버거 하나, 콜라 두 개 주문"), return all items in the items array.
7. Respond ONLY in JSON, no extra text.`;

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: `사용자 음성: "${transcript}"`,
            },
          ],
          max_tokens: 300,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API 오류: ${response.status} - ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();

      // JSON 파싱
      const result: GPTAnalysisResult = JSON.parse(content);

      // VoiceCommand 형태로 변환 (여러 메뉴 지원)
      if (
        result.intent === "add_item" &&
        result.items &&
        result.items.length > 0
      ) {
        // 실제 메뉴와 정확히 매칭되는 것만 추림
        const validItems = result.items.filter((item: any) =>
          availableMenus.some((menu) => menu.name === item.name)
        );
        if (validItems.length > 0) {
          return {
            intent: "add_item",
            items: validItems,
            confidence: result.confidence,
          };
        }
      } else if (
        result.intent === "remove_item" &&
        result.items &&
        result.items.length > 0
      ) {
        const firstItem = result.items[0];
        return {
          intent: "remove_item",
          entity: firstItem.name,
          confidence: result.confidence,
        };
      } else if (result.intent === "show_menu") {
        return {
          intent: "show_menu",
          confidence: result.confidence,
        };
      } else if (result.intent === "checkout") {
        return {
          intent: "checkout",
          confidence: result.confidence,
        };
      } else if (result.intent === "help") {
        return {
          intent: "help",
          confidence: result.confidence,
        };
      }

      // 신뢰도가 낮으면 폴백 사용
      if (result.confidence < 0.6) {
        return this.fallbackKeywordMatching(transcript, availableMenus);
      }

      return null;
    } catch (error) {
      console.error("OpenAI API 분석 실패:", error);
      // API 실패 시 기본 키워드 매칭으로 폴백
      return this.fallbackKeywordMatching(transcript, availableMenus);
    }
  }

  private fallbackKeywordMatching(
    transcript: string,
    availableMenus: MenuItem[]
  ): VoiceCommand | null {
    const lowerText = transcript.toLowerCase().trim();

    // 메뉴 추가 명령
    if (
      lowerText.includes("추가") ||
      lowerText.includes("주문") ||
      lowerText.includes("넣어")
    ) {
      // 사용 가능한 메뉴들로부터 키워드 생성
      const menuKeywords = availableMenus.map((menu) => ({
        keyword: menu.name,
        menu: menu,
      }));

      // 더 구체적인 메뉴명을 먼저 매칭
      menuKeywords.sort((a, b) => b.keyword.length - a.keyword.length);

      let foundMenu = null;
      for (const item of menuKeywords) {
        if (lowerText.includes(item.keyword.toLowerCase())) {
          foundMenu = item.menu;
          break;
        }
      }

      if (foundMenu) {
        // 수량 추출
        const quantityMatch = lowerText.match(/(\d+)개|(\d+)잔|(\d+)번/);
        const quantity = quantityMatch
          ? parseInt(quantityMatch[1] || quantityMatch[2] || quantityMatch[3])
          : 1;

        return {
          intent: "add_item",
          entity: foundMenu.name,
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
      const menuKeywords = availableMenus.map((menu) => ({
        keyword: menu.name,
        menu: menu,
      }));

      menuKeywords.sort((a, b) => b.keyword.length - a.keyword.length);

      let foundMenu = null;
      for (const item of menuKeywords) {
        if (lowerText.includes(item.keyword.toLowerCase())) {
          foundMenu = item.menu;
          break;
        }
      }

      if (foundMenu) {
        return {
          intent: "remove_item",
          entity: foundMenu.name,
        };
      }
    }

    // 기타 명령들
    if (
      lowerText.includes("메뉴") &&
      (lowerText.includes("보여") ||
        lowerText.includes("알려") ||
        lowerText.includes("뭐"))
    ) {
      return { intent: "show_menu" };
    }

    if (
      lowerText.includes("결제") ||
      lowerText.includes("계산") ||
      lowerText.includes("주문완료")
    ) {
      return { intent: "checkout" };
    }

    if (
      lowerText.includes("도움") ||
      lowerText.includes("help") ||
      lowerText.includes("어떻게")
    ) {
      return { intent: "help" };
    }

    return null;
  }
}

// 싱글톤 인스턴스
export const gptVoiceAnalyzer = new GPTVoiceAnalyzer();
