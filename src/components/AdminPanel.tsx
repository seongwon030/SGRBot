import React, { useState } from "react";
import styled from "styled-components";
import { useKiosk } from "../context/KioskContext";
import { MenuItem, Category } from "../types";
import { Button, Card, Input, Grid, Flex, theme } from "../styles/GlobalStyle";

const AdminContainer = styled.div`
  padding: ${theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const Section = styled.section`
  margin-bottom: ${theme.spacing.xxl};
`;

const SectionTitle = styled.h2`
  color: ${theme.colors.black};
  margin-bottom: ${theme.spacing.lg};
  font-size: ${theme.fontSize.xxl};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: 500;
  color: ${theme.colors.gray[700]};
`;

const Select = styled.select`
  padding: ${theme.spacing.md};
  border: 2px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.md};

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
  }
`;

const MenuItemCard = styled(Card)`
  position: relative;
`;

const MenuItemActions = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  display: flex;
  gap: ${theme.spacing.sm};
`;

const Price = styled.span`
  color: ${theme.colors.primary};
  font-weight: 600;
  font-size: ${theme.fontSize.lg};
`;

const Status = styled.span<{ available: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSize.sm};
  font-weight: 500;
  background-color: ${(props) =>
    props.available ? theme.colors.success : theme.colors.error};
  color: ${theme.colors.white};
`;

const FeedbackMessage = styled.div<{ type: "success" | "error" }>`
  position: fixed;
  top: ${theme.spacing.xl};
  right: ${theme.spacing.xl};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  font-weight: 500;
  color: ${theme.colors.white};
  background-color: ${(props) =>
    props.type === "success" ? theme.colors.success : theme.colors.error};
  box-shadow: ${theme.shadows.lg};
  z-index: 1000;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

export const AdminPanel: React.FC = () => {
  const { state, dispatch } = useKiosk();
  const [isAddingMenu, setIsAddingMenu] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    available: true,
  });
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    order: "",
  });
  const [feedback, setFeedback] = useState("");

  const handleMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 폼 검증
    if (!menuForm.name.trim()) {
      setFeedback("❌ 메뉴 이름을 입력해주세요.");
      return;
    }
    if (!menuForm.price || Number(menuForm.price) <= 0) {
      setFeedback("❌ 유효한 가격을 입력해주세요.");
      return;
    }
    if (!menuForm.category) {
      setFeedback("❌ 카테고리를 선택해주세요.");
      return;
    }

    try {
      const newMenuItem: MenuItem = {
        id: editingMenu?.id || Date.now().toString(),
        name: menuForm.name.trim(),
        name_en: menuForm.name.trim(), // 한글명과 동일하게 임시 자동 할당
        description: menuForm.description.trim(),
        price: Number(menuForm.price),
        category: menuForm.category,
        available: menuForm.available,
      };

      if (editingMenu) {
        dispatch({ type: "UPDATE_MENU_ITEM", payload: newMenuItem });
        setFeedback(`✅ ${newMenuItem.name} 메뉴가 수정되었습니다.`);
        setEditingMenu(null);
      } else {
        dispatch({ type: "ADD_MENU_ITEM", payload: newMenuItem });
        setFeedback(`✅ ${newMenuItem.name} 메뉴가 추가되었습니다.`);
      }

      // 폼 리셋
      setMenuForm({
        name: "",
        description: "",
        price: "",
        category: "",
        available: true,
      });
      setIsAddingMenu(false);

      // 3초 후 피드백 메시지 제거
      setTimeout(() => setFeedback(""), 3000);
    } catch (error) {
      setFeedback("❌ 메뉴 저장 중 오류가 발생했습니다.");
      console.error("메뉴 저장 오류:", error);
    }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 폼 검증
    if (!categoryForm.name.trim()) {
      setFeedback("❌ 카테고리 이름을 입력해주세요.");
      return;
    }
    if (!categoryForm.order || Number(categoryForm.order) <= 0) {
      setFeedback("❌ 유효한 순서를 입력해주세요.");
      return;
    }

    try {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: categoryForm.name.trim(),
        order: Number(categoryForm.order),
      };

      dispatch({ type: "ADD_CATEGORY", payload: newCategory });
      setFeedback(`✅ ${newCategory.name} 카테고리가 추가되었습니다.`);

      setCategoryForm({ name: "", order: "" });
      setIsAddingCategory(false);

      // 3초 후 피드백 메시지 제거
      setTimeout(() => setFeedback(""), 3000);
    } catch (error) {
      setFeedback("❌ 카테고리 저장 중 오류가 발생했습니다.");
      console.error("카테고리 저장 오류:", error);
    }
  };

  const editMenu = (menu: MenuItem) => {
    setEditingMenu(menu);
    setMenuForm({
      name: menu.name,
      description: menu.description,
      price: menu.price.toString(),
      category: menu.category,
      available: menu.available,
    });
    setIsAddingMenu(true);
  };

  const deleteMenu = (menuId: string) => {
    const menuToDelete = state.menuItems.find((item) => item.id === menuId);
    if (window.confirm("정말로 이 메뉴를 삭제하시겠습니까?")) {
      dispatch({ type: "DELETE_MENU_ITEM", payload: menuId });
      setFeedback(`✅ ${menuToDelete?.name || "메뉴"}가 삭제되었습니다.`);
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  const deleteCategory = (categoryId: string) => {
    const categoryToDelete = state.categories.find(
      (cat) => cat.id === categoryId
    );
    if (
      window.confirm(
        "정말로 이 카테고리를 삭제하시겠습니까? 해당 카테고리의 모든 메뉴가 함께 삭제됩니다."
      )
    ) {
      dispatch({ type: "DELETE_CATEGORY", payload: categoryId });
      setFeedback(
        `✅ ${categoryToDelete?.name || "카테고리"}가 삭제되었습니다.`
      );
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return (
      state.categories.find((cat) => cat.id === categoryId)?.name ||
      "알 수 없음"
    );
  };

  return (
    <AdminContainer>
      <Section>
        <Flex justify="space-between" align="center">
          <SectionTitle>관리자 패널</SectionTitle>
          <Button
            variant="secondary"
            onClick={() => dispatch({ type: "SET_MODE", payload: "customer" })}
          >
            고객 모드로 전환
          </Button>
        </Flex>
      </Section>

      {/* 카테고리 관리 */}
      <Section>
        <Flex justify="space-between" align="center">
          <h3>카테고리 관리</h3>
          <Button onClick={() => setIsAddingCategory(!isAddingCategory)}>
            {isAddingCategory ? "취소" : "카테고리 추가"}
          </Button>
        </Flex>

        {isAddingCategory && (
          <Card padding="lg" style={{ marginTop: theme.spacing.lg }}>
            <form onSubmit={handleCategorySubmit}>
              <FormGrid>
                <FormGroup>
                  <Label>카테고리 이름</Label>
                  <Input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    placeholder="카테고리 이름 입력"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>순서</Label>
                  <Input
                    type="number"
                    value={categoryForm.order}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        order: e.target.value,
                      })
                    }
                    placeholder="표시 순서"
                    required
                  />
                </FormGroup>
              </FormGrid>
              <Button type="submit" variant="success">
                카테고리 추가
              </Button>
            </form>
          </Card>
        )}

        <Grid columns={4} style={{ marginTop: theme.spacing.lg }}>
          {state.categories.map((category) => (
            <Card key={category.id} padding="md">
              <Flex justify="space-between" align="center">
                <div>
                  <h4>{category.name}</h4>
                  <p style={{ color: theme.colors.gray[600] }}>
                    순서: {category.order}
                  </p>
                </div>
                <Button
                  variant="error"
                  size="sm"
                  onClick={() => deleteCategory(category.id)}
                >
                  삭제
                </Button>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* 메뉴 관리 */}
      <Section>
        <Flex justify="space-between" align="center">
          <h3>메뉴 관리</h3>
          <Button onClick={() => setIsAddingMenu(!isAddingMenu)}>
            {isAddingMenu ? "취소" : "메뉴 추가"}
          </Button>
        </Flex>

        {isAddingMenu && (
          <Card padding="lg" style={{ marginTop: theme.spacing.lg }}>
            <form onSubmit={handleMenuSubmit}>
              <FormGrid>
                <FormGroup>
                  <Label>메뉴 이름</Label>
                  <Input
                    type="text"
                    value={menuForm.name}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, name: e.target.value })
                    }
                    placeholder="메뉴 이름 입력"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>설명</Label>
                  <Input
                    type="text"
                    value={menuForm.description}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, description: e.target.value })
                    }
                    placeholder="메뉴 설명"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>가격</Label>
                  <Input
                    type="number"
                    value={menuForm.price}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, price: e.target.value })
                    }
                    placeholder="가격 (원)"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>카테고리</Label>
                  <Select
                    value={menuForm.category}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, category: e.target.value })
                    }
                    required
                  >
                    <option value="">카테고리 선택</option>
                    {state.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </FormGrid>
              <Flex gap={theme.spacing.md} align="center">
                <label>
                  <input
                    type="checkbox"
                    checked={menuForm.available}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, available: e.target.checked })
                    }
                  />
                  <span style={{ marginLeft: theme.spacing.sm }}>
                    판매 가능
                  </span>
                </label>
                <Button type="submit" variant="success">
                  {editingMenu ? "메뉴 수정" : "메뉴 추가"}
                </Button>
              </Flex>
            </form>
          </Card>
        )}

        <Grid columns={3} style={{ marginTop: theme.spacing.lg }}>
          {state.menuItems.map((menu) => (
            <MenuItemCard key={menu.id} padding="lg">
              <MenuItemActions>
                <Button size="sm" onClick={() => editMenu(menu)}>
                  수정
                </Button>
                <Button
                  variant="error"
                  size="sm"
                  onClick={() => deleteMenu(menu.id)}
                >
                  삭제
                </Button>
              </MenuItemActions>

              <h4 style={{ marginBottom: theme.spacing.sm }}>{menu.name}</h4>
              <p
                style={{
                  color: theme.colors.gray[600],
                  marginBottom: theme.spacing.md,
                }}
              >
                {menu.description}
              </p>
              <Flex justify="space-between" align="center">
                <Price>{menu.price.toLocaleString()}원</Price>
                <Status available={menu.available}>
                  {menu.available ? "판매중" : "품절"}
                </Status>
              </Flex>
              <p
                style={{
                  marginTop: theme.spacing.sm,
                  color: theme.colors.gray[500],
                }}
              >
                카테고리: {getCategoryName(menu.category)}
              </p>
            </MenuItemCard>
          ))}
        </Grid>
      </Section>

      {/* 피드백 메시지 */}
      {feedback && (
        <FeedbackMessage type={feedback.includes("✅") ? "success" : "error"}>
          {feedback}
        </FeedbackMessage>
      )}
    </AdminContainer>
  );
};
