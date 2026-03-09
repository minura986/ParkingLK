Current System Problem Identification
The current parking ecosystem suffers from critical inefficiencies that affect both drivers and facility operators. These challenges highlight the need for a modern, centralized solution.

Current Problems for Drivers
•	Wasted Time and Fuel: Drivers circle aimlessly searching for spots, burning fuel and losing valuable time.
•	Lack of Real-Time Information: There is no reliable way to know a parking facility's availability before driving there.
•	Payment Inconvenience: Reliance on cash-only machines or outdated ticket systems creates friction and delays.
•	Increased Traffic and Pollution: The "hunt" for parking spots is a direct contributor to urban traffic congestion and associated vehicle emissions.
•	Driver Frustration: The entire process is stressful, unpredictable, and inefficient, leading to a poor urban experience.

Current Problems for Parking Operators
•	Inefficient Space Utilization: Operators lack the data to optimize their inventory, leading to empty, non-revenue-generating spots.
•	Lack of Dynamic Pricing: A static pricing model misses the opportunity to maximize revenue during peak demand or incentivize parking during off-peak hours.
•	Manual Management: Many processes for tracking occupancy and revenue are manual, leading to data errors and high labor costs.
•	Limited Customer Data: Operators have no mechanism to understand user behavior, identify repeat customers, or offer loyalty-based incentives.


Proposed Technique to Solve the Current Problem
ParkingLK will address these issues by creating a centralized, data-driven platform that provides real-time information and functionality to all stakeholders. (Pham, 2017)

Proposed Techniques for Drivers (ROLE_USER)

1.	Interactive Real-Time Map:
•	 Provide a web interface where users can view available parking spots on a map in real-time.
2.	Advance Booking System: 
•	Allow users to book a specific spot for a set duration (e.g., 10:00 AM to 2:00 PM).
3.	Secure Online Payment: 
•	Integrate a payment gateway like PayHere to allow for cashless, pre-payment for bookings.
4.	QR Code Access & IoT Integration:
•	Generates a unique QR code for check-in and check-out validation. This will be scanned via a mobile app by operators or integrated directly with physical IoT-enabled boom barriers or kiosk scanners.
5.	Advanced Filtering: 
•	Enable users to filter spots by criteria such as proximity to elevators, availability of EV charging, or covered parking.
6.	Notifications Infrastructure:
•	Alerts for booking reminders, expiry, and payment confirmations via email (e.g., Nodemailer/SendGrid) and SMS/Push notifications (e.g., Twilio/Firebase).


Proposed Techniques for Administrators (ROLE_SUPER_ADMIN / ROLE_OWNER)

1.	Centralized and Tiered Admin Dashboards: 
•	Develop a comprehensive dashboard system separating Super Admins (platform-wide visibility, system settings) from Facility Owners (managing their specific car park's occupancy and revenue).
2.	Dynamic Pricing Engine: 
•	Implement a system where administrators can adjust parking rates based on demand, (Xu, 2019) time of day, or special events to optimize revenue.
3.	User and Booking Management: 
•	Provide tools to manage user accounts, view booking histories, and handle customer service issues.
4.	Analytics and Reporting: 
•	Generate (Springer, 2020) to enable data-driven decision-making.

Feasibility Study
A feasibility study for the ParkingLK Platform, The system will be built on a RESTful API architecture using Node.js and Express.js, ensuring scalability and a clear separation of concerns. A React frontend will consume these APIs to provide a responsive and interactive user experience. Optimized WebSockets (Geofenced Rooms) will be implemented to push real-time availability updates to all connected clients (drivers and admins), ensuring the data is always current without requiring manual user intervention and without overwhelming server bandwidth.

1.	Technical Feasibility
The chosen technology stack (Node.js, Express.js, React, MongoDB) is mature, widely adopted, and well-documented. The development team possesses the necessary skills in these technologies. All required software tools (Node v18+, MongoDB Community Server) are open-source and readily available, minimizing software costs.
2.	Operational Feasibility
The platform will work on any modern web browser or smartphone, ensuring accessibility. Parking operators will be trained to use the admin dashboard and QR code validation system. The system reduces manual work and improves customer satisfaction. An offline fallback mode for scanner devices will be integrated to prevent users from being trapped during temporary internet outages.
3.	Economic (Financial) Feasibility
The project has low software costs, relying mainly on open-source frameworks. Cloud hosting can begin on a free-tier basis (AWS or Vercel). Monetization options include:
•	Subscription fees for parking operators
•	Small convenience fee per booking
•	Revenue share model with partner facilities
4.	Legal Feasibility
The system must comply with data privacy laws (Parliament, 2022)(such as GDPR or local equivalents) regarding the collection and storage of user data (names, email, license plates, payment info). Integrating a third-party payment gateway like PayHere (PayHere.lk, 2025) will help offload much of the PCI-DSS (Payment Card Industry Data Security Standard) compliance burden. A clear "Terms of Service" and "Privacy Policy" will be required.
5.	Time Feasibility
The project is planned for a 16-week development cycle, as detailed in the "Time Plan" section. This timeline is aggressive but achievable by breaking the project into distinct phases (planning, backend, frontend, integration, testing, deployment) and managing scope effectively.


Project Description
Urban areas in Sri Lanka face growing challenges in managing vehicle parking efficiently due to the rising number of private and commercial vehicles. Traditional parking management systems remain largely manual, relying on paper tickets, cash transactions, and human attendants. This inefficiency often leads to congestion, wasted time, fuel consumption, and driver frustration, particularly in busy cities such as Colombo, Kandy, and Galle. Drivers spend an excessive amount of time searching for available parking spaces, which contributes to traffic congestion and environmental pollution. (Barth, 2008) Furthermore, the absence of digital payment options, real-time space availability data, and centralized parking management tools prevents both drivers and facility operators from optimizing parking utilization.
Parking operators also face operational difficulties due to the lack of automated systems to monitor occupancy, manage reservations, and generate revenue analytics. Many rely on traditional methods such as manual logbooks or static pricing, resulting in financial inefficiency and limited capacity to expand operations. Additionally, Sri Lanka currently lacks a nationally integrated smart parking solution, preventing data-driven urban planning and effective resource management.
The ParkingLK system is designed to address these challenges by introducing an intelligent, web-based solution that integrates modern digital technologies with real-time data analytics. Developed using React for a user-friendly, responsive interface (Reactjs.org, 2025) and Node.js with Express for a secure and scalable backend, (Express.js, 2025) the platform delivers a seamless, automated experience for both drivers and parking administrators. The proposed solution contributes to urban mobility improvement, environmental sustainability, and technological modernization in Sri Lanka’s transportation sector.


1.	Real-Time Parking Availability and Booking
ParkingLK allows drivers to view, reserve, and pay for parking spaces in real time through an interactive map interface. The system displays up-to-date occupancy data, enabling drivers to quickly identify available spaces near their destination and make a booking instantly. Users can filter parking options by location, price, vehicle type, or facility amenities (e.g., EV charging, security cameras, or covered parking). The real-time data feed ensures efficient space utilization and reduces unnecessary traffic caused by drivers searching for spots.
2.	Administrative Dashboard and Management Tools
For parking facility operators, ParkingLK offers an intuitive administrative dashboard to monitor live occupancy, manage reservations, and update pricing dynamically. The dashboard provides comprehensive analytics, including daily occupancy trends, revenue reports, and user behavior insights. Operators can also configure parking zones, define rates based on time or demand, and generate automated invoices. This replaces manual recordkeeping with an intelligent, data-driven management system that enhances transparency and operational efficiency.
3.	Secure Online Payment and QR-Based Entry/Exit
ParkingLK integrates secure online payment gateways such as PayHere and Stripe, supporting multiple payment methods including credit/debit cards and mobile wallets. Once a reservation is confirmed, the system automatically generates a QR code for the user. This code acts as a digital ticket that can be scanned at entry and exit points using a smartphone or kiosk system. The use of QR technology ensures a contactless, efficient parking experience and eliminates dependency on printed tickets or cash transactions.



4.	Multilingual User Interface and Accessibility
Recognizing Sri Lanka’s linguistic diversity, ParkingLK supports a multilingual interface in Sinhala, Tamil, and English. This inclusivity promotes accessibility among users from different regions and demographics. The system is designed with responsive web design principles, ensuring compatibility across smartphones, tablets, and desktop devices. Lightweight frontend architecture ensures smooth performance even in areas with low or unstable internet connectivity. A Content Delivery Network (CDN) like AWS CloudFront or Cloudflare will be used to cache frontend assets and images at edge locations for lightning-fast loading across Sri Lanka.
5.	Data Analytics and Dynamic Pricing
The platform incorporates a data-driven analytics module that collects and visualizes operational insights such as parking utilization rates, peak demand hours, and payment trends. This module helps operators implement dynamic pricing strategies, adjusting rates based on demand fluctuations, special events, or time of day. Such a system maximizes revenue potential while balancing affordability for users. Additionally, aggregated data can be shared with municipal authorities to aid in urban traffic management and city planning.
6.	Deliverables of the ParkingLK System
The ParkingLK project will deliver a fully functional, research-based prototype that provides practical solutions to Sri Lanka’s urban parking challenges. Its main deliverables include:
•	A working web-based platform allowing real-time parking reservations, payments, and management.
•	Source code repositories for both frontend (React) and backend (Node.js/Express) applications.
•	System documentation including API specifications, database schema, and deployment guides.
•	User guides and video tutorials to assist both drivers and parking operators in using the system.
•	A comprehensive impact assessment report evaluating reductions in congestion time, improved occupancy rates, and user adoption levels.

Booking, Cancellation, Overstay, and No-Show Policies

Defining clear business rules for handling exceptions is critical to the system's success and fairness.

Customer Cancellations and Refund Policy
The system must allow users to cancel a confirmed booking, governed by a fair refund policy.
•	Policy:
1.	Full Refund (100%): Users can cancel up to 1 hour before their booking's start time.
2.	Partial Refund (50%): Users who cancel within 1 hour of the start time (but before it begins) receive a partial refund.
3.	No Refund (0%): If the booking's start time has already passed, it cannot be cancelled, and no refund is issued.
•	Justification: This tiered policy respects the user's need for flexibility while protecting the operator's revenue. A last-minute cancellation makes it difficult for the operator to re-sell the spot, justifying the partial fee.

Customer No-Show Policy
A "no-show" (a user who books but never arrives) wastes a spot and costs the operator revenue.
•	Policy:
1.	A "holding period" of 30 minutes will be granted. The spot is held for the user from their booking's start time until 30 minutes after.
2.	If the user does not check-in (scan their QR code) within this 30-minute window, the booking is automatically marked STATUS_CANCELLED_NOSHOW.
3.	No refund is issued.
•	Justification: This balances fairness (allowing for a user stuck in traffic) with the operator's commercial need to re-list the spot.

Customer Late Arrival Policy
This policy is a direct consequence of the no-show rule.
•	Policy:
1.	If a customer arrives within the 30-minute holding period, their QR code scans successfully.
2.	If they arrive after the 30-minute holding period, their booking will have been cancelled (see No-Show Policy). The spot may have already been re-booked. Their QR code scan will fail. They will have to make a new booking (if spots are available) at the current rate.

Booking Modifications (Extensions) and Overstay Policy
Users may wish to extend their stay or may fail to exit on time.
•	Policy:
1.	A user with an STATUS_ACTIVE booking can request an extension.
2.	The extension is only granted if the spot does not have another booking immediately following it (i.e., no booking collision).
3.	If approved, the user is charged for the additional time at the current rate, and their booking.endTime is updated.
4.	Overstay Management: If a user fails to exit by their booking endTime without an extension, an automatic penalty fee applies to their card on file or must be paid at the exit gate (via app or kiosk) before the exit QR code authorizes the boom barrier to open.


Deliverables
•	A Fully Functional and Deployed Web Application: 
This is the primary deliverable. A production-ready, deployed application (on a cloud provider like AWS) accessible via a public URL, demonstrating all features described (booking, payment, admin dashboard).
•	Complete Source Code: 
The full, commented source code for the React frontend and the Node.js backend, managed in a Git repository (e.g., GitHub), including a README.md file with setup and build instructions.
•	Final Project Report and Presentation: 
This document, in its final form, detailing the entire project lifecycle, from design to evaluation. A slide deck for final presentation will also be created.
•	User Manuals: Two distinct guides:
1.	User Guide: A simple, visual guide (PDF) for end-users, explaining how to register, book, and pay.
2.	Admin Guide: A detailed manual for parking operators, explaining how to use the dashboard, manage pricing, and handle bookings.


Required Resources 
To successfully transition the ParkingLK concept from a proposal to a tangible, deployed application, a specific set of resources is required. These resources are not limited to just hardware or funding but encompass the entire ecosystem of software, foundational data, and the skilled personnel needed to build and manage the project. This section provides a detailed breakdown of the required resources, categorized into three critical domains: Software and Tools, Data Resources, and Human Resources.

System Efficiency & Architecture Enhancements
To ensure high performance and scalability in the architecture, the following techniques will be implemented:
•	Geospatial Indexing in MongoDB: Using MongoDB `2dsphere` indexes to instantly calculate distances and optimize nearby car park queries instead of scanning all records.
•	Caching Layer: Integrating Redis to cache real-time occupancy counts and active pricing, reducing database load for frequently accessed data.
•	Optimized WebSockets (Socket.io Rooms): WebSockets will use geofenced rooms so users only receive updates pertinent to their viewed area, significantly saving bandwidth.
•	Background Task Queues: BullMQ or RabbitMQ will offload heavy tasks (QR code generation, notification dispatching, payment confirmation emails) to background worker processes so APIs respond rapidly.

1.	Software and Tools
	Development Framework
o	React: Used for developing the user-friendly, responsive frontend interface that supports key user features such as parking search, booking, payment processing, and live map visualization.
o	Node.js & Express.js: Serves as the high-performance backend framework, enabling the creation of fast, scalable RESTful APIs to handle user authentication, bookings, payments, and real-time operations.

	Database & Caching
o	MongoDB: Acts as the primary database for storing structured and semi-structured data, including user profiles, facility details, booking records, and transaction logs. Geospatial support (`2dsphere`) handles real-time map features seamlessly.
o	Redis: In-memory data store for caching layout and occupancy states.

	Cloud Hosting:
o	AWS (Amazon Web Services): Provides scalable and secure cloud infrastructure. ((AWS), 2025)
o	EC2 / Elastic Beanstalk: For server deployment and backend execution.
o	S3 + CloudFront: For storing static content (facility images, QR codes) and caching frontend assets globally via CDN.
o	MongoDB Atlas / RDS: For managed database hosting with automatic backups and global distribution.

	Payment Gateway & Notifications:
o	PayHere: Integration with a trusted online payment gateway enables secure, cashless transactions for parking reservations and refunds in LKR.
o	Nodemailer/SendGrid & Twilio: To manage responsive email and SMS notifications through message queues.

	Development Environments:
o	Visual Studio Code: For coding and debugging React and Node.js applications.

	Security Tools
o	Authentication Middleware: Implements secure JWT-based authentication (e.g., standard Passport.js/JWT implementations) enforcing distinct access controls (ROLE_USER, ROLE_SUPER_ADMIN, ROLE_OWNER).
o	SSL Certificates: Enable HTTPS communication for all client-server interactions, protecting sensitive information.

	Testing Tools:
o	Postman: For testing REST APIs developed with Node.js/Express.

2.	Data Resources
•	Parking Facility Dataset: A foundational dataset containing detailed information about each parking facility, including:
o	Facility ID, name, and address
o	GPS coordinates and map boundaries (for geospatial queries)
o	Total capacity and space allocation
o	Amenities (e.g., EV charging, disabled access, CCTV coverage)
This data is necessary for populating the system’s real-time availability map and supporting search and filtering functions.

•	User and Transaction Data
An evolving dataset automatically generated as the system operates. It includes user registration details, booking history, transaction records, and feedback scores. This dataset supports analytics for user behaviour, facility performance, and dynamic pricing optimization.

•	Pricing and Policy Configuration Data
Administrators maintain datasets defining base rates, dynamic pricing rules, and policies such as cancellation timelines, refund percentages, no-show conditions, and overstay parameters. 

•	Geospatial and Traffic Data
Integration with Google Maps API or OpenStreetMap provides real-time location mapping and routing capabilities.

•	Analytical and Log Data
System logs and analytics datasets store telemetry data (e.g., API response times, booking latency, and error rates). These records are crucial for evaluating system performance, debugging, and refining algorithms.


Expected output and outcome
The success of the ParkingLK project will be evaluated using two complementary dimensions: Outputs and Outcomes.
Outputs represent the tangible, verifiable deliverables that will be produced by the conclusion of the development cycle, while Outcomes represent the measurable, real-world impact and improvements in user experience, efficiency, and environmental sustainability that the project aims to achieve. This section outlines both categories, defining what will be developed and the difference it will make.

Expected Outputs
•	Functional Web Platform:
A complete, user-friendly, mobile-responsive web platform developed using React and Node.js, hosted on AWS, featuring:
o	A real-time parking availability system that allows drivers to view, reserve, and pay for parking spaces online.
o	An administrative dashboard with tiered access for platform owners and facility operators.
o	A dynamic pricing engine enabling operators to adjust rates based on time, demand, and special events.
o	A secure online payment system for cashless transactions.
o	A QR code–based entry and exit validation system for seamless check-in and checkout operations.
o	Multilingual interface support (Sinhala, Tamil, and English) to enhance accessibility for Sri Lankan users.

•	Software Artifacts:
Comprehensive software components and documentation, including:
o	Source code repositories (frontend and backend) maintained on GitHub.
o	Database schema definitions for MongoDB.
o	Configuration and deployment scripts for AWS.
•	User Support Materials:
A collection of end-user learning and support content, including:
o	Illustrated user manuals (PDF format) in Sinhala, Tamil, and English.
o	Video tutorials demonstrating how to create accounts, reserve parking spaces, and use QR codes.
•	Testing and Evaluation Results:
A detailed report summarizing the outcomes of beta testing with a minimum of 50 users and 5 parking operators, evaluating functional accuracy, system performance, and responsiveness.
•	Impact Analysis Report:
A final analytical document presenting statistical and qualitative data on:
o	Reduction in average parking search time and fuel consumption.
o	Improved occupancy rates and revenue for operators.
o	User adoption rate across different demographics.
o	System performance and reliability metrics post-deployment.

Expected Outcomes
•	Reduced Parking Search Time and Congestion:
By providing real-time availability data, ParkingLK will minimize the time drivers spend searching for parking spaces, reducing traffic congestion and fuel waste in urban areas.
•	Improved Operational Efficiency for Operators:
Parking facility owners will benefit from automated booking, digital payments, and analytics dashboards, enabling better space utilization, revenue tracking, and decision-making.
•	Enhanced User Convenience and Trust:
Drivers will gain access to a predictable, stress-free parking experience, with secure transactions, QR-based access, and transparent refund policies.
•	Increased Economic Viability:
The system’s dynamic pricing model and digital automation will generate additional revenue streams for parking operators and contribute to the growth of Sri Lanka’s emerging smart mobility market.
•	Environmental Sustainability:
Reduced vehicle idling and shorter cruising distances will lead to measurable declines in CO₂ emissions and noise pollution.
•	Encouragement of Smart City Innovation:
The successful deployment of ParkingLK will demonstrate the feasibility of cost-effective, software-driven smart infrastructure in Sri Lanka.
