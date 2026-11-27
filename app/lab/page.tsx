import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lab } from "./lab";

export const metadata: Metadata = {
  title: "Lab · CareWeaPredictions",
  robots: { index: false, follow: false },
};

// Design-system workbench: dev only, static sample data, never touches Neon.
export default function LabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Lab />;
}
