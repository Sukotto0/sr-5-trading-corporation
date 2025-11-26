import Image from "next/image";

export default function Footer() {
  return (
    <footer className="flex flex-col gap-4 sm:gap-0 sm:flex-row items-center justify-around bg-black/20 text-base-content p-10 select-none">
      <aside className="flex flex-col items-center justify-center">
        <Image
          src={"/images/SR5TradingCorporation.png"}
          width={80}
          height={80}
          alt="Logo"
        />
        <p className="text-center">
          SR-5 Trading Corporation
          <br />© {new Date().getFullYear()} - All rights reserved.
        </p>
      </aside>

       <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="rounded-2xl flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2 text-blue-600">Cavite</h2>
            <p className="text-md text-gray-700 mb-1">+63 969 272 7377</p>
            <p className="text-md text-gray-700 mb-auto">+63 917 556 1897</p>
            <h3 className="text-md font-semibold mt-4 mb-1 text-gray-800">
              Bacoor Branch
            </h3>
            <p className="text-gray-600 text-center mb-2">
              Reveal Subdivision Real 1 Bacoor Cavite 4102
            </p>
            <h3 className="text-md font-semibold mb-1 text-gray-800">
              Imus Branch
            </h3>
            <p className="text-gray-600 text-center">
              Sanchez Compound Bayan Luma 7 Imus Cavite 4103
            </p>
          </div>
          <div className="rounded-2xl flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2 text-green-600">Bicol</h2>
            <p className="text-md text-gray-700 mb-1">+63 917 710 4758</p>
            <p className="text-md text-gray-700 mb-1">+63 917 575 8157</p>
            <p className="text-md text-gray-700 mb-auto">+63 917 556 1897</p>
            <h3 className="text-md font-semibold mt-4 mb-1 text-gray-800">
              Warehouse
            </h3>
            <p className="text-gray-600 text-center mb-2">
              Purok 1 Malabog Maharlika Highway Daraga Albay 4501
            </p>
            <h3 className="text-md font-semibold mb-1 text-gray-800">
              Main Branch
            </h3>
            <p className="text-gray-600 text-center">
              Purok 1 Barangay Ilawod Maharlika Highway Camalig Albay 4502
            </p>
          </div>
        </div>
      </div>


      <nav className="flex flex-col text-center sm:text-left">
        <h6 className="footer-title">Legal</h6>
        <a className="link link-hover">Terms of use</a>
        <a className="link link-hover">Privacy policy</a>
        <a className="link link-hover">Cookie policy</a>
      </nav>
    </footer>
  );
}
