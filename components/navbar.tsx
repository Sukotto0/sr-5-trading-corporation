import React from 'react'
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import NavbarLoggedIn from "@/components/navbarloggedin";
import NavbarDefault from "@/components/navbardefault";


const Navigation = () => {
    const { isLoaded, isSignedIn } = useUser()
    const pathname = usePathname();

  return isLoaded && isSignedIn ? pathname.startsWith("/admin") ? <></> : <NavbarLoggedIn /> : <NavbarDefault /> 
}

export default Navigation