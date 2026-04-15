import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  BookOpen, 
  Info, 
  PlayCircle, 
  Zap, 
  Instagram, 
  Users, 
  ChevronRight, 
  ChevronLeft,
  Star, 
  MonitorPlay,
  Lightbulb,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Search
} from 'lucide-react';

type Section = 'home' | 'lessons' | 'about';
type Platform = 'YouTube' | 'TikTok' | 'Instagram' | 'Facebook';

interface Lesson {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  tag?: string;
  duration?: string;
}

const PLATFORM_LESSONS: Record<Platform, Lesson[]> = {
  YouTube: [
    {
      id: 'yt1',
      title: 'Mastering the Passive Voice',
      description: 'Learn how to shift focus in your sentences with these simple rules, moving from action-oriented to object-focused narratives.',
      thumbnail: 'https://picsum.photos/seed/writing/1200/600',
      duration: '12:45'
    },
    {
      id: 'yt2',
      title: 'Conditional Clause Fluency',
      description: 'Navigate "if" and "when" with confidence. A deep dive into the four main conditionals of English grammar.',
      thumbnail: 'https://picsum.photos/seed/abstract/1200/600',
      tag: 'NEW LESSON'
    },
    {
      id: 'yt3',
      title: 'The Art of Semicolons',
      description: 'Stop fearing the semicolon. Learn how to connect independent thoughts for a more sophisticated writing style.',
      thumbnail: 'https://picsum.photos/seed/book/1200/600'
    }
  ],
  TikTok: [
    {
      id: 'tk1',
      title: 'Quick Tense Hacks',
      description: 'Master the present perfect in under 60 seconds with these memory triggers.',
      thumbnail: 'https://picsum.photos/seed/fast/1200/600',
      duration: '0:59'
    }
  ],
  Instagram: [
    {
      id: 'ig1',
      title: 'Visual Prepositions',
      description: 'A visual guide to "in", "on", and "at" through beautiful photography.',
      thumbnail: 'https://picsum.photos/seed/photo/1200/600',
      tag: 'VISUAL'
    }
  ],
  Facebook: [
    {
      id: 'fb1',
      title: 'Community Storytelling',
      description: 'How to use narrative tenses to engage your audience in long-form posts.',
      thumbnail: 'https://picsum.photos/seed/story/1200/600',
      duration: '15:20'
    }
  ]
};

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const homeRef = useRef<HTMLElement>(null);
  const lessonsRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      const scrollPosition = window.scrollY + 100;

      if (aboutRef.current && scrollPosition >= aboutRef.current.offsetTop) {
        setActiveSection('about');
      } else if (lessonsRef.current && scrollPosition >= lessonsRef.current.offsetTop) {
        setActiveSection('lessons');
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (section: Section) => {
    if (selectedPlatform) {
      setSelectedPlatform(null);
      // Small timeout to allow the main view to mount before scrolling
      setTimeout(() => {
        const refs = { home: homeRef, lessons: lessonsRef, about: aboutRef };
        const ref = refs[section];
        if (ref.current) {
          window.scrollTo({
            top: ref.current.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      }, 50);
    } else {
      const refs = { home: homeRef, lessons: lessonsRef, about: aboutRef };
      const ref = refs[section];
      if (ref.current) {
        window.scrollTo({
          top: ref.current.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    }
  };

  if (selectedPlatform) {
    return (
      <PlatformLessonsView 
        platform={selectedPlatform} 
        onBack={() => scrollTo('lessons')} 
        onNav={(section) => scrollTo(section)}
        activeSection={activeSection}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-on-surface/5 py-3' : 'bg-background py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('home')}>
            <BookOpen className="text-secondary w-8 h-8" />
            <h1 className="text-xl md:text-2xl font-extrabold text-secondary tracking-tight">The Fluid Classroom</h1>
          </div>

          <nav className="flex items-center gap-2 md:gap-4">
            <NavButton 
              active={activeSection === 'home'} 
              onClick={() => scrollTo('home')}
              icon={<Home size={20} />}
              label="Home"
            />
            <NavButton 
              active={activeSection === 'lessons'} 
              onClick={() => scrollTo('lessons')}
              icon={<BookOpen size={20} />}
              label="Lessons"
            />
            <NavButton 
              active={activeSection === 'about'} 
              onClick={() => scrollTo('about')}
              icon={<Info size={20} />}
              label="About Us"
            />
          </nav>

          <button className="hidden md:block bg-secondary text-white px-6 py-2 rounded-full font-bold hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20">
            Sign In
          </button>
        </div>
      </header>

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section ref={homeRef} className="max-w-7xl mx-auto px-6 py-12 md:py-20 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <h2 className="text-5xl md:text-7xl font-extrabold text-on-surface leading-[1.1] mb-8">
                Grammar in <br />
                <span className="text-secondary">Motion</span>.
              </h2>
              <p className="text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed">
                Static textbooks are a thing of the past. Explore our curated collections of bite-sized grammar lessons across your favorite social platforms.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="bg-tertiary-container text-on-tertiary-container px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm">
                  <Star size={16} fill="currentColor" />
                  New Lessons Daily
                </span>
                <span className="bg-secondary-container text-on-secondary-container px-5 py-2.5 rounded-full text-sm font-bold shadow-sm">
                  1,200+ Video Clips
                </span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-5 relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative z-10">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://picsum.photos/seed/learning/800/800" 
                  alt="Learning environment"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-tertiary-container rounded-3xl -z-0 opacity-50 blur-2xl"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary-container rounded-full -z-0 opacity-30 blur-xl"></div>
            </motion.div>
          </div>
        </section>

        {/* Lessons Section - Updated Layout */}
        <section ref={lessonsRef} className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h3 className="text-4xl font-extrabold text-on-surface mb-3">Choose Your Channel</h3>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-secondary hover:text-white transition-all">
                <ChevronLeft size={20} />
              </button>
              <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-secondary hover:text-white transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <PlatformCard 
              icon={<PlayCircle className="text-[#FF0000]" size={24} />}
              iconBg="bg-red-50"
              title="YouTube"
              description="Deep dives into complex syntax with cinematic visuals."
              lessons="248 Lessons"
              onClick={() => setSelectedPlatform('YouTube')}
            />
            <PlatformCard 
              icon={<Zap className="text-on-surface" size={24} />}
              iconBg="bg-surface-container-low"
              title="TikTok"
              description="15-second rules and grammar hacks for the fast lane."
              lessons="512 Lessons"
              onClick={() => setSelectedPlatform('TikTok')}
            />
            <PlatformCard 
              icon={<Instagram className="text-white" size={24} />}
              iconBg="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]"
              title="Instagram"
              description="Visual carousels and beautiful typography for visual learners."
              lessons="389 Lessons"
              onClick={() => setSelectedPlatform('Instagram')}
            />
            <PlatformCard 
              icon={<Users className="text-secondary" size={24} />}
              iconBg="bg-blue-50"
              title="Facebook"
              description="Community-led discussions and long-form grammar storytelling."
              lessons="156 Lessons"
              onClick={() => setSelectedPlatform('Facebook')}
            />
          </div>
        </section>

        {/* Stats Section - Moved and Updated */}
        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="bg-surface-container-low rounded-[3rem] p-12 md:p-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="flex flex-col items-center md:border-r border-on-surface/10 px-8">
                <span className="text-7xl font-black text-on-surface mb-2">12</span>
                <span className="text-on-surface-variant font-semibold text-lg text-center">Lessons Watched Today</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-7xl font-black text-on-surface mb-2">4.9</span>
                <div className="flex text-tertiary-container mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={24} fill="currentColor" />
                  ))}
                </div>
                <span className="text-on-surface-variant font-semibold text-lg text-center">Average Course Rating</span>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section - Updated Layout */}
        <section ref={aboutRef} className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-16">
            <h3 className="text-4xl font-extrabold text-on-surface mb-4">Our Mission</h3>
            <p className="text-on-surface-variant text-xl">Breaking rigid constraints to foster intuitive linguistic growth.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            <MissionCard 
              icon={<Lightbulb className="text-secondary" size={24} />}
              title="Clarity"
              description="Removing the noise of traditional LMS to provide crystal-clear pathways through complex grammar rules."
            />
            <MissionCard 
              icon={<GraduationCap className="text-secondary" size={24} />}
              title="Learning"
              description="An adaptive ecosystem that evolves with your unique pace, turning friction into flow."
            />
            <MissionCard 
              icon={<TrendingUp className="text-secondary" size={24} />}
              title="Progress"
              description="Visualizing growth through tactile, friendly indicators that celebrate every win."
              className="lg:row-span-1"
            />
            <div className="md:col-span-2 lg:col-span-2 bg-secondary text-white rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
              <div className="relative z-10 flex-1">
                <h4 className="text-3xl font-bold mb-4">Empowerment</h4>
                <p className="text-lg opacity-90 leading-relaxed">
                  Equipping learners with the confidence to communicate naturally, not just correctly. Mastery is the destination; confidence is the journey.
                </p>
              </div>
              <div className="relative z-10 w-full md:w-1/3 aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://picsum.photos/seed/empower/600/400" 
                  alt="Empowerment" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          <div className="text-center mb-16">
            <h3 className="text-4xl font-extrabold text-on-surface">Meet the Visionaries</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <TeamCard 
              image="https://picsum.photos/seed/elena/600/800"
              name="Dr. Elena Vance"
              role="FOUNDER & CHIEF LINGUIST"
              bio="A PhD in Cognitive Linguistics with 15 years of experience bridging the gap between brain science and language acquisition."
            />
            <TeamCard 
              image="https://picsum.photos/seed/marcus/600/800"
              name="Marcus Chen"
              role="CREATIVE DIRECTOR"
              bio="The architect behind 'The Fluid Classroom.' Marcus ensures every pixel serves the learner's journey and mental momentum."
            />
            <TeamCard 
              image="https://picsum.photos/seed/sarah/600/800"
              name="Sarah Jamil"
              role="HEAD OF EXPERIENCE"
              bio="Dedicated to human-centric design, Sarah ensures GrammarFlow remains the most approachable learning tool in the market."
            />
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="bg-surface-container-low mt-20 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="text-secondary w-8 h-8" />
                <h4 className="text-2xl font-extrabold text-secondary tracking-tight">The Fluid Classroom</h4>
              </div>
              <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
                A new way of learning English through the platforms you already use every day. Simple, modern, and fluid. We believe education should meet you where you are.
              </p>
            </div>
            
            <div className="md:col-span-2 md:col-start-7">
              <h5 className="font-bold text-on-surface mb-6 text-lg">Quick Links</h5>
              <ul className="space-y-4 text-on-surface-variant">
                <li><button onClick={() => scrollTo('lessons')} className="hover:text-secondary transition-colors">All Lessons</button></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Study Guides</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Premium Perks</a></li>
              </ul>
            </div>
            
            <div className="md:col-span-2">
              <h5 className="font-bold text-on-surface mb-6 text-lg">Support</h5>
              <ul className="space-y-4 text-on-surface-variant">
                <li><a href="#" className="hover:text-secondary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h5 className="font-bold text-on-surface mb-6 text-lg">Newsletter</h5>
              <div className="flex gap-2">
                <input type="email" placeholder="Email" className="bg-white border-none rounded-full px-4 py-2 text-sm w-full focus:ring-2 focus:ring-secondary/20" />
                <button className="bg-secondary text-white p-2 rounded-full hover:bg-secondary-dim transition-colors">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-on-surface/5 text-center text-on-surface-variant text-sm">
            <p>© {new Date().getFullYear()} The Fluid Classroom. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PlatformLessonsView({ platform, onBack, onNav, activeSection }: { platform: Platform, onBack: () => void, onNav: (s: Section) => void, activeSection: Section }) {
  const lessons = PLATFORM_LESSONS[platform];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-on-surface/5 py-3">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
            <BookOpen className="text-secondary w-8 h-8" />
            <h1 className="text-xl md:text-2xl font-extrabold text-secondary tracking-tight">GrammarFlow</h1>
          </div>

          <nav className="flex items-center gap-2 md:gap-4">
            <NavButton 
              active={false} 
              onClick={() => onNav('home')}
              icon={<Home size={20} />}
              label="Home"
            />
            <NavButton 
              active={true} 
              onClick={() => onNav('lessons')}
              icon={<BookOpen size={20} />}
              label="Lessons"
            />
            <NavButton 
              active={false} 
              onClick={() => onNav('about')}
              icon={<Info size={20} />}
              label="About Us"
            />
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-secondary transition-colors">
              <Users size={20} />
            </button>
            <button className="bg-secondary text-white px-6 py-2 rounded-full font-bold hover:bg-secondary-dim transition-all">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-16 text-center relative">
            <span className="inline-block bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4">
              LEARNING HUB
            </span>
            <h2 className="text-5xl md:text-6xl font-extrabold text-on-surface mb-6">
              {platform} <span className="text-secondary">Lessons</span>
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed mb-10">
              Master English nuances through our fluid cinematic curriculum. Break the grid of traditional learning.
            </p>
            
            {/* Centered Search Bar */}
            <div className="max-w-md mx-auto relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-secondary transition-colors">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder={`Search ${platform} lessons...`}
                className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-14 pr-6 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm"
              />
            </div>

            <button className="absolute top-0 right-0 p-3 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-secondary hover:text-white transition-all hidden md:block">
              <Zap size={20} />
            </button>
          </div>

          <div className="space-y-12 mb-16">
            {lessons.map((lesson, idx) => (
              <motion.div 
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-on-surface/5 border border-on-surface/5 group"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={lesson.thumbnail} 
                    alt={lesson.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-secondary shadow-xl">
                      <PlayCircle size={32} fill="currentColor" className="text-white" />
                      <PlayCircle size={32} className="absolute text-secondary" />
                    </div>
                  </div>
                  {lesson.duration && (
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
                      {lesson.duration}
                    </div>
                  )}
                  {lesson.tag && (
                    <div className="absolute bottom-4 left-4 bg-tertiary text-on-tertiary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                      {lesson.tag}
                    </div>
                  )}
                </div>
                <div className="p-8 md:p-10">
                  <h3 className="text-3xl font-bold text-on-surface mb-4">{lesson.title}</h3>
                  <p className="text-on-surface-variant text-lg mb-8 leading-relaxed">
                    {lesson.description}
                  </p>
                  <button className="w-full bg-secondary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20">
                    Start Quiz
                    <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-on-surface-variant hover:text-secondary font-bold transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all">
                <ArrowLeft size={20} />
              </div>
              Back to All Channels
            </button>
          </div>
        </div>

        {/* Floating Back Button */}
        <motion.button
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -10 }}
          onClick={onBack}
          className="fixed right-0 top-1/2 -translate-y-1/2 bg-secondary text-white pl-4 pr-6 py-4 rounded-l-full shadow-2xl flex items-center gap-3 z-50 hover:bg-secondary-dim transition-all group"
          title="Go Back"
        >
          <ArrowLeft size={24} />
          <span className="font-bold text-sm tracking-wide">BACK</span>
        </motion.button>
      </main>

      <footer className="bg-surface-container-low py-10 border-t border-on-surface/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-on-surface-variant text-sm">© 2024 GrammarFlow. The Fluid Classroom.</p>
          <div className="flex gap-8 text-on-surface-variant text-sm">
            <a href="#" className="hover:text-secondary">Terms of Service</a>
            <a href="#" className="hover:text-secondary">Privacy Policy</a>
            <a href="#" className="hover:text-secondary">Contact Support</a>
            <a href="#" className="hover:text-secondary">Careers</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group ${
        active 
          ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm' 
          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
      }`}
    >
      <span className={`${active ? 'text-on-secondary-container' : 'text-on-surface-variant group-hover:text-secondary'} transition-colors`}>
        {icon}
      </span>
      <AnimatePresence mode="wait">
        {active && (
          <motion.span 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="overflow-hidden whitespace-nowrap text-sm"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function PlatformCard({ icon, iconBg, title, description, lessons, onClick }: { icon: ReactNode, iconBg: string, title: string, description: string, lessons: string, onClick?: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-white rounded-3xl p-8 shadow-xl shadow-on-surface/5 border border-on-surface/5 flex flex-col h-full group cursor-pointer"
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${iconBg}`}>
        {icon}
      </div>
      <h4 className="text-2xl font-bold text-on-surface mb-3">{title}</h4>
      <p className="text-on-surface-variant mb-8 flex-grow leading-relaxed text-sm">
        {description}
      </p>
      <div className="pt-6 border-t border-on-surface/5">
        <span className="text-secondary font-bold text-sm">{lessons}</span>
      </div>
    </motion.div>
  );
}

function MissionCard({ icon, title, description, className }: { icon: ReactNode, title: string, description: string, className?: string }) {
  return (
    <div className={`bg-white rounded-3xl p-8 shadow-xl shadow-on-surface/5 border border-on-surface/5 ${className}`}>
      <div className="mb-6">
        {icon}
      </div>
      <h4 className="text-2xl font-bold text-on-surface mb-3">{title}</h4>
      <p className="text-on-surface-variant leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function TeamCard({ image, name, role, bio }: { image: string, name: string, role: string, bio: string }) {
  return (
    <div className="flex flex-col">
      <div className="aspect-[3/4] rounded-3xl overflow-hidden mb-6 shadow-2xl">
        <img src={image} alt={name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
      </div>
      <h4 className="text-2xl font-bold text-on-surface mb-1">{name}</h4>
      <span className="text-secondary font-bold text-xs tracking-widest mb-4">{role}</span>
      <p className="text-on-surface-variant text-sm leading-relaxed">
        {bio}
      </p>
    </div>
  );
}
