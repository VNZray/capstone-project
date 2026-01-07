import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Plus, Minus, HelpCircle, MessageCircle, Mail } from "lucide-react";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import PageContainer from "@/src/components/PageContainer";
import FooterSection from "@/src/features/landing-page/components/FooterSection";
import { colors } from "@/src/utils/Colors";

// Gold accent from Tourist Landing Page
const GOLD_ACCENT = "#C5A059";
const GOLD_SECONDARY = "#FFD700";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        style={{
          background: isOpen
            ? "linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%)"
            : "#ffffff",
          borderRadius: 16,
          border: isOpen
            ? `1px solid ${GOLD_ACCENT}30`
            : "1px solid rgba(0, 0, 0, 0.06)",
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: isOpen
            ? `0 8px 32px ${GOLD_ACCENT}15`
            : "0 2px 8px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Question Header */}
        <button
          onClick={onToggle}
          style={{
            width: "100%",
            padding: "24px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span
            style={{
              fontSize: "clamp(1rem, 1.5vw, 1.125rem)",
              fontWeight: 600,
              color: colors.primary,
              lineHeight: 1.5,
              flex: 1,
            }}
          >
            {question}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: isOpen ? GOLD_ACCENT : `${GOLD_ACCENT}12`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background-color 0.3s ease",
            }}
          >
            {isOpen ? (
              <Minus size={18} color="#ffffff" />
            ) : (
              <Plus size={18} color={GOLD_ACCENT} />
            )}
          </motion.div>
        </button>

        {/* Answer Content */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  padding: "0 28px 24px 28px",
                  borderTop: `1px solid ${GOLD_ACCENT}15`,
                  paddingTop: 20,
                }}
              >
                <p
                  style={{
                    fontSize: "clamp(0.9375rem, 1.25vw, 1rem)",
                    lineHeight: 1.8,
                    color: colors.gray,
                    margin: 0,
                  }}
                >
                  {answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function FAQ() {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const faqCategories: FAQCategory[] = [
    {
      title: "General Questions",
      icon: <HelpCircle size={24} color={GOLD_ACCENT} />,
      items: [
        {
          question: "What is City Venture?",
          answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        },
        {
          question: "How do I get started with City Venture?",
          answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
        },
        {
          question: "Is City Venture free to use?",
          answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
        },
        {
          question: "What cities are currently supported?",
          answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        },
      ],
    },
    {
      title: "For Tourists",
      icon: <MessageCircle size={24} color={GOLD_ACCENT} />,
      items: [
        {
          question: "How do I book a tour or experience?",
          answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
        },
        {
          question: "Can I cancel or modify my booking?",
          answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        },
        {
          question: "How do payments work?",
          answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        },
        {
          question: "Is my payment information secure?",
          answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        },
      ],
    },
    {
      title: "For Businesses",
      icon: <Mail size={24} color={GOLD_ACCENT} />,
      items: [
        {
          question: "How can I list my business on City Venture?",
          answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
        },
        {
          question: "What are the fees for businesses?",
          answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        },
        {
          question: "How do I manage my listings?",
          answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        },
        {
          question: "How do I receive payments from customers?",
          answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        },
      ],
    },
  ];

  return (
    <PageContainer gap={0} padding={0} style={{ background: "#fafbfc" }}>
      {/* Floating Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "fixed",
          top: 24,
          left: 24,
          zIndex: 100,
        }}
      >
        <Button
          variant="soft"
          startDecorator={<ArrowLeft size={18} />}
          onClick={() => navigate("/")}
          sx={{
            borderRadius: 16,
            padding: "12px 24px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
            color: colors.primary,
            fontWeight: 600,
            "&:hover": {
              backgroundColor: colors.white,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            },
          }}
        >
          Back
        </Button>
      </motion.div>

      {/* Hero Section */}
      <section
        style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px 60px",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, #ffffff 0%, #f8f9fb 100%)",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "5%",
            right: "15%",
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.tertiary}40 0%, transparent 70%)`,
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "10%",
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.secondary}15 0%, transparent 70%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <Container
          direction="column"
          align="center"
          gap="24px"
          padding="0"
          style={{ maxWidth: 700, textAlign: "center", position: "relative", zIndex: 1 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 20px",
                borderRadius: 100,
                backgroundColor: `${GOLD_ACCENT}15`,
                color: GOLD_ACCENT,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 24,
              }}
            >
              Help Center
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Typography.Title
              size="lg"
              color="primary"
              weight="bold"
              sx={{ lineHeight: 1.1, marginBottom: "20px" }}
            >
              Frequently Asked{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Questions
              </span>
            </Typography.Title>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Typography.Body
              size="md"
              sx={{
                lineHeight: 1.8,
                color: colors.gray,
                maxWidth: 520,
                margin: "0 auto",
              }}
            >
              Find answers to common questions about City Venture. Can't find what you're
              looking for? Feel free to contact our support team.
            </Typography.Body>
          </motion.div>
        </Container>
      </section>

      {/* FAQ Sections with Sticky CTA */}
      <section
        style={{
          padding: "60px 24px 100px",
          background: "#fafbfc",
        }}
      >
        <style>
          {`
            .faq-grid {
              max-width: 1200px;
              margin: 0 auto;
              display: grid;
              grid-template-columns: 300px 1fr;
              gap: 48px;
            }
            .faq-sticky-cta {
              position: relative;
            }
            @media (max-width: 900px) {
              .faq-grid {
                grid-template-columns: 1fr;
              }
              .faq-sticky-cta {
                order: 2;
              }
              .faq-sticky-cta > div {
                position: relative !important;
                top: 0 !important;
              }
            }
          `}
        </style>
        <div className="faq-grid">
          {/* Left Column - Sticky CTA */}
          <div className="faq-sticky-cta">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "sticky",
                top: 100,
              }}
            >
              <Container
                direction="column"
                align="flex-start"
                gap="20px"
                padding="32px"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  borderRadius: 24,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)",
                    pointerEvents: "none",
                  }}
                />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <Typography.Header
                    size="sm"
                    weight="bold"
                    sx={{ color: "#ffffff", marginBottom: "8px" }}
                  >
                    Still have questions?
                  </Typography.Header>
                  <Typography.Body
                    size="sm"
                    sx={{ color: "rgba(255, 255, 255, 0.85)", marginBottom: "20px" }}
                  >
                    Our support team is here to help you with anything you need.
                  </Typography.Body>
                  <Button
                    variant="solid"
                    size="md"
                    startDecorator={<Mail size={16} />}
                    sx={{
                      backgroundColor: "#ffffff",
                      color: colors.primary,
                      borderRadius: 12,
                      fontWeight: 600,
                      padding: "12px 24px",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                      },
                    }}
                  >
                    Contact Support
                  </Button>
                </div>
              </Container>
            </motion.div>
          </div>

          {/* Right Column - FAQ Accordions */}
          <Container
            direction="column"
            gap="64px"
            padding="0"
          >
            {faqCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: categoryIndex * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {/* Category Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 24,
                  }}
                >
                  <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${GOLD_ACCENT}15 0%, ${GOLD_ACCENT}08 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {category.icon}
                </div>
                <Typography.Header size="sm" color="primary" weight="bold">
                  {category.title}
                </Typography.Header>
              </div>

              {/* FAQ Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {category.items.map((item, itemIndex) => {
                  const itemId = `${categoryIndex}-${itemIndex}`;
                  return (
                    <AccordionItem
                      key={itemId}
                      question={item.question}
                      answer={item.answer}
                      isOpen={openItems.has(itemId)}
                      onToggle={() => toggleItem(itemId)}
                      index={itemIndex}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}
          </Container>
        </div>
      </section>

      {/* Footer */}
      <FooterSection />
    </PageContainer>
  );
}
