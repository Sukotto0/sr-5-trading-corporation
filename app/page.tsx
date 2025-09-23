import Carousel from "@/components/reactbits/carousel";
import React from "react";

const Dashboard = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Carousel */}

      <div className="w-full my-8">
        <Carousel
          baseWidth={800}
          autoplay={true}
          autoplayDelay={3000}
          pauseOnHover={true}
          loop={true}
          round={false}
        />
      </div>
      <div className="carousel w-full mx-auto">
        <div id="slide1" className="carousel-item relative w-full">
          <img
            src="https://lh3.googleusercontent.com/p/AF1QipM7xwTxQeUsWCoHKDVYlYQgV8E1f_SwEi-3k78h=s387-k-no"
            className="w-full object-cover h-64 md:h-96"
          />
          <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
            <a href="#slide4" className="btn btn-circle">
              ❮
            </a>
            <a href="#slide2" className="btn btn-circle">
              ❯
            </a>
          </div>
        </div>

        <div id="slide2" className="carousel-item relative w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp"
            className="w-full object-cover h-64 md:h-96"
          />
          <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
            <a href="#slide1" className="btn btn-circle">
              ❮
            </a>
            <a href="#slide3" className="btn btn-circle">
              ❯
            </a>
          </div>
        </div>

        <div id="slide3" className="carousel-item relative w-full">
          <img
            src="/images/Sample1.jpg"
            className="w-full object-cover h-64 md:h-96"
          />
          <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
            <a href="#slide2" className="btn btn-circle">
              ❮
            </a>
            <a href="#slide4" className="btn btn-circle">
              ❯
            </a>
          </div>
        </div>

        <div id="slide4" className="carousel-item relative w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1665553365602-b2fb8e5d1707.webp"
            className="w-full object-cover h-64 md:h-96"
          />
          <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
            <a href="#slide3" className="btn btn-circle">
              ❮
            </a>
            <a href="#slide1" className="btn btn-circle">
              ❯
            </a>
          </div>
        </div>
      </div>

      {/* About Us */}
      <div className="mx-auto sm:px-4">
        <h1 className="text-4xl font-bold">About Us</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora,
          nisi quibusdam aperiam officiis saepe aliquid commodi rem corporis
          sequi pariatur nihil ad nesciunt, enim debitis voluptas ipsa ipsam
          dolorem. In?
        </p>
      </div>

      {/* Location */}
      <div className="mx-auto">
        <h1 className="text-4xl font-bold">Where to find us</h1>
      </div>
    </div>
  );
};

export default Dashboard;
