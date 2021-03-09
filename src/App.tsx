import { DialogProvider } from "./Dialog";
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
