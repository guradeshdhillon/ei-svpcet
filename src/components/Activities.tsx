import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";
import abhyudaya from "@/activities-assets/abhyudaya.jpeg";
import donationdrive from "@/activities-assets/donationdrive.jpg";
import rashtrabimaan from "@/activities-assets/rashtrabimaan.png";
import slum from "@/activities-assets/slum.jpg";
import induction from "@/activities-assets/induction.jpg";
import sevasankalp from "@/activities-assets/sevasankalp.jpeg";
import diwalimilan from "@/activities-assets/diwalimilan.jpeg";

const Activities = () => {
  const [expandedCards, setExpandedCards] = useState<{ [key: number]: boolean }>({});

  const toggleCard = (index: number) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const activities = [
    {
      title: "Abhyudaya 24.0",
      description: "Abhyudaya is a unique and prestigious event organized exclusively by Engineering India (EI), where EI coordinators from all colleges come together to make it grand and impactful. It is the biggest technical event of EI, showcasing innovation, teamwork, and technical excellence on a large scale. Last year, this mega event was successfully conducted at Smruti Mandir Parisar, Reshimbagh, with active participation from multiple colleges. Abhayadaya stands as a symbol of EI’s unity, technical strength, and its ability to organize large-scale events that leave a lasting impact.",
      image: abhyudaya,
      date: "September 2024",
      location: "Smruti Mandir Parisar, Reshimbagh",
      
    },
    {
      title: "Donation drive - Orphanage Visit",
      description: "EI Coordinators visited an orphanage center with the aim of spreading awareness, care, and positivity. During the visit, the coordinators guided the children and explained the importance and benefits of education in a simple and motivating way. Various fun activities were conducted to create a joyful and friendly environment. As a gesture of support and love, books, chocolates, and stationery were distributed among the children. The visit was not only about giving resources but also about sharing time, encouragement, and hope, making the experience meaningful and heart-warming for everyone involved.",
      image: donationdrive,
      date: "January 2025",
      location: "Shri Shradhanand Anathalaya,Plot No. 123, Abhyankar Nagar Road Opp. Punjab National Bank, Shradhanandpeth, Maharashtra 440022"
      
    },
    {
      title: "Rastrabhiman - Republic Day Celebration ",
      description: "On the occasion of 26th January, EI Coordinators from all colleges came together to celebrate Republic Day with great enthusiasm and unity. The event included a vibrant dance performance that reflected patriotism and cultural pride. At the Traffic Park, EI coordinators also guided and interacted with people, sharing messages related to patriotism, civic sense, and national values. The celebration was filled with deshbhakti, teamwork, and a strong sense of responsibility towards the nation, making it a meaningful and memorable occasion for all.",
      image: rashtrabimaan,
      date: "January 2025",
      location: "Traffic Park, Nagpur"
      
    },
    {
      title: "Light of Learning – Slum Area Visit",
      description: "Under the Light of Learning initiative, EI Coordinators visited the slum area of Omkar Nagar in collaboration with Youth for Seva, Nagpur. During the visit, EI coordinators interacted with children and taught them basic alphabets, numbers, tables, and poems in an engaging way. They also communicated with the children’s parents to understand their needs and challenges, and made efforts to fulfill essential requirements wherever possible. Fun activities and games were organized to create a joyful learning environment. To support the children, books, stationery kits, biscuits, and chocolates were distributed. The visit aimed to spread education, care, and hope among the community.",
      image: slum,
      date: "July 2025",
      location: "Omkar Nagar, Nagpur"
    },
    {
      title: "Induction Programme",
      description: "The Engineering India (EI) Induction Programme was successfully conducted at St. Vincent Pallotti College of Engineering and Technology, Nagpur. During the session, EI coordinators interacted with the junior students and gave a brief introduction to Engineering India. A short overview of all EI events was shared, highlighting how EI is socially as well as technically active. The session helped juniors understand the vision, activities, and impact of EI. The juniors showed keen interest and enthusiasm to become EI members. The programme was graced by the presence of Pallotti EI Facility Coordinator, Ms. Mrunali Buradkar, making the session more informative and inspiring for the students.",
      image: induction,
      date: "August 2025",
      location: "SVPCET, Nagpur"
    },
    {
      title: "Seva Sankalp – Old Age Orphanage Visit",
      description: "Under the Seva Sankalp initiative, EI Coordinators visited an old age orphanage in collaboration with EI RBU. The coordinators spent quality time with the elderly, engaging in warm conversations and listening to their life experiences. Old songs were sung together, creating a nostalgic and joyful atmosphere. The elders shared their valuable experiences, and the coordinators also received meaningful guidance and insights from them. The visit concluded with a cake-cutting ceremony, celebrating togetherness, respect, and compassion, making the moment memorable for everyone involved.",
      image: sevasankalp,
      date: "October 2025",
      location: "Nalanda Vastistar Vruddhashram, Binaki, Nagpur"
    },
    {
      title: "Diwali Milan",
      description: "Diwali Milan was a joyful gathering where all EI coordinators from different colleges came together under one roof. The event focused on building strong coordination and bonding among everyone. Various fun activities were organized, creating a lively and positive atmosphere. Along with celebrations, it was a great opportunity for interaction, teamwork, and sharing experiences. The Diwali celebration was filled with happiness, unity, and festive spirit, making it a memorable event for all the coordinators involved. ",
      image: diwalimilan,
      date: "October 2025",
      location: "Dattaji Didolar bhavan, Pande layout, New Sneh Nagar,Nagpur"
    },
  ];

//  const otherActivities = [
//     "Weekly Coding Sessions",
//     "Project Showcases",
//     "Industry Visits",
//     "Social Outreach Programs",
//    "Seminar Series",
//     "Tech Talks",
// ];

  return (
    <section style={{backgroundColor:"#fff2e6"}} id="activities" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our <span className="bg-gradient-accent bg-clip-text text-transparent">Activities</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From hackathons to workshops, we keep innovation alive year-round
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12 items-start">
          {activities.map((activity, index) => (
            <Card
              key={index}
              className="group overflow-hidden hover:shadow-glow transition-all duration-300 border-border animate-scale-in self-start w-full"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={activity.image}
                  alt={activity.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* <div className={`absolute inset-0 bg-gradient-to-t ${activity.color} opacity-60`} /> */}
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2 min-h-[0.1rem]">
                  <h3 className="text-1xl font-bold text-foreground flex-1 leading-tight">
                    {activity.title}
                  </h3>
                  <button
                    onClick={() => toggleCard(index)}
                    className="ml-2 p-1 hover:bg-muted rounded-full transition-colors flex-shrink-0"
                    aria-label={expandedCards[index] ? "Collapse" : "Expand"}
                  >
                    <ChevronDown
                      className={`w-5 h-5 text-primary transition-transform duration-300 ${
                        expandedCards[index] ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedCards[index] ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* <div className="max-w-4xl mx-auto">
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
        </div> */}
      </div>
    </section>
  );
};

export default Activities;
