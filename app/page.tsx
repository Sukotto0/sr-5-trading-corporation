"use client";

import React, { useRef, useState, useEffect } from "react";
import { Users, MapPin, ChevronDown, ShoppingCart, Calendar } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";

const Dashboard = () => {
  const { isSignedIn } = useUser();
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalSales: 0,
    totalAppointments: 0,
  });

  useEffect(() => {
    // Fetch stats data
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStatsData({
            totalUsers: data.totalUsers || 0,
            totalSales: data.totalSales || 0,
            totalAppointments: data.totalAppointments || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
  }, []);

  // Hero Slides
  const heroSlides = [
    {
      id: 1,
      image: "/images/HeroBanner1.jpg",
      title: "Welcome to SR-5 Trading Corporation",
      subtitle: "IMPORTER • REBUILDER • DEALER",
    },
    {
      id: 2,
      image: "/images/HeroBanner2.jpg",
      title: "Explore Our Inventory",
      subtitle: "Discover Quality Products and Parts",
      link: "/browse/trucks",
    },
    {
      id: 3,
      image: "/images/HeroBanner3.jpg",
      title: "Expert Automotive Care",
      subtitle: "Professional Service You Can Trust",
      link: "/services",
    },
    {
      id: 4,
      image: "/images/HeroBanner4.jpg",
      title: "Visit Us Today",
      subtitle: "Three Convenient Locations to Serve You",
      link: "/schedule",
    },
  ];

  // Stats Section
  const stats = [
    {
      id: 1,
      icon: Users,
      value: `${statsData.totalUsers.toLocaleString()}`,
      label: "Users",
      color: "text-blue-500",
    },
    {
      id: 2,
      icon: ShoppingCart,
      value: `${statsData.totalSales.toLocaleString()}`,
      label: "Transactions",
      color: "text-green-500",
    },
    {
      id: 3,
      icon: Calendar,
      value: `${statsData.totalAppointments.toLocaleString()}`,
      label: "Appointments",
      color: "text-purple-500",
    },
    {
      id: 4,
      icon: MapPin,
      value: "3",
      label: "Locations",
      color: "text-red-500",
    },
  ];

  // About Section
  const about = {
    title: "About Us",
    description:
      "We are dedicated to providing the best services and experiences. Our community thrives on innovation, collaboration, and growth. With a strong presence across multiple regions, we strive to create lasting impact and value for all our members.",
  };

  // Location Section
  const location = {
    title: "Where to Find Us",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!...",
  };

  // FAQ Section
  const faqs = [
    {
      question: "What services do you offer?",
      answer:
        "We provide a wide range of services including consulting, community programs, and local initiatives that empower growth.",
    },
    {
      question: "How can I join the community?",
      answer:
        "You can join by registering on our website or visiting one of our branches for in-person sign-ups.",
    },
    {
      question: "Where are you located?",
      answer:
        "We currently have branches in Cavite and Bicol. Visit the 'Contact Us' section for full addresses.",
    },
    {
      question: "Do you collaborate with other organizations?",
      answer:
        "Yes! We actively seek partnerships to expand our impact and create better opportunities for members.",
    },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Hero Carousel */}
      <div className="relative w-full h-[70vh] mb-10">
        <Carousel
          opts={{ loop: true }}
          plugins={[autoplayPlugin.current]}
          className="w-full h-full"
          onMouseEnter={autoplayPlugin.current.stop}
          onMouseLeave={autoplayPlugin.current.reset}
        >
          <CarouselContent>
            {heroSlides.map((slide) => (
              <CarouselItem key={slide.id} className="relative w-full h-[70vh]">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-6">
                  <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl max-w-2xl mx-auto mb-4">
                    {slide.subtitle}
                  </p>
                  {slide.link && !isSignedIn && slide.link == "/schedule" ? (
                    <SignInButton mode="modal">
                      <div className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
                        Get Started
                      </div>
                    </SignInButton>
                  ) : (
                    slide.link && (
                      <Link
                        href={slide.link}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-block"
                      >
                        Get Started
                      </Link>
                    )
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </div>

      {/* Stats */}
      <div className="w-full px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-12 relative z-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="flex flex-col items-center justify-center p-6 bg-white shadow-lg rounded-2xl"
            >
              <Icon className={`w-10 h-10 ${stat.color}`} />
              <h2 className="text-3xl font-bold mt-2">{stat.value}</h2>
              <p className="text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* About */}
      <div className="w-full bg-gradient-to-br from-emerald-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              {about.title}
            </h1>
            <div className="w-24 h-1 bg-emerald-600 mx-auto rounded-full"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border-t-4 border-emerald-600">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-center">
              {about.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="flex flex-col items-center p-6 bg-emerald-50 rounded-xl">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Customer First</h3>
                <p className="text-sm text-gray-600 text-center">Dedicated to your satisfaction</p>
              </div>
              <div className="flex flex-col items-center p-6 bg-emerald-50 rounded-xl">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Quality Service</h3>
                <p className="text-sm text-gray-600 text-center">Excellence in every detail</p>
              </div>
              <div className="flex flex-col items-center p-6 bg-emerald-50 rounded-xl">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Multiple Locations</h3>
                <p className="text-sm text-gray-600 text-center">Conveniently located near you</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      {/* <div className="w-full max-w-5xl px-6 py-16">
        <h1 className="text-4xl font-extrabold text-center mb-8">
          {location.title}
        </h1>
        <div className="w-full h-80 rounded-2xl overflow-hidden shadow-lg">
          <iframe
            className="w-full h-full border-0"
            src={location.mapEmbed}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div> */}

      {/* FAQ */}
      <div className="w-full bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <div className="w-24 h-1 bg-emerald-600 mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-600">Find answers to common questions about our services</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                  activeFAQ === idx ? "border-emerald-600" : "border-gray-100 hover:border-emerald-300"
                }`}
              >
                <button
                  className="flex justify-between items-center w-full text-left p-6 bg-gradient-to-r from-white to-emerald-50/30"
                  onClick={() => setActiveFAQ(activeFAQ === idx ? null : idx)}
                >
                  <span className="font-semibold text-lg text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    activeFAQ === idx ? "bg-emerald-600" : "bg-gray-200"
                  }`}>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${
                        activeFAQ === idx ? "rotate-180 text-white" : "text-gray-600"
                      }`}
                    />
                  </div>
                </button>
                {activeFAQ === idx && (
                  <div className="px-6 pb-6 pt-2 bg-emerald-50/50">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Details */}
    </div>
  );
};

export default Dashboard;
