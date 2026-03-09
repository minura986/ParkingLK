import React from 'react';

const CookiePolicy = () => {
    return (
        <div className="bg-white min-h-screen text-gray-800 font-sans py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 pb-4 border-b">Cookie Policy</h1>

                <div className="space-y-8 text-lg leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
                        <p className="text-gray-600">
                            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Why Do We Use Cookies?</h2>
                        <p className="text-gray-600 mb-4">
                            We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. For instance:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li><strong>Essential Cookies:</strong> These cookies are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas (e.g., your Profile or Dashboard).</li>
                            <li><strong>Performance and Functionality Cookies:</strong> These are used to enhance the performance and functionality of our Website but are non-essential to their use. However, without these cookies, certain functionality (like videos or real-time map features) may become unavailable.</li>
                            <li><strong>Analytics and Customization Cookies:</strong> These cookies collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are, or to help us customize our Website for you.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Token Authentication</h2>
                        <p className="text-gray-600">
                            Instead of traditional session cookies, ParkingLK heavily relies on JWT (JSON Web Tokens) stored securely in your browser's local storage or HTTP-only cookies to verify your identity and authorize requests to our API. These are essential for the security of your account and the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How Can I Control Cookies?</h2>
                        <p className="text-gray-600">
                            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in your web browser controls. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicy;
