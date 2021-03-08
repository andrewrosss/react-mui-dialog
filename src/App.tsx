import "./styles.css";
import { MaterialDialogProvider } from "./MaterialDialog";
import { Nested } from "./Nested";

export default function App() {
  return (
    <div className="App">
      <MaterialDialogProvider>
        <Nested />
      </MaterialDialogProvider>
    </div>
  );
}
