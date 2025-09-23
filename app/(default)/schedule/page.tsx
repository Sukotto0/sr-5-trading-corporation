import { ChevronDownIcon } from '@heroicons/react/20/solid';

export default function Example() {
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 p-8">
      <div className="bg-gray-400/40 p-10 rounded-lg shadow-md max-w-2xl w-full">
        <h1 className="text-xl font-bold text-black mb-8">Schedule Info:</h1>

        <div className="space-y-6">
          {/* Name Section */}
          <div>
            <h2 className="text-xl font-semibold text-black mb-4">Name</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first-name" className="block text-sm font-medium text-black">
                  First Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="first-name"
                    id="first-name"
                    autoComplete="given-name"
                    value=""
                    className="bg-gray-100 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 text-black focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="surname" className="block text-sm font-medium text-black">
                  Surname
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="surname"
                    id="surname"
                    autoComplete="family-name"
                    value=""
                    className="bg-gray-100 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 text-black focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div>
            <h2 className="text-xl font-semibold text-black mb-4">Contact Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contact-number" className="block text-sm font-medium text-black">
                  Contact Number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="contact-number"
                    id="contact-number"
                    autoComplete="tel"
                    value=""
                    className="bg-gray-100 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 text-black focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black">
                  E-mail
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    value=""
                    className="bg-gray-100 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 text-black focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date Section */}
          <div>
            <h2 className="text-xl font-semibold text-black mb-4">Date</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-black">
                  Month
                </label>
                <div className="relative mt-1">
                  <select
                    id="month"
                    name="month"
                    autoComplete="cc-exp-month"
                    className="bg-gray-100 block w-full border border-gray-600 rounded-md shadow-sm py-2 pl-3 pr-10 text-black focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none"
                  >
                    <option>Please Select a Month</option>
                    {/* Add more month options here */}
                  </select>
                  <ChevronDownIcon
                    className="pointer-events-none absolute inset-y-0 right-0 h-full w-5 text-black mr-2"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="day" className="block text-sm font-medium text-black">
                  Day
                </label>
                <div className="relative mt-1">
                  <select
                    id="day"
                    name="day"
                    className="bg-gray-100 block w-full border border-gray-600 rounded-md shadow-sm py-2 pl-3 pr-10 text-black focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none"
                  >
                    <option>Please Select a Day</option>
                    {/* Add more day options here */}
                  </select>
                  <ChevronDownIcon
                    className="pointer-events-none absolute inset-y-0 right-0 h-full w-5 text-black mr-2"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-black-700">
                  Year
                </label>
                <div className="relative mt-1">
                  <select
                    id="year"
                    name="year"
                    autoComplete="cc-exp-year"
                    className="bg-gray-100 block w-full border border-gray-600 rounded-md shadow-sm py-2 pl-3 pr-10 text-black focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none"
                  >
                    <option>Please Select a Year</option>
                    {/* Add more year options here */}
                  </select>
                  <ChevronDownIcon
                    className="pointer-events-none absolute inset-y-0 right-0 h-full w-5 text-black mr-2"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Visit Button */}
        <div className="mt-10">
          <button
            type="submit"
            className="w-full bg-lime-500 text-white py-3 px-4 rounded-md shadow-md text-lg font-semibold hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 transition duration-300"
          >
            Schedule Visit
          </button>
        </div>
      </div>
    </div>
  );
}