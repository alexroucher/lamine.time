import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Briefcase, Home, ClipboardList } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/lamine-time.firebasestorage.app/o/Icone%20officielle.png?alt=media&token=cb047734-f655-40f4-b69f-6f19e9a15db8" 
              alt="Mine.time" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-semibold text-[#252C36] hidden md:inline">Mine.time</span>
          </Link>
          
          <div className="flex space-x-1 md:space-x-4">
            <NavLink to="/" icon={<Home />} text="Accueil" active={isActive('/')} />
            <NavLink to="/time-entries" icon={<ClipboardList />} text="Liste des temps" active={isActive('/time-entries')} />
            <NavLink to="/employees" icon={<Users />} text="Salariés" active={isActive('/employees')} />
            <NavLink to="/clients" icon={<Briefcase />} text="Clients" active={isActive('/clients')} />
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, text, active }: { to: string; icon: React.ReactNode; text: string; active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center space-x-1 px-2 md:px-3 py-2 rounded-md text-sm font-medium transition-colors
      ${active 
        ? 'bg-[#FF881B]/10 text-[#FF881B]' 
        : 'text-gray-600 hover:bg-[#FF881B]/5 hover:text-[#FF881B]'
      }`}
  >
    {icon}
    <span className="hidden md:inline">{text}</span>
  </Link>
);

export default Navbar;