import type { Metadata } from "next";
import { ContactHero } from "./_components/contact-hero";
import { ContactInfo } from "./_components/contact-info";
import { ContactForm } from "./_components/contact-form";
import { ContactMap } from "./_components/contact-map";

export const metadata: Metadata = {
  title: "Contact Us | FDM",
  description:
    "Connect with us to share prayer requests, seek guidance, or learn how to serve in our community of faith.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <ContactHero />
      
      <section className="px-5 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:items-start">
          <ContactInfo />
          <ContactForm />
        </div>
      </section>

      <ContactMap />
    </main>
  );
}
