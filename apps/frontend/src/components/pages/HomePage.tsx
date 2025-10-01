import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "@/components/models/PulseModel";
import {
  BookOpen,
  Brain,
  FileText,
  Users,
  Award,
  ChevronRight,
  Star,
  Play,
} from "lucide-react";
import { getUserInfo, setUserInfo } from "@/lib/auth";
import type { ApiError } from "@/types/api";
import { Route } from "@/routes";
import { useNavigate } from "@tanstack/react-router";

const productFeatures = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI Question Generator",
    description:
      "Generate contextual questions from any topic using advanced AI algorithms",
    highlight: "10,000+ Questions Generated Daily",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Smart Notes",
    description:
      "Create organized, searchable notes with automatic formatting and categorization",
    highlight: "Auto-categorized & Searchable",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Study Materials",
    description:
      "Transform your content into comprehensive study guides and flashcards",
    highlight: "Multiple Format Export",
    color: "from-green-500 to-teal-500",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Progress Analytics",
    description:
      "Track your learning journey with detailed analytics and insights",
    highlight: "Real-time Performance Data",
    color: "from-orange-500 to-red-500",
  },
];

const testimonials = [
  {
    name: "Atul Miya",
    role: "Medical Student",
    text: "Doclin helped me create 500+ practice questions for my finals!",
    rating: 5,
    avatar: "SC",
  },
  {
    name: "Tinku Jiya",
    role: "Engineering Student",
    text: "The AI-generated notes are incredibly accurate and well-structured.",
    rating: 5,
    avatar: "AK",
  },
  {
    name: "Ladki BAJIGAR",
    role: "Teacher",
    text: "Perfect for creating diverse question sets for my students.",
    rating: 5,
    avatar: "MR",
  },
];

const useCases = [
  {
    title: "Students",
    description:
      "Generate practice questions, create study notes, and track your learning progress",
    icon: <Users className="w-8 h-8" />,
    benefits: ["Practice Questions", "Study Guides", "Progress Tracking"],
  },
  {
    title: "Teachers",
    description:
      "Create comprehensive question banks and study materials for your classes",
    icon: <BookOpen className="w-8 h-8" />,
    benefits: ["Question Banks", "Curriculum Materials", "Assessment Tools"],
  },
  {
    title: "Professionals",
    description:
      "Prepare for certifications and continuing education with AI-powered tools",
    icon: <Award className="w-8 h-8" />,
    benefits: ["Certification Prep", "Skill Assessment", "Knowledge Gaps"],
  },
];

const features = [
  "AI-Generated Questions",
  "Smart Note Taking",
  "Study Material Creation",
  "Progress Tracking",
];

function HomePage() {
  const { oauth } = Route.useSearch();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [stats, setStats] = useState({ users: 0, questions: 0, notes: 0 });

  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);

    // Typewriter effect
    const text = "Your one stop for QUESTIONS, NOTES and STUDY MATERIAL";
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setTypewriterText(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    // Feature rotation
    const featureTimer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    // Stats animation
    const statsTimer = setTimeout(() => {
      setStats({ users: 25000, questions: 500000, notes: 150000 });
    }, 1500);

    return () => {
      clearInterval(timer);
      clearInterval(featureTimer);
      clearTimeout(statsTimer);
    };
  }, []);

  useEffect(() => {
    if (!oauth || getUserInfo()) return;
    const fetchUser = async () => {
      try {
        const url = `${import.meta.env.VITE_API_BASE_URL}/auth/me`;
        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          const error: ApiError = {
            message: `Request failed with status ${response.status}`,
            status: response.status,
          };

          try {
            error.details = await response.json();
          } catch {
            console.error("Failed to parse error details");
          }
          throw error;
        }

        const data = await response.json();
        console.log("OAuth user data:", data);
        setUserInfo({
          email: data.data.email,
          role: data.data.role,
          username: data.data.username,
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, [oauth]);

  const AnimatedCounter: React.FC<{
    end: number;
    duration?: number;
    suffix?: string;
  }> = ({ end, duration = 2000, suffix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (end === 0) return;
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, [end, duration]);

    return (
      <span>
        {count.toLocaleString()}
        {suffix}
      </span>
    );
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden mt-24">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-bounce"
          style={{ animationDuration: "6s" }}
        ></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-bounce"
          style={{ animationDuration: "8s", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-40 left-40 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-bounce"
          style={{ animationDuration: "10s", animationDelay: "4s" }}
        ></div>
      </div>

      {/****************************** Foreground: Enhanced Content ******************************/}
      <div className="relative z-10 w-full pointer-events-auto">
        {/* Hero Section */}
        <div className="flex flex-col justify-center items-center lg:items-start p-6 sm:p-8 md:p-12 lg:p-16 xl:p-24 text-center lg:text-left min-h-screen">
          <div className="max-w-4xl lg:max-w-2xl xl:max-w-4xl mx-auto lg:mx-0">
            {/***************************** Background: 3D MODEL ************************* */}
            <div className="absolute left-[400px] top-[-200px] inset-0 w-full h-[40%] ">
              <Canvas
                // className="w-full  h-full"
                style={{ pointerEvents: "none", width: "100%", height: "100%" }}
              >
                <Suspense fallback={null}>
                  <Scene />
                </Suspense>
              </Canvas>
            </div>

            {/* **************************************** TITLE ****************************************** */}

            <h1
              className={`text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-8xl font-black text-white mb-4 sm:mb-6 leading-tight tracking-tighter transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "0.2s" }}
            >
              <span className="block bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-xl animate-pulse">
                DOCLIN NOTE
              </span>
              <span className="block text-white drop-shadow-xl">GENERATOR</span>
            </h1>

            <div className="mb-8 h-16">
              <p
                className={`text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-sm sm:max-w-md lg:max-w-xl mx-auto lg:mx-0 leading-relaxed font-light drop-shadow-md transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: "0.4s" }}
              >
                {typewriterText}
                <span className="animate-pulse text-blue-400">|</span>
              </p>
            </div>

            <div className="mb-8">
              <p
                className={`text-blue-300 text-lg font-semibold mb-4 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: "0.6s" }}
              >
                Currently featuring:{" "}
                <span className="text-white animate-pulse">
                  {features[currentFeature]}
                </span>
              </p>
            </div>

            <div
              className={`flex flex-row xs:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "0.8s" }}
            >
              <button
                onClick={() => {
                  navigate({ to: "/config" });
                }}
                className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl text-sm sm:text-base transform hover:scale-105 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-2"
              >
                <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                Generate Questions
              </button>
              <button
                onClick={() => {
                  navigate({ to: "/about" });
                }}
                className="group px-6 sm:px-8 py-3 sm:py-4 bg-white/10 text-white font-semibold rounded-xl text-sm sm:text-base transform hover:scale-105 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm border border-white/10 shadow-lg flex items-center gap-2"
              >
                Learn About us
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div
              className={`grid grid-cols-3 gap-6 mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "1s" }}
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                  <AnimatedCounter end={stats.users} suffix="+" />
                </div>
                <div className="text-white/60 text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-400">
                  <AnimatedCounter end={stats.questions} suffix="+" />
                </div>
                <div className="text-white/60 text-sm">Questions Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-pink-400">
                  <AnimatedCounter end={stats.notes} suffix="+" />
                </div>
                <div className="text-white/60 text-sm">Notes Created</div>
              </div>
            </div>
          </div>
        </div>

        {/* **************************************************Feature***************************************** */}
        <div className="px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-16 bg-black/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Powerful Features for{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Every Learner
                </span>
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Discover how Doclin transforms the way you study, create, and
                learn with cutting-edge AI technology
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {productFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 mb-4 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="text-xs text-blue-300 font-semibold bg-blue-500/10 px-3 py-1 rounded-full inline-block">
                    {feature.highlight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* **************************************** User base ****************************************** */}
        <div className="px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Perfect for{" "}
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Everyone
                </span>
              </h2>
              <p className="text-xl text-white/70">
                Whether you're a student, teacher, or professional, Doclin
                adapts to your learning needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-blue-400 mb-6">{useCase.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {useCase.title}
                  </h3>
                  <p className="text-white/70 mb-6">{useCase.description}</p>
                  <ul className="space-y-2">
                    {useCase.benefits.map((benefit, benefitIndex) => (
                      <li
                        key={benefitIndex}
                        className="flex items-center text-white/60"
                      >
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* **************************************** Testimonials *********************************** */}
        <div className="px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-16 bg-black/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                What Our{" "}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Users Say
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        {testimonial.name}
                      </div>
                      <div className="text-white/60 text-sm">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-white/80 italic">"{testimonial.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
