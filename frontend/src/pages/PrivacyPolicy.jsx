import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="bg-white min-h-screen text-gray-800 font-sans py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 pb-4 border-b">Privacy Policy</h1>

                <div className="space-y-8 text-lg leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                        <p className="text-gray-600">
                            Welcome to ParkingLK. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. The Data We Collect About You</h2>
                        <p className="text-gray-600 mb-4">
                            Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store, and transfer different kinds of personal data about you which we have grouped together as follows:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data</strong> includes billing address, email address and telephone numbers.</li>
                            <li><strong>Financial Data</strong> includes payment card details (processed securely by our third-party payment gateways).</li>
                            <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of parking services you have purchased from us.</li>
                            <li><strong>Profile Data</strong> includes your username and password, vehicle license plate numbers, bookings made by you, your interests, preferences, feedback and survey responses.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Personal Data</h2>
                        <p className="text-gray-600 mb-4">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., booking a parking slot).</li>
                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                            <li>Where we need to comply with a legal obligation.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                        <p className="text-gray-600">
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contact Us</h2>
                        <p className="text-gray-600">
                            If you have any questions about this privacy policy or our privacy practices, please contact us at via WhatsApp or Phone at <span className="font-semibold">0770631923</span>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
