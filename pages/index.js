import { useContext } from "react";
import AppHeader from "./components/AppHeader";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import MidiDropZone from "./components/MidiDropZone";
import Link from "next/link";
import MidiContext from "../contexts/MidiContext";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const { setArrayBuffer } = useContext(MidiContext);

  const handleOnFile = (acceptedFiles) => {
    if (acceptedFiles.length > 1) {
      return alert("Please only upload 1 file at a time");
    }
    const file = acceptedFiles[0];

    if (!file?.type.includes("midi")) {
      return alert("Today i only accept midi files");
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        console.log("MIDI ArrayBuffer:", arrayBuffer);
        setArrayBuffer(arrayBuffer);
        router.push("/demo");
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <>
      <AppHeader description="Jvega Demo for get new Job " />
      <main className={styles.main}>
        <div className={styles.description}>
          <p>Yousic play Demo</p>
          <div>
            <Image
              src="https://media.tenor.com/36NzM99naO8AAAAC/cat-piano.gif"
              alt="Kitty playing piano"
              className={styles.vercelLogo}
              width={150}
              height={150}
              priority
            />
          </div>
        </div>

        <div>
          <MidiDropZone onFile={handleOnFile} />
        </div>

        <div className={`${styles.grid} ${styles.minGrid}`}>
          <Link href="/demo" className={styles.card}>
            <h2 className={inter.className}>Play Demo</h2>
            <p className={inter.className}>Just play a built-in DEMO</p>
          </Link>
        </div>
      </main>
    </>
  );
}
