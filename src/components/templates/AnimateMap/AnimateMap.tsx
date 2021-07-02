import React, { useEffect, useRef, useState } from "react";

import "./AnimateMap.scss";
import { GameInstance } from "./game/GameInstance";
import { useFirebase } from "react-redux-firebase";
import { BufferingDataProvider } from "./bridges/DataProvider/BufferingDataProvider";
import { useStore } from "react-redux";
import { AnimateMapVenue } from "../../../types/venues";
import { useUser } from "../../../hooks/useUser";

export interface AnimateMapProps {
  venue: AnimateMapVenue;
}

export const AnimateMap: React.FC<AnimateMapProps> = () => {
  const [app, setApp] = useState<GameInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const firebase = useFirebase();
  const store = useStore();
  const user = useUser();

  useEffect(() => {
    if (!app && containerRef && containerRef.current) {
      const dataProvider = new BufferingDataProvider(
        firebase,
        user.userId ? user.userId : "undefined"
      );
      const game = new GameInstance(
        dataProvider,
        containerRef.current as HTMLDivElement,
        user.profile?.pictureUrl
      );

      game
        .init()
        .then(() => game.start())
        .catch((error) => console.log(error));

      setApp(game);
    }
  }, [containerRef, app, firebase, store, user]);
  useEffect(() => {
    return () => {
      app?.release();
    };
  }, [app]);

  return <div ref={containerRef} className="AnimateMap" />;
};
