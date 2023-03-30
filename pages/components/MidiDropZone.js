import React from "react";
import { useDropzone } from "react-dropzone";
import styles from "@/styles/Home.module.css";

const MidiDropzone = () => {
  const onDrop = (acceptedFiles) => {
    console.log(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: "audio/midi, audio/x-midi",
    maxFiles: 1,
    maxSize: 1048576,
    onDrop,
  });

  return (
    <div {...getRootProps()} className={styles.dropzone}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className={`${styles.dropzone_description} ${styles.grab_cursor}`}>
          Drop your midi file here...
        </p>
      ) : (
        <div>
          <p className={`${styles.dropzone_description} ${styles.grab_cursor}`}>
            Drag and Drop your midi file here.
            <br />
            Or click to select it
          </p>
        </div>
      )}
    </div>
  );
};

export default MidiDropzone;
