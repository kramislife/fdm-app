"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/shared/form-fields";
import { inquiryTypes, socialLinks, formContent } from "@/config/contact";
import { Reveal } from "@/components/shared/animations/reveal";

const FIELD_LABEL_STYLE =
  "text-xs font-bold tracking-wider uppercase text-muted-foreground";

export function ContactForm() {
  return (
    <Reveal direction="right" className="lg:sticky lg:top-20 h-fit">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-bold md:text-3xl">
              {formContent.title}
            </CardTitle>
            <CardDescription className="text-xs text-left">
              {formContent.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-3">
            <form className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-2">
                <FormInput
                  label="Full Name"
                  id="full-name"
                  name="full-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  className="h-12"
                  wrapperClassName="md:col-span-2 text-left"
                  labelClassName={FIELD_LABEL_STYLE}
                  required
                />

                <FormSelect
                  label="Inquiry Type"
                  id="inquiry-type"
                  onValueChange={() => {}}
                  value=""
                  placeholder="Select inquiry type"
                  options={inquiryTypes.map(({ label, value }) => ({
                    label,
                    value,
                  }))}
                  className="h-12"
                  labelClassName={FIELD_LABEL_STYLE}
                  required
                />
              </div>

              <FormInput
                label="Email Address"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@gmail.com"
                className="h-12"
                wrapperClassName="text-left"
                labelClassName={FIELD_LABEL_STYLE}
                required
              />

              <FormTextarea
                label="Message"
                id="message"
                name="message"
                placeholder="Write your message here..."
                wrapperClassName="text-left"
                labelClassName={FIELD_LABEL_STYLE}
                required
              />

              <Button type="submit" className="h-12">
                {formContent.submitLabel}
              </Button>
            </form>

            <div className="flex items-center justify-center gap-5 mt-5">
              {socialLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-primary transition-transform hover:scale-110 cursor-pointer"
                >
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </Reveal>
  );
}
