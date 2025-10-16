"use client";

import React, { useRef, useState } from "react";
import { BarChart, Users, TrendingUp, MapPin, ChevronDown } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Dashboard = () => {
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  // Hero Slides
  const heroSlides = [
    {
      id: 1,
      image: "/images/HeroBanner1.jpg",
      title: "Welcome to Our Community",
      subtitle:
        "Empowering growth, innovation, and collaboration across all fields.",
    },
    {
      id: 2,
      image: "/images/HeroBanner2.jpg",
      title: "Innovation That Inspires",
      subtitle: "We push boundaries and deliver outstanding experiences.",
    },
    {
      id: 3,
      image: "/images/HeroBanner3.jpg",
      title: "Building Stronger Communities",
      subtitle: "Join us as we grow and achieve new milestones together.",
    },
    {
      id: 4,
      image: "/images/HeroBanner4.jpg",
      title: "Empowering Local Initiatives",
      subtitle: "Supporting grassroots movements for a better tomorrow.",
    },
  ];

  // Stats Section
  const stats = [
    {
      id: 1,
      icon: Users,
      value: "1,200+",
      label: "Active Members",
      color: "text-blue-500",
    },
    {
      id: 2,
      icon: TrendingUp,
      value: "98%",
      label: "Growth Rate",
      color: "text-green-500",
    },
    {
      id: 3,
      icon: BarChart,
      value: "450+",
      label: "Projects Completed",
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
                  <p className="text-lg md:text-xl max-w-2xl mx-auto">
                    {slide.subtitle}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </div>

      {/* Stats */}
      <div className="w-full max-w-6xl px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-12 relative z-10">
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
      <div className="w-full max-w-4xl text-center px-6 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight">
          {about.title}
        </h1>
        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          {about.description}
        </p>
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
      <div className="w-full max-w-5xl px-6 py-16">
        <h1 className="text-4xl font-extrabold text-center mb-8">
          Frequently Asked Questions
        </h1>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white shadow-md rounded-lg p-6 cursor-pointer"
            >
              <button
                className="flex justify-between items-center w-full text-left font-semibold text-lg text-gray-800"
                onClick={() =>
                  setActiveFAQ(activeFAQ === idx ? null : idx)
                }
              >
                {faq.question}
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${
                    activeFAQ === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeFAQ === idx && (
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Details */}
      <div className="w-full max-w-5xl px-6 py-16">
        <h1 className="text-4xl font-extrabold text-center mb-8">Contact Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-2 text-blue-600">Cavite</h2>
            <p className="text-lg text-gray-700 mb-1">+63 969 272 7377</p>
            <p className="text-lg text-gray-700 mb-1">+63 917 556 1897</p>
            <h3 className="text-lg font-semibold mt-4 mb-1 text-gray-800">
              Bacoor Branch
            </h3>
            <p className="text-gray-600 text-center mb-2">
              Reveal Subdivision Real 1 Bacoor Cavite 4102
            </p>
            <h3 className="text-lg font-semibold mb-1 text-gray-800">
              Imus Branch
            </h3>
            <p className="text-gray-600 text-center">
              Sanchez Compound Bayan Luma 7 Imus Cavite 4103
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-2 text-green-600">Bicol</h2>
            <p className="text-lg text-gray-700 mb-1">+63 917 710 4758</p>
            <p className="text-lg text-gray-700 mb-1">+63 917 575 8157</p>
            <p className="text-lg text-gray-700 mb-1">+63 917 556 1897</p>
            <h3 className="text-lg font-semibold mt-4 mb-1 text-gray-800">
              Warehouse
            </h3>
            <p className="text-gray-600 text-center mb-2">
              Purok 1 Malabog Maharlika Highway Daraga Albay 4501
            </p>
            <h3 className="text-lg font-semibold mb-1 text-gray-800">
              Main Branch
            </h3>
            <p className="text-gray-600 text-center">
              Purok 1 Barangay Ilawod Maharlika Highway Camalig Albay 4502
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
