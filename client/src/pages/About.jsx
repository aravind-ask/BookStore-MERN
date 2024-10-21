import { Card } from "flowbite-react";

export default function About() {
  return (
    <div className="max-w-6xl mx-auto p-4 pt-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        About{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500">
          ReBook
        </span>
      </h1>

      <div className="flex flex-col md:flex-row gap-6 mb-12">
        <div className="w-full md:w-1/2">
          <Card>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              ReBook is committed to building a community of book lovers by
              providing a platform to buy, sell, and swap second-hand books. Our
              goal is to make books accessible to everyone while promoting
              sustainability through recycling books.
            </p>
          </Card>
        </div>
        <div className="w-full md:w-1/2">
          <Card>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Our Vision
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              We envision a world where books are shared, not discarded. By
              connecting readers from around the globe, we aim to give books a
              second life and inspire generations to read, share, and connect
              through the stories they hold.
            </p>
          </Card>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-green-500 p-6 rounded-lg text-center">
        <h3 className="text-2xl font-bold text-white">
          Join the ReBook Movement
        </h3>
        <p className="text-white mt-4">
          Together, we can make books accessible to all. Whether you're here to
          find a hidden gem or pass on a beloved favorite, you’re a part of the
          ReBook family.
        </p>
        <button className="mt-6 px-6 py-3 text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-lg hover:opacity-90">
          Start Trading Books
        </button>
      </div>
    </div>
  );
}
