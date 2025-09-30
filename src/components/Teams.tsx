import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Linkedin } from "lucide-react";

const Teams = () => {
  const currentTeam = [
    {
      name: "Rahul Sharma",
      role: "President",
      bio: "Leading the club with vision and innovation",
      email: "rahul@example.com",
      linkedin: "#",
    },
    {
      name: "Priya Patel",
      role: "Vice President",
      bio: "Ensuring smooth operations and member engagement",
      email: "priya@example.com",
      linkedin: "#",
    },
    {
      name: "Amit Kumar",
      role: "Technical Head",
      bio: "Driving technical excellence in all our projects",
      email: "amit@example.com",
      linkedin: "#",
    },
    {
      name: "Sneha Reddy",
      role: "Events Manager",
      bio: "Creating memorable experiences through events",
      email: "sneha@example.com",
      linkedin: "#",
    },
    {
      name: "Arjun Singh",
      role: "Treasurer",
      bio: "Managing club finances and sponsorships",
      email: "arjun@example.com",
      linkedin: "#",
    },
    {
      name: "Neha Gupta",
      role: "PR & Marketing Head",
      bio: "Building our brand and community presence",
      email: "neha@example.com",
      linkedin: "#",
    },
  ];

  const previousTeams = [
    {
      year: "2023-2024",
      members: [
        { name: "Vikram Mehta", role: "President" },
        { name: "Anjali Shah", role: "Vice President" },
        { name: "Karthik Iyer", role: "Technical Head" },
        { name: "Divya Joshi", role: "Events Manager" },
      ],
    },
    {
      year: "2022-2023",
      members: [
        { name: "Rohan Verma", role: "President" },
        { name: "Pooja Nair", role: "Vice President" },
        { name: "Aditya Rao", role: "Technical Head" },
        { name: "Kavya Desai", role: "Events Manager" },
      ],
    },
  ];

  return (
    <section id="teams" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Meet Our <span className="bg-gradient-accent bg-clip-text text-transparent">Team</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The passionate individuals driving our mission forward
          </p>
        </div>

        <Tabs defaultValue="current" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="current">Current Team</TabsTrigger>
            <TabsTrigger value="previous">Previous Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentTeam.map((member, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-glow transition-all duration-300 border-border bg-card animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-card mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl font-bold text-primary">
                        {member.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground text-center mb-1">
                      {member.name}
                    </h3>
                    <p className="text-secondary font-semibold text-center mb-3">
                      {member.role}
                    </p>
                    <p className="text-muted-foreground text-center text-sm mb-4">
                      {member.bio}
                    </p>
                    <div className="flex justify-center gap-4">
                      <a
                        href={`mailto:${member.email}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="previous">
            <div className="space-y-12">
              {previousTeams.map((team, teamIndex) => (
                <div key={teamIndex}>
                  <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                    Academic Year {team.year}
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {team.members.map((member, index) => (
                      <Card
                        key={index}
                        className="hover:shadow-card transition-shadow border-border bg-card"
                      >
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-card mx-auto mb-4 flex items-center justify-center">
                            <span className="text-xl font-bold text-primary">
                              {member.name.split(" ").map(n => n[0]).join("")}
                            </span>
                          </div>
                          <h4 className="font-bold text-foreground mb-1">
                            {member.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {member.role}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default Teams;
