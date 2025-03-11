import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-row justify-center items-center gap-1">
          <Image
            src="https://rashid-rentease-images.s3.ap-southeast-2.amazonaws.com/appliances/1741630098404-IMG-20250304-WA0000.jpg"
            alt="RentEase Logo"
            width={36}
            height={36}
            className="rounded-md"
          />
          <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            <Link href="/">RentEase</Link>
          </h1>
        </div>
        <Card className="shadow-lg">
          <CardContent className="pt-6">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
