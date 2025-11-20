import { requireAuth } from "@/lib/auth-utils";

export default async function Home() {
  await requireAuth();
  return (
    <div className="w-full h-screen flex items-center justify-center">
      Welcome
    </div>
  );
}
