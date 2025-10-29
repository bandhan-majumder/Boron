"use client";

import { Mail, Copy, Twitter, Linkedin, Github } from "lucide-react";
import Link from "next/link";
import { handleCopyEmail } from "../lib/copyClipBoard";

const Footer = () => {
  return (
    <footer className="py-8 sm:py-12 px-4 text-white bg-[#272725] max-w-[70vw] rounded-2xl min-w-[65vw]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-xl mb-4 font-semibold">Boron</div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 sm:mb-10 mt-10">
          <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 w-full md:w-auto mb-6 md:mb-0">
            <div className="flex flex-grow sm:flex-grow-0 max-w-full">
              <div className="flex items-center px-2 sm:px-4 py-2 border border-gray-600 rounded-l truncate">
                <Mail className="w-5 h-5 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-base truncate">
                  bandhanmajumder16@gmail.com
                </span>
              </div>
              <button
                className="flex items-center justify-center px-2 sm:px-4 border border-l-0 border-gray-600 rounded-r"
                onClick={handleCopyEmail}
              >
                <Copy className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-base">copy</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-800 pt-4 gap-3">
          <div className="flex gap-4 mb-2 sm:mb-0 order-1 sm:order-1">
            <Link
              href={
                "https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=bandhanmajumder16@gmail.com"
              }
              target="_blank"
            >
              <Mail size={26} />
            </Link>
            <Link
              target="_blank"
              href="https://x.com/MEbandhan"
              className="hover:text-gray-300 text-sm sm:text-base"
            >
              <Twitter />
            </Link>
            <Link
              target="_blank"
              href="https://github.com/bandhan-majumder/"
              className="hover:text-gray-300 text-sm sm:text-base"
            >
              <Github />
            </Link>
            <Link
              target="_blank"
              href="https://www.linkedin.com/in/bandhan-majumder/"
              className="hover:text-gray-300 text-sm sm:text-base"
            >
              <Linkedin />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-center sm:justify-end w-full sm:w-auto order-4 sm:order-4">
            <div className="text-xs sm:text-sm text-gray-400 order-2 sm:order-3">
              Boron © 2025
            </div>
          </div>
        </div>
      </div>
      {/* <div className="w-full h-auto flex items-center justify-center overflow-hidden">
        <div className="w-full h-auto flex items-center justify-center overflow-hidden px-2">
          <div className="text-center my-5 w-full">
            <h1
              className="
            text-[4rem] 
            xs:text-[5rem] 
            sm:text-[6rem] 
            md:text-[8rem] 
            lg:text-[12rem] 
            xl:text-[16rem] 
            2xl:text-[20rem]
            font-black 
            leading-none 
            tracking-tight 
            select-none 
            font-sans
            w-full
            break-all
            sm:break-normal
          "
              style={{
                color: "transparent",
                WebkitTextStroke: "1px rgba(255, 255, 255, 1)",
              }}
            >
              boron
            </h1>
          </div>
        </div>
      </div> */}
    </footer>
  );
};

export default Footer;
