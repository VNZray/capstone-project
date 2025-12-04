import Button from "@/src/components/Button";

type props = {
  onClick?: () => void;
  children?: React.ReactNode;
  fontWeight?: number;
};
export const LandingPageButton = ({ onClick, children, fontWeight }: props) => {
  return (
    <Button
      size="lg"
      colorScheme="primary"
      onClick={onClick}
      sx={{
        borderRadius: 12,
        px: 3,
        color: "#ffffff",
        background:
          "linear-gradient(135deg, #FF6B6B 0%, #FF914D 50%, #28C76F 100%)",
        boxShadow: "0 10px 26px rgba(0,0,0,0.12)",
        border: "none",
        textTransform: "none",
        fontWeight: fontWeight ? fontWeight : 700,
        transition:
          "transform 160ms ease, box-shadow 160ms ease, filter 160ms ease",
        "&:hover": {
          filter: "brightness(1.2)",
          transform: "translateY(-1px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.20)",
        },
      }}
    >
      {children}
    </Button>
  );
};
