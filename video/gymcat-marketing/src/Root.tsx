import { Composition } from "remotion";
import { GymCatAd } from "./GymCatAd";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="GymCatLaunch"
        component={GymCatAd}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ variant: "landscape" }}
      />
      <Composition
        id="GymCatStory"
        component={GymCatAd}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ variant: "story" }}
      />
    </>
  );
};
