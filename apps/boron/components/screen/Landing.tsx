import type React from "react";
import { Card } from "../../components/index";
import { Star, Play } from "lucide-react";
import { Header } from "../Header";
import Footer from "../Footer";
import Hero from "../Hero";
import { testimonials } from "../../prompts/helper/constants";

export default function BoronGPTLanding() {
  return (
    <div className="bg-[1C1C1C] focus:to-yellow-50">
      <Hero />

      {/* <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-glow mb-8">
            See BoronGPT in Action
          </h2>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Watch how BoronGPT builds a landing page
          </p>

          <div className="relative max-w-4xl mx-auto">
            <div className="relative aspect-video bg-gray-900/30 border border-gray-700 rounded-2xl overflow-hidden glow-effect group cursor-pointer">
              <video
                className="w-full h-full object-cover"
                poster="/futuristic-ai-interface-demo-thumbnail.jpg"
                controls
              >
                <source
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>

              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                <div className="w-20 h-20 bg-amber-500/90 rounded-full flex items-center justify-center animate-glow">
                  <Play className="h-8 w-8 text-black ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-glow mb-4">
              Look what people say!
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Join builders, build appliation and ship fast ⚡!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={testimonial.name}
                className="p-8 bg-gray-900/30 border-gray-700 backdrop-blur-sm glow-effect hover:bg-gray-800/50 transition-all duration-300"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="space-y-6">
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-amber-500 text-amber-500"
                      />
                    ))}
                  </div>

                  <blockquote className="text-gray-300 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>

                  <div className="border-t border-gray-700 pt-6">
                    <div className="font-semibold text-white text-glow">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* <div className="mb-10 flex justify-center">
       <Footer />
     </div> */}
    </div>
  );
}
