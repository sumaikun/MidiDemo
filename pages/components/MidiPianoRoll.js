import React from "react";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";

const MidiPianoRoll = () => {
  const firstNote = MidiNumbers.fromNote("a0");
  const lastNote = MidiNumbers.fromNote("c8");
  const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: firstNote,
    lastNote: lastNote,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
  });

  return (
    <div className="horizontal_piano_roll">
      <Piano
        noteRange={{ first: firstNote, last: lastNote }}
        playNote={(midiNumber) => {
          // Play a note here, using Tone.js or another library
        }}
        stopNote={(midiNumber) => {
          // Stop playing a note here, using Tone.js or another library
        }}
        width={1000}
        keyboardShortcuts={keyboardShortcuts}
      />
    </div>
  );
};

export default MidiPianoRoll;
