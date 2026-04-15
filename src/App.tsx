import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from 'motion/react';
import { QuizBuilder, QuizPlayer } from './Quiz';
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
  Search,
  Plus,
  Trash2,
  Edit,
  LogOut,
  Upload,
  Link as LinkIcon,
  Save,
  X
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
  platform?: Platform;
  category?: string;
  videoUrl?: string;
  created_at?: string; // Preserve Supabase timestamp
}

const PLATFORM_LESSONS: Record<Platform, Lesson[]> = {
  YouTube: [],
  TikTok: [],
  Instagram: [],
  Facebook: []
};

const CATEGORY_COLORS: Record<string, string> = {
  'Grammar': 'from-indigo-600 to-purple-600',
  'Vocabulary': 'from-emerald-500 to-teal-600',
  'Pronunciation': 'from-amber-400 to-orange-500',
  'Writing': 'from-rose-500 to-pink-600',
  'General': 'from-slate-600 to-slate-800'
};

function LessonThumbnail({ lesson, index, className }: { lesson: Lesson, index?: number, className?: string }) {
  const colorClass = CATEGORY_COLORS[lesson.category || 'General'] || CATEGORY_COLORS['General'];
  const hasImage = lesson.thumbnail && !lesson.thumbnail.includes('placeholder') && !lesson.thumbnail.includes('picsum.photos');

  const PlatformLogo = () => {
    switch (lesson.platform) {
      case 'YouTube': return <PlayCircle size={32} fill="white" className="text-red-500" />;
      case 'TikTok': return <Zap size={32} fill="white" className="text-black" />;
      case 'Instagram': return <Instagram size={32} className="text-white" />;
      default: return <MonitorPlay size={32} className="text-white" />;
    }
  };

  if (hasImage) {
    return (
      <div className={`${className} bg-black flex items-center justify-center overflow-hidden`}>
        <img
          src={lesson.thumbnail}
          alt={lesson.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`${className} bg-gradient-to-br ${colorClass} flex flex-col items-center justify-center p-6 text-white overflow-hidden relative group-hover:scale-105 transition-transform duration-700`}>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl mb-4 shadow-xl border border-white/30">
        <PlatformLogo />
      </div>
      <div className="text-center z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 block mb-1">
          {lesson.platform} Lesson
        </span>
        <span className="text-2xl font-black">
          #{index !== undefined ? index + 1 : lesson.id.slice(-4)}
        </span>
      </div>
      {/* Decorative background element */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl opacity-50" />
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCreatorMode, setIsCreatorMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [localLessons, setLocalLessons] = useState<Lesson[]>([]);
  const [lessonsWithQuizzes, setLessonsWithQuizzes] = useState<Set<string>>(new Set());

  const homeRef = useRef<HTMLElement>(null);
  const lessonsRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Check for creator route
    if (window.location.pathname === '/creator') {
      setIsCreatorMode(true);
    }

    // Sync with Supabase
    const fetchLessonsAndQuizzes = async () => {
      const [lessonsRes, quizzesRes] = await Promise.all([
        supabase.from('lessons').select('*').order('id', { ascending: false }),
        supabase.from('quizzes').select('lesson_id')
      ]);

      if (lessonsRes.data) {
        setLocalLessons(lessonsRes.data);
      }
      if (quizzesRes.data) {
        setLessonsWithQuizzes(new Set(quizzesRes.data.map(q => q.lesson_id)));
      }
    };

    fetchLessonsAndQuizzes();

    const handleScroll = () => {
      if (isCreatorMode) return;
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
  }, [isCreatorMode]);

  const saveLessons = async (updated: Lesson[]) => {
    setLocalLessons(updated);
    const { error } = await supabase.from('lessons').upsert(updated);
    if (error) console.error('Error saving lessons:', error);
  };

  const syncQuizStatus = async () => {
    const { data } = await supabase.from('quizzes').select('lesson_id');
    if (data) setLessonsWithQuizzes(new Set(data.map(q => q.lesson_id)));
  };

  const deleteLesson = async (id: string) => {
    const updated = localLessons.filter(l => l.id !== id);
    setLocalLessons(updated);

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting lesson from Supabase:', error);
    }
  };

  const getMergedLessons = (platform: Platform) => {
    const hardcoded = PLATFORM_LESSONS[platform] || [];
    const local = localLessons.filter(l => l.platform === platform);
    return [...local, ...hardcoded];
  };

  const scrollTo = (section: Section) => {
    if (isCreatorMode) {
      window.location.pathname = '/';
      return;
    }
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

  if (isCreatorMode) {
    if (!isLoggedIn) {
      return <CreatorLogin onLogin={() => setIsLoggedIn(true)} />;
    }
    return (
      <CreatorDashboard
        lessons={localLessons}
        onSave={saveLessons}
        onDelete={deleteLesson}
        hasQuizIds={lessonsWithQuizzes}
        onQuizSaved={syncQuizStatus}
        onLogout={() => {
          setIsLoggedIn(false);
          setIsCreatorMode(false);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  if (selectedPlatform) {
    return (
      <PlatformLessonsView
        platform={selectedPlatform}
        lessons={getMergedLessons(selectedPlatform)}
        hasQuizIds={lessonsWithQuizzes}
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

function PlatformLessonsView({ platform, lessons, hasQuizIds, onBack, onNav, activeSection }: { platform: Platform, lessons: Lesson[], hasQuizIds: Set<string>, onBack: () => void, onNav: (s: Section) => void, activeSection: Section }) {
  const [activeVideo, setActiveVideo] = useState<Lesson | null>(null);
  const [quizLesson, setQuizLesson] = useState<Lesson | null>(null);

  const getEmbedUrl = (url?: string) => {
    if (!url) return null;

    // YouTube (including Shorts)
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // Handle Shorts
      if (url.includes('/shorts/')) {
        const videoId = url.split('/shorts/')[1]?.split(/[?#]/)[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }

      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
    }

    // Facebook
    if (url.includes('facebook.com')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560`;
    }

    // Instagram (Reels/Posts)
    if (url.includes('instagram.com')) {
      // Instagram embeds usually need /embed at the end
      const cleanUrl = url.split(/[?#]/)[0];
      return `${cleanUrl.endsWith('/') ? cleanUrl : cleanUrl + '/'}embed`;
    }

    // TikTok
    if (url.includes('tiktok.com')) {
      const videoIdMatch = url.match(/\/video\/(\d+)/);
      if (videoIdMatch && videoIdMatch[1]) {
        return `https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`;
      }
      return url;
    }

    return url;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (() => {
          const isVertical = activeVideo.platform === 'TikTok' ||
            activeVideo.platform === 'Instagram' ||
            activeVideo.videoUrl?.includes('/shorts/');

          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveVideo(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`bg-white w-full h-full ${isVertical ? 'md:max-w-4xl md:h-[85vh]' : 'md:max-w-5xl md:h-auto'} md:rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col`}
              >
                <div className="p-6 border-b border-on-surface/5 flex justify-between items-center bg-white shrink-0">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">{activeVideo.title}</h3>
                    <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest mt-1">{activeVideo.platform} • {activeVideo.category || 'Lesson'}</p>
                  </div>
                  <button
                    onClick={() => setActiveVideo(null)}
                    className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className={`flex-grow flex flex-col md:flex-row overflow-hidden ${isVertical ? '' : 'flex-col'}`}>
                  {/* Video Section */}
                  <div className={`${isVertical ? 'md:w-[45%] h-[60%] md:h-full' : 'aspect-video w-full'} bg-black relative shrink-0`}>
                    {activeVideo.videoUrl ? (
                      <iframe
                        src={getEmbedUrl(activeVideo.videoUrl) || ''}
                        className="w-full h-full border-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={activeVideo.title}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 p-10 text-center">
                        <MonitorPlay size={64} className="mb-4 opacity-20" />
                        <p className="text-xl font-bold">No Video URL Provided</p>
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="p-8 bg-surface-container-low flex-grow overflow-y-auto flex flex-col">
                    <div className="flex-grow">
                      <h4 className="font-bold text-on-surface mb-4">Lesson Overview</h4>
                      <p className="text-on-surface-variant leading-relaxed">
                        {activeVideo.description}
                      </p>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => { setActiveVideo(null); setQuizLesson(activeVideo); }}
                        className="flex-grow bg-secondary text-white py-4 px-6 rounded-2xl font-bold hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                      >
                        <Zap size={20} />
                        Take Lesson Quiz
                      </button>
                      <button
                        onClick={() => setActiveVideo(null)}
                        className="px-8 bg-white text-on-surface-variant py-4 rounded-2xl font-bold hover:bg-on-surface/5 transition-all border border-on-surface/5"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Quiz Player */}
      <AnimatePresence>
        {quizLesson && (
          <QuizPlayer
            lessonId={quizLesson.id}
            lessonTitle={quizLesson.title}
            onClose={() => setQuizLesson(null)}
          />
        )}
      </AnimatePresence>
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
                <div
                  className="relative aspect-video overflow-hidden cursor-pointer"
                  onClick={() => setActiveVideo(lesson)}
                >
                  <LessonThumbnail
                    lesson={lesson}
                    index={idx}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-secondary shadow-xl">
                      <PlayCircle size={32} fill="currentColor" className="text-white" />
                      <PlayCircle size={32} className="absolute text-secondary" />
                    </div>
                  </div>

                  {/* Quiz Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 z-20 ${hasQuizIds.has(lesson.id)
                    ? 'bg-amber-400 text-amber-950 shadow-lg shadow-amber-400/20'
                    : 'bg-black/40 backdrop-blur-md text-white/70'
                    }`}>
                    <Zap size={10} fill={hasQuizIds.has(lesson.id) ? "currentColor" : "none"} />
                    {hasQuizIds.has(lesson.id) ? 'Quiz Ready' : 'Video Lesson'}
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
                  <button
                    onClick={(e) => { e.stopPropagation(); setQuizLesson(lesson); }}
                    className="w-full bg-secondary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20"
                  >
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
      className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group ${active
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

// --- Creator Components ---

function CreatorLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'creator123') {
      onLogin();
    } else {
      setError('Invalid credentials. Try admin / creator123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-on-surface/5"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="text-secondary" size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-on-surface">Creator Hub</h2>
          <p className="text-on-surface-variant text-sm mt-2">Sign in to manage your lessons</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-on-surface mb-2 ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-on-surface mb-2 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20"
          >
            Enter Dashboard
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// Extracts a thumbnail URL from a given video URL
function getThumbnailFromUrl(url: string): string | null {
  if (!url) return null;

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    // Shorts
    if (url.includes('/shorts/')) {
      const videoId = url.split('/shorts/')[1]?.split(/[?#]/)[0];
      if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    // Standard watch URL
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }

  return null;
}

function CreatorDashboard({ lessons, onSave, onDelete, hasQuizIds, onQuizSaved, onLogout }: { lessons: Lesson[], onSave: (l: Lesson[]) => void, onDelete: (id: string) => void, hasQuizIds: Set<string>, onQuizSaved: () => void, onLogout: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [quizLessonId, setQuizLessonId] = useState<{ id: string; title: string } | null>(null);
  const [formData, setFormData] = useState<Partial<Lesson>>({
    title: '',
    description: '',
    platform: 'YouTube',
    category: 'Grammar',
    thumbnail: '',
    videoUrl: ''
  });

  const handleVideoUrlChange = async (url: string) => {
    const autoThumb = getThumbnailFromUrl(url);
    setFormData(prev => ({
      ...prev,
      videoUrl: url,
      // Only auto-fill if user hasn't manually set a thumbnail
      thumbnail: autoThumb || prev.thumbnail || ''
    }));

    // For TikTok, fetch from oEmbed API
    if (url.includes('tiktok.com') && url.length > 20) {
      try {
        const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.thumbnail_url) {
            setFormData(prev => ({ ...prev, thumbnail: data.thumbnail_url }));
          }
        }
      } catch (e) {
        console.warn('TikTok thumbnail fetch failed:', e);
      }
    }
  };

  // Resolve the active thumbnail to show in the preview
  const previewThumbnail = formData.thumbnail ||
    getThumbnailFromUrl(formData.videoUrl || '') ||
    null;

  const handleAdd = () => {
    const autoThumb = getThumbnailFromUrl(formData.videoUrl || '');

    // Find the original lesson if editing to preserve metadata (like created_at)
    const existingLesson = editingId ? lessons.find(l => l.id === editingId) : {};

    const newLesson: Lesson = {
      ...existingLesson, // Preserve all hidden metadata fields from Supabase
      id: editingId || Date.now().toString(),
      title: formData.title || 'Untitled Lesson',
      description: formData.description || '',
      platform: (formData.platform as Platform) || 'YouTube',
      category: formData.category || 'General',
      thumbnail: formData.thumbnail || autoThumb || `https://picsum.photos/seed/${Date.now()}/1200/600`,
      videoUrl: formData.videoUrl || '',
      tag: (existingLesson as any)?.tag || 'NEW'
    };

    if (editingId) {
      onSave(lessons.map(l => l.id === editingId ? newLesson : l));
    } else {
      onSave([newLesson, ...lessons]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', platform: 'YouTube', category: 'Grammar', thumbnail: '', videoUrl: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (lesson: Lesson) => {
    setFormData(lesson);
    setEditingId(lesson.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      onDelete(id);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col">
      <header className="bg-white border-b border-on-surface/5 py-4 px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <BookOpen className="text-secondary w-8 h-8" />
          <h1 className="text-xl font-extrabold text-on-surface tracking-tight">Creator Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAdding(true)}
            className="bg-secondary text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20"
          >
            <Plus size={18} />
            Add Content
          </button>
          <button
            onClick={onLogout}
            className="text-on-surface-variant hover:text-red-500 transition-colors p-2"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-grow p-8 max-w-6xl mx-auto w-full">
        <div className="mb-10">
          <h2 className="text-3xl font-black text-on-surface mb-2">My Content</h2>
          <p className="text-on-surface-variant">Manage your fluid grammar lessons across all platforms.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {lessons.map((lesson) => (
              <motion.div
                key={lesson.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl overflow-hidden shadow-xl border border-on-surface/5 group"
              >
                <div className="aspect-video relative overflow-hidden">
                  <LessonThumbnail
                    lesson={lesson}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                    {lesson.platform}
                  </div>

                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 ${hasQuizIds.has(lesson.id)
                    ? 'bg-amber-400 text-amber-950 shadow-lg shadow-amber-400/20'
                    : 'bg-black/40 backdrop-blur-md text-white/50'
                    }`}>
                    <Zap size={10} fill={hasQuizIds.has(lesson.id) ? "currentColor" : "none"} />
                    {hasQuizIds.has(lesson.id) ? 'Active' : 'Missing Quiz'}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-on-surface mb-2 line-clamp-1">{lesson.title}</h3>
                  <p className="text-on-surface-variant text-sm mb-6 line-clamp-2">{lesson.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-on-surface/5">
                    <span className="text-xs font-bold text-secondary uppercase tracking-widest">{lesson.category}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setQuizLessonId({ id: lesson.id, title: lesson.title })}
                        className="p-2 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-tertiary-container hover:text-on-tertiary-container transition-all"
                        title="Edit Quiz"
                      >
                        <Zap size={16} />
                      </button>
                      <button
                        onClick={() => startEdit(lesson)}
                        className="p-2 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-secondary hover:text-white transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        className="p-2 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {lessons.length === 0 && !isAdding && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-on-surface-variant opacity-50">
              <PlayCircle size={64} className="mb-4" />
              <p className="text-xl font-bold">No content yet. Click "Add Content" to start.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-on-surface/5 flex justify-between items-center">
                <h3 className="text-2xl font-black text-on-surface">{editingId ? 'Edit Lesson' : 'Add New Lesson'}</h3>
                <button onClick={resetForm} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-on-surface mb-2">Lesson Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all"
                      placeholder="e.g. Mastering the Present Perfect"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-2">Platform</label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value as Platform })}
                      className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all appearance-none"
                    >
                      <option value="YouTube">YouTube</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-2">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all"
                      placeholder="e.g. Grammar, Vocabulary"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-on-surface mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all h-32 resize-none"
                      placeholder="Describe the lesson content..."
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-on-surface mb-2">Video Link / Embed URL</label>
                    <div className="flex gap-3">
                      <div className="flex-grow relative">
                        <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                        <input
                          type="text"
                          value={formData.videoUrl}
                          onChange={(e) => handleVideoUrlChange(e.target.value)}
                          className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-14 pr-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all"
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                    </div>
                    {/* Live Thumbnail Preview */}
                    {previewThumbnail ? (
                      <div className="mt-4 relative rounded-2xl overflow-hidden aspect-video bg-surface-container-low">
                        <img
                          src={previewThumbnail}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full">PREVIEW</div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-on-surface-variant mt-2 ml-2 italic">Paste a YouTube URL to auto-generate the thumbnail.</p>
                    )}
                  </div>

                  {/* Manual thumbnail override */}
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-on-surface mb-2">Custom Thumbnail URL <span className="font-normal text-on-surface-variant">(optional override)</span></label>
                    <input
                      type="text"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-on-surface/5 flex gap-4">
                <button
                  onClick={resetForm}
                  className="flex-1 bg-surface-container-low text-on-surface-variant py-4 rounded-2xl font-bold hover:bg-on-surface/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {editingId ? 'Update Lesson' : 'Publish Lesson'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quiz Builder */}
      <AnimatePresence>
        {quizLessonId && (
          <QuizBuilder
            lessonId={quizLessonId.id}
            lessonTitle={quizLessonId.title}
            onClose={() => { setQuizLessonId(null); onQuizSaved(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
