import React, { useState } from "react";
import styled from "styled-components";
import { useKiosk } from "../context/KioskContext";
import { Button, Card, Flex, theme } from "../styles/GlobalStyle";

const CartContainer = styled(Card)`
  position: sticky;
  top: 120px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
`;

const CartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 2px solid ${theme.colors.gray[200]};
`;

const CartTitle = styled.h3`
  font-size: ${theme.fontSize.lg};
  color: ${theme.colors.black};
`;

const CartBadge = styled.span`
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.round};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  min-width: 20px;
  text-align: center;
`;

const CartItems = styled.div`
  margin-bottom: ${theme.spacing.lg};
  max-height: 300px;
  overflow-y: auto;
`;

const CartItem = styled.div`
  padding: ${theme.spacing.md} 0;
  border-bottom: 1px solid ${theme.colors.gray[200]};

  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  margin-bottom: ${theme.spacing.sm};
`;

const ItemName = styled.div`
  font-weight: 500;
  margin-bottom: ${theme.spacing.xs};
`;

const ItemPrice = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.gray[600]};
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.gray[200]};
  color: ${theme.colors.gray[700]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.gray[300]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span`
  min-width: 40px;
  text-align: center;
  font-weight: 500;
`;

const RemoveButton = styled(Button)`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.fontSize.xs};
`;

const TotalSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  background: ${theme.colors.gray[100]};
  border-radius: ${theme.borderRadius.md};
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
    font-weight: 600;
    font-size: ${theme.fontSize.lg};
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl} ${theme.spacing.lg};
  color: ${theme.colors.gray[500]};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${theme.spacing.lg};
`;

interface CartProps {
  onCheckout?: () => void;
}

export const Cart: React.FC<CartProps> = ({ onCheckout }) => {
  const { state, dispatch } = useKiosk();
  const [isProcessing, setIsProcessing] = useState(false);

  const updateQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: "REMOVE_FROM_CART", payload: menuItemId });
    } else {
      dispatch({
        type: "UPDATE_CART_ITEM",
        payload: { menuItemId, quantity: newQuantity },
      });
    }
  };

  const removeItem = (menuItemId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: menuItemId });
  };

  const clearCart = () => {
    if (window.confirm("장바구니를 비우시겠습니까?")) {
      dispatch({ type: "CLEAR_CART" });
    }
  };

  const getItemCount = () => {
    return state.cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return state.cart.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
  };

  const getTotal = () => {
    return getSubtotal();
  };

  const handleCheckout = async () => {
    if (state.cart.length === 0) return;

    setIsProcessing(true);

    try {
      // 주문 처리 로직
      const newOrder = {
        id: Date.now().toString(),
        items: [...state.cart],
        totalAmount: getTotal(),
        orderTime: new Date(),
        status: "pending" as const,
        paymentMethod: "card" as const,
      };

      dispatch({ type: "CREATE_ORDER", payload: newOrder });

      if (onCheckout) {
        onCheckout();
      }
    } catch (error) {
      console.error("주문 처리 중 오류:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (state.cart.length === 0) {
    return (
      <CartContainer padding="lg">
        <CartHeader>
          <CartTitle>장바구니</CartTitle>
          <CartBadge>0</CartBadge>
        </CartHeader>

        <EmptyCart>
          <EmptyIcon>🛒</EmptyIcon>
          <p>장바구니가 비어있습니다</p>
          <p
            style={{ fontSize: theme.fontSize.sm, marginTop: theme.spacing.sm }}
          >
            원하는 메뉴를 선택해주세요
          </p>
        </EmptyCart>
      </CartContainer>
    );
  }

  return (
    <CartContainer padding="lg">
      <CartHeader>
        <CartTitle>장바구니</CartTitle>
        <CartBadge>{getItemCount()}</CartBadge>
      </CartHeader>

      <CartItems>
        {state.cart.map((item) => (
          <CartItem key={item.menuItem.id}>
            <ItemInfo>
              <ItemName>{item.menuItem.name}</ItemName>
              <ItemPrice>{item.menuItem.price.toLocaleString()}원</ItemPrice>
            </ItemInfo>

            <Flex justify="space-between" align="center">
              <QuantityControls>
                <QuantityButton
                  onClick={() =>
                    updateQuantity(item.menuItem.id, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                >
                  −
                </QuantityButton>
                <QuantityDisplay>{item.quantity}</QuantityDisplay>
                <QuantityButton
                  onClick={() =>
                    updateQuantity(item.menuItem.id, item.quantity + 1)
                  }
                >
                  +
                </QuantityButton>
              </QuantityControls>

              <Flex align="center" gap={theme.spacing.sm}>
                <span style={{ fontWeight: 600 }}>
                  {(item.menuItem.price * item.quantity).toLocaleString()}원
                </span>
                <RemoveButton
                  variant="error"
                  size="sm"
                  onClick={() => removeItem(item.menuItem.id)}
                >
                  삭제
                </RemoveButton>
              </Flex>
            </Flex>
          </CartItem>
        ))}
      </CartItems>

      <TotalSection>
        <TotalRow>
          <span>총 금액</span>
          <span style={{ color: theme.colors.primary }}>
            {getTotal().toLocaleString()}원
          </span>
        </TotalRow>
      </TotalSection>

      <Flex direction="column" gap={theme.spacing.sm}>
        <Button
          fullWidth
          size="lg"
          variant="success"
          onClick={handleCheckout}
          disabled={isProcessing}
        >
          {isProcessing ? "처리중..." : `주문하기 (${getItemCount()}개)`}
        </Button>

        <Button
          fullWidth
          variant="error"
          size="sm"
          onClick={clearCart}
          disabled={isProcessing}
        >
          장바구니 비우기
        </Button>
      </Flex>
    </CartContainer>
  );
};
