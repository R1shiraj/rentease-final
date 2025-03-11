// src/app/about/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, Clock, Shield, Truck, Users } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image:
        "https://rashid-rentease-images.s3.ap-southeast-2.amazonaws.com/appliances/1741520193911-member-1.png",
      bio: "With over 15 years in retail and rental services, Sarah founded RentEase to make home appliances accessible to everyone.",
    },
    {
      name: "Michael Chen",
      role: "Operations Director",
      image:
        "https://rashid-rentease-images.s3.ap-southeast-2.amazonaws.com/appliances/1741520461422-member-2.jpg",
      bio: "Michael ensures our appliances are always in perfect condition and deliveries are made on time, every time.",
    },
    {
      name: "Priya Patel",
      role: "Customer Success Manager",
      image:
        "https://rashid-rentease-images.s3.ap-southeast-2.amazonaws.com/appliances/1741520483105-member-3.jpeg",
      bio: "Priya leads our support team to provide exceptional service throughout your rental experience.",
    },
  ];

  const valueProps = [
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Flexible Rental Periods",
      description:
        "Rent for a day, a month, or a year - whatever suits your needs.",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Quality Guaranteed",
      description:
        "All our appliances undergo rigorous testing and maintenance.",
    },
    {
      icon: <Truck className="h-8 w-8 text-primary" />,
      title: "Doorstep Delivery",
      description: "Free delivery and installation for all rental items.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "24/7 Support",
      description: "Our customer service team is always here to help.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 sm:px-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="space-y-12"
      >
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            About RentEase
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Making premium home appliances accessible to everyone through
            simple, affordable rentals with exceptional service.
          </p>
          <div className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden shadow-lg">
            <Image
              src="https://rashid-rentease-images.s3.ap-southeast-2.amazonaws.com/appliances/1741519640675-team.jpg"
              alt="Team at RentEase headquarters"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* Our Story */}
        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Our Story
            </h2>
            <p className="text-gray-600">
              Founded in 2020, RentEase was born from a simple observation: many
              people need quality home appliances but don't want the burden of
              ownership. Whether you're a student in temporary accommodation, a
              young professional in a transitional phase, or someone who prefers
              to access the latest technology without the long-term commitment -
              we've got you covered.
            </p>
            <p className="text-gray-600">
              What began as a small operation with just 50 appliances has grown
              into a comprehensive service with thousands of products available
              across multiple categories. Our mission remains the same: to
              provide hassle-free access to the appliances you need, when you
              need them.
            </p>
          </div>
          <div className="relative h-64 w-full rounded-xl overflow-hidden shadow-md">
            <Image
              src="https://rashid-rentease-images.s3.ap-southeast-2.amazonaws.com/appliances/1741519889098-story.jpg"
              alt="RentEase office"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* Value Props */}
        <section className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
            Why Choose RentEase
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {valueProps.map((prop, index) => (
              <Card
                key={index}
                className="border-none shadow-md hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="shrink-0 bg-blue-50 p-3 rounded-full">
                    {prop.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{prop.title}</h3>
                    <p className="text-gray-600">{prop.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Meet Our Team */}
        <section className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-50 rounded-xl p-8 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Ready to start renting?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse our wide selection of home appliances and find the perfect
            match for your needs.
          </p>
          <Link href="/user">
            <Button className="px-8 py-6 text-lg gap-2 mt-4">
              Explore Products <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </section>
      </motion.div>
    </div>
  );
};

export default AboutPage;
