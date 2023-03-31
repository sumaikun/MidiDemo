import React, { useState, useEffect, useRef, useContext } from "react";
import styles from "@/styles/Home.module.css";
import AppHeader from "./components/AppHeader";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { Inter } from "next/font/google";
import Link from "next/link";
import MidiContext from "../contexts/MidiContext";

const inter = Inter({ subsets: ["latin"] });

const Demo = () => {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songTicks, setSongTicks] = useState(0);
  const [ticksForOffset, setTicksForOffset] = useState(0);
  const [musicNotes, setMusicNotes] = useState([]);
  const [startInterval, setStartInterval] = useState(false);
  const timeWatch = useRef(0);
  const scrollableRef = useRef(null);
  const { arrayBuffer } = useContext(MidiContext);

  const pianoScroll = (top) => {
    scrollableRef.current.scrollTo({
      top,
      behavior: "smooth",
    });
  };

  const loadMidi = async (buffer) => {
    try {
      const midi = new Midi(buffer);

      const synth = new Tone.PolySynth(Tone.Synth).toDestination();
      //const now = Tone.now();
      const part = new Tone.Part((time, note) => {
        //console.log(time, note);
        synth.triggerAttackRelease(
          note.name,
          note.duration,
          time,
          note.velocity
        );
      }, midi.tracks[0].notes);

      setMusicNotes(midi.tracks[0].notes);

      console.log("midi", midi);

      // Getting PPQ signatue
      const timeSignature = midi.header.timeSignatures[0]
        ? midi.header.timeSignatures[0].timeSignature[0]
        : 4;
      const ppq = midi.header.ppq;

      // Calculate the ticks by signature
      const ticksPerBar = ppq * timeSignature;
      /*console.log(
        "Ticks:",
        ticksPerBar,
        timeSignature,
        ticksPerBar / timeSignature
      );*/
      setSongTicks(ticksPerBar / timeSignature);

      // Calculate the seconds per signature
      const beatsPerMinute =
        midi.header.tempos[0]?.bpm || Tone.Transport.bpm.value;
      console.log("beatsPerMinute", beatsPerMinute);
      const secondsPerBeat = 60 / beatsPerMinute;
      const secondsPerBar = timeSignature * secondsPerBeat;
      console.log("secondsPerBar", secondsPerBar);
      const offsetTicks =
        ticksPerBar /
        timeSignature /
        ((secondsPerBar * 1000) / timeSignature / 50);
      console.log("offsetTicks", offsetTicks);
      setTicksForOffset(offsetTicks);

      //console.log("midi.tracks[0].notes", midi.tracks[0].notes);
      part.start();

      /*midi.tracks.forEach((track) => {
        track.notes.forEach((note) => {
          synth.triggerAttackRelease(
            note.name,
            note.duration,
            note.time + now,
            note.velocity
          );
        });
      });
      playerRef.current = synth;*/

      playerRef.current = {
        synth,
        part,
        notes: midi.tracks[0].notes,
      };
      console.log("scroll to", midi.tracks[0].notes[1].midi);
      pianoScroll(midi.tracks[0].notes[1].midi * 20);
      //setStartInterval(true);
    } catch (error) {
      console.error("Error loading MIDI file:", error);
      alert("Error loading MIDI file");
    }
  };

  useEffect(() => {
    async function fetchMidi() {
      console.log("arrayBuffer", arrayBuffer);
      if (arrayBuffer) {
        await loadMidi(arrayBuffer);
      }
    }
    fetchMidi();
    return () => {
      if (playerRef.current) {
        //playerRef.current.synth.dispose();
        //playerRef.current.part.dispose();
      }
    };
  }, [arrayBuffer]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        //alert("Disposing synth");
        stop();
        //playerRef.current.synth.dispose();
        //playerRef.current.part.dispose();
      }
    };
  }, []);

  useEffect(() => {
    let intervalId;
    if (startInterval) {
      intervalId = setInterval(async () => {
        /*console.log(
          "execute",
          timeWatch.current,
          timeWatch.current / 0.05,
          (timeWatch.current / 0.05) * ticksForOffset
        );*/
        timeWatch.current = +timeWatch.current + 50 / 1000;
        //console.log("counter", timeWatch.current);
        const offset = (timeWatch.current / 0.05) * ticksForOffset;
        //console.log("offset", offset);
        const filteredNotes = playerRef.current.notes.filter(
          (note) =>
            note.ticks >= offset - songTicks * 4 &&
            note.ticks <= songTicks * 20 + offset
        );
        //console.log("length", filteredNotes.length);
        setMusicNotes(filteredNotes);
      }, 50);
    } else {
      clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [startInterval, playerRef.current?.notes, songTicks, ticksForOffset]);

  const playDemo = async () => {
    const response = await fetch("/files/gravity.mid");
    const arrayBuffer = await response.arrayBuffer();
    loadMidi(arrayBuffer);
  };

  const playDemo2 = async () => {
    const response = await fetch("/files/attackOnTitan.mid");
    const arrayBuffer = await response.arrayBuffer();
    loadMidi(arrayBuffer);
  };

  const play = async () => {
    console.log("Tone.context.state", Tone.context.state);
    if (Tone.context.state !== "running") {
      await Tone.start();
    }
    setIsPlaying(true);
    Tone.Transport.start();
    setStartInterval(true);
    console.log("part details", playerRef.current.part);
  };

  const pause = () => {
    setIsPlaying(false);
    Tone.Transport.pause();
    // piano roll
    setStartInterval(false);
    timeWatch.current += 0.05;
  };

  const stop = () => {
    setIsPlaying(false);
    Tone.Transport.stop();
    //playerRef.current.part.stop();
    playerRef.current.part.loopStart = 0;
    // piano roll
    setStartInterval(false);
    setMusicNotes(playerRef.current.notes);
    timeWatch.current = 0;
  };

  const generateRandomId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const renderNote = (note, index) => {
    if (note.midi === index) {
      const pxValue = 50 / songTicks;
      const offset = (timeWatch.current / 0.05) * ticksForOffset;
      const marginLeft = pxValue * (note.ticks - offset);
      //console.log("marginLeft", marginLeft);
      return (
        <div
          key={generateRandomId()}
          style={{
            width: pxValue * note.durationTicks,
            backgroundColor: "#333",
            position: "absolute",
            zIndex: 2,
            height: 24,
            borderRadius: 2,
            marginLeft: marginLeft,
            border: "0.5px solid white",
            color: "white",
            fontSize: 9,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
          }}
        >
          {Tone.Frequency(note.midi, "midi").toNote()}
        </div>
      );
    }

    return null;
  };

  const isBlackKey = (index) => {
    const positionInOctave = index % 12;
    return (
      positionInOctave === 1 ||
      positionInOctave === 3 ||
      positionInOctave === 6 ||
      positionInOctave === 8 ||
      positionInOctave === 10
    );
  };

  return (
    <>
      <AppHeader title="Piano" description="Piano Roll demo for get a job" />
      <main className={styles.main}>
        <div className={styles.playerContainer}>
          <div className={`${styles.buttonContainer}`}>
            {!arrayBuffer ? (
              <button
                className={styles.button}
                onClick={playDemo}
                disabled={playerRef?.current?.notes.length}
              >
                PlayDemo
              </button>
            ) : (
              <></>
            )}
            {!arrayBuffer ? (
              <button
                className={styles.button}
                onClick={playDemo2}
                disabled={playerRef?.current?.notes.length}
              >
                PlayDemo 2
              </button>
            ) : (
              <></>
            )}
            <button
              className={styles.button}
              onClick={play}
              disabled={isPlaying || !playerRef?.current?.notes}
            >
              Play
            </button>
            <button
              className={styles.button}
              onClick={pause}
              disabled={!isPlaying}
            >
              Pause
            </button>
            <button
              className={styles.button}
              onClick={stop}
              disabled={!isPlaying}
            >
              Stop
            </button>
          </div>
          <span>You can scroll in the piano roll container</span>
        </div>
        <div
          ref={scrollableRef}
          style={{ marginTop: 20, height: 600, overflow: "scroll" }}
        >
          {Array(128)
            .fill()
            .map((_, index) => (
              <div
                key={index}
                style={{ display: "flex", position: "relative" }}
              >
                {Array(20)
                  .fill()
                  .map((_, index2) => (
                    <div
                      key={`${index}-${index2}`}
                      style={{
                        width: 50,
                        height: 25,
                        backgroundColor:
                          index2 === 0
                            ? isBlackKey(127 - index)
                              ? "black"
                              : "#f1f0f0"
                            : "white",
                        fontSize: 8,
                        zIndex: 1,
                        fontSize: 9,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {index2 === 0 ? (
                        <span
                          style={{
                            color: isBlackKey(127 - index) ? "white" : "black",
                          }}
                        >
                          {Tone.Frequency(127 - index, "midi").toNote()}
                        </span>
                      ) : (
                        <></>
                      )}
                    </div>
                  ))}
                {musicNotes.map((note) => renderNote(note, 127 - index))}
              </div>
            ))}
        </div>
        <div className={`${styles.grid} ${styles.minGrid}`}>
          <Link href="/" className={styles.card}>
            <h2 className={inter.className}>Upload your MIDI</h2>
            <p className={inter.className}>
              Upload your MIDI and check your piano Roll {musicNotes.length}
            </p>
          </Link>
        </div>
      </main>
    </>
  );
};

export default Demo;
