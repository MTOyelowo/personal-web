"use client";

import { FC, useState, useEffect, useRef } from "react";
import { FiSend } from "react-icons/fi";

const ContactForm: FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (showAlert) {
      timerRef.current = setTimeout(() => setShowAlert(false), 4000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showAlert]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAlert(true);
  };

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-space-grotesk">
            Get in Touch
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="contact-name"
                className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-space-grotesk"
              >
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 transition-all font-space-grotesk"
              />
            </div>
            <div>
              <label
                htmlFor="contact-email"
                className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-space-grotesk"
              >
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 transition-all font-space-grotesk"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-subject"
              className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-space-grotesk"
            >
              Subject
            </label>
            <input
              id="contact-subject"
              type="text"
              placeholder="What's this about?"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 transition-all font-space-grotesk"
            />
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-space-grotesk"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              placeholder="Write your message..."
              rows={6}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 transition-all resize-none font-space-grotesk"
            />
          </div>

          <div className="relative flex justify-end">
            {showAlert && (
              <div className="absolute bottom-full mb-3 right-0 px-4 py-3 rounded-lg bg-card border border-border shadow-lg">
                <p className="text-sm font-medium text-foreground font-space-grotesk">
                  Service currently unavailable
                </p>
                <p className="text-xs text-muted-foreground font-space-grotesk mt-1">
                  Please reach out via socials or email
                </p>
              </div>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors font-space-grotesk"
            >
              <FiSend className="w-4 h-4" />
              Send Message
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;
