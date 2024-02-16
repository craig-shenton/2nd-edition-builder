import { useState, Fragment } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { RulesIndex, rulesMap } from "../../components/rules-index";
import { getAllOptions } from "../../utils/unit";
import { getUnitPoints, getPoints, getAllPoints } from "../../utils/points";
import { useLanguage } from "../../utils/useLanguage";
import { normalizeRuleName } from "../../utils/string";
import { openRulesIndex } from "../../state/rules-index";
import gameSystems from "../../assets/armies.json";

import "./GameView.css";

export const GameView = () => {
  const { listId } = useParams();
  const { language } = useLanguage();
  const dispatch = useDispatch();
  const intl = useIntl();
  const [showPoints, setShowPoints] = useState(true);
  const [showSpecialRules, setShowSpecialRules] = useState(true);
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );

  if (!list) {
    return (
      <>
        <Header
          to={`/editor/${listId}`}
          headline={intl.formatMessage({
            id: "duplicate.title",
          })}
        />
        <Main />
      </>
    );
  }

  const allPoints = getAllPoints(list);
  const lordsPoints = getPoints({ list, type: "lords" });
  const heroesPoints = getPoints({ list, type: "heroes" });
  const charactersPoints = getPoints({ list, type: "characters" });
  const corePoints = getPoints({ list, type: "core" });
  const specialPoints = getPoints({ list, type: "special" });
  const rarePoints = getPoints({ list, type: "rare" });
  const mercenariesPoints = getPoints({ list, type: "mercenaries" });
  const alliesPoints = getPoints({ list, type: "allies" });
  const game = gameSystems.find((game) => game.id === list.game);
  const army = game.armies.find((army) => army.id === list.army);
  const armyName = army[`name_${language}`] || army.name_en;
  const filters = [
    {
      name: intl.formatMessage({
        id: "export.specialRules",
      }),
      id: "specialRules",
      checked: showSpecialRules,
      callback: () => {
        setShowSpecialRules(!showSpecialRules);
      },
    },
    {
      name: intl.formatMessage({
        id: "export.showPoints",
      }),
      id: "points",
      checked: showPoints,
      callback: () => {
        setShowPoints(!showPoints);
      },
    },
  ];
  const getRulesLinksText = (textObject) => {
    const textEn = textObject.name_en.split(", ");
    const ruleString = textObject[`name_${language}`] || textObject.name_en;
    let ruleButtons = ruleString.split(", ");

    ruleButtons = ruleButtons.map((rule, index) => (
      <Fragment key={rule}>
        {rulesMap[normalizeRuleName(textEn[index])] ? (
          <button
            className="unit__rule"
            onClick={() =>
              dispatch(openRulesIndex({ activeRule: textEn[index] }))
            }
          >
            {rule}
            {index !== ruleButtons.length - 1 && ", "}
          </button>
        ) : (
          <>
            {rule}
            {index !== ruleButtons.length - 1 && ", "}
          </>
        )}
      </Fragment>
    ));

    return ruleButtons;
  };
  const getSection = ({ type }) => {
    const units = list[type];

    return (
      <ul>
        {units.map((unit, index) => (
          <li key={index} className="list">
            <div className="list__inner game-view__list-inner">
              <h3>
                {unit.strength || unit.minimum ? (
                  <span className="game-view__strength">
                    {`${unit.strength || unit.minimum} `}
                  </span>
                ) : null}
                {unit[`name_${language}`] || unit.name_en}
                {showPoints && (
                  <span className="game-view__points">
                    [{getUnitPoints(unit)} <FormattedMessage id="app.points" />]
                  </span>
                )}
              </h3>
              <div className="game-view__details">
                {getAllOptions(unit)}
                {showSpecialRules && unit.specialRules ? (
                  <p className="game-view__special-rules">
                    <b>
                      <i>
                        <FormattedMessage id="unit.specialRules" />:
                      </i>
                    </b>{" "}
                    {getRulesLinksText(unit.specialRules).map((item) => item)}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <Helmet>
        <title>{`Old World Builder | ${list.name}`}</title>
      </Helmet>

      <RulesIndex />

      <Header
        to={`/editor/${listId}`}
        headline={intl.formatMessage({
          id: "misc.gameView",
        })}
        subheadline={`${armyName} [${allPoints} ${intl.formatMessage({
          id: "app.points",
        })}]`}
        filters={filters}
      />

      <Main className="game-view">
        {list.game === "the-old-world" ? (
          list.characters.length > 0 && (
            <section>
              <header className="editor__header">
                <h2>
                  <FormattedMessage id="editor.characters" />{" "}
                  {showPoints && (
                    <span className="game-view__points">
                      [{charactersPoints} <FormattedMessage id="app.points" />]
                    </span>
                  )}
                </h2>
              </header>
              {getSection({ type: "characters" })}
            </section>
          )
        ) : (
          <>
            {list.lords.length > 0 && (
              <section>
                <header className="editor__header">
                  <h2>
                    <FormattedMessage id="editor.lords" />{" "}
                    {showPoints && (
                      <span className="game-view__points">
                        [{lordsPoints} <FormattedMessage id="app.points" />]
                      </span>
                    )}
                  </h2>
                </header>
                {getSection({ type: "lords" })}
              </section>
            )}

            {list.heroes.length > 0 && (
              <section>
                <header className="editor__header">
                  <h2>
                    <FormattedMessage id="editor.heroes" />{" "}
                    {showPoints && (
                      <span className="game-view__points">
                        [{heroesPoints} <FormattedMessage id="app.points" />]
                      </span>
                    )}
                  </h2>
                </header>
                {getSection({ type: "heroes" })}
              </section>
            )}
          </>
        )}

        {list.core.length > 0 && (
          <section>
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.core" />{" "}
                {showPoints && (
                  <span className="game-view__points">
                    [{corePoints} <FormattedMessage id="app.points" />]
                  </span>
                )}
              </h2>
            </header>
            {getSection({ type: "core" })}
          </section>
        )}

        {list.special.length > 0 && (
          <section>
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.special" />{" "}
                {showPoints && (
                  <span className="game-view__points">
                    [{specialPoints} <FormattedMessage id="app.points" />]
                  </span>
                )}
              </h2>
            </header>
            {getSection({ type: "special" })}
          </section>
        )}

        {list.rare.length > 0 && (
          <section>
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.rare" />{" "}
                {showPoints && (
                  <span className="game-view__points">
                    [{rarePoints} <FormattedMessage id="app.points" />]
                  </span>
                )}
              </h2>
            </header>
            {getSection({ type: "rare" })}
          </section>
        )}

        {list.game === "the-old-world" && (
          <>
            {list.allies.length > 0 && (
              <section>
                <header className="editor__header">
                  <h2>
                    <FormattedMessage id="editor.allies" />{" "}
                    {showPoints && (
                      <span className="game-view__points">
                        [{alliesPoints} <FormattedMessage id="app.points" />]
                      </span>
                    )}
                  </h2>
                </header>
                {getSection({ type: "allies" })}
              </section>
            )}

            {list.mercenaries.length > 0 && (
              <section>
                <header className="editor__header">
                  <h2>
                    <FormattedMessage id="editor.mercenaries" />{" "}
                    {showPoints && (
                      <span className="game-view__points">
                        [{mercenariesPoints}{" "}
                        <FormattedMessage id="app.points" />]
                      </span>
                    )}
                  </h2>
                </header>
                {getSection({ type: "mercenaries" })}
              </section>
            )}
          </>
        )}
      </Main>
    </>
  );
};
