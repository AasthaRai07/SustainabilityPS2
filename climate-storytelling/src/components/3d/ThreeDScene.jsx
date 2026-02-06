// 3D Scene Component - Wrapper for Three.js scene
import { useEffect, useRef } from 'react';
import SceneManager from './SceneManager';

const ThreeDScene = ({ storyData, userData }) => {
  const containerRef = useRef(null);
  const sceneManagerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !sceneManagerRef.current) {
      // Initialize scene manager
      sceneManagerRef.current = new SceneManager(containerRef.current);
      
      // Create the globe
      sceneManagerRef.current.createGlobe();
    }

    return () => {
      // Cleanup on unmount
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
        sceneManagerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Update scene when story data changes
    if (sceneManagerRef.current && storyData?.visualData) {
      sceneManagerRef.current.updateGlobeVisuals(storyData.visualData);
    }
  }, [storyData]);

  useEffect(() => {
    // Update scene based on user input even before story generation
    if (sceneManagerRef.current && userData.location) {
      // Could add pre-visualization effects based on location selection
    }
  }, [userData.location, userData.timeframe]);

  return (
    <div 
      ref={containerRef} 
      className="three-container"
    />
  );
};

export default ThreeDScene;