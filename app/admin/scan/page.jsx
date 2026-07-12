import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "crypto";
import PlantScanner from "./plant-scanner";

export const metadata = { title: "Escáner de plantas" };

function hashSecret(value) {
  return createHash("sha256").update(value).digest("hex");
}

function adminSessionHash() {
  return hashSecret(`${process.env.ADMIN_EMAIL}:${process.env.ADMIN_PASSWORD}`);
}

export default async function ScanPage() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) redirect("/admin");
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("inland_admin")?.value === adminSessionHash();
  if (!isAuthed) redirect("/admin");

  return <PlantScanner />;
}
