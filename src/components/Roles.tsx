import { Card, CardContent } from "@/components/ui/card";
import { Crown, Users, Code, Calendar, DollarSign, Megaphone, Pencil, Camera } from "lucide-react";

const Roles = () => {
  const roles = [
    {
      icon: Crown,
      title: "President",
      description: "Leads the club's vision and strategy, represents the club at college events, and coordinates with faculty advisors.",
    },
    {
      icon: Users,
      title: "Vice President",
      description: "Supports the president, manages day-to-day operations, and ensures smooth coordination between teams.",
    },
    {
      icon: Code,
      title: "Technical Head",
      description: "Oversees all technical projects and workshops, mentors members on technical skills, and manages tech infrastructure.",
    },
    {
      icon: Calendar,
      title: "Events Manager",
      description: "Plans and executes all club events, coordinates with vendors and venues, and manages event logistics.",
    },
    {
      icon: DollarSign,
      title: "Treasurer",
      description: "Manages club finances, handles sponsorships and fundraising, and maintains financial records and budgets.",
    },
    {
      icon: Megaphone,
      title: "PR & Marketing Head",
      description: "Manages social media presence, creates marketing campaigns, and handles external communications.",
    },
    {
      icon: Pencil,
      title: "Content Writer",
      description: "Creates engaging content for social media, writes articles and newsletters, and manages club blog.",
    },
    {
      icon: Camera,
      title: "Media & Design Head",
      description: "Captures event photos and videos, creates promotional materials, and manages visual content.",
    },
  ];

  return (
    <section id="roles" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Member <span className="bg-gradient-accent bg-clip-text text-transparent">Roles</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Every role is essential to our club's success
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-glow transition-all duration-300 border-border bg-card animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-card flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {role.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {role.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Roles;
