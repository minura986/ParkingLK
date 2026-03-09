import React from 'react';

const TermsOfService = () => {
    return (
        <div className="bg-white min-h-screen text-gray-800 font-sans py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 pb-4 border-b">Terms of Service</h1>

                <div className="space-y-8 text-lg leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
                        <p className="text-gray-600">
                            These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and ParkingLK ("we," "us" or "our"), concerning your access to and use of our platform. You agree that by accessing the site, you have read, understood, and agreed to be bound by all of these Terms of Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accounts</h2>
                        <p className="text-gray-600 mb-4">
                            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.
                        </p>
                        <p className="text-gray-600">
                            You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Booking and Payments</h2>
                        <p className="text-gray-600 mb-4">
                            When you make a booking through ParkingLK, you agree to pay the stated fees for the parking slot duration.
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>All payments must be completed prior to the commencement of your booking unless "Pay on Arrival" is specifically authorized.</li>
                            <li>Early check-ins may be subject to additional charges dynamically calculated and added to your bill depending on arrival time.</li>
                            <li>Cancellations and refunds are handled as per the policies instituted by individual Car Park Owners on our platform.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Car Park Owners Responsibilities</h2>
                        <p className="text-gray-600">
                            If you use ParkingLK as a Car Park Owner, you agree to provide accurate and updated information regarding your facilities, pricing, EV charging capabilities, and physical exactness. You understand that ParkingLK acts purely as an intermediary, and physical safety/liabilities remain with the individual facility owners.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Governing Law</h2>
                        <p className="text-gray-600">
                            These Terms shall be governed and construed in accordance with the laws of Sri Lanka, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
