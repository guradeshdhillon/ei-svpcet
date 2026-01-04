import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Instagram, Linkedin, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false); // Added loading state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create the data object for Web3Forms
    const submissionData = new FormData();
    submissionData.append("access_key", "3494638b-4b79-46c5-8c53-784ed8e45fe7");
    submissionData.append("name", formData.name);
    submissionData.append("email", formData.email);
    submissionData.append("phone", formData.phone);
    submissionData.append("message", formData.message);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: submissionData
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Thank you! We'll get back to you soon.");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("Could not send message. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { icon: Instagram, label: "Instagram", url: "https://www.instagram.com/engineering.india_svpcet?utm_source=ig_web_button_share_sheet&igsh=ODdmZWVhMTFiMw==", color: "hover:text-pink-500" },
    { icon: Linkedin, label: "LinkedIn", url: "https://www.linkedin.com/company/engineeringindia-2047/", color: "hover:text-blue-700" },
  ];

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get In <span className="bg-gradient-accent bg-clip-text text-transparent">Touch</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions? Want to join? We'd love to hear from you!
          </p>
        </div>
 <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
{/* Contact Info */}
 <div className="space-y-6">
 <Card className="border-border bg-card shadow-card">
 <CardContent className="p-6">
<h3 className="text-2xl font-bold text-foreground mb-6">
 Contact Information
 </h3>
<div className="space-y-4">
 <div className="flex items-start gap-4">
 <div className="p-3 rounded-lg bg-gradient-card">
 <Mail className="w-5 h-5 text-primary" />
 </div>
 <div>
<h4 className="font-semibold text-foreground mb-1">Email</h4>
 <a
 href="mailto:contact@engineeringindiaclub.edu"
 className="text-muted-foreground hover:text-primary transition-colors"
 >
 contact@engineeringindiaclub.edu
 </a>
</div>
 </div>

<div className="flex items-start gap-4">
 <div className="p-3 rounded-lg bg-gradient-card">
<Phone className="w-5 h-5 text-primary" />
</div>
<div>
<h4 className="font-semibold text-foreground mb-1">Phone</h4>
<a
 href="tel:+911234567890"
 className="text-muted-foreground hover:text-primary transition-colors"
 >
 +91 12345 67890
 </a>
 </div>
</div>
 <div className="flex items-start gap-4">
 <div className="p-3 rounded-lg bg-gradient-card">
<MapPin className="w-5 h-5 text-primary" />
 </div>
 <div>
 <h4 className="font-semibold text-foreground mb-1">Address</h4>
 <p className="text-muted-foreground">
 Engineering Department, Building A<br />
 Main Campus, College Road<br />
 City, State - 123456
</p>
 </div>
 </div>
</div>
 </CardContent>
 </Card>

            <Card className="border-border bg-card shadow-card">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-6">Follow Us</h3>
                <div className="grid grid-cols-2 gap-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-card hover:shadow-card transition-all ${social.color}`}>
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-medium">{social.label}</span>
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Updated Contact Form */}
          <Card className="border-border bg-card shadow-card">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  type="tel"
                  placeholder="Your Phone (Optional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  className="resize-none"
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-accent hover:opacity-90"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;
