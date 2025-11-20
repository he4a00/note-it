import { SigninForm } from "@/components/shared/Auth/SigninForm";
import { requireUnauth } from "@/lib/auth-utils";

export default async function SigninPage() {
  await requireUnauth();
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-lg">
        <SigninForm />
      </div>
    </div>
  );
}
