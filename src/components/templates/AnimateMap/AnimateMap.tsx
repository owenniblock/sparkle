import React, { useEffect, useRef, useState } from "react";

import "./AnimateMap.scss";
import { GameInstance } from "./game/GameInstance";
import { useFirebase } from "react-redux-firebase";
import { FirebaseDataProvider } from "./DataProvider/FirebaseDataProvider";
import { useStore } from "react-redux";
import { AnimateMapVenue } from "../../../types/venues";

export interface AnimateMapProps {
  venue: AnimateMapVenue;
}

export const AnimateMap: React.FC<AnimateMapProps> = () => {
  const [app, setApp] = useState<GameInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const firebase = useFirebase();
  const store = useStore();

  useEffect(() => {
    if (!app && containerRef && containerRef.current) {
      const dataProvider = new FirebaseDataProvider(firebase);
      const game = new GameInstance(
        dataProvider,
        containerRef.current as HTMLDivElement,
        store
      );

      game.init().then(() => game.start());

      setApp(game);
    }
    return () => {
      app?.release();
    };
  }, [containerRef, app, firebase, store]);

  return <div ref={containerRef} className="AnimateMap" />;
};
