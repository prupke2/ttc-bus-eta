import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from "@fluentui/react-components";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  EtaPredictionJson,
  RouteJson,
  RoutesJson,
} from "../../models/etaJson.js";
import { settingsRedux, stopBookmarksRedux } from "../../models/etaObjects.js";
import { SubwayStations, SubwayStop } from "../../models/ttc.js";
import { StopRequest } from "../../models/yrt.js";
import { store } from "../../store/index.js";
import { settingsSelectors } from "../../store/settings/slice.js";
import { fluentStyles } from "../../styles/fluent.js";

export default function RawDisplay(props: {
  data:
    | EtaPredictionJson
    | RouteJson
    | RoutesJson
    | settingsRedux
    | stopBookmarksRedux
    | SubwayStations
    | SubwayStop
    | StopRequest;
}) {
  const fluentStyle = fluentStyles();
  const { t } = useTranslation();

  const settings = settingsSelectors.selectAll(store.getState().settings);

  const devModeValue = settingsSelectors.selectById(
    store.getState().settings,
    "devMode"
  );
  const isInDevMode = useMemo(
    () => (devModeValue !== undefined ? devModeValue.value === "true" : false),
    [settings]
  );

  const rawDisplay = (
    <Accordion collapsible className="raw-display">
      <AccordionItem value="raw">
        <AccordionHeader className={fluentStyle.accordionHeader}>
          {t("debug.showResponse")}
        </AccordionHeader>
        <AccordionPanel>
          <pre>{JSON.stringify(props.data, null, 1)}</pre>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );

  return isInDevMode ? rawDisplay : <> {}</>;
}
