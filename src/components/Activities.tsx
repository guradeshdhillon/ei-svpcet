import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import hackathonImg from "@/assets/hackathon.jpg";
import workshopImg from "@/assets/workshop.jpg";
import techfestImg from "@/assets/techfest.jpg";

const Activities = () => {
  const activities = [
    {
      title: "Annual Hackathon",
      description: "36-hour coding marathon where teams build innovative solutions to real-world problems. Win prizes, mentorship, and industry connections.",
      image: hackathonImg,
      date: "March 2024",
      location: "Main Campus",
      color: "from-primary to-primary/80",
    },
    {
      title: "Technical Workshops",
      description: "Hands-on learning sessions covering cutting-edge technologies like AI, IoT, Cloud Computing, and more. Expert speakers from industry and academia.",
      image: workshopImg,
      date: "Monthly",
      location: "Engineering Block",
      color: "from-secondary to-secondary/80",
    },
    {
      title: "TechFest",
      description: "Our flagship annual technical festival featuring competitions, exhibitions, guest lectures, and networking opportunities with industry leaders.",
      image: techfestImg,
      date: "November 2024",
      location: "College Grounds",
      color: "from-accent to-accent/80",
    },
  ];

  const otherActivities = [
    "Weekly Coding Sessions",
    "Project Showcases",
    "Industry Visits",
    "Social Outreach Programs",
    "Seminar Series",
    "Tech Talks",
  ];

  return (
    <section id="activities" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our <span className="bg-gradient-accent bg-clip-text text-transparent">Activities</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From hackathons to workshops, we keep innovation alive year-round
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {activities.map((activity, index) => (
            <Card
              key={index}
              className="group overflow-hidden hover:shadow-glow transition-all duration-300 border-border animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={activity.image}
                  alt={activity.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${activity.color} opacity-60`} />
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {activity.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {activity.description}
                </p>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{activity.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{activity.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
            More Activities
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {otherActivities.map((activity, index) => (
              <Card
                key={index}
                className="hover:shadow-card transition-shadow border-border bg-card"
              >
                <CardContent className="p-4 text-center">
                  <span className="text-foreground font-medium">{activity}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Activities;
