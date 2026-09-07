import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <main className="grid min-h-screen place-items-center bg-[#f6f8f5] p-4"><SignIn forceRedirectUrl="/dashboard" /></main>;
}
