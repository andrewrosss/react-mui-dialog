import { DialogProvider } from "./MaterialDialog";
import { Nested } from "./Nested";

export default function App() {
  return (
    <div>
      <DialogProvider>
        <Nested />
      </DialogProvider>
    </div>
  );
}
