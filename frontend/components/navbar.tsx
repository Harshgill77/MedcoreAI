"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Philosophy", href: "/Philosophy" },
  { label: "About us", href: "/about" },
];

function UserProfileBar({
  name,
  email,
  mobile = false,
}: {
  name: string;
  email: string;
  mobile?: boolean;
}) {
  const initials = name.trim().charAt(0).toUpperCase() || "U";
  const router = useRouter();

  if (mobile) {
    return (
      <div className="flex flex-col gap-3 w-full">
        <Button
          variant="outline"
          className="w-full justify-center rounded-full"
          onClick={() => {
            router.push("/chat");
          }}
        >
          Dashboard
        </Button>
        <div className="flex items-center gap-3 rounded-xl border p-3 w-full bg-slate-50">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
            <p className="truncate text-xs text-slate-500">{email}</p>
          </div>
          <Button
            className="shrink-0"
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        className="rounded-full h-[34px] px-4 text-sm font-medium bg-gray-50 hover:bg-gray-100 border-gray-200 text-slate-700"
        onClick={() => router.push("/chat")}
      >
        Dashboard
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 p-1 pr-3 hover:bg-gray-100 transition-all focus:outline-none">
            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#111] text-[11px] font-semibold text-white">
              {initials}
            </div>
            <p className="truncate text-[13px] text-slate-600 font-medium max-w-[140px]">
              {email}
            </p>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-1 rounded-xl shadow-lg border-slate-200">
          <div className="flex flex-col gap-1">
            <div className="px-3 py-2.5 border-b border-slate-100 flex flex-col min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
              <p className="truncate text-xs text-slate-500 mt-0.5">{email}</p>
            </div>
            <div className="p-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg h-9"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Sign out
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "No email";

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <nav className="py-4 flex items-center justify-between px-2 md:px-14 lg:px-8 bg-gray-50 border-b border-gray-200">
        <Link href={"/"}>
          <div className="text-md items-center gap-2 flex md:text-lg font-semibold">
            <Image src={"/globe.svg"} alt="TNP" width={30} height={30} />
            MedCoreAI
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium "  //hover:underline
            >
              {l.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <UserProfileBar name={userName} email={userEmail} />
          ) : (
            <>
              <Button
                className="shadow-none rounded-md"
                variant={"outline"}
                onClick={() => router.push("/login")}
              >
                Sign in
              </Button>
              <Button onClick={() => router.push("/signup")}>Get Started</Button>
            </>
          )}
        </div>

        <div className="md:hidden">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                aria-label="Toggle Menu"
                className="relative flex h-8 w-8 items-center justify-center"
              >
                <div className="relative size-4">
                  <span
                    className={`bg-foreground absolute left-0 block h-0.5 w-4 transition-all duration-200 ${open ? "top-[0.4rem] -rotate-45" : "top-1 rotate-0"
                      }`}
                  />
                  <span
                    className={`bg-foreground absolute left-0 block h-0.5 w-4 transition-all duration-200 ${open ? "top-[0.4rem] rotate-45" : "top-2.5 rotate-0"
                      }`}
                  />
                </div>
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-screen h-[calc(100vh-56px)] mt-2 bg-white/90 backdrop-blur-md rounded-none shadow-lg p-6 border-0"
            >
              <div className="flex flex-col gap-6">
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-2xl font-medium"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <UserProfileBar name={userName} email={userEmail} mobile />
                ) : (
                  <div className="flex flex-col justify-between gap-2">
                    <Button
                      className="shadow-none rounded-md w-full"
                      variant={"outline"}
                      onClick={() => {
                        setOpen(false);
                        router.push("/login");
                      }}
                    >
                      Sign in
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setOpen(false);
                        router.push("/signup");
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>
    </header>
  );
}
