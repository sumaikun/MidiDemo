import AppHeader from "./components/AppHeader";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import MidiDropZone from "./components/MidiDropZone";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
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
          <MidiDropZone />
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
