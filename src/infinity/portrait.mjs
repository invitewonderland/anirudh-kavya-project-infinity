// Shared timing contract for the photograph and its gold frame. No timers can outlive the scene.
export function portraitOpacity(now,started,duration,reduced=false){
  if(reduced)return 1;
  const t=Math.max(0,Math.min(1,(now-started)/duration));
  return t*t*t*(t*(t*6-15)+10);
}
