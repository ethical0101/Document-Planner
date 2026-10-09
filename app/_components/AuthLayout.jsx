import Image from "next/image";
import Logo from "./Logo";

/**
 * Shared split layout for the sign-in and sign-up pages.
 */
export default function AuthLayout({ children }) {
  return (
    <section className="min-h-screen bg-white lg:grid lg:grid-cols-12">
      <aside className="relative hidden lg:block lg:order-last lg:col-span-5 xl:col-span-6">
        <Image
          alt=""
          src="/Assets/form-banner.jpg"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </aside>

      <main className="flex flex-col items-center justify-center min-h-screen gap-8 px-4 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
        <Logo />
        {children}
      </main>
    </section>
  );
}
