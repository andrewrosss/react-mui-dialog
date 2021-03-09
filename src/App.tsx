import "./styles.css";

import { DialogProvider } from "./MaterialDialog";
import { Nested } from "./Nested";

export default function App() {
  return (
    <div className="App">
      <DialogProvider>
        <Nested />
      </DialogProvider>
    </div>
  );
}
