'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAddMeditation } from '@/hooks/useApi';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Heart,
  Wind,
  Clock,
  CheckCircle,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const breathingPatterns = {
  '4-4-4': {
    name: '4-4-4 (Equal Breathing)',
    inhale: 4,
    hold: 4,
    exhale: 4,
    description: 'Perfect for beginners and stress relief'
  },
  '4-7-8': {
    name: '4-7-8 (Relaxing Breath)',
    inhale: 4,
    hold: 7,
    exhale: 8,
    description: 'Great for sleep and deep relaxation'
  },
  '6-2-6': {
    name: '6-2-6 (Calm Focus)',
    inhale: 6,
    hold: 2,
    exhale: 6,
    description: 'Excellent for concentration and focus'
  },
  '5-5-5': {
    name: '5-5-5 (Balanced)',
    inhale: 5,
    hold: 5,
    exhale: 5,
    description: 'Well-rounded breathing for daily practice'
  }
};

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';
type PatternKey = keyof typeof breathingPatterns;

export default function BreathePage() {
  const addMeditation = useAddMeditation();
  
  const [isActive, setIsActive] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<PatternKey>('4-4-4');
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [duration, setDuration] = useState(300); // 5 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(duration);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionRecorded, setSessionRecorded] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const pattern = breathingPatterns[currentPattern];
  const progress = ((duration - timeLeft) / duration) * 100;

  const handleComplete = useCallback(() => {
    setIsActive(false);
    setSessionComplete(true);
    
    // Add meditation session only if not already recorded
    if (!sessionRecorded) {
      setSessionRecorded(true);
      addMeditation.mutate({
        duration: Math.round((duration - timeLeft) / 60), // Convert to minutes
        type: 'BREATHING',
        notes: `Completed ${breathCount} breath cycles using ${pattern.name}`
      });
    }
  }, [duration, timeLeft, breathCount, addMeditation, pattern.name, sessionRecorded]);

  const playPhaseSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  }, []);

  // Main session timer
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleComplete();
    }
  }, [isActive, timeLeft, handleComplete]);

  // Phase transition logic
  useEffect(() => {
    if (!isActive) return;

    // Initialize phase time when starting or changing phases
    if (phaseTimeLeft === 0) {
      const phaseDuration = getCurrentPhaseDuration();
      setPhaseTimeLeft(phaseDuration);
    }

    const phaseTimer = setTimeout(() => {
      if (phaseTimeLeft > 1) {
        setPhaseTimeLeft(phaseTimeLeft - 1);
      } else {
        // Move to next phase
        playPhaseSound();
        
        switch (phase) {
          case 'inhale':
            setPhase('hold');
            setPhaseTimeLeft(pattern.hold);
            break;
          case 'hold':
            setPhase('exhale');
            setPhaseTimeLeft(pattern.exhale);
            break;
          case 'exhale':
            setPhase('inhale');
            setPhaseTimeLeft(pattern.inhale);
            setBreathCount(prev => prev + 1);
            break;
          default:
            setPhase('inhale');
            setPhaseTimeLeft(pattern.inhale);
        }
      }
    }, 1000);

    return () => clearTimeout(phaseTimer);
  }, [isActive, phase, phaseTimeLeft, pattern, playPhaseSound]);

  const handleStart = () => {
    setIsActive(true);
    setSessionComplete(false);
    setPhase('inhale');
    setPhaseTimeLeft(pattern.inhale);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setTimeLeft(duration);
    setPhaseTimeLeft(0);
    setBreathCount(0);
    setSessionComplete(false);
    setSessionRecorded(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'pause':
        return 'Pause';
      default:
        return 'Breathe';
    }
  };

  const getCircleScale = () => {
    const phaseDuration = getCurrentPhaseDuration();
    const progress = phaseDuration > 0 ? (phaseDuration - phaseTimeLeft) / phaseDuration : 0;
    
    switch (phase) {
      case 'inhale':
        return 0.6 + (progress * 0.4); // Scale from 0.6 to 1.0
      case 'hold':
        return 1.0; // Stay at maximum
      case 'exhale':
        return 1.0 - (progress * 0.4); // Scale from 1.0 to 0.6
      default:
        return 0.6;
    }
  };

  const getCurrentPhaseDuration = () => {
    switch (phase) {
      case 'inhale':
        return pattern.inhale;
      case 'hold':
        return pattern.hold;
      case 'exhale':
        return pattern.exhale;
      default:
        return pattern.inhale;
    }
  };

  // Update timeLeft when duration changes
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration);
    }
  }, [duration, isActive]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Heart className="h-8 w-8 text-pink-500" />
              Breathe & Meditate
            </h1>
            <p className="text-gray-600 mt-1">
              Find your calm with guided breathing exercises
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Pattern Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Breathing Pattern
              </label>
              <div className="space-y-2">
                {Object.entries(breathingPatterns).map(([key, patternData]) => (
                  <button
                    key={key}
                    onClick={() => setCurrentPattern(key as PatternKey)}
                    disabled={isActive}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      currentPattern === key
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="font-medium">{patternData.name}</div>
                    <div className="text-sm text-gray-500">{patternData.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Session Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Duration
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="60"
                    max="1800"
                    step="60"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    disabled={isActive}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className="text-sm font-medium text-gray-700 min-w-[4rem]">
                    {Math.round(duration / 60)} min
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Sound Guidance
                </label>
                <button
                  onClick={() => {
                    // Toggle sound guidance
                  }}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg transition-colors bg-gray-100 text-gray-600"
                >
                  <Volume2 className="h-4 w-4" />
                  On
                </button>
              </div>

              {/* Session Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatTime(timeLeft)}</div>
                  <div className="text-sm text-gray-500">Time Left</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{breathCount}</div>
                  <div className="text-sm text-gray-500">Breaths</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breathing Circle */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="flex flex-col items-center justify-center space-y-8">
            {/* Progress Ring */}
            <div className="relative w-80 h-80">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgb(229 231 235)"
                  strokeWidth="2"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgb(236 72 153)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  className="transition-all duration-300"
                />
              </svg>

              {/* Breathing Circle */}
              <motion.div
                className="absolute inset-4 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-2xl"
                animate={{
                  scale: getCircleScale(),
                }}
                transition={{
                  duration: 1,
                  ease: "easeInOut"
                }}
              >
                <Wind className="h-16 w-16 text-white" />
              </motion.div>
            </div>

            {/* Phase Instruction */}
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {getPhaseInstruction()}
              </h2>
              <p className="text-gray-600">
                {pattern.name} • {phaseTimeLeft}s remaining
              </p>
            </motion.div>

            {/* Control Buttons */}
            <div className="flex items-center gap-4">
              {!isActive ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-lg"
                >
                  <Play className="h-5 w-5" />
                  Start
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
                >
                  <Pause className="h-5 w-5" />
                  Pause
                </button>
              )}
              
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <RotateCcw className="h-5 w-5" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Completion Modal */}
        <AnimatePresence>
          {sessionComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full border border-gray-200"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Session Complete!
                  </h2>
                  
                  <p className="text-gray-600 mb-6">
                    Great job! You completed {formatTime(duration - timeLeft)} of mindful breathing
                    with {breathCount} breath cycles.
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSessionComplete(false);
                        handleReset();
                      }}
                      className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      Start New Session
                    </button>
                    <button
                      onClick={() => setSessionComplete(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Benefits */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Benefits of Breathing Exercises
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <Heart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Reduce Stress</h3>
              <p className="text-sm text-gray-600">Lower cortisol levels and anxiety</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50">
              <Wind className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Better Sleep</h3>
              <p className="text-sm text-gray-600">Improve sleep quality and duration</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Increase Focus</h3>
              <p className="text-sm text-gray-600">Enhance concentration and clarity</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-pink-50">
              <CheckCircle className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Emotional Balance</h3>
              <p className="text-sm text-gray-600">Regulate emotions and mood</p>
            </div>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          preload="auto"
          src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdxiuUXJkdWaIcAx1jHEQdX93EX5idH12fH3tgICEbHVtfxZ2dH91fX57iHqHdYN9iHt7cXhqeXJtdnp8d3p7dXl2e3l5cH5wgHV8d3V3dH3+fHx1cHp4cXhyb3lxdYN3e3doeW15enJ0ZXd2dXR0bHd7dH56fnZ4eXh7dX17fH53d3R7dn18dHV6eXJzcXVzdXdxdXV2dXByd3V3cnR1dXZ4dXV2cXV1dXZxcXV1dXV1dXVydXV1dXV1dXVydXV1dXV1dXVydXV1dXV1dXVydXV1dXV1dXVydXV1dXV1dXVydQ=="
        />
      </div>
    </div>
  );
} 