import React from 'react';
import { GraduationCap, Mail, Phone, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';
import footerPattern from '../../../../assets/images/footer.png';

const Footer = () => {
    return (
        <footer className="w-full bg-[#fbf7ff] pt-24 pb-8 mt-20 relative overflow-hidden opacity-[0.9]">
            {/* Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url(${footerPattern})`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '400px'
                }}
            />

            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-8 h-8 text-[#6366f1]" />
                            <span className="text-[26px] font-bold text-[#7d2ae8] tracking-tight">EduCollaborate</span>
                        </div>
                        <p className="text-gray-700 text-[16px] leading-relaxed max-w-[340px]">
                            Empowering the next generation of learners through innovative AI collaboration. Premium digital education solutions for modern students.
                        </p>

                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-3 text-gray-700 hover:text-white transition-colors cursor-pointer group">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#6366f1]/20 transition-all">
                                    <Mail size={18} />
                                </div>
                                <span className="text-[15px]">hello@educollaborate.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700 hover:text-white transition-colors cursor-pointer group">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#6366f1]/20 transition-all">
                                    <Phone size={18} />
                                </div>
                                <span className="text-[15px]">+1 (234) 567-890</span>
                            </div>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="space-y-8">
                        <h4 className="text-[18px] font-bold text-[#7d2ae8] uppercase tracking-[0.1em]">Platform</h4>
                        <ul className="space-y-4">
                            <li><button className="text-gray-700 hover:text-[#6366f1] transition-colors text-[16px]">AI Tutor</button></li>
                            <li><button className="text-gray-700 hover:text-[#6366f1] transition-colors text-[16px]">For Teachers</button></li>
                            <li><button className="text-gray-700 hover:text-[#6366f1] transition-colors text-[16px]">Parent Portal</button></li>
                        </ul>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-[18px] font-bold text-[#7d2ae8] uppercase tracking-[0.1em]">Company</h4>
                        <ul className="space-y-4">
                            <li><button className="text-gray-700 hover:text-[#6366f1] transition-colors text-[16px]">About Us</button></li>
                            <li><button className="text-gray-700 hover:text-[#6366f1] transition-colors text-[16px]">Our Mission</button></li>
                            <li><button className="text-gray-700 hover:text-[#6366f1] transition-colors text-[16px]">Contact</button></li>
                        </ul>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-[18px] font-bold text-[#7d2ae8] uppercase tracking-[0.1em]">Legal</h4>
                        <ul className="space-y-4">
                            <li><button className="text-gray-700 hover:text-[#6366f1] transition-colors text-[16px]">Privacy Policy</button></li>
                            <li><button className="text-gray-700 hover:text-[#6366f1] transition-colors text-[16px]">Terms of Service</button></li>
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 text-[14px]">
                        © {new Date().getFullYear()} EduCollaborate. All rights reserved.
                    </p>

                    <div className="flex items-center gap-6">
                        <button className="text-gray-700 hover:text-white transition-colors"><Linkedin size={20} /></button>
                        <button className="text-gray-700 hover:text-white transition-colors"><Twitter size={20} /></button>
                        <button className="text-gray-700 hover:text-white transition-colors"><Facebook size={20} /></button>
                        <button className="text-gray-700 hover:text-white transition-colors"><Instagram size={20} /></button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
