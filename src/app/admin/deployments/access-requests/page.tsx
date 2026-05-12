import type { Metadata } from "next";
import { AccessRequestsClient } from "./AccessRequestsClient";

export const metadata: Metadata = {
  title: "Access requests",
};

export default function AdminAccessRequestsPage() {
  return <AccessRequestsClient />;
}
