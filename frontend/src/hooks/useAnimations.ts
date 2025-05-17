import { useEffect, useState } from 'react';

const useAnimations = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    if (scrollY > windowHeight / 2) {
      setIsVisible(true);
      setAnimationClass('fade-in');
    } else {
      setIsVisible(false);
      setAnimationClass('fade-out');
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return { isVisible, animationClass };
};

export default useAnimations;