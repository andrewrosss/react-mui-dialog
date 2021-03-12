import * as React from "react";
import * as ReactDOM from "react-dom";

import { DialogProvider, useDialog } from "../src";

const Nested = () => {
  useDialog();
  return null;
};

describe("it", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<DialogProvider />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
  it("renders and calls the main hook without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <DialogProvider>
        <Nested />
      </DialogProvider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
