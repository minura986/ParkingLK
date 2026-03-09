import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 border-t border-gray-800 text-white mt-auto py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Branding Section */}
                <div className="col-span-1 md:col-span-2">
                    <Link to="/" className="text-2xl font-extrabold tracking-tight hover:text-blue-400 transition-colors flex items-center gap-2 mb-4">
                        <span className="text-blue-500 text-3xl leading-none">&bull;</span> ParkingLK
                    </Link>
                    <p className="text-gray-400 text-sm max-w-sm mb-6">
                        Bridging the gap between drivers needing a space and car park owners with available spots. Reliable, secure, and modern parking solutions.
                    </p>
                    {/* Social / Contact */}
                    <div className="flex flex-col gap-4">
                        <a href="https://wa.me/94770631923" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-green-500 transition-colors">
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.811.883 3.145.883 3.182 0 5.768-2.585 5.768-5.766 0-3.181-2.586-5.767-5.764-5.765zM8.523 14.621c-.244-.122-1.442-.712-1.666-.793-.223-.082-.385-.122-.547.122-.162.244-.632.793-.775.955-.143.162-.285.182-.53.061-.244-.122-1.028-.379-1.959-1.206-.724-.645-1.214-1.44-1.356-1.684-.143-.244-.015-.377.107-.498.11-.11.244-.285.366-.427.122-.143.162-.244.244-.407.082-.162.041-.305-.02-.427-.061-.122-.547-1.321-.75-1.808-.198-.475-.398-.411-.547-.419-.143-.008-.305-.008-.468-.008-.162 0-.427.061-.65.305-.224.244-.853.834-.853 2.034 0 1.2.874 2.361.996 2.524.122.162 1.722 2.628 4.171 3.682.581.25 1.034.401 1.388.513.583.185 1.114.159 1.534.097.472-.071 1.442-.589 1.646-1.159.203-.57.203-1.057.143-1.159-.06-.102-.224-.162-.468-.285z"></path><path d="M12.031 2C6.505 2 2.012 6.495 2.013 12.02c0 1.838.486 3.618 1.411 5.148L2 22l4.981-1.306A9.976 9.976 0 0012.03 22c5.526 0 10.019-4.495 10.02-10.02C22.049 6.495 17.556 2 12.031 2zm0 18.232c-1.503 0-2.975-.403-4.264-1.167l-.306-.182-3.172.831.844-3.092-.2-.319A8.17 8.17 0 013.886 12.02c0-4.52 3.676-8.195 8.145-8.195 4.469 0 8.145 3.675 8.145 8.195 0 4.52-3.676 8.196-8.145 8.196z"></path></svg>
                            <span className="text-sm font-semibold">Chat on WhatsApp</span>
                        </a>
                        <div className="flex gap-4">
                            {/* Facebook */}
                            <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors" aria-label="Facebook">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                            </a>
                            {/* TikTok */}
                            <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors" aria-label="TikTok">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.16-3.44-3.37-3.46-5.7-.02-1.29.25-2.58.83-3.75 1.04-2.16 3.11-3.66 5.42-3.9 1.4-.14 2.81-.05 4.18.28V14.1c-1.5-.32-3.1-.11-4.38.74-1.18.78-1.95 2.1-1.98 3.53-.02 1.2.49 2.37 1.35 3.16 1.01.99 2.5 1.25 3.86.8 1.52-.45 2.55-1.92 2.58-3.52.05-3.32.02-6.64.03-9.96.01-2.94.02-5.87.02-8.81z"></path></svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="col-span-1">
                    <h3 className="text-sm font-semibold tracking-wider uppercase mb-4 text-gray-300">Quick Links</h3>
                    <ul className="space-y-3">
                        <li>
                            <Link to="/" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">Find Parking</Link>
                        </li>
                        <li>
                            <Link to="/about" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">About Us</Link>
                        </li>
                        <li>
                            <Link to="/login" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">Login / Register</Link>
                        </li>
                    </ul>
                </div>

                {/* Legal Info */}
                <div className="col-span-1">
                    <h3 className="text-sm font-semibold tracking-wider uppercase mb-4 text-gray-300">Legal</h3>
                    <ul className="space-y-3">
                        <li>
                            <Link to="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
                        </li>
                        <li>
                            <Link to="/terms-of-service" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
                        </li>
                        <li>
                            <Link to="/cookie-policy" className="text-sm text-gray-400 hover:text-white transition-colors">Cookie Policy</Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} ParkingLK. All rights reserved.</p>
                <div className="mt-4 md:mt-0">
                    Built with <span className="text-blue-500">&hearts;</span> for hassle-free parking.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
