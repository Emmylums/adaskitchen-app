import { useEffect, useState } from "react";

export default function TestimonialSlider({ testimonials, interval = 7000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, interval);
    return () => clearInterval(timer);
  }, [testimonials.length, interval]);

  return (
    <div className="flex items-center justify-center">
      <div className="max-w-3xl w-full font-display2 rounded-lg overflow-hidden">
        <div
          className="flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={index} className="min-w-full bg-own-2 rounded-lg p-6">
              <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-sm text-justify">{testimonial.description}</h3>
                <div className="flex items-center mt-5">
                  <div className="w-16 h-16 bg-black rounded-full p-2">
                    <img src={testimonial.image} className="object-cover rounded-full" />
                  </div>
                  <div className="ml-5">
                    <p className="text-lg tracking-wide font-bold font-display2">{testimonial.name}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
