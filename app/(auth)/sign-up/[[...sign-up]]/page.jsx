import { SignUp } from "@clerk/nextjs";
import AuthLayout from "@/app/_components/AuthLayout";

export const metadata = { title: "Sign up" };

export default function Page() {
  return (
    <AuthLayout>
      <SignUp />
    </AuthLayout>
  );
}
