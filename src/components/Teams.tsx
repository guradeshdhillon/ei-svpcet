import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Linkedin } from "lucide-react";

const Teams = () => {
  const currentTeam = [
    {
      im :  <img style={{width: "350px", height: "400px", borderRadius: "0.5rem"}} src="/this.png"/>,
      name: "Rahul Sharma",
      role: "President",
      bio: "Leading the club with vision and innovation",
      email: "rahul@example.com",
      linkedin: "#",
    },
    {
      im :  <img style={{width: "350px", height: "400px", borderRadius: "0.5rem"}} src="/this.png"/>,
      name: "Priya Patel",
      role: "Vice President",
      bio: "Ensuring smooth operations and member engagement",
      email: "priya@example.com",
      linkedin: "#",
    },
    {
      im :  <img style={{width: "350px", height: "400px", borderRadius: "0.5rem"}} src="/this.png"/>,
      name: "Amit Kumar",
      role: "Technical Head",
      bio: "Driving technical excellence in all our projects",
      email: "amit@example.com",
      linkedin: "#",
    },
    {
      im :  <img style={{width: "350px", height: "400px", borderRadius: "0.5rem"}} src="/this.png"/>,
      name: "Sneha Reddy",
      role: "Events Manager",
      bio: "Creating memorable experiences through events",
      email: "sneha@example.com",
      linkedin: "#",
    },
    {
      im :  <img style={{width: "350px", height: "400px", borderRadius: "0.5rem"}} src="/this.png"/>,
      name: "Arjun Singh",
      role: "Treasurer",
      bio: "Managing club finances and sponsorships",
      email: "arjun@example.com",
      linkedin: "#",
    },
    {
      im :  <img style={{width: "350px", height: "400px", borderRadius: "0.5rem"}} src="/this.png"/>,
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
        {im :  <img style={{width: "350px", height: "400px", borderRadius: "0.5rem"}} src="/this.png"/>,  name: "Vikram Mehta", role: "President" },
        { im :  <img style={{width: "350px", height: "400px", borderRadius: "0.5rem"}} src="/this.png"/>, name: "Anjali Shah", role: "Vice President" },
        { im :  <img style={{width: "350px", height: "400px", borderRadius: "0.5rem"}} src="/this.png"/>, name: "Karthik Iyer", role: "Technical Head" },
        { im :  <img style={{width: "350px", height: "400px", borderRadius: "0.5rem"}} src="/this.png"/>, name: "Divya Joshi", role: "Events Manager" },
      ],
    },
    {
      year: "2022-2023",
      members: [
        {im :  <img style={{width: "350px", height: "400px", borderRadius: "0.5rem"}} src="/this.png"/>,  name: "Rohan Verma", role: "President" },
        { im :  <img style={{width: "350px", height: "400px", borderRadius: "0.5rem"}} src="/this.png"/>, name: "Pooja Nair", role: "Vice President" },
        { im :  <img style={{width: "350px", height: "400px", borderRadius: "0.5rem"}} src="/this.png"/>, name: "Aditya Rao", role: "Technical Head" },
        { im :  <img style={{width: "350px", height: "400px", borderRadius: "0.5rem"}} src="/this.png"/>, name: "Kavya Desai", role: "Events Manager" },
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
                  style={{ animationDelay: `${index * 0.05}s`, flexDirection: "column", alignItems: "center" , width: "380px ", height: "545px", borderRadius: "0.5rem"}}
                >
                  <CardContent style={{width:"380px ", height: "545px", backgroundColor: " #fff2e6"}} className="p-6">
                    <div className="w-25 h-15 rounded-full bg-gradient-card mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl font-bold text-primary">
                        {member.im}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground text-center mb-1">
                      {member.name}
                    </h3>
                    <p className="text-secondary font-semibold text-center mb-3">
                      {member.role}
                    </p>
                    
                    <div className="flex justify-center gap-4">
                      
                        
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
                        style={{flexDirection: "column", alignItems: "center" , width: "280px ", height: "500px", borderRadius: "0.5rem"}}
                        className="hover:shadow-card transition-shadow border-border bg-card"
                      >
                        <CardContent style={{width:"320px ", height: "500px", backgroundColor: " #fff2e6",  borderRadius: "0.5rem", paddingLeft: "1rem", paddingRight: "1rem"} } className="p-6 text-center">
                          <div className="w-25 h-15 rounded-full bg-gradient-card mx-auto mb-4 flex items-center justify-center">
                            <span className="text-xl font-bold text-primary">
                              {member.im}
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
