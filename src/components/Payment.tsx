import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useKiosk } from "../context/KioskContext";
import { Order } from "../types";
import { Button, Card, Flex, theme } from "../styles/GlobalStyle";

const PaymentContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const PaymentModal = styled(Card)`
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const PaymentHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.lg};
  border-bottom: 2px solid ${theme.colors.gray[200]};
`;

const PaymentTitle = styled.h2`
  color: ${theme.colors.black};
  margin-bottom: ${theme.spacing.sm};
  font-size: ${theme.fontSize.xxl};
`;

const OrderSummary = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const PaymentMethods = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const PaymentMethodButton = styled.button<{ selected: boolean }>`
  width: 100%;
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  border: 2px solid
    ${(props) =>
      props.selected ? theme.colors.primary : theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.lg};
  background: ${(props) =>
    props.selected ? theme.colors.primary + "10" : theme.colors.white};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.primary}10;
  }
`;

const PaymentMethodIcon = styled.div`
  font-size: ${theme.fontSize.xxl};
  margin-bottom: ${theme.spacing.sm};
`;

const PaymentMethodName = styled.div`
  font-weight: 600;
  margin-bottom: ${theme.spacing.xs};
`;

const PaymentMethodDesc = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.gray[600]};
`;

const TotalSection = styled.div`
  background: ${theme.colors.gray[100]};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.xl};
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};

  &:last-child {
    margin-bottom: 0;
    padding-top: ${theme.spacing.sm};
    border-top: 2px solid ${theme.colors.gray[300]};
    font-weight: 700;
    font-size: ${theme.fontSize.lg};
  }
`;

const ProcessingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  color: ${theme.colors.white};
`;

const ProcessingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid ${theme.colors.gray[300]};
  border-top: 4px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: ${theme.spacing.lg};

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
`;

const SuccessIcon = styled.div`
  font-size: 80px;
  margin-bottom: ${theme.spacing.lg};
`;

interface PaymentProps {
  isVisible: boolean;
  order: Order | null;
  onClose: () => void;
  onPaymentComplete: (order: Order) => void;
  selectedMethod: "card" | "cash" | "digital";
  setSelectedMethod: React.Dispatch<React.SetStateAction<"card" | "cash" | "digital">>;
}

export const Payment: React.FC<PaymentProps> = ({
  isVisible,
  order,
  onClose,
  onPaymentComplete,
  selectedMethod,
  setSelectedMethod,
}) => {
  const { dispatch } = useKiosk();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const paymentMethods = [
    {
      id: "card" as const,
      icon: "💳",
      name: "카드 결제",
      description: "신용카드, 체크카드로 결제",
    },
    {
      id: "cash" as const,
      icon: "💵",
      name: "현금 결제",
      description: "현금으로 결제",
    },
    {
      id: "digital" as const,
      icon: "📱",
      name: "간편결제",
      description: "삼성페이, 애플페이, 네이버페이 등",
    },
  ];

  // 결제 완료 후 카운트다운
  useEffect(() => {
    if (isComplete && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isComplete && countdown === 0) {
      handleClose();
    }
  }, [isComplete, countdown]);

  const handlePayment = async () => {
    if (!order) return;

    setIsProcessing(true);

    try {
      // 결제 처리 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const completedOrder: Order = {
        ...order,
        status: "completed",
        paymentMethod: selectedMethod,
      };

      setIsProcessing(false);
      setIsComplete(true);
      onPaymentComplete(completedOrder);
    } catch (error) {
      console.error("결제 처리 중 오류:", error);
      setIsProcessing(false);
      alert("결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleClose = () => {
    setIsComplete(false);
    setCountdown(5);
    setIsProcessing(false);
    dispatch({ type: "CLEAR_ORDER" });
    onClose();
  };

  if (!isVisible || !order) return null;

  // 결제 처리 중 화면
  if (isProcessing) {
    return (
      <ProcessingOverlay>
        <ProcessingSpinner />
        <h2>결제 처리 중...</h2>
        <p>잠시만 기다려주세요.</p>
      </ProcessingOverlay>
    );
  }

  // 결제 완료 화면
  if (isComplete) {
    return (
      <ProcessingOverlay>
        <SuccessMessage>
          <SuccessIcon>✅</SuccessIcon>
          <h2>결제가 완료되었습니다!</h2>
          <p
            style={{ marginTop: theme.spacing.lg, fontSize: theme.fontSize.lg }}
          >
            주문번호: {order.id}
          </p>
          <p style={{ marginTop: theme.spacing.md }}>
            {countdown}초 후 자동으로 닫힙니다.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleClose}
            style={{ marginTop: theme.spacing.xl }}
          >
            확인
          </Button>
        </SuccessMessage>
      </ProcessingOverlay>
    );
  }

  const getSubtotal = () => {
    return order.items.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
  };

  const getTotal = () => {
    return getSubtotal();
  };

  return (
    <PaymentContainer>
      <PaymentModal padding="lg">
        <PaymentHeader>
          <PaymentTitle>결제하기</PaymentTitle>
          <p style={{ color: theme.colors.gray[600] }}>
            결제 방법을 선택하고 결제를 진행해주세요
          </p>
        </PaymentHeader>

        <OrderSummary>
          <h3 style={{ marginBottom: theme.spacing.lg }}>주문 내역</h3>
          {order.items.map((item) => (
            <OrderItem key={item.menuItem.id}>
              <div>
                <div style={{ fontWeight: 500 }}>{item.menuItem.name}</div>
                <div
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.gray[600],
                  }}
                >
                  {item.menuItem.price.toLocaleString()}원 × {item.quantity}
                </div>
              </div>
              <div style={{ fontWeight: 600 }}>
                {(item.menuItem.price * item.quantity).toLocaleString()}원
              </div>
            </OrderItem>
          ))}
        </OrderSummary>

        <TotalSection>
          <TotalRow>
            <span>총 결제 금액</span>
            <span style={{ color: theme.colors.primary }}>
              {getTotal().toLocaleString()}원
            </span>
          </TotalRow>
        </TotalSection>

        <PaymentMethods>
          <h3 style={{ marginBottom: theme.spacing.lg }}>결제 방법</h3>
          {paymentMethods.map((method) => (
            <PaymentMethodButton
              key={method.id}
              selected={selectedMethod === method.id}
              onClick={() => setSelectedMethod(method.id)}
            >
              <PaymentMethodIcon>{method.icon}</PaymentMethodIcon>
              <PaymentMethodName>{method.name}</PaymentMethodName>
              <PaymentMethodDesc>{method.description}</PaymentMethodDesc>
            </PaymentMethodButton>
          ))}
        </PaymentMethods>

        <Flex gap={theme.spacing.md}>
          <Button
            variant="error"
            size="lg"
            onClick={handleClose}
            style={{ flex: 1 }}
          >
            취소
          </Button>
          <Button
            variant="success"
            size="lg"
            onClick={handlePayment}
            style={{ flex: 2 }}
          >
            {getTotal().toLocaleString()}원 결제하기
          </Button>
        </Flex>
      </PaymentModal>
    </PaymentContainer>
  );
};
