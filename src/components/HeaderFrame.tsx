import React from "react";
import { useTranslation } from "react-i18next";

const HeaderFrame: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="headerFrame">
      <h1 className="title">{t("header.title")}</h1>
      <h2 className="title-description">{t("header.description")}</h2>
    </div>
  );
};

export default HeaderFrame;
