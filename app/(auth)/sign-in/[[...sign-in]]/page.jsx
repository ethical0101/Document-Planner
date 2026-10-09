import { SignIn } from "@clerk/nextjs";
import AuthLayout from "@/app/_components/AuthLayout";

export const metadata = { title: "Sign in" };

export default function Page() {
  return (
    <AuthLayout>
      <SignIn />
    </AuthLayout>
  );
}
