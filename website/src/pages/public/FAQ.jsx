import { useState } from "react";
import { Container, PageHeader } from "../../components/shared/Layout";
import { Accordion } from "../../components/shared/Input";
import { Button } from "../../components/shared/Button";
import { MessageCircle } from "lucide-react";
import { FAQS } from "../../data/faq";
import { CONFIG } from "../../config/config";

/** FAQ. A disclosure list, so the answer is in the DOM and findable by search. */
export function FAQ() {
  const [open, setOpen] = useState(() => FAQS[0]?.id ?? null);

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Questions"
        title="Frequently asked"
        description="If something is not answered here, the fastest route to a human is the email address in the footer."
      />

      <div className="cs-prose mt-8">
        {FAQS.map((faq) => (
          <Accordion
            key={faq.id}
            open={open === faq.id}
            onToggle={() => setOpen((current) => (current === faq.id ? null : faq.id))}
            question={faq.question}
          >
            {faq.answer}
          </Accordion>
        ))}
      </div>

      <div className="cs-card mt-10 flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-fg">Still stuck?</p>
          <p className="mt-1 text-sm text-fg-muted">
            Send us a message on WhatsApp, or write to us directly.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button href={CONFIG.WHATSAPP.joinLink} variant="primary" size="md">
            <MessageCircle size={14} aria-hidden="true" />
            WhatsApp
          </Button>
          <Button href={`mailto:${CONFIG.CONTACT_EMAIL}`} variant="secondary" size="md">
            Email
          </Button>
        </div>
      </div>
    </Container>
  );
}

export default FAQ;
