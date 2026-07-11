import "./globals.css";

export const metadata = {
  title: "Inland Mex | Volcano hikes that reforest Iztapalapa",
  description:
    "Guided volcano hikes in Iztapalapa that fund reforestation, tree monitoring, and future on-chain stewardship.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
