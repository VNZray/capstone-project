import React from "react";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import { Grid, Chip, Avatar } from "@mui/joy";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import IconButton from "@/src/components/IconButton";
import Section from "@/src/components/ui/Section";
import BenefitsSection from "./BenefitsSection";

interface TeamMember {
  name: string;
  role: string;
  description: string;
  image?: string;
  github?: string;
  linkedin?: string;
  email?: string;
}

const TeamSection: React.FC = () => {
  // Replace with actual team member data
  const teamMembers: TeamMember[] = [
    {
      name: "Team Member 1",
      role: "Project Lead / Full Stack Developer",
      description:
        "Led the development of City Venture from concept to deployment. Specialized in system architecture and backend development.",
      image: undefined,
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "member1@cityventure.io",
    },
    {
      name: "Team Member 2",
      role: "Frontend Developer",
      description:
        "Designed and implemented the mobile app and web interface. Focused on creating intuitive user experiences.",
      image: undefined,
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "member2@cityventure.io",
    },
    {
      name: "Team Member 3",
      role: "Backend Developer",
      description:
        "Built the API infrastructure and database architecture. Ensured security and scalability of the platform.",
      image: undefined,
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "member3@cityventure.io",
    },
    {
      name: "Team Member 4",
      role: "UI/UX Designer",
      description:
        "Created the visual identity and user interface design. Conducted user research and usability testing.",
      image: undefined,
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "member4@cityventure.io",
    },
  ];

  return (
    <Section
      align="center"
      justify="center"
      height="auto"
      minHeight={"100vh"}
      maxHeight={"auto"}
      id="team"
    >
      <Container padding="0" align="center">
        <Chip size="lg" color="primary" variant="soft">
          Meet the Team
        </Chip>

        <Typography.Header
          size="lg"
          align="center"
          sx={{
            lineHeight: 1.15,
            marginBottom: 1,
            marginTop: 2,
            color: "#0A1B47",
          }}
        >
          The People Behind <span className="gradient-bicol">City Venture</span>
        </Typography.Header>

        <Typography.Body
          size="md"
          align="center"
          sx={{
            maxWidth: 720,
            margin: "8px auto 48px",
            opacity: 0.9,
          }}
        >
          A dedicated team of developers and designers passionate about
          promoting Naga City's tourism through innovative technology.
        </Typography.Body>

        <Grid xs={12} sm={11} md={11} lg={9} xl={9} container spacing={2}>
          {teamMembers.map((member, index) => (
            <Grid key={index} xs={12} sm={6} md={6} lg={6} xl={3} spacing={2}>
              <Container
                elevation={2}
                hover
                hoverEffect="lift"
                padding="32px 24px"
                radius="20px"
                gap="20px"
                align="center"
                height="400px"
              >
                {/* Avatar */}
                <Avatar
                  src={member.image}
                  alt={member.name}
                  sx={{
                    width: 160,
                    height: 160,
                    fontSize: 48,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  }}
                >
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Avatar>

                {/* Name and Role */}
                <Container gap="4px" padding="0" align="center">
                  <Typography.CardTitle
                    size="sm"
                    color="primary"
                    align="center"
                  >
                    {member.name}
                  </Typography.CardTitle>
                  <Typography.Label
                    size="xs"
                    sx={{
                      color: "#667eea",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    {member.role}
                  </Typography.Label>
                </Container>

                {/* Description */}
                <Typography.Body
                  size="sm"
                  align="center"
                  sx={{ opacity: 0.85 }}
                >
                  {member.description}
                </Typography.Body>

                {/* Social Links */}
                <Container
                  direction="row"
                  gap="8px"
                  padding="0"
                  justify="center"
                  style={{ marginTop: "auto" }}
                >
                  {member.github && (
                    <IconButton
                      variant="soft"
                      colorScheme="gray"
                      size="sm"
                      onClick={() => window.open(member.github, "_blank")}
                      sx={{
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "#fff",
                        },
                      }}
                    >
                      <FaGithub size={18} />
                    </IconButton>
                  )}
                  {member.linkedin && (
                    <IconButton
                      variant="soft"
                      colorScheme="gray"
                      size="sm"
                      onClick={() => window.open(member.linkedin, "_blank")}
                      sx={{
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "#fff",
                        },
                      }}
                    >
                      <FaLinkedin size={18} />
                    </IconButton>
                  )}
                  {member.email && (
                    <IconButton
                      variant="soft"
                      colorScheme="gray"
                      size="sm"
                      onClick={() => window.open(`mailto:${member.email}`)}
                      sx={{
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "#fff",
                        },
                      }}
                    >
                      <FaEnvelope size={18} />
                    </IconButton>
                  )}
                </Container>
              </Container>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Section>
  );
};

export default TeamSection;
