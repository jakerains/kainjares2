import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin, Globe, Twitter, Youtube, Twitch, Github } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Reset form after success
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after a delay
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };
  
  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Me</h1>
          <p className="text-xl text-gray-300">
            Have questions about alien AI technology? Want to collaborate on intergalactic projects? Reach out!
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-5 gap-10">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-3"
          >
            <div className="bg-space-deep p-8 rounded-xl border border-space-purple/50">
              <h2 className="text-2xl font-bold mb-6">Send me a message</h2>
              
              {submitSuccess && (
                <div className="mb-6 p-4 bg-alien-glow/20 border border-alien-glow rounded-lg">
                  <p className="text-alien-glow font-medium">
                    Your message has been sent successfully! I'll respond as soon as possible.
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-space-purple/20 border border-space-purple rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-alien-glow transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-space-purple/20 border border-space-purple rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-alien-glow transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-space-purple/20 border border-space-purple rounded-lg text-white focus:outline-none focus:border-alien-glow transition-colors"
                  >
                    <option value="">Select a subject</option>
                    <option value="collaboration">Collaboration Opportunity</option>
                    <option value="question">Question about AI Technology</option>
                    <option value="speaking">Speaking Request</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-space-purple/20 border border-space-purple rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-alien-glow transition-colors"
                    placeholder="Your message here..."
                  ></textarea>
                </div>
                
                <div className="text-right">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-alien-glow text-space-dark font-bold rounded-full hover:shadow-alien-glow disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-space-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
          
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2"
          >
            <div className="bg-space-deep p-8 rounded-xl border border-space-purple/50 mb-8">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-space-purple/40 p-3 rounded-full mr-4">
                    <Mail className="text-alien-glow h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Email</h3>
                    <p className="text-gray-400">kain@aliangen.ai</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-space-purple/40 p-3 rounded-full mr-4">
                    <MapPin className="text-alien-glow h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Base Location</h3>
                    <p className="text-gray-400">San Francisco, Earth</p>
                    <p className="text-gray-400">(Visiting from Proxima Centauri b)</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-space-purple/40 p-3 rounded-full mr-4">
                    <Globe className="text-alien-glow h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Website</h3>
                    <p className="text-gray-400">www.kainjarres.com</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-space-deep p-8 rounded-xl border border-space-purple/50">
              <h2 className="text-2xl font-bold mb-6">Follow Me</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-space-purple/30 rounded-lg hover:bg-space-purple/50 transition-colors"
                >
                  <Twitter className="text-alien-glow h-5 w-5" />
                  <span className="text-gray-300">Twitter</span>
                </a>
                
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-space-purple/30 rounded-lg hover:bg-space-purple/50 transition-colors"
                >
                  <Youtube className="text-alien-glow h-5 w-5" />
                  <span className="text-gray-300">YouTube</span>
                </a>
                
                <a 
                  href="https://twitch.tv" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-space-purple/30 rounded-lg hover:bg-space-purple/50 transition-colors"
                >
                  <Twitch className="text-alien-glow h-5 w-5" />
                  <span className="text-gray-300">Twitch</span>
                </a>
                
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-space-purple/30 rounded-lg hover:bg-space-purple/50 transition-colors"
                >
                  <Github className="text-alien-glow h-5 w-5" />
                  <span className="text-gray-300">GitHub</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;