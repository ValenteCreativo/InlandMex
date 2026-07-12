import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Inland Mex | Experiencias en el volcán de Iztapalapa",
    template: "%s | Inland Mex",
  },
  description:
    "Vive una caminata al amanecer por un antiguo volcán en Iztapalapa, comparte un desayuno sobre la ciudad y planta un árbol para restaurar la naturaleza.",
  icons: {
    icon: "/icon.jpeg",
    apple: "/icon.jpeg",
  },
  openGraph: {
    title: "Inland Mex | Experiencias en el volcán de Iztapalapa",
    description:
      "Caminatas guiadas, vistas de la Ciudad de México, desayuno y reforestación comunitaria en Iztapalapa.",
    siteName: "Inland Mex",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/volcan-iztapalapa-6-bg.jpg",
        width: 1200,
        height: 845,
        alt: "Vista del volcán de Iztapalapa durante una experiencia de Inland Mex",
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
