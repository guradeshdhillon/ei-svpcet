import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Lightbulb, Trophy } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To foster innovation, technical excellence, and collaborative learning among engineering students, creating a platform for knowledge sharing and skill development.",
    },
    {
      icon: Users,
      title: "Community First",
      description: "Building a supportive community where every member can grow, learn, and contribute to meaningful projects that make a real impact.",
    },
    {
      icon: Lightbulb,
      title: "Innovation Hub",
      description: "Encouraging creative thinking and problem-solving through hackathons, workshops, and hands-on projects that push technological boundaries.",
    },
    {
      icon: Trophy,
      title: "Excellence",
      description: "Striving for excellence in every endeavor, from organizing world-class events to developing cutting-edge technical solutions.",
    },
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            About <span className="bg-gradient-accent bg-clip-text text-transparent">Our Club</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Building the future of engineering, one project at a time
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Story</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Founded over a decade ago, the Engineering India Club has been at the forefront of technical education and innovation at our college. What started as a small group of passionate engineers has grown into one of the most active and influential student organizations on campus.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, we're proud to have created a thriving ecosystem where students from all engineering disciplines come together to learn, collaborate, and innovate. Through our diverse range of activities - from cutting-edge hackathons to insightful technical workshops - we continue to shape the next generation of engineering leaders.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-glow transition-all duration-300 border-border bg-card animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gradient-card group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default About;
