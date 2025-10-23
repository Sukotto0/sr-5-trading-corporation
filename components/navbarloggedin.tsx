"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  CubeTransparentIcon,
} from "@heroicons/react/24/outline";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Bolt, Cog, SparkleIcon, TruckIcon, User, Wrench } from "lucide-react";

const products = [
  { name: "Trucks", href: "/browse/trucks", icon: TruckIcon },
  { name: "Equipment", href: "/browse/equipment", icon: Wrench },
  { name: "Units", href: "/browse/units", icon: Cog },
  { name: "Engine", href: "/browse/engine", icon: Bolt },
  {
    name: "Parts & Accessories",
    href: "/browse/parts-accessories",
    icon: CubeTransparentIcon,
  },
];

export default function NavbarDefault() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [disclosureOpen, setDisclosureOpen] = useState(false);
  const disclosureRef = useRef<HTMLDivElement>(null);

  // Detect outside clicks ANYWHERE on the document
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        disclosureOpen &&
        disclosureRef.current &&
        !disclosureRef.current.contains(event.target as Node)
      ) {
        setDisclosureOpen(false);
      }
    }
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") setDisclosureOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [disclosureOpen]);

  return (
    <header className="bg-emerald-600 select-none">
      <nav className="mx-auto flex max-w-11/12 items-center justify-between px-6 py-3 lg:px-8">
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <img
              alt=""
              src="/images/SR5MoreMinimal.png"
              className="h-12 w-auto"
            />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 p-2.5 text-gray-400"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop Nav */}
        <PopoverGroup className="hidden lg:flex flex-row items-center lg:gap-x-12">
          <Link href="/" className="text-sm font-semibold text-white">
            Home
          </Link>
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold text-white">
              Browse
              <ChevronDownIcon className="h-5 w-5 text-gray-300" />
            </PopoverButton>
            <PopoverPanel className="absolute left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 rounded-3xl bg-white shadow-lg p-4">
              {products.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center gap-x-4 rounded-lg p-3 hover:bg-white/5"
                >
                  <item.icon className="h-6 w-6 text-green-800 group-hover:text-black/50" />
                  <span className="font-semibold text-black/80 group-hover:text-black/50">{item.name}</span>
                </Link>
              ))}
            </PopoverPanel>
          </Popover>
          <Link href="/services" className="text-sm font-semibold text-white">
            Services
          </Link>
          <Link href="/transactions" className="text-sm font-semibold text-white">
            Transactions
          </Link>
          <Link href="/feedback" className="text-sm font-semibold text-white">
            Feedback
          </Link>
          <Link href="/schedule" className="text-sm font-semibold text-white">
            Schedule
          </Link>
          <Link href="/cart" className="text-sm font-semibold text-white">
            Cart
          </Link>
          <UserButton />
        </PopoverGroup>
      </nav>

      {/* Mobile Menu */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-sm bg-lime-900 p-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <a href="/" className="-m-1.5 p-1.5">
              <img alt="" src="/images/SR5Minimal.png" className="h-8 w-auto" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-400"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {/* Mobile Disclosure (controlled) */}
            <div ref={disclosureRef}>
              <Disclosure as="div" defaultOpen={false}>
                {() => (
                  <>
                    <DisclosureButton
                      onClick={() => setDisclosureOpen((prev) => !prev)}
                      className="flex w-full justify-between rounded-lg py-2 px-3 text-white font-semibold hover:bg-white/5"
                    >
                      Browse Units
                      <ChevronDownIcon className="h-5 w-5" />
                    </DisclosureButton>
                    {disclosureOpen && (
                      <DisclosurePanel className="mt-2 space-y-2">
                        {products.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setDisclosureOpen(false)}
                            className="block rounded-lg py-2 pl-6 text-sm text-white hover:bg-white/5"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </DisclosurePanel>
                    )}
                  </>
                )}
              </Disclosure>
            </div>

            <SignInButton mode="modal">
              <div className="block rounded-lg px-3 py-2 text-white font-semibold hover:bg-white/5">
                Schedule a Visit
              </div>
            </SignInButton>
            <UserButton />
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
