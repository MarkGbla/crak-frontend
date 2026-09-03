import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <main className="grid min-h-screen place-items-center bg-[#f6f8f5] p-4"><SignUp forceRedirectUrl="/dashboard" /></main>;
}
