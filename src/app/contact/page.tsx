import React from "react";

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
            <section className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
                <h1 className="text-3xl font-bold text-green-700 mb-2 text-center">Contact Us</h1>
                <p className="text-gray-600 mb-8 text-center">
                    Have questions or feedback? We&apos;d love to hear from you!
                </p>
                {/* Contact Info Section for Mobile */}
                <div className="md:hidden group mb-8">
                    <h3 className="font-semibold text-base mb-3 text-black dark:text-white">Contact</h3>
                    <div className="space-y-3 text-gray-600 dark:text-gray-300 text-sm">
                        <div className="space-y-2">
                            <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">📍 Shop 5/6/7, Akshay Colony, Vidya Nagar, Hubli, Karnataka 580021</p>
                            <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">📞 +91 91132 31424</p>
                            <p className="hover:text-purple-400 transition-colors duration-300 hover:translate-x-1 transform cursor-pointer">✉️ hello@sonnaspatisserie.com</p>
                        </div>
                        <div className="pt-2 space-y-1">
                            <p className="font-semibold text-black dark:text-white">Hours:</p>
                            <p className="hover:text-purple-400 transition-colors duration-300">Mon, Wed-Sat: 2:00 PM - 10:00 PM</p>
                            <p className="hover:text-purple-400 transition-colors duration-300">Sunday: 1:00 PM - 10:30 PM</p>
                            <p className="hover:text-purple-400 transition-colors duration-300">Tuesday: Closed</p>
                        </div>
                    </div>
                </div>
                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                            placeholder="Your Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="message">
                            Message
                        </label>
                        <textarea
                            id="message"
                            required
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                            placeholder="How can we help you?"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                        Send Message
                    </button>
                </form>
                <div className="mt-8 text-center text-gray-500 text-sm">
                    Or email us at <a href="mailto:support@foodorder.com" className="text-green-700 underline">support@foodorder.com</a>
                </div>
            </section>
        </main>
    );
}