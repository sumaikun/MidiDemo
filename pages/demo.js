import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "@/styles/Home.module.css";
import AppHeader from "./components/AppHeader";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

const Demo = () => {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songTicks, setSongTicks] = useState(0);
  const [signatureSeconds, setSignatureSeconds] = useState(0);
  const [musicNotes, setMusicNotes] = useState([]);
  const [startInterval, setStartInterval] = useState(false);
  const timeWatch = useRef(0);

  useEffect(() => {
    async function fetchMidi() {
      try {
        const response = await fetch("/files/zelda.mid");
        const arrayBuffer = await response.arrayBuffer();
        const midi = new Midi(arrayBuffer);
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

        //setMusicNotes(midi.tracks[0].notes);

        // Getting PPQ signatue
        const timeSignature = midi.header.timeSignatures[0]
          ? midi.header.timeSignatures[0].timeSignature[0]
          : 4;
        const ppq = midi.header.ppq;

        // Calculate the ticks by signature
        const ticksPerBar = ppq * timeSignature;
        console.log("Ticks:", ticksPerBar, timeSignature);
        setSongTicks(ticksPerBar / timeSignature);

        // Calculate the seconds per signature
        const beatsPerMinute = Tone.Transport.bpm.value;
        const secondsPerBeat = 60 / beatsPerMinute;
        const secondsPerBar = timeSignature * secondsPerBeat;
        setSignatureSeconds(secondsPerBar);

        console.log("midi.tracks[0].notes", midi.tracks[0].notes);
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

        setStartInterval(true);
      } catch (error) {
        console.error("Error loading MIDI file:", error);
      }
    }

    fetchMidi();

    return () => {
      if (playerRef.current) {
        playerRef.current.synth.dispose();
        playerRef.current.part.dispose();
      }
    };
  }, []);

  useEffect(() => {
    let intervalId;
    if (startInterval) {
      intervalId = setInterval(async () => {
        timeWatch.current = +timeWatch.current + 0.25;
        //console.log("counter", timeWatch.current);
        const offset = timeWatch.current * songTicks;
        //console.log("offset", offset);
        const filteredNotes = playerRef.current.notes.filter(
          (note) =>
            note.ticks >= offset - songTicks * 2 &&
            note.ticks <= songTicks * 20 + offset
        );
        console.log("length", filteredNotes.length, filteredNotes);
        setMusicNotes(filteredNotes);
      }, 250);
    } else {
      clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [startInterval, playerRef.current?.notes, songTicks]);

  const play = async () => {
    console.log("Tone.context.state", Tone.context.state);
    if (Tone.context.state !== "running") {
      await Tone.start();
    }
    setIsPlaying(true);
    Tone.Transport.start();
  };

  const pause = () => {
    setIsPlaying(false);
    Tone.Transport.pause();
  };

  const stop = async () => {
    setIsPlaying(false);
    Tone.Transport.stop();
    playerRef.current.part.stop();
    playerRef.current.part.loopStart = 0;
  };

  const generateRandomId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const renderNote = (note, index) => {
    if (note.midi === index) {
      const pxValue = 50 / songTicks;
      const offset = timeWatch.current * songTicks;
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
          }}
        />
      );
    }

    return null;
  };

  return (
    <>
      <AppHeader title="Piano" description="Piano Roll demo for get a job" />
      <main className={styles.main}>
        <div className={styles.playerContainer}>
          <div className={`${styles.buttonContainer}`}>
            <button
              className={styles.button}
              onClick={play}
              disabled={isPlaying}
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
        </div>
        <div style={{ marginTop: 100 }}>
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
                        backgroundColor: "white",
                        fontSize: 8,
                        zIndex: 1,
                      }}
                    >
                      {127 - index}, {index2 + 1}
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
