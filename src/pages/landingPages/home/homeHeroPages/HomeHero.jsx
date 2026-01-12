import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowRight, Sparkles, Check, Users, UserCheck, School, Brain, Presentation, GraduationCap } from 'lucide-react';
import heroVideo from '../../../../assets/video/homehero.mp4';
import studentImg from '../../../../assets/images/student_ai_tutor.png';
import teacherImg from '../../../../assets/images/teacher_analytics.png';
import parentImg from '../../../../assets/images/parents_informed.png';
import schoolImg from '../../../../assets/images/school_management.png';
import NavigationPills from './NavigationPills';

const CanvaHero = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Try It Now');
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);

    // Typewriter State
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    const fullText = "Learning";

    const contentData = {
        'Try It Now': {
            color: 'from-[#00c4cc] to-[#6366f1]',
            hero: {
                badge: 'ALL-IN-ONE PLATFORM',
                title: 'Complete Learning Ecosystem',
                description: 'Experience the power of EduCollaborate across all domains. From AI tutoring for students to advanced analytics for schools, we provide a unified solution for modern education.',
                image: parentImg, // Reusing best general asset
                icon: <Sparkles size={18} />
            },
            features: [
                { title: 'Unified Dashboard', desc: 'Control every aspect of learning from a single interface', icon: <School size={20} /> },
                { title: 'Global AI Synergy', desc: 'Seamless communication between tutors, teachers, and parents', icon: <Users size={20} /> },
                { title: 'Holistic Analytics', desc: 'Comprehensive data-driven insights at every level', icon: <Check size={20} /> }
            ],
            deepDive: {
                title: 'The Future of Education',
                description: 'Our platform bridges the gap between technology and traditional learning, creating a synergistic environment where everyone thrives.',
                image: teacherImg,
                features: ['AI-Driven Curriculum', 'Cross-Persona Collaboration', 'Security-First Infrastructure']
            }
        },
        'Students': {
            color: 'from-[#00c4cc] to-[#34d399]',
            hero: {
                badge: 'STUDENTS',
                title: 'AI-Powered Socratic Tutor',
                description: 'Students engage with an intelligent AI tutor that uses the Socratic method—teaching through thoughtful questions rather than direct answers. This approach fosters critical thinking.',
                image: studentImg,
                icon: <GraduationCap size={18} />
            },
            features: [
                { title: 'Adaptive Quizzes', desc: 'Real-time difficulty adjustment based on performance', icon: <Sparkles size={20} /> },
                { title: 'Gamified Progress', desc: 'Earn badges and points for consistency and mastery', icon: <Check size={20} /> },
                { title: 'Subject Mastery', desc: 'Guided pathways through complex NCERT topics', icon: <GraduationCap size={20} /> }
            ],
            deepDive: {
                title: 'Interactive Visualizations',
                description: 'Complex concepts in Science and Math come to life with interactive AI-driven 3D models and step-by-step visual breakdowns.',
                image: studentImg, // Reusing student image due to quota
                features: ['3D Anatomy Models', 'Physics Simulations', 'Geometric Visualizers']
            }
        },
        'Teachers': {
            color: 'from-[#6366f1] to-[#8b5cf6]',
            hero: {
                badge: 'TEACHERS',
                title: 'Smart Insights & Analytics',
                description: 'Get AI-powered insights on homework and assignments. Access detailed logs of student-AI tutor interactions to understand learning patterns.',
                image: teacherImg,
                icon: <Users size={18} />
            },
            features: [
                { title: 'Automated Grading', desc: 'Safe context-aware AI grading for subjective answers', icon: <Check size={20} /> },
                { title: 'Lesson Planner', desc: 'Generate NCERT-aligned plans in seconds', icon: <Sparkles size={20} /> },
                { title: 'Intervention Alerts', desc: 'Early warning system for struggling students', icon: <Users size={20} /> }
            ],
            deepDive: {
                title: 'Classroom Group Dynamics',
                description: 'Visualize how your entire class is progressing. Identify trends across different sections and adjust your teaching modules instantly.',
                image: teacherImg,
                features: ['Class Progress Charts', 'Individual Log Reviews', 'Resource Recommendations']
            }
        },
        'Parents': {
            color: 'from-[#f59e0b] to-[#ef4444]',
            hero: {
                badge: 'PARENTS',
                title: 'Stay Connected & Informed',
                description: 'Monitor curriculum progress, view homework and assessments, and access AI tutor interaction logs for complete transparency.',
                image: parentImg,
                icon: <UserCheck size={18} />
            },
            features: [
                { title: 'Real-time Logs', desc: 'See exactly what the AI tutor says to your child', icon: <UserCheck size={20} /> },
                { title: 'Approval Center', desc: 'Manage and approve platform activities and requests', icon: <Check size={20} /> },
                { title: 'Weekly Reports', desc: 'Deep dives into growth and areas of improvement', icon: <Sparkles size={20} /> }
            ],
            deepDive: {
                title: 'Parent-Teacher Hub',
                description: 'A direct line of communication with educators, backed by AI-summarized insights from your child\'s learning journey.',
                image: parentImg,
                features: ['Direct Messaging', 'Summarized Progress', 'Shared Goal Setting']
            }
        },
        'Schools': {
            color: 'from-[#10b981] to-[#3b82f6]',
            hero: {
                badge: 'SCHOOLS',
                title: 'Institutional Growth',
                description: 'Equip your school with cutting-edge AI infrastructure. Manage multiple classrooms and track educator performance at scale.',
                image: schoolImg,
                icon: <School size={18} />
            },
            features: [
                { title: 'Central Dashboard', desc: 'Monitor all school activities and metrics in one place', icon: <School size={20} /> },
                { title: 'Educator Support', desc: 'AI tools to enhance teacher efficiency and training', icon: <Users size={20} /> },
                { title: 'Curriculum Ops', desc: 'Seamlessly align institutional goals with NCERT', icon: <Check size={20} /> }
            ],
            deepDive: {
                title: 'Future-ready Infrastructure',
                description: 'Scale AI across your entire institution with robust security, privacy, and centralized management tools.',
                image: schoolImg,
                features: ['Security & Privacy', 'Scalable AI Units', 'Institutional Reporting']
            }
        },
        'AI': {
            color: 'from-[#8b5cf6] to-[#ec4899]',
            hero: {
                badge: 'AI TECHNOLOGY',
                title: 'Intelligent Learning Engine',
                description: 'Powered by advanced machine learning algorithms, our AI adapts to each student\'s learning style, providing personalized guidance and real-time feedback for optimal educational outcomes.',
                image: studentImg,
                icon: <Brain size={18} />
            },
            features: [
                { title: 'Adaptive Learning', desc: 'AI that adjusts difficulty and pace based on individual performance', icon: <Brain size={20} /> },
                { title: 'Natural Language Processing', desc: 'Conversational AI that understands context and provides meaningful responses', icon: <Sparkles size={20} /> },
                { title: 'Predictive Analytics', desc: 'Identify learning gaps and predict student needs before they struggle', icon: <Check size={20} /> }
            ],
            deepDive: {
                title: 'Next-Generation AI Capabilities',
                description: 'Our AI engine continuously learns and evolves, using deep learning models trained on educational data to provide the most effective tutoring experience.',
                image: teacherImg,
                features: ['Deep Learning Models', 'Real-time Adaptation', 'Context-Aware Responses']
            }
        },
        'Presentation': {
            color: 'from-[#f59e0b] to-[#f97316]',
            hero: {
                badge: 'PRESENTATION TOOLS',
                title: 'Interactive Content Creation',
                description: 'Create engaging presentations, interactive slides, and visual learning materials that captivate students and enhance comprehension through multimedia experiences.',
                image: parentImg,
                icon: <Presentation size={18} />
            },
            features: [
                { title: 'Interactive Slides', desc: 'Build dynamic presentations with embedded quizzes and animations', icon: <Presentation size={20} /> },
                { title: 'Visual Learning Aids', desc: 'Create diagrams, charts, and infographics to simplify complex concepts', icon: <Sparkles size={20} /> },
                { title: 'Collaborative Editing', desc: 'Work together with students and teachers in real-time on presentations', icon: <Users size={20} /> }
            ],
            deepDive: {
                title: 'Engaging Visual Experiences',
                description: 'Transform traditional lessons into immersive presentations with interactive elements, multimedia integration, and student engagement tools.',
                image: schoolImg,
                features: ['Multimedia Integration', 'Interactive Elements', 'Student Engagement Tools']
            }
        }
    };

    React.useEffect(() => {
        const handleType = () => {
            const shouldDelete = isDeleting;

            setText(prev => {
                if (shouldDelete) {
                    return fullText.substring(0, prev.length - 1);
                } else {
                    return fullText.substring(0, prev.length + 1);
                }
            });

            setTypingSpeed(shouldDelete ? 100 : 150);

            if (!shouldDelete && text === fullText) {
                setTimeout(() => setIsDeleting(true), 1500);
            } else if (shouldDelete && text === '') {
                setIsDeleting(false);
                setLoopNum(prev => prev + 1);
            }
        };

        const timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, typingSpeed]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="w-full bg-white overflow-hidden">
            {/* Top Section with Rainbow Gradient */}
            <div className="bg-gradient-to-b from-[#6749ff] via-[#7B72E8]  via-[#6749ff] to-white pb-10">
                {/* Hero Section */}
                <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-20 pb-20">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full">
                                <Sparkles className="w-5 h-5" />
                                <span className="text-[12px] font-semibold">AI-Powered NCERT Learning Platform</span>
                            </div>

                            {/* Main Heading */}
                            <div className="space-y-2">
                                <h1 className="text-[#ffffff] text-[40px] lg:text-[50px] xl:text-[60px] font-bold leading-[1.05] tracking-tight">
                                    Transform
                                </h1>
                                <h1 className="text-[#ffffff] text-[40px] lg:text-[50px] xl:text-[60px] font-bold leading-[1.05] tracking-tight">
                                    Education with
                                </h1>
                                <h1 className="text-[#ffffff] text-[32px] lg:text-[42px] xl:text-[52px] font-bold leading-[1.05] tracking-tight flex flex-nowrap items-baseline gap-[0.3em] overflow-visible">
                                    <span className="flex items-center gap-[0.15em] whitespace-nowrap">
                                        {"Intelligent".split('').map((char, index) => (
                                            <span
                                                key={index}
                                                className="inline-block"

                                            >
                                                {char}
                                            </span>
                                        ))}
                                    </span>
                                    <span className="text-[#ffbf00] whitespace-nowrap inline-flex items-baseline gap-[0.15em]">
                                        {text.split('').map((char, index) => ( 
                                            <span
                                                key={index}
                                                className="inline-block"

                                            >
                                                {char}
                                            </span>
                                        ))}
                                        <span className="inline-block border-r-4 border-[#0066ff] h-[0.8em] ml-1 self-center animate-pulse-cursor" />
                                    </span>
                                </h1>
                            </div>

                            {/* Subheading */}
                            <p className=" text-[18px] lg:text-[20px] font-normal leading-relaxed max-w-[600px]">
                                Personalized AI tutoring, interactive quizzes, and comprehensive progress tracking designed for the Indian education system.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap items-center gap-4">
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="flex items-center gap-2 bg-[#0066ff] hover:bg-[#0052cc] text-white px-8 py-4 rounded-xl text-[17px] font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
                                >
                                    Start Learning Free
                                    <ArrowRight className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={() => navigate('/demo')}
                                    className="flex items-center gap-3 bg-white hover:bg-gray-50 text-[#1a1f36] px-8 py-4 rounded-xl text-[17px] font-semibold border-2 border-gray-200 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                                >
                                    <Play className="w-5 h-5" />
                                    Watch Demo
                                </button>
                            </div>
                        </div>

                        {/* Right Content - Video Card */}
                        <div className="relative xl:lg-12">
                            <div className="relative rounded-[28px] overflow-hidden shadow-2xl">
                                {/* Canva Logo Overlay */}
                                <div className="absolute top-5 left-6 z-10">
                                    <span
                                        className="text-white text-[38px] font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                                        style={{ fontFamily: "'Pacifico', cursive" }}
                                    >
                                        EduCollaborate
                                    </span>
                                </div>

                                {/* Subject Tags Overlay - Matching Image Style */}
                                <style>{`
                                    .subject-tags-wrapper {
                                        display: flex;
                                        flex-direction: column;
                                        align-items: flex-start;
                                        gap: 4px;
                                    }
                                    .orange-tag {
                                        background: #ff6b35;
                                        color: white;
                                        padding: 6px 14px;
                                        font-weight: bold;
                                        font-size: 13px;
                                        border-radius: 20px;
                                        white-space: nowrap;
                                        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                                    }
                                    .tag-pointer {
                                        width: 0;
                                        height: 0;
                                        border-left: 6px solid transparent;
                                        border-right: 6px solid transparent;
                                        border-top: 6px solid #ff6b35;
                                        margin-left: 8px;
                                    }
                                    .white-tags-stack {
                                        display: flex;
                                        flex-direction: column;
                                        gap: 0;
                                        margin-left: 0;
                                    }
                                    .white-tag-box {
                                        background: white;
                                        color: black;
                                        padding: 10px 18px;
                                        font-weight: bold;
                                        font-size: 14px;
                                        border-radius: 20px;
                                        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                                        white-space: nowrap;
                                    }
                                    .white-tag-box-middle {
                                        background: white;
                                        color: black;
                                        padding: 10px 18px;
                                        font-weight: bold;
                                        font-size: 14px;
                                        border-radius: 20px;
                                        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                                        white-space: nowrap;
                                        margin-top: 4px;
                                    }
                                `}</style>
                                
                                {/* Subject Tags - Left Side */}
                                <div className="absolute bottom-[100px] left-6 z-10">
                                    <div className="subject-tags-wrapper">
                                        <div className="orange-tag">Subjects</div>
                                        <div className="tag-pointer"></div>
                                        <div className="white-tags-stack">
                                            <div className="white-tag-box">Mathematics</div>
                                            <div className="white-tag-box-middle">Science</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Video Container */}
                                <div className="relative aspect-[16/9] bg-black overflow-hidden group">
                                    {/* Video Element */}
                                    <video
                                        ref={videoRef}
                                        src={heroVideo}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                    >
                                        Your browser does not support the video tag.
                                    </video>

                                    {/* Gradient Overlay for better text visibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none"></div>

                                    {/* Play/Pause Button */}
                                    <button
                                        onClick={togglePlay}
                                        className="absolute bottom-7 right-7 w-14 h-14 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md shadow-xl group z-20"
                                        aria-label={isPlaying ? 'Pause video' : 'Play video'}
                                    >
                                        {isPlaying ? (
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-5 bg-white rounded-sm"></div>
                                                <div className="w-1.5 h-5 bg-white rounded-sm"></div>
                                            </div>
                                        ) : (
                                            <Play className="w-7 h-7 text-white ml-1 group-hover:scale-110 transition-transform" fill="white" />
                                        )}
                                    </button>

                                    {/* Subtle shimmer effect on hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-shimmer"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Navigation Pills Component */}
                <NavigationPills 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    contentData={contentData} 
                />
            </div>

            {/* Content Section (Now on White) */}
            <section className="w-full bg-white">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">

                    {/* Dynamic Feature Content */}
                    <div className="relative">
                        {Object.entries(contentData).map(([key, data]) => (
                            activeTab === key && (
                                <div
                                    key={key}
                                    className="animate-fadeIn"
                                >
                                    <div className="space-y-16">
                                        {/* Module 1: Hero Split */}
                                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                                            <div className="space-y-6">
                                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-full text-xs font-bold tracking-wider uppercase border border-gray-200/50 shadow-sm">
                                                    {data.hero.icon}
                                                    <span>{data.hero.badge}</span>
                                                </div>
                                                <h3 className="text-[42px] lg:text-[56px] xl:text-[60px] font-black text-gray-900 leading-[1.1] tracking-tight">
                                                    {data.hero.title}
                                                </h3>
                                                <p className="text-[18px] lg:text-[20px] text-gray-600 leading-relaxed max-w-[580px] font-normal">
                                                    {data.hero.description}
                                                </p>
                                                <button className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-4 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]">
                                                    Get Started
                                                    <ArrowRight size={20} />
                                                </button>
                                            </div>
                                            <div className="relative group">
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/10 via-transparent to-transparent rounded-3xl pointer-events-none z-10"></div>
                                                <img
                                                    src={data.hero.image}
                                                    alt={data.hero.title}
                                                    className="w-full h-[500px] lg:h-[550px] object-cover rounded-3xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] transition-all duration-700 group-hover:scale-[1.01] group-hover:shadow-[0_25px_80px_-12px_rgba(0,0,0,0.2)]"
                                                />
                                                <div className="absolute -inset-4 bg-gradient-to-r from-[#6366f1]/20 via-blue-500/10 to-transparent blur-2xl -z-10 opacity-50 group-hover:opacity-70 transition-opacity rounded-3xl"></div>
                                            </div>
                                        </div>

                                        {/* Module 2: Feature Grid */}
                                        <div className="space-y-10">
                                            <div className="text-center space-y-2 max-w-2xl mx-auto">
                                                <h4 className="text-[36px] lg:text-[40px] font-black text-gray-900">Advanced Capabilities</h4>
                                                <p className="text-gray-600 text-lg font-medium">Hyper-personalized tools engineered specifically for {key.toLowerCase()}.</p>
                                            </div>
                                            <div className="grid md:grid-cols-3 gap-6">
                                                {data.features.map((feature, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                                                    >
                                                        <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center text-gray-700 mb-6 group-hover:from-gray-900 group-hover:to-gray-800 group-hover:text-white transition-all duration-300">
                                                            {feature.icon}
                                                        </div>
                                                        <h5 className="text-[20px] font-bold text-gray-900 mb-3 tracking-tight">{feature.title}</h5>
                                                        <p className="text-gray-600 leading-relaxed text-[15px]">{feature.desc}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Module 3: Deep Dive */}
                                        <div className="grid lg:grid-cols-2 gap-12 items-center bg-gradient-to-br from-gray-50/80 to-white rounded-3xl p-8 lg:p-12 border border-gray-100 shadow-sm">
                                            <div className="lg:order-2 space-y-6">
                                                <h4 className="text-[36px] lg:text-[40px] font-black text-gray-900 tracking-tight">{data.deepDive.title}</h4>
                                                <p className="text-lg text-gray-600 leading-relaxed">
                                                    {data.deepDive.description}
                                                </p>
                                                <div className="grid gap-4">
                                                    {data.deepDive.features.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-4 text-base font-semibold text-gray-800 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                                                                <Check size={14} strokeWidth={3} />
                                                            </div>
                                                            <span>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="lg:order-1 relative rounded-2xl overflow-hidden shadow-lg group">
                                                <img
                                                    src={data.deepDive.image}
                                                    alt={data.deepDive.title}
                                                    className="w-full h-[400px] lg:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </section>

            {/* Shimmer Animation Styles */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%) skewX(-12deg);
                    }
                    100% {
                        transform: translateX(200%) skewX(-12deg);
                    }
                }
                @keyframes pulse-cursor {
                    0%, 100% { border-color: #0066ff; }
                    50% { border-color: transparent; }
                }
                .animate-pulse-cursor {
                    animation: pulse-cursor 0.8s step-end infinite;
                }
                .animate-shimmer {
                    animation: shimmer 3s infinite;
                }
            `}</style>
        </div>
    );
};

export default CanvaHero;