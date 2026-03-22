import Image from "next/image";
import Link from "next/link";

export default function Login() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-10 border border-gray-100 flex flex-col items-center">
          
          {/* Logo */}
          <div className="mb-8">
             <Image
              src="/velogo.png"
              alt="Vardhan Enterprises Logo"
              width={200}
              height={100}
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>

          <h1 className="text-2xl font-bold mb-8 text-gray-800 tracking-tight">Sign In</h1>

          {/* Form */}
          <form className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="userId" className="text-sm font-semibold text-gray-700">
                User ID
              </label>
              <input
                id="userId"
                type="text"
                placeholder="Enter User ID"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white text-base outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter Password"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white text-base outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            <div className="mt-4">
              <Link href="/dashboard" className="block w-full">
                <button
                  type="button"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex justify-center items-center"
                >
                  Login
                </button>
              </Link>
            </div>
          </form>

        </div>
      </main>

      {/* Sticky Footer */}
      <footer className="sticky bottom-0 w-full bg-black text-white py-4 px-6 md:px-12 flex justify-between items-center text-sm font-medium z-10 shadow-[0_-4px_15px_rgba(0,0,0,0.1)]">
        <div>Vardhan Enterprises</div>
        <div>
          Powered by <span className="font-bold tracking-wide">rigteq</span>
        </div>
      </footer>
    </div>
  );
}
