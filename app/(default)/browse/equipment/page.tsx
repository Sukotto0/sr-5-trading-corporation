'use client'
import { Fragment, useState } from 'react'
import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon, FunnelIcon, MinusIcon, PlusIcon, Squares2X2Icon, StarIcon } from '@heroicons/react/20/solid'

// Dummy product data to populate the grid
const products = [
  {
    id: 1,
    name: 'NEW For Acer 550-53-50QC',
    href: '#',
    imageSrc: 'https://cdn.shoppy.ph/image/c_limit,q_80,w_400/v1/product/36979201.webp',
    imageAlt: 'Laptop cooling fan.',
    price: '₱530',
    originalPrice: '₱850',
    discount: '38%',
    description: 'Get a better understanding of your traffic',
    rating: 5
  },
  {
    id: 2,
    name: 'Preferred CPU Cooling Fan for Acer Aspire 5',
    href: '#',
    imageSrc: 'https://cdn.shoppy.ph/image/c_limit,q_80,w_400/v1/product/166548773.webp',
    imageAlt: 'Another laptop cooling fan.',
    price: '₱338',
    originalPrice: '₱390',
    discount: '13%',
    description: 'Speak directly to your customers',
    rating: 5
  },
  {
    id: 3,
    name: 'Laptop CPU Cooler Fan for Acer Aspire 5',
    href: '#',
    imageSrc: 'https://cdn.shoppy.ph/image/c_limit,q_80,w_400/v1/product/166548773.webp',
    imageAlt: 'Laptop cooling fan with a different design.',
    price: '₱1,047',
    originalPrice: '₱1,099',
    discount: '5%',
    description: 'Shop for genuine parts and accessories',
    rating: 5
  },
  {
    id: 4,
    name: 'Replacement Acer Aspire 5 A515-52',
    href: '#',
    imageSrc: 'https://cdn.shoppy.ph/image/c_limit,q_80,w_400/v1/product/34720170.webp',
    imageAlt: 'Laptop LCD screen.',
    price: '₱3,150',
    originalPrice: '₱3,500',
    discount: '10%',
    description: 'Replacement LCD screen.',
    rating: 5
  },
  {
    id: 5,
    name: 'Preferred 15.6 for Acer Aspire 5',
    href: '#',
    imageSrc: 'https://cdn.shoppy.ph/image/c_limit,q_80,w_400/v1/product/181552550.webp',
    imageAlt: 'Another laptop LCD screen.',
    price: '₱3,390',
    originalPrice: '₱3,790',
    discount: '10%',
    description: 'Another replacement LCD screen.',
    rating: 5
  },
  {
    id: 6,
    name: 'Replacement for Acer Aspire 5',
    href: '#',
    imageSrc: 'https://cdn.shoppy.ph/image/c_limit,q_80,w_400/v1/product/165384196.webp',
    imageAlt: 'Replacement display for a laptop.',
    price: '₱423',
    originalPrice: '₱490',
    discount: '13%',
    description: 'Replacement display for a laptop.',
    rating: 5
  },
  {
    id: 7,
    name: 'Preferred 15.6 for Acer Aspire 5',
    href: '#',
    imageSrc: 'https://cdn.shoppy.ph/image/c_limit,q_80,w_400/v1/product/181552550.webp',
    imageAlt: 'Laptop display replacement.',
    price: '₱3,328',
    originalPrice: '₱3,720',
    discount: '10%',
    description: 'Laptop display replacement.',
    rating: 5
  },
  {
    id: 8,
    name: 'for Acer Aspire 5 A315-23',
    href: '#',
    imageSrc: 'https://cdn.shoppy.ph/image/c_limit,q_80,w_400/v1/product/40738600.webp',
    imageAlt: 'Laptop speakers.',
    price: '₱935',
    originalPrice: '₱990',
    discount: '5%',
    description: 'Replacement speakers.',
    rating: 5
  },
  {
    id: 9,
    name: 'Preferred For Acer aspire 5 a515',
    href: '#',
    imageSrc: 'https://cdn.shoppy.ph/image/c_limit,q_80,w_400/v1/product/101683453.webp',
    imageAlt: 'Laptop keyboard.',
    price: '₱47',
    originalPrice: '₱50',
    discount: '6%',
    description: 'Replacement keyboard.',
    rating: 5
  },
  {
    id: 10,
    name: 'NEW For Acer 550-53-50QC',
    href: '#',
    imageSrc: 'https://cdn.shoppy.ph/image/c_limit,q_80,w_400/v1/product/36979201.webp',
    imageAlt: 'Another laptop cooling fan.',
    price: '₱499',
    originalPrice: '₱599',
    discount: '17%',
    description: 'Laptop cooling fan.',
    rating: 5
  },
  
];

// Dummy filter data
const filters = [
    {
        id: 'Branch',
        name: 'Branch',
        options: [
            { value: 'imus', label: 'Imus', checked: false },
            { value: 'bacoor', label: 'Bacoor', checked: false },
            { value: 'albay', label: 'Albay', checked: false },
          ],
    },
    {
        id: 'shops-promos',
        name: 'Shops & Promos',
        options: [
            { value: 'preferred-sellers', label: 'Preferred Sellers', checked: false },
            { value: 'mega-discount', label: 'Mega Discount Vouchers', checked: false },
        ],
    },
    {
        id: 'rating',
        name: 'Rating',
        options: [
            { value: '5-up', label: '5 & Up', checked: false, stars: 5 },
            { value: '4-up', label: '4 & Up', checked: false, stars: 4 },
            { value: '3-up', label: '3 & Up', checked: false, stars: 3 },
            { value: '2-up', label: '2 & Up', checked: false, stars: 2 },
        ],
    },
];

const sortOptions = [
    { name: 'Relevance', href: '#', current: true },
    { name: 'Latest', href: '#', current: false },
    { name: 'Price', href: '#', current: false },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function Equipments() {
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    return (
        <div className="bg-white">
            <div>
                {/* Mobile filter dialog */}
                <Transition.Root show={mobileFiltersOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileFiltersOpen}>
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black bg-opacity-25" />
                        </Transition.Child>

                        <div className="fixed inset-0 z-40 flex">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-in-out duration-300 transform"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition ease-in-out duration-300 transform"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                                    <div className="flex items-center justify-between px-4">
                                        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                                        <button
                                            type="button"
                                            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                                            onClick={() => setMobileFiltersOpen(false)}
                                        >
                                            <span className="sr-only">Close menu</span>
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>

                                    {/* Filters */}
                                    <form className="mt-4 border-t border-gray-200">
                                        {filters.map((section) => (
                                            <Disclosure as="div" key={section.id} className="border-t border-gray-200 px-4 py-6">
                                                {({ open }) => (
                                                    <>
                                                        <h3 className="-mx-2 -my-3 flow-root">
                                                            <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                                                                <span className="font-medium text-gray-900">{section.name}</span>
                                                                <span className="ml-6 flex items-center">
                                                                    <span
                                                                        className={classNames(open ? 'rotate-180' : 'rotate-0', 'h-5 w-5 transform transition-transform duration-200')}
                                                                    >
                                                                        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                                                                    </span>
                                                                </span>
                                                            </Disclosure.Button>
                                                        </h3>
                                                        <Disclosure.Panel className="pt-6">
                                                            <div className="space-y-6">
                                                                {section.options.map((option, optionIdx) => (
                                                                    <div key={option.value} className="flex items-center">
                                                                        <input
                                                                            id={`filter-mobile-${section.id}-${optionIdx}`}
                                                                            name={`${section.id}[]`}
                                                                            defaultValue={option.value}
                                                                            type="checkbox"
                                                                            defaultChecked={option.checked}
                                                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                        />
                                                                        <label
                                                                            htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                                                            className="ml-3 text-sm text-gray-600"
                                                                        >
                                                                            {option.label}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </Disclosure.Panel>
                                                    </>
                                                )}
                                            </Disclosure>
                                        ))}
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition.Root>

                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="relative z-10 flex items-baseline justify-between pt-24 pb-6 border-b border-gray-200">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Browse "Equipments"</h1>
                        <div className="flex items-center">
                            <Menu as="div" className="relative inline-block text-left">
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-700">Sort by</span>
                                    {sortOptions.map((option) => (
                                        <a
                                            key={option.name}
                                            href={option.href}
                                            className={classNames(
                                                option.current ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900',
                                                'px-3 py-2 text-sm font-medium transition-colors duration-200'
                                            )}
                                        >
                                            {option.name}
                                        </a>
                                    ))}
                                    <span className="mx-2 text-gray-300">|</span>
                                    <span className="text-sm text-gray-500">1/17</span>
                                    <button className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </Menu>
                            <button
                                type="button"
                                className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
                                onClick={() => setMobileFiltersOpen(true)}
                            >
                                <span className="sr-only">Filters</span>
                                <FunnelIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    <section aria-labelledby="products-heading" className="pb-24 pt-6">
                        <h2 id="products-heading" className="sr-only">Products</h2>
                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                            {/* Filter sidebar */}
                            <form className="hidden lg:block">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">FILTER SEARCH</h3>
                                {filters.map((section) => (
                                    <Disclosure as="div" key={section.id} className="border-b border-gray-200 py-6">
                                        {({ open }) => (
                                            <>
                                                <h3 className="-my-3 flow-root">
                                                    <Disclosure.Button className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                                                        <span className="font-medium text-gray-900">{section.name}</span>
                                                        <span className="ml-6 flex items-center">
                                                            <span
                                                                className={classNames(open ? 'rotate-180' : 'rotate-0', 'h-5 w-5 transform transition-transform duration-200')}
                                                            >
                                                                <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        </span>
                                                    </Disclosure.Button>
                                                </h3>
                                                <Disclosure.Panel className="pt-6">
                                                    <div className="space-y-4">
                                                        {section.options.map((option, optionIdx) => (
                                                            <div key={option.value} className="flex items-center">
                                                                <input
                                                                    id={`filter-${section.id}-${optionIdx}`}
                                                                    name={`${section.id}[]`}
                                                                    defaultValue={option.value}
                                                                    type="checkbox"
                                                                    defaultChecked={option.checked}
                                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                />
                                                                <label
                                                                    htmlFor={`filter-${section.id}-${optionIdx}`}
                                                                    className="ml-3 text-sm text-gray-600"
                                                                >
                                                                    {option.label}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Disclosure.Panel>
                                            </>
                                        )}
                                    </Disclosure>
                                ))}
                            </form>

                            {/* Product grid */}
                            <div className="lg:col-span-3">
                                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                                    {products.map((product) => (
                                        <div key={product.id} className="group relative border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                                                <img
                                                    src={product.imageSrc}
                                                    alt={product.imageAlt}
                                                    className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-center justify-between text-sm mb-2">
                                                    <span className="text-gray-500 font-medium">Mall</span>
                                                    <div className="flex items-center space-x-1 text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <StarIcon key={i} className={`h-4 w-4 ${i < product.rating ? 'text-yellow-400' : 'text-gray-200'}`} aria-hidden="true" />
                                                        ))}
                                                        <span className="text-gray-500 text-xs">(5.0)</span>
                                                    </div>
                                                </div>
                                                <h3 className="text-sm font-medium text-gray-900">
                                                    <a href={product.href}>
                                                        <span aria-hidden="true" className="absolute inset-0" />
                                                        {product.name}
                                                    </a>
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                                                <div className="flex items-baseline mt-2">
                                                    <p className="text-lg font-medium text-red-500 mr-2">{product.price}</p>
                                                    <p className="text-sm text-gray-400 line-through mr-2">{product.originalPrice}</p>
                                                    <p className="text-xs text-red-500">{product.discount}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}