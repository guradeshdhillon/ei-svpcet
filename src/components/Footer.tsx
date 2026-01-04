const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-2">Engineering India Club</h3>
            <p className="text-sm opacity-90">
              Innovate • Collaborate • Engineer
            </p>
          </div>
          <div className="text-center md:text-right text-sm opacity-90">
            <p>© 2026 Engineering India Club. All rights reserved.</p>
            <p className="mt-1">Made with passion by our Technical Team</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
