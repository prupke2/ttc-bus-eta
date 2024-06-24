import { Link as LinkFluent, Switch, Text } from "@fluentui/react-components";
// skipcq: JS-W1028
import React, { useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { RouteJson } from "../../models/etaJson.js";
import { LineStop, LineStopElement } from "../../models/etaObjects.js";
import { StopAccordions, StopDiv } from "../accordions/StopAccordions.js";
import { DirectionButton } from "../buttons/DirectionButton.js";
import { stopsParser } from "../parser/stopsParser.js";
import { mergeAndGroup } from "../parser/stopsUnifier.js";
import RawDisplay from "../rawDisplay/RawDisplay.js";
import style from "./FetchRoute.module.css";
import { getTTCRouteData } from "./fetchUtils.js";

function RouteInfo(props: { line: number }): JSX.Element {
  const [data, setData] = useState<RouteJson>();
  const [stopDb, setStopDb] = useState<LineStop[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number>(Date.now());
  const [enabledDir, setEnabledDir] = useState<string>("");
  const [unifiedRouteView, setUnifiedRouteView] = useState<boolean>(false);

  const { t } = useTranslation();
  const getMatchingStop = (stopNumber: number) => {
    return stopDb.find((searching) => stopNumber === searching.id);
  };
  const createStopList = useCallback(
    (stuff: { stop: { tag: string }[] }) => {
      const result: LineStopElement[] = [];

      for (const element of stuff.stop) {
        const matchingStop = getMatchingStop(parseInt(element.tag));

        // skip not found data
        if (!matchingStop) {
          continue;
        }

        result.push({
          ...matchingStop,
          key: matchingStop?.id ?? 0,
        });
      }
      return result;
    },
    [stopDb]
  );

  useEffect(() => {
    const controller = new AbortController();

    const fetchStopsData = async () => {
      const data = await getTTCRouteData(props.line, {
        signal: controller.signal,
      });

      return { parsedData: data };
    };

    fetchStopsData().then(({ parsedData }) => {
      if (!parsedData) {
        return;
      }
      setData(parsedData);
      setStopDb(stopsParser(parsedData));
    });

    // when useEffect is called, the following clean-up fn will run first
    return () => {
      controller.abort();
    };
  }, [lastUpdatedAt]);

  const handleFetchBusClick = useCallback(() => {
    setLastUpdatedAt(Date.now());
    setData(undefined);
    setStopDb([]);
  }, [lastUpdatedAt]);

  const viewOnChange = useCallback(
    (
      _event: React.ChangeEvent<HTMLInputElement>,
      data: { checked: boolean }
    ) => {
      setUnifiedRouteView(data.checked);
    },
    [unifiedRouteView]
  );
  if (data) {
    if (!data.Error) {
      const directions: Set<string> = new Set();
      data.route.direction.forEach((line) => {
        directions.add(line.name);
      });
      const accordionList: (
        direction: string
      ) => (JSX.Element | JSX.Element[])[] = (direction) => {
        if (unifiedRouteView) {
          const lines = data.route.direction.filter(
            (line) => direction === line.name
          );
          const stationAndLineMap: Map<number, string[]> = new Map();

          const unifiedList = lines.map((line) =>
            line.stop.map((stop) => {
              const stopNum = parseInt(stop.tag);
              const stoppingLines = stationAndLineMap.get(stopNum) || [];
              stoppingLines.push(line.branch);
              stationAndLineMap.set(stopNum, stoppingLines);
              return stopNum;
            })
          );

          const mergedList: number[] = mergeAndGroup(...unifiedList).flat(
            Infinity
          );

          return mergedList.map((item) => {
            // if (Array.isArray(item)) {
            //   const matchingStops: LineStop[][] = item.map((stops) =>
            //     stops
            //       .map((stop) => getMatchingStop(stop))
            //       .filter((stop): stop is LineStop => stop !== undefined)
            //   );

            //   return matchingStops.map((lines) => {
            //     const parsedLines: LineStopElement[] = lines
            //       .filter((line) => Boolean(line))
            //       .map((line: LineStop) => {
            //         return { ...line, key: line.id };
            //       });

            //     const idList = parsedLines.map((stop: LineStop) => stop.id);

            //     return (
            //       <StopAccordions
            //         key={idList.toString()}
            //         result={parsedLines}
            //         title={`Only some buses go to these ${parsedLines.length} stop${parsedLines.length > 1 ? "s" : ""}.`}
            //         lineNum={props.line.toString()}
            //         tag={idList.toString()}
            //       />
            //     );
            //   });
            // }
            const matchingStop = getMatchingStop(item);
            if (matchingStop)
              return (
                <div key={matchingStop.id} className={style.stop}>
                  <StopDiv
                    lineStop={{ ...matchingStop, key: matchingStop.id }}
                    branches={lines.map((line) => line.branch) || []}
                    stoppingBranches={
                      stationAndLineMap.get(matchingStop.id) || []
                    }
                  />
                </div>
              );
            return <div key={item}>{item}</div>;
          });
        }
        return data.route.direction
          .filter((line) => direction === line.name)
          .map((line) => {
            const list = createStopList(line);

            return (
              <li key={line.tag}>
                <StopAccordions
                  title={line.title}
                  direction={line.name}
                  lineNum={line.branch}
                  result={list}
                  tag={line.tag}
                />
              </li>
            );
          });
      };
      const directionsArr = Array.from(directions.values());
      if (enabledDir === "") setEnabledDir(directionsArr[0]);

      return (
        <div className="stop-prediction-page">
          <div className={style["direction-buttons"]}>
            {directionsArr.map((direction) => {
              return (
                <DirectionButton
                  key={direction}
                  direction={direction}
                  enabledDir={enabledDir}
                  setEnabledDir={setEnabledDir}
                />
              );
            })}
            <Switch
              onChange={viewOnChange}
              label="Unified stops (experimental)"
            />
          </div>

          {directionsArr.map((direction) => {
            return (
              <ul
                className={enabledDir !== direction ? style.hide : undefined}
                key={direction}
              >
                {accordionList(direction)}
              </ul>
            );
          })}
          <RawDisplay data={data} />
        </div>
      );
    } else {
      const noRouteRegex = /Could not get route /;
      const errorString = data.Error?.["#text"];
      if (noRouteRegex.test(errorString)) {
        return (
          <div className="stop-prediction-page">
            <Text as="h1" weight="semibold">
              <Trans>{t("lines.noLineInDb")}</Trans>
            </Text>
            <RawDisplay data={data} />
          </div>
        );
      } else
        return (
          <div className="stop-prediction-page">
            <LinkFluent onClick={handleFetchBusClick}>
              <Text as="h1" weight="semibold">
                {`Error: ${errorString}`}
              </Text>
            </LinkFluent>
            <RawDisplay data={data} />
          </div>
        );
    }
  } else {
    if (navigator.onLine) {
      return (
        <LinkFluent appearance="subtle" onClick={handleFetchBusClick}>
          <Text as="h1" weight="semibold">
            {t("reminder.loading")}
          </Text>
        </LinkFluent>
      );
    } else {
      return (
        <Text>
          Your device seems to be offline, and no cache has been found.
        </Text>
      );
    }
  }
}
export default RouteInfo;
