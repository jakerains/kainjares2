import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PenIcon as AlienIcon, Home, Globe, Radar } from 'lucide-react';
import { useState, useEffect } from 'react';

interface GeoData {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

const NotFound = () => {
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchLocation() {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setGeoData({
          city: data.city,
          country: data.country_name,
          latitude: data.latitude,
          longitude: data.longitude
        });
      } catch (error) {
        console.error('Error fetching location:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLocation();
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <AlienIcon size={120} className="text-alien-glow mx-auto" />
          <motion.div
            className="absolute inset-0"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full rounded-full bg-alien-glow blur-xl opacity-20"></div>
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8"
      >
        <h1 className="text-6xl font-bold mb-4">
          4<span className="text-alien-glow">0</span>4
        </h1>
        <h2 className="text-2xl font-semibold mb-6">
          Planet Not Found
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto mb-8">
          It seems you've ventured into uncharted space. This cosmic destination doesn't exist in my intergalactic database.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-3 bg-alien-glow text-space-dark font-bold rounded-full mx-auto hover:shadow-alien-glow transition-all duration-300"
        >
          <Home size={18} />
          <span>Return to Home Planet</span>
        </motion.button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-16 p-4 bg-space-purple/20 border border-space-purple/50 rounded-lg max-w-md"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-alien-glow mb-2">
            <Radar className="w-5 h-5 animate-spin" />
            <span className="font-mono font-bold">SPATIAL ANALYSIS</span>
          </div>
          
          {loading ? (
            <p className="text-gray-400 font-mono text-sm animate-pulse">
              Scanning quantum coordinates...
            </p>
          ) : (
            <>
              <p className="text-gray-400 font-mono text-sm">
                <span className="text-alien-glow">$</span> cosmo-scan --location="current"
              </p>
              
              <div className="flex items-center justify-center gap-2 text-gray-400 font-mono text-sm">
                <Globe className="w-4 h-4 text-alien-glow" />
                <span>
                  Detected life form in: {geoData?.city}, {geoData?.country}
                </span>
              </div>
              
              <p className="text-gray-400 font-mono text-sm">
                <span className="text-alien-glow">Spatial coordinates:</span>{' '}
                {geoData?.latitude?.toFixed(4)}°N, {geoData?.longitude?.toFixed(4)}°E
              </p>
              
              <p className="text-gray-400 font-mono text-sm">
                <span className="text-alien-glow">Analysis:</span> You appear to be in the void between known routes.
              </p>
              
              <p className="text-gray-400 font-mono text-sm">
                <span className="text-alien-glow">Recommendation:</span> Return to a mapped path.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;