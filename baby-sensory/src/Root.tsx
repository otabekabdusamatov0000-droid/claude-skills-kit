import {Composition} from 'remotion';
import {BabySensory, TOTAL_FRAMES} from './BabySensory';

export const Root = () => (
  <Composition
    id="BabySensory"
    component={BabySensory}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1920}
    height={1080}
  />
);
