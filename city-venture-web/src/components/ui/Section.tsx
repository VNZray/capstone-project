import Container from "../Container";

type Props = {
  children: React.ReactNode;
  background?: string;
  id?: string;
  className?: string;
  flex?: 1;
  direction?: "row" | "column";
  align?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline";
  justify?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around";
  padding?: string;
  height?: string;
  style?: React.CSSProperties;
};

const Section: React.FC<Props> = ({
  children,
  background,
  id,
  className,
  flex,
  direction,
  align,
  justify,
  padding,
  height = "100vh",
  style,
}) => {
  return (
    <Container
      id={id}
      className={className}
      background={background}
      flex={flex}
      direction={direction}
      align={align}
      justify={justify}
      padding={padding}
      height={height}
      style={style}
    >
      {children}
    </Container>
  );
};

export default Section;
