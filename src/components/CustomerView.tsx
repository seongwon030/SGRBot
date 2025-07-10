import React, { useState } from "react";
import styled from "styled-components";
import { useKiosk } from "../context/KioskContext";
import { MenuItem, Order } from "../types";
import { Button, Card, Grid, Flex, theme } from "../styles/GlobalStyle";
import { Cart } from "./Cart";
import { VoiceBot } from "./VoiceBot";
import { Payment } from "./Payment";

const CustomerContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${theme.colors.primary}10,
    ${theme.colors.secondary}10
  );
`;

const Header = styled.header`
  background: ${theme.colors.white};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  color: ${theme.colors.primary};
  font-size: ${theme.fontSize.xxxl};
  font-weight: 700;
`;

const CategoryNav = styled.nav`
  background: ${theme.colors.white};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const CategoryTabs = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: ${theme.spacing.sm};
  overflow-x: auto;
`;

const CategoryTab = styled.button<{ active: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;

  background-color: ${(props) =>
    props.active ? theme.colors.primary : theme.colors.gray[100]};
  color: ${(props) =>
    props.active ? theme.colors.white : theme.colors.gray[700]};

  &:hover {
    background-color: ${(props) =>
      props.active ? theme.colors.primaryDark : theme.colors.gray[200]};
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: ${theme.spacing.xl};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding: ${theme.spacing.lg};
  }
`;

const MenuSection = styled.section``;

const MenuGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`;

const MenuCard = styled(Card)`
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${theme.shadows.xl};
  }
`;

const MenuImage = styled.div`
  width: 100%;
  height: 180px;
  background: linear-gradient(
    45deg,
    ${theme.colors.gray[200]},
    ${theme.colors.gray[300]}
  );
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSize.lg};
  color: ${theme.colors.gray[500]};
`;

const MenuInfo = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const MenuName = styled.h3`
  font-size: ${theme.fontSize.lg};
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.black};
`;

const MenuDescription = styled.p`
  color: ${theme.colors.gray[600]};
  font-size: ${theme.fontSize.sm};
  line-height: 1.4;
`;

const MenuFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Price = styled.span`
  font-size: ${theme.fontSize.xl};
  font-weight: 700;
  color: ${theme.colors.primary};
`;

const UnavailableOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.white};
  font-weight: 600;
  font-size: ${theme.fontSize.lg};
`;

const AdminButton = styled(Button)`
  position: fixed;
  bottom: ${theme.spacing.xl};
  left: ${theme.spacing.xl};
  z-index: 1000;
`;

interface CustomerViewProps {
  lang: string;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ lang }) => {
  const { state, dispatch } = useKiosk();
  const [selectedCategory, setSelectedCategory] = useState(
    state.categories[0]?.id || ""
  );
  const [showPayment, setShowPayment] = useState(false);

  const filteredMenus = state.menuItems.filter(
    (item) => selectedCategory === "" || item.category === selectedCategory
  );

  const addToCart = (menuItem: MenuItem) => {
    if (!menuItem.available) return;

    dispatch({
      type: "ADD_TO_CART",
      payload: { menuItem, quantity: 1 },
    });
  };

  const handleCheckout = () => {
    if (state.cart.length === 0) return;
    setShowPayment(true);
  };

  const handlePaymentComplete = (order: Order) => {
    console.log("주문 완료:", order);
    setShowPayment(false);
  };

  const handleCloseVoiceBot = () => {
    dispatch({ type: "SET_VOICE_MODE", payload: false });
  };

  return (
    <CustomerContainer>
      <Header>
        <HeaderContent>
          <Logo>🍔 맛있는 키오스크</Logo>
          <Flex gap={theme.spacing.md} align="center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() =>
                dispatch({
                  type: "SET_VOICE_MODE",
                  payload: !state.isVoiceMode,
                })
              }
            >
              {state.isVoiceMode ? "🔇 음성 끄기" : "🎤 음성 주문"}
            </Button>
          </Flex>
        </HeaderContent>
      </Header>

      <CategoryNav>
        <CategoryTabs>
          <CategoryTab
            active={selectedCategory === ""}
            onClick={() => setSelectedCategory("")}
          >
            전체
          </CategoryTab>
          {state.categories
            .sort((a, b) => a.order - b.order)
            .map((category) => (
              <CategoryTab
                key={category.id}
                active={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </CategoryTab>
            ))}
        </CategoryTabs>
      </CategoryNav>

      <MainContent>
        <MenuSection>
          <h2
            style={{
              marginBottom: theme.spacing.xl,
              fontSize: theme.fontSize.xxl,
              color: theme.colors.black,
            }}
          >
            {selectedCategory === ""
              ? "전체 메뉴"
              : state.categories.find((cat) => cat.id === selectedCategory)
                  ?.name}
          </h2>

          <MenuGrid>
            {filteredMenus.map((menu) => (
              <MenuCard
                key={menu.id}
                padding="lg"
                style={{ position: "relative" }}
              >
                <MenuImage>
                  <img
                    src={menu.image || "/logo192.png"}
                    alt={menu.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }}
                  />
                </MenuImage>

                <MenuInfo>
                  <MenuName>{menu.name}</MenuName>
                  <MenuDescription>{menu.description}</MenuDescription>
                </MenuInfo>

                <MenuFooter>
                  <Price>{menu.price.toLocaleString()}원</Price>
                  <Button
                    size="sm"
                    disabled={!menu.available}
                    onClick={() => addToCart(menu)}
                  >
                    담기
                  </Button>
                </MenuFooter>

                {!menu.available && (
                  <UnavailableOverlay>품절</UnavailableOverlay>
                )}
              </MenuCard>
            ))}
          </MenuGrid>

          {filteredMenus.length === 0 && (
            <Card
              padding="lg"
              style={{ textAlign: "center", marginTop: theme.spacing.xl }}
            >
              <h3 style={{ color: theme.colors.gray[500] }}>
                해당 카테고리에 메뉴가 없습니다.
              </h3>
            </Card>
          )}
        </MenuSection>

        <aside>
          <Cart onCheckout={handleCheckout} />
        </aside>
      </MainContent>

      <AdminButton
        variant="warning"
        onClick={() => dispatch({ type: "SET_MODE", payload: "admin" })}
      >
        관리자
      </AdminButton>

      {/* 음성 봇 */}
      <VoiceBot isVisible={state.isVoiceMode} onClose={handleCloseVoiceBot} lang={lang} />

      {/* 결제 모달 */}
      <Payment
        isVisible={showPayment}
        order={state.currentOrder}
        onClose={() => setShowPayment(false)}
        onPaymentComplete={handlePaymentComplete}
      />
    </CustomerContainer>
  );
};
