import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white border-b border-gray-200 pt-20 pb-32">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-80" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-12">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-blue-900 tracking-tight mb-6">
                        About ParkingLK
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 font-medium">
                        Revolutionizing the way you find and book parking spots across Sri Lanka with a seamless, smart, and digital approach.
                    </p>
                </div>
            </div>

            {/* Core Values / Features */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* For Drivers Card */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">For Drivers</h3>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            Find real-time parking availability, book slots in advance, and pay securely online. Enjoy premium features like EV charging spots and hassle-free early check-ins designed for your convenience.
                        </p>
                    </div>

                    {/* For Owners Card */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">For Owners</h3>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            Monetize your empty parking spaces effortlessly. Manage your car parks, monitor real-time occupancy, and track revenue seamlessly through our comprehensive, data-driven dashboard.
                        </p>
                    </div>
                </div>
            </div>

            {/* Story & Contact Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Story */}
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
                        <div className="w-20 h-1 bg-blue-600 mb-8 rounded-full"></div>
                        <p className="text-lg text-gray-700 leading-relaxed mb-6 font-medium">
                            ParkingLK started with a simple observation: urban areas in Sri Lanka were getting more crowded, and drivers were spending too much time searching for parking. We realized that while there were spaces available, they weren't always visible or accessible.
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mb-8">
                            By leveraging modern web technologies and real-time data, we built a platform that connects the right people to the right spaces at the right time. Today, we offer a robust system supporting EV integration, dynamic pricing, and secure digital payments.
                        </p>
                        <div className="flex gap-4">
                            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all hover:shadow-lg">
                                Join Now
                            </Link>
                            <Link to="/" className="bg-white hover:bg-gray-50 text-blue-700 font-semibold py-3 px-8 rounded-xl border border-blue-200 transition-all hover:shadow-sm">
                                Browse Sites
                            </Link>
                        </div>
                    </div>

                    {/* Contact Us Card */}
                    <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden">

                        <h2 className="text-3xl font-bold text-gray-900 mb-2 relative z-10">Get in Touch</h2>
                        <p className="text-gray-600 mb-8 relative z-10 text-lg">We're here to help. Reach out to us through any of our channels.</p>

                        <div className="space-y-6 relative z-10">
                            {/* WhatsApp */}
                            <a href="https://wa.me/94770631923" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group transition-all p-3 rounded-2xl hover:bg-green-50">
                                <div className="w-14 h-14 bg-green-100 group-hover:bg-[#25D366] rounded-2xl flex items-center justify-center text-green-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.811.883 3.145.883 3.182 0 5.768-2.585 5.768-5.766 0-3.181-2.586-5.767-5.764-5.765zM8.523 14.621c-.244-.122-1.442-.712-1.666-.793-.223-.082-.385-.122-.547.122-.162.244-.632.793-.775.955-.143.162-.285.182-.53.061-.244-.122-1.028-.379-1.959-1.206-.724-.645-1.214-1.44-1.356-1.684-.143-.244-.015-.377.107-.498.11-.11.244-.285.366-.427.122-.143.162-.244.244-.407.082-.162.041-.305-.02-.427-.061-.122-.547-1.321-.75-1.808-.198-.475-.398-.411-.547-.419-.143-.008-.305-.008-.468-.008-.162 0-.427.061-.65.305-.224.244-.853.834-.853 2.034 0 1.2.874 2.361.996 2.524.122.162 1.722 2.628 4.171 3.682.581.25 1.034.401 1.388.513.583.185 1.114.159 1.534.097.472-.071 1.442-.589 1.646-1.159.203-.57.203-1.057.143-1.159-.06-.102-.224-.162-.468-.285z"></path><path d="M12.031 2C6.505 2 2.012 6.495 2.013 12.02c0 1.838.486 3.618 1.411 5.148L2 22l4.981-1.306A9.976 9.976 0 0012.03 22c5.526 0 10.019-4.495 10.02-10.02C22.049 6.495 17.556 2 12.031 2zm0 18.232c-1.503 0-2.975-.403-4.264-1.167l-.306-.182-3.172.831.844-3.092-.2-.319A8.17 8.17 0 013.886 12.02c0-4.52 3.676-8.195 8.145-8.195 4.469 0 8.145 3.675 8.145 8.195 0 4.52-3.676 8.196-8.145 8.196z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 group-hover:text-green-700 transition-colors">Chat with us on</p>
                                    <p className="text-xl font-bold text-gray-900 group-hover:text-[#25D366] transition-colors">WhatsApp</p>
                                </div>
                            </a>

                            {/* Facebook */}
                            <a href="#" className="flex items-center gap-4 group transition-all p-3 rounded-2xl hover:bg-blue-50">
                                <div className="w-14 h-14 bg-blue-100 group-hover:bg-[#1877F2] rounded-2xl flex items-center justify-center text-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 group-hover:text-blue-700 transition-colors">Follow us on</p>
                                    <p className="text-xl font-bold text-gray-900 group-hover:text-[#1877F2] transition-colors">Facebook</p>
                                </div>
                            </a>

                            {/* TikTok */}
                            <a href="#" className="flex items-center gap-4 group transition-all p-3 rounded-2xl hover:bg-pink-50">
                                <div className="w-14 h-14 bg-pink-100 group-hover:bg-[#000000] rounded-2xl flex items-center justify-center text-pink-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.16-3.44-3.37-3.46-5.7-.02-1.29.25-2.58.83-3.75 1.04-2.16 3.11-3.66 5.42-3.9 1.4-.14 2.81-.05 4.18.28V14.1c-1.5-.32-3.1-.11-4.38.74-1.18.78-1.95 2.1-1.98 3.53-.02 1.2.49 2.37 1.35 3.16 1.01.99 2.5 1.25 3.86.8 1.52-.45 2.55-1.92 2.58-3.52.05-3.32.02-6.64.03-9.96.01-2.94.02-5.87.02-8.81z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 group-hover:text-pink-700 transition-colors">Follow us on</p>
                                    <p className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">TikTok</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
