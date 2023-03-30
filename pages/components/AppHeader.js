// pages/demo.js
import Head from "next/head";

const AppHeader = ({ title, description }) => {
  return (
    <Head>
      <title>{title || "App Demo"}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default AppHeader;
