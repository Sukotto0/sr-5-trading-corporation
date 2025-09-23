import Image from "next/image"

export default function Footer() {
    return (
        <footer className="flex flex-col gap-4 sm:gap-0 sm:flex-row items-center justify-between bg-black/20 text-base-content p-10">
            <aside className="flex flex-col items-center justify-center">
                <Image src={"/images/SR5TradingCorporation.png"} width={80} height={80} alt="Logo"/>
                <p className="text-center">
                    SR-5 Trading Corporation
                    <br />
                    © {new Date().getFullYear()} - All rights reserved.
                </p>
            </aside>


            <nav className="flex flex-col text-center sm:text-left">
                <h6 className="footer-title">Legal</h6>
                <a className="link link-hover">Terms of use</a>
                <a className="link link-hover">Privacy policy</a>
                <a className="link link-hover">Cookie policy</a>
            </nav>
        </footer>
    )
}