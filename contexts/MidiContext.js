import { createContext } from "react";

const MidiContext = createContext({
  arrayBuffer: null,
  setArrayBuffer: () => {},
});

export default MidiContext;
