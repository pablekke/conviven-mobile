import TabTransition from "../../components/TabTransition";
import { FeedScreen } from "../../features/feed";

export default function HomeScreen() {
  return (
    <TabTransition>
      <FeedScreen />
    </TabTransition>
  );
}
