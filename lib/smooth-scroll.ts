// Simple and reliable smooth scroll utility
export function smoothScrollTo(targetId: string, offset: number = 80) {
  const element = document.getElementById(targetId);
  if (!element) return;

  // Always use custom animation for consistent behavior
  const targetPosition = element.offsetTop - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  const duration = 800; // Shorter duration for better UX
  let start: number | null = null;

  function animation(currentTime: number) {
    if (start === null) start = currentTime;
    const timeElapsed = currentTime - start;
    const progress = Math.min(timeElapsed / duration, 1);
    
    // Smooth easing function (ease-in-out)
    const eased = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    const currentPosition = startPosition + (distance * eased);
    window.scrollTo(0, currentPosition);
    
    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}