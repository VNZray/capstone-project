import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { MapPin, Ticket, ArrowRight } from "lucide-react";
import Button from "@/src/components/Button";
import {
  eventsContainerVariants,
  eventRowVariants,
  dateBadgeVariants,
  sectionHeaderVariants,
  viewportSettings,
  EASE,
  arrowBounceAnimation,
  arrowBounceTransition,
} from "../utils/animationVariants";

interface EventDate {
  month: string;
  day: string;
}

interface EventRowProps {
  date: EventDate;
  title: string;
  location: string;
  category: string;
  image: string;
  setHoveredEvent: (image: string) => void;
  index: number;
}

const EventRow: React.FC<EventRowProps> = ({
  date,
  title,
  location,
  category,
  image,
  setHoveredEvent,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={eventRowVariants}
      onMouseEnter={() => {
        setHoveredEvent(image);
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={shouldReduceMotion ? undefined : { 
        x: 8,
        backgroundColor: "rgba(255,255,255,0.05)",
      }}
      transition={{ duration: 0.25, ease: EASE.snappy }}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "40px 32px",
        borderBottom: "1px solid rgba(75, 85, 99, 0.5)",
        cursor: "pointer",
        willChange: "transform, background-color",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "24px",
        }}
      >
        {/* Left Side: Date + Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            flex: 1,
            minWidth: "300px",
          }}
        >
          {/* Date Badge with spring animation */}
          <motion.div
            variants={dateBadgeVariants}
            whileHover={{ scale: 1.1, rotate: 3 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            style={{
              textAlign: "center",
              width: "64px",
              flexShrink: 0,
            }}
          >
            <motion.span
              animate={{ 
                color: isHovered ? "#FFD700" : "#C5A059",
              }}
              transition={{ duration: 0.2 }}
              style={{
                display: "block",
                fontWeight: 700,
                fontSize: "0.875rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              {date.month}
            </motion.span>
            <motion.span
              animate={{ 
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
              style={{
                display: "block",
                fontSize: "1.875rem",
                fontWeight: 900,
                color: "white",
              }}
            >
              {date.day}
            </motion.span>
          </motion.div>

          {/* Title & Location */}
          <div>
            <motion.h3
              animate={{ 
                color: isHovered ? "#C5A059" : "white",
              }}
              transition={{ duration: 0.2 }}
              style={{
                fontSize: "clamp(1.5rem, 3vw, 1.875rem)",
                fontWeight: 700,
                margin: 0,
              }}
            >
              {title}
            </motion.h3>
            <motion.div
              animate={{ 
                x: isHovered ? 4 : 0,
              }}
              transition={{ duration: 0.2 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#9ca3af",
                marginTop: "8px",
                fontSize: "0.875rem",
              }}
            >
              <MapPin size={14} /> {location}
            </motion.div>
          </div>
        </div>

        {/* Right Side: Category + Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <motion.span
            animate={{
              borderColor: isHovered ? "#C5A059" : "rgba(75,85,99,0.6)",
              color: isHovered ? "#C5A059" : "#d1d5db",
            }}
            transition={{ duration: 0.2 }}
            style={{
              padding: "4px 16px",
              borderRadius: "9999px",
              border: "1px solid",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {category}
          </motion.span>
          <motion.div
            animate={{
              borderColor: isHovered ? "#C5A059" : "rgba(75,85,99,0.6)",
              backgroundColor: isHovered ? "#C5A059" : "transparent",
              color: isHovered ? "#0A1B47" : "#9ca3af",
              rotate: isHovered ? 45 : 0,
            }}
            transition={{ duration: 0.3, ease: EASE.snappy }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "9999px",
              border: "1px solid",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ticket size={20} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Tourist Events Section
 * A dynamic events listing with hover-reveal background images
 * and engaging staggered animations
 */
export const TouristEventsSection: React.FC = () => {
  const [hoveredImage, setHoveredImage] = useState(
    "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
  );

  const events = [
    {
      date: { month: "SEP", day: "15" },
      title: "Peñafrancia Festival",
      location: "Naga River & Basilica",
      category: "Religious / Cultural",
      image:
        "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    },
    {
      date: { month: "OCT", day: "02" },
      title: "Kamundagan Festival",
      location: "Plaza Quezon",
      category: "Music / Arts",
      image:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    },
    {
      date: { month: "NOV", day: "12" },
      title: "Bicol Food Fest",
      location: "Magsaysay Avenue",
      category: "Gastronomy",
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    },
    {
      date: { month: "DEC", day: "24" },
      title: "Grand Christmas Lighting",
      location: "City Hall Grounds",
      category: "Community",
      image:
        "https://images.unsplash.com/photo-1512389142860-9c449e58a543?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    },
  ];

  return (
    <section
      id="events"
      style={{
        position: "relative",
        padding: "102px 24px",
        backgroundColor: "#0A1B47",
        overflow: "hidden",
      }}
    >
      {/* Dynamic Background Image with smooth crossfade */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={hoveredImage}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.09, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE.smooth }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            willChange: "opacity, transform",
          }}
        >
          <img
            src={hoveredImage}
            alt="Event background"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(4px) grayscale(30%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(10, 27, 71, 0.8)",
              mixBlendMode: "multiply",
            }}
          />
        </motion.div>
      </AnimatePresence>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Header with entrance animations */}
        <motion.div
          variants={sectionHeaderVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "80px",
            gap: "24px",
          }}
        >
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE.smooth }}
              style={{
                color: "#C5A059",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontSize: "0.875rem",
                marginBottom: "16px",
              }}
            >
              Mark Your Calendar
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE.smooth }}
              style={{
                fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
                fontWeight: 900,
                color: "white",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Upcoming <br />
              <span
                style={{
                  background: "linear-gradient(to right, white, #C5A059)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Events
              </span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            style={{ display: "none" }}
            className="events-calendar-btn"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outlined"
                sx={{
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  borderRadius: "9999px",
                  padding: "16px 32px",
                  fontWeight: 700,
                  "&:hover": {
                    backgroundColor: "white",
                    color: "#0A1B47",
                  },
                }}
              >
                View Full Calendar
                <motion.span 
                  animate={arrowBounceAnimation}
                  transition={arrowBounceTransition}
                  style={{ marginLeft: "8px", display: "inline-flex" }}
                >
                  <ArrowRight size={16} />
                </motion.span>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Events List with staggered animations */}
        <motion.div
          variants={eventsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          style={{
            borderTop: "1px solid rgba(75, 85, 99, 0.5)",
          }}
        >
          {events.map((event, index) => (
            <EventRow
              key={index}
              {...event}
              index={index}
              setHoveredEvent={setHoveredImage}
            />
          ))}
        </motion.div>

        {/* Mobile Button with animation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          style={{ marginTop: "48px", textAlign: "center" }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outlined"
              sx={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "white",
                borderRadius: "9999px",
                padding: "16px 32px",
                fontWeight: 700,
                width: "100%",
                maxWidth: "400px",
                "&:hover": {
                  backgroundColor: "white",
                  color: "#0A1B47",
                },
              }}
            >
              View Full Calendar
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Show desktop button */}
      <style>{`
        @media (min-width: 768px) {
          .events-calendar-btn {
            display: block !important;
          }
          #events > div > div:last-child {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default TouristEventsSection;
