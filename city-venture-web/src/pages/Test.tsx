import DynamicTab from "../components/ui/DynamicTab";
import PageContainer from "../components/PageContainer";
import { useState } from "react";
import ButtonShowcase from "../test/ButtonShowcase";
import TextShowcase from "../test/TextShowcase";
import CardShowcase from "../test/CardShowcase";
import TableShowcase from "../test/TableShowcase";
import PageShowcase from "../test/PageShowcase";
import AlertShowcase from "../test/AlertShowcase";

const Test = () => {
  const [activeTab, setActiveTab] = useState("button");

  const loadPage = () => {
    switch (activeTab) {
      case "button":
        return <ButtonShowcase />;
      case "text":
        return <TextShowcase />;
      case "card":
        return <CardShowcase />;
      case "table":
        return <TableShowcase />;
      case "page":
        return <PageShowcase />;
      case "alert":
        return <AlertShowcase />;
    }
  };

  const TABS = [
    { id: "button", label: "Button" },
    { id: "text", label: "Text" },
    { id: "card", label: "Card" },
    { id: "table", label: "Table" },
    { id: "page", label: "Page" },
    { id: "alert", label: "Alert" },
  ];
  return (
    <PageContainer>
      <DynamicTab
        tabs={TABS}
        activeTabId={activeTab}
        onChange={(tabId) => {
          setActiveTab(String(tabId));
        }}
      />

      {loadPage()}
    </PageContainer>
  );
};

export default Test;
