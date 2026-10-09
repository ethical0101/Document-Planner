import FirebaseAuthGate from "@/components/FirebaseAuthGate";

export default function RoutesLayout({ children }) {
  return <FirebaseAuthGate>{children}</FirebaseAuthGate>;
}
