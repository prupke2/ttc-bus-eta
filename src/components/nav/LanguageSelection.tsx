import {
  Button,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Radio,
  RadioGroup,
  Text,
} from "@fluentui/react-components";
import { LocalLanguage20Regular } from "@fluentui/react-icons";
import { FormEvent, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { fluentStyles } from "../../styles/fluent";

export function LanguageSelection({ width }: { width: number }) {
  const { t, i18n } = useTranslation();
  const fluentStyle = fluentStyles();

  const handleLangChange = useCallback(
    (_: FormEvent<HTMLDivElement>, data: { value: string | undefined }) => {
      i18n.changeLanguage(data.value);
      // close Popover
      document.body.click();
    },
    []
  );
  return (
    <Popover positioning="below">
      <PopoverTrigger disableButtonEnhancement>
        <Button
          className={
            width >= 800
              ? fluentStyle.sideNavButton
              : width > 390
              ? fluentStyle.bottomNavButton
              : fluentStyle.smallRoundNavButton
          }
          title={t("buttons.languageChange") ?? "Language selection"}
          shape="circular"
          appearance="subtle"
          icon={<LocalLanguage20Regular />}
          size={width > 390 ? "medium" : "large"}
        >
          {width > 390 && <Text>{t("nav.label.lang")}</Text>}
        </Button>
      </PopoverTrigger>

      <PopoverSurface>
        <RadioGroup
          defaultValue={i18n.language}
          aria-labelledby={t("buttons.languageChange") ?? "Language selection"}
          onChange={handleLangChange}
        >
          <Radio value="en" label={t("lang.en")} />
          <Radio value="fr" label={t("lang.fr")} />
          <Radio value="zh" label={t("lang.zh")} />
        </RadioGroup>
      </PopoverSurface>
    </Popover>
  );
}
