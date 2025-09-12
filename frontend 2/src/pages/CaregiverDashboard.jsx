import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CaregiverDashboard() {
  const boxRef = useRef();
  useEffect(() => { gsap.from(boxRef.current, { y: 20, opacity: 0, duration: 0.6 }); }, []);
  return (
    <div className="container-px py-8">
      <div ref={boxRef} className="p-6 rounded-lg bg-purple-50 border">
        <h2 className="text-xl font-semibold mb-2">Caregiver Dashboard</h2>
        <p className="text-sm">Coordinate care, track vitals and alerts.</p>
      </div>
    </div>
  );
}

