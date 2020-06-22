import React, { useState } from "react";
import { useSelector } from "react-redux";
import JazzBarSkeletonPage from "../JazzBarSkeletonPage";
import useProfileInformationCheck from "hooks/useProfileInformationCheck";

import Jazz from "../Jazz";
import Backstage from "../Backstage";
import Cocktail from "../Cocktail";
import { User } from "components/organisms/UserProfileModal/UserProfileModal";
import useUpdateLocationEffect from "utils/useLocationUpdateEffect";
import { PARTY_NAME } from "config";

const LoggedInPartyPage: React.FunctionComponent = () => {
  const [selectedTab, setSelectedTab] = useState("jazz");
  useProfileInformationCheck();

  const [userList, setUserList] = useState<User[]>([]);

  const { user, experience } = useSelector((state: any) => ({
    user: state.user,
    experience: state.firestore.data.config?.[PARTY_NAME]?.experiences.jazzbar,
  }));

  useUpdateLocationEffect(user, experience.associatedRoom);

  return (
    <JazzBarSkeletonPage
      userList={userList}
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      setUserList={setUserList}
    >
      <div className="col content-column">
        <div className={`row ${selectedTab === "smoking" ? "reduced" : ""}`}>
          {selectedTab === "jazz" && <Jazz setUserList={setUserList} />}
          {selectedTab === "cocktail" && <Cocktail setUserList={setUserList} />}
          {selectedTab === "smoking" && <Backstage setUserList={setUserList} />}
        </div>
      </div>
    </JazzBarSkeletonPage>
  );
};

export default LoggedInPartyPage;
