import React, { useState } from "react";
import { TabContainer, Tab } from "@ui5/webcomponents-react";

/**
 * 🔹 Tabs SAP Fiori con soporte oficial (icon + additionalText)
 */
const Tabs = ({ tabs }) => {
  const [active, setActive] = useState(0);

  const handleTabSelect = (e) => {
    const index = e.detail.tabIndex;
    setActive(index);
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <TabContainer
        collapsed={false}
        fixed={false}
        showOverflow
        onTabSelect={handleTabSelect}
      >
        {tabs.map((tab, i) => (
          <Tab
            key={i}
            text={tab.label}
            selected={i === active}
            icon={tab.icon || ""}  
            additionalText={tab.status?.text || ""} 
          >
            {/* 🔹 Contenido interno estilizado */}
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#fff",
                borderRadius: "0 0 8px 8px",
              }}
            >
              {tab.content}
            </div>
          </Tab>
        ))}
      </TabContainer>
    </div>
  );
};

export default Tabs;
