import React from "react";
import "./Card.css";
import Text from "@/src/components/Text";
import Container from "@/src/components/Container";

interface CardProps {
  image?: string;
  title?: string;
  subtitle?: string;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

const Card: React.FC<CardProps> = ({ image, title, subtitle, elevation }) => {
  return (
    <Container className="card-container" elevation={elevation}>
      <div className="image-container">
        <img
          src={image}
          alt={title}
          width={"100%"}
          height={"100%"}
          className="card-image"
        />
      </div>
      <div className="card-content">
        <Text variant="card-title">{title}</Text>
        <Text variant="card-sub-title">{subtitle}</Text>
      </div>
    </Container>
  );
};

export default Card;
