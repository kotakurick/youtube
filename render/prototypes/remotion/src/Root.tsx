import { Composition } from "remotion";
import { Proto } from "./Proto";
import { Crowd } from "./Crowd";
export const Root = () => (<>
  <Composition id="Proto" component={Proto} durationInFrames={300} fps={30} width={1920} height={1080} />
  <Composition id="Crowd" component={Crowd} durationInFrames={150} fps={30} width={1920} height={1080} />
</>);
