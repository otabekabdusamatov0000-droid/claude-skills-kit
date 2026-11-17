import {Composition} from 'remotion';
import {ColorFriends, TOTAL_FRAMES} from './ColorFriends';

export const Root = () => (
  <Composition id="ColorFriends" component={ColorFriends} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
);
