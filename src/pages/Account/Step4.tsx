import React, { useState } from "react";
import "firebase/storage";
import "./Account.scss";
import { PLAYA_IMAGE } from "settings";
import { useHistory } from "react-router-dom";
import Webcam from "react-webcam";
import { ReactMic } from "react-mic";

const Step4 = () => {
  const history = useHistory();
  const [showMicrophone, setShowMicrophone] = useState(false);
  return (
    <div className="splash-page-container">
      <img className="playa-img" src={PLAYA_IMAGE} alt="Playa Background Map" />
      <div className="step-container step5-container">
        <div className="login-container">
          <h2>Test your camera and mic before entering the venue</h2>
          <div style={{ marginTop: 10 }}>
            <Webcam width={400} />
          </div>
          <ReactMic
            record={showMicrophone} // defaults -> false.  Set to true to begin recording
            visualSetting="frequencyBars" // defaults -> "sinewave".  Other option is "frequencyBars
            strokeColor="#937c63" // sinewave or frequency bar color
            backgroundColor="black"
            className="microphone"
          />
          <button
            className="microphone-button"
            onClick={() => setShowMicrophone((prev) => !prev)}
          >
            Test microphone
          </button>
          <button
            className={`btn btn-primary btn-block btn-centered`}
            onClick={() => history.push(`/enter/step6b`)}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step4;
