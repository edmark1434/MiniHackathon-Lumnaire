import { Link } from "react-router";
import {
  HiOutlineShoppingBag,
  HiOutlineCube,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineSearch,
  HiOutlineArrowRight,
} from "react-icons/hi";

export default function Home() {
  const features = [
    {
      icon: <HiOutlineCube className="w-7 h-7" />,
      title: "Product Management",
      desc: "Add, edit, and track all your store products with ease.",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: <HiOutlineCurrencyDollar className="w-7 h-7" />,
      title: "Debt Tracking",
      desc: "Keep records of customer debts and track payments.",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: <HiOutlineChartBar className="w-7 h-7" />,
      title: "Dashboard Analytics",
      desc: "View your store stats, low stock alerts, and debt summaries.",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: <HiOutlineSearch className="w-7 h-7" />,
      title: "Public Catalogue",
      desc: "Let customers browse and search your products online.",
      color: "from-yellow-500 to-orange-600",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-gray-950 to-teal-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              <HiOutlineShoppingBag className="w-4 h-4" />
              Built for Sari-Sari Store Owners
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
              Manage Your{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Sari-Sari Store
              </span>{" "}
              Smarter
            </h1>

            <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Track products, manage customer debts, and let your community
              browse your inventory — all in one simple, modern platform.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
              >
                Get Started
                <HiOutlineArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-gray-300 font-semibold border border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 transition-all"
              >
                Browse Stores
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Everything You Need</h2>
          <p className="mt-3 text-gray-400">Simple tools to run your sari-sari store efficiently.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-all hover:translate-y-[-2px]"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
              >
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/10 p-10 md:p-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to modernize your sari-sari store?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Join SariTrack today and start managing your inventory, tracking
            debts, and connecting with your community.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all"
          >
            Create Your Store
            <HiOutlineArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
