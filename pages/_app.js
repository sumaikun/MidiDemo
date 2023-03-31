import "@/styles/globals.css";
import MidiContext from "../contexts/MidiContext";
import { useState } from "react";

export default function App({ Component, pageProps }) {
  const [arrayBuffer, setArrayBuffer] = useState(null);
  return (
    <MidiContext.Provider value={{ arrayBuffer, setArrayBuffer }}>
      <Component {...pageProps} />
    </MidiContext.Provider>
  );
}
