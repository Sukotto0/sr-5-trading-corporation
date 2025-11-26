"use client";
import { Fragment, useState, useMemo } from "react";
import {
  Dialog,
  Disclosure,
  DisclosureButton,
  Menu,
  Transition,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  FunnelIcon,
  StarIcon,
} from "@heroicons/react/20/solid";
import {
  useFilters,
  useProducts,
  type ProductsQueryParams,
} from "@/hooks/useQuery";
import { use } from "react";
import Link from "next/link";

const productsCategory = [
  { name: "Trucks", href: "/browse/trucks"},
  { name: "Heavy Equipment", href: "/browse/heavy-equipment"},
  { name: "Units", href: "/browse/units"},
  { name: "Engine", href: "/browse/engine"},
  { name: "Tools", href: "/browse/tools"},
  { name: "Parts & Accessories", href: "/browse/parts-accessories"},
];

// Sort options for products
const sortOptions = [
  { name: "Relevance", value: "relevance", current: true },
  { name: "Latest", value: "latest", current: false },
  { name: "Price: Low to High", value: "price-low", current: false },
  { name: "Price: High to Low", value: "price-high", current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Browse({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<ProductsQueryParams>({
    category: slug,
  });
  const [currentSort, setCurrentSort] = useState("relevance");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showDevWarning, setShowDevWarning] = useState(true);

  // Fetch filters and products using React Query
  const {
    data: filters = [],
    isLoading: filtersLoading,
    error: filtersError,
  } = useFilters();
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useProducts({
    ...selectedFilters,
    sortBy: currentSort,
  });

  // Handle filter changes
  const handleFilterChange = (
    filterId: string,
    optionValue: string,
    checked: boolean
  ) => {
    setSelectedFilters((prev) => {
      if (checked) {
        return { ...prev, [filterId.toLowerCase()]: optionValue };
      } else {
        const newFilters = { ...prev };
        delete newFilters[filterId.toLowerCase() as keyof ProductsQueryParams];
        return newFilters;
      }
    });
  };

  // Handle sort changes
  const handleSortChange = (sortValue: string) => {
    setCurrentSort(sortValue);
  };

  // Handle price range changes
  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const newRange = { ...priceRange, [type]: value };
    setPriceRange(newRange);
    
    // Update selected filters
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      
      if (newRange.min && !isNaN(parseFloat(newRange.min))) {
        newFilters.minPrice = parseFloat(newRange.min);
      } else {
        delete newFilters.minPrice;
      }
      
      if (newRange.max && !isNaN(parseFloat(newRange.max))) {
        newFilters.maxPrice = parseFloat(newRange.max);
      } else {
        delete newFilters.maxPrice;
      }
      
      return newFilters;
    });
  };

  // Update sort options current state
  const updatedSortOptions = useMemo(
    () =>
      sortOptions.map((option) => ({
        ...option,
        current: option.value === currentSort,
      })),
    [currentSort]
  );

  if (filtersError || productsError) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600">
            Failed to load data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div>
        {/* Mobile filter dialog */}
        <Transition.Root show={mobileFiltersOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 lg:hidden"
            onClose={setMobileFiltersOpen}
          >
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
                    <h2 className="text-lg font-medium text-gray-900">
                      Filters
                    </h2>
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
                    {filtersLoading ? (
                      <div className="space-y-4 p-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                            <div className="space-y-2">
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      filters.map((section) => (
                        <Disclosure
                          as="div"
                          key={section.id}
                          className="border-t border-gray-200 px-4 py-6"
                        >
                          {({ open }) => (
                            <>
                              <h3 className="-mx-2 -my-3 flow-root">
                                <DisclosureButton className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                                  <span className="font-medium text-gray-900">
                                    {section.name}
                                  </span>
                                  <span className="ml-6 flex items-center">
                                    <span
                                      className={classNames(
                                        open ? "rotate-180" : "rotate-0",
                                        "h-5 w-5 transform transition-transform duration-200"
                                      )}
                                    >
                                      <ChevronDownIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  </span>
                                </DisclosureButton>
                              </h3>
                              <Disclosure.Panel className="pt-6">
                                {section.type === 'price-range' ? (
                                  <div className="space-y-4 flex flex-row gap-4">
                                    <div>
                                      <label htmlFor={`min-price-mobile`} className="block text-sm font-medium text-gray-700 mb-1">
                                        Min Price (₱)
                                      </label>
                                      <input
                                        type="number"
                                        id={`min-price-mobile`}
                                        value={priceRange.min}
                                        onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="0"
                                        min="0"
                                      />
                                    </div>
                                    <div>
                                      <label htmlFor={`max-price-mobile`} className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Price (₱)
                                      </label>
                                      <input
                                        type="number"
                                        id={`max-price-mobile`}
                                        value={priceRange.max}
                                        onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="No limit"
                                        min="0"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-6">
                                    {section.options.map((option, optionIdx) => (
                                      <div
                                        key={option.value}
                                        className="flex items-center"
                                      >
                                        <input
                                          id={`filter-mobile-${section.id}-${optionIdx}`}
                                          name={`${section.id}[]`}
                                          value={option.value}
                                          type="checkbox"
                                          checked={
                                            selectedFilters[
                                              section.id.toLowerCase() as keyof ProductsQueryParams
                                            ] === option.value
                                          }
                                          onChange={(e) =>
                                            handleFilterChange(
                                              section.id,
                                              option.value,
                                              e.target.checked
                                            )
                                          }
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
                                )}
                              </Disclosure.Panel>
                            </>
                          )}
                        </Disclosure>
                      ))
                    )}
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 flex items-baseline justify-between pt-24 pb-6 border-b border-gray-200">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Browsing "{slug.charAt(0).toUpperCase() + slug.slice(1)}"
            </h1>
            <div className="flex items-center">
              <Menu as="div" className="relative inline-block text-left">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Sort by
                  </span>
                  {updatedSortOptions.map((option) => (
                    <button
                      key={option.name}
                      onClick={() => handleSortChange(option.value)}
                      className={classNames(
                        option.current
                          ? "text-indigo-600"
                          : "text-gray-500 hover:text-gray-900",
                        "px-3 py-2 text-sm font-medium transition-colors duration-200"
                      )}
                    >
                      {option.name}
                    </button>
                  ))}

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
            <h2 id="products-heading" className="sr-only">
              Products
            </h2>
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4 relative">
              
              {/* Filter sidebar */}
              <form className="hidden lg:block sticky top-0 h-fit">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  CATEGORIES
                </h3>
                <ul className="mb-8 space-y-2">
                 {productsCategory.map((product) => (
                    <li key={product.name}>
                      <Link href={product.href} className="text-gray-600 hover:text-gray-900">
                        {product.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  FILTER SEARCH
                </h3>
                {filtersLoading ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse border-b border-gray-200 py-6"
                      >
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  filters.map((section) => (
                    <Disclosure
                      as="div"
                      key={section.id}
                      className="border-b border-gray-200 py-6"
                    >
                      {({ open }) => (
                        <>
                          <h3 className="-my-3 flow-root">
                            <Disclosure.Button className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                              <span className="font-medium text-gray-900">
                                {section.name}
                              </span>
                              <span className="ml-6 flex items-center">
                                <span
                                  className={classNames(
                                    open ? "rotate-180" : "rotate-0",
                                    "h-5 w-5 transform transition-transform duration-200"
                                  )}
                                >
                                  <ChevronDownIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              </span>
                            </Disclosure.Button>
                          </h3>
                          <Disclosure.Panel className="pt-6">
                            {section.type === 'price-range' ? (
                              <div className="flex flex-row gap-4 items-center">
                                <div>
                                  <label htmlFor={`min-price-desktop`} className="block text-sm font-medium text-gray-700 mb-1">
                                    Min Price (₱)
                                  </label>
                                  <input
                                    type="number"
                                    id={`min-price-desktop`}
                                    value={priceRange.min}
                                    onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                                    placeholder="0"
                                    min="0"
                                  />
                                </div>
                                -
                                <div>
                                  <label htmlFor={`max-price-desktop`} className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Price (₱)
                                  </label>
                                  <input
                                    type="number"
                                    id={`max-price-desktop`}
                                    value={priceRange.max}
                                    onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                                    placeholder="No limit"
                                    min="0"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {section.options.map((option, optionIdx) => (
                                  <div
                                    key={option.value}
                                    className="flex items-center"
                                  >
                                    <input
                                      id={`filter-${section.id}-${optionIdx}`}
                                      name={`${section.id}[]`}
                                      value={option.value}
                                      type="checkbox"
                                      checked={
                                        selectedFilters[
                                          section.id.toLowerCase() as keyof ProductsQueryParams
                                        ] === option.value
                                      }
                                      onChange={(e) =>
                                        handleFilterChange(
                                          section.id,
                                          option.value,
                                          e.target.checked
                                        )
                                      }
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
                            )}
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  ))
                )}
              </form>

              {/* Product grid */}
              <div className="lg:col-span-3">
                {productsLoading ? (
                  <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-h-1 aspect-w-1 w-full bg-gray-200 rounded-lg h-80"></div>
                        <div className="mt-4 space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your filters to see more results.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {products.map((product) => (
                      <Link
                      href={(slug == "tools" || slug == "parts-accessories") ? `/view/e/${product.id}` : `/view/v/${product.id}`}
                        key={product.id}
                        className="group relative border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                      >
                        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                          />
                        </div>
                        <div className="p-4">
                          <p className="mt-1 text-sm text-gray-500">
                            {product.name}
                          </p>
                          <div className="flex items-baseline mt-2">
                            <p className="text-lg font-medium text-red-900 mr-2">
                              ₱{Number(product.price).toFixed(2)}
                            </p>
                            {/* <p className="text-sm text-gray-400 line-through mr-2">
                              {product.originalPrice}
                            </p>
                            <p className="text-xs text-red-500">
                              {product.discount}
                            </p> */}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {product.quantity} in stock
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
        {showDevWarning && (
  <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-md shadow-lg z-50 flex items-start max-w-xs">
    <div className="flex-1 text-sm">
      ⚠️ This website is currently in development.  
      All products & services shown are placeholders only, and NOT actual products of SR-5 Trading Corporation.
    </div>
    <button
      onClick={() => setShowDevWarning(false)}
      className="ml-3 text-red-800 hover:text-red-900"
    >
      ✕
    </button>
  </div>
)}

      </div>
    </div>
  );
}
