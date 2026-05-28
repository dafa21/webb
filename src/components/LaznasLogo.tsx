export const LaznasLogo = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    {/* Left Loop */}
    <rect x="5" y="45" width="25" height="10" />
    <rect x="5" y="45" width="10" height="25" />
    <rect x="5" y="60" width="25" height="10" />
    {/* Left Short Pillar */}
    <rect x="20" y="25" width="10" height="60" />
    {/* Left Connection */}
    <rect x="20" y="75" width="25" height="10" />
    {/* Left Tall Pillar */}
    <rect x="35" y="10" width="10" height="85" />
    {/* Center Connection */}
    <rect x="35" y="85" width="30" height="10" />
    {/* Right Tall Pillar */}
    <rect x="55" y="10" width="10" height="85" />
    {/* Right Connection */}
    <rect x="55" y="75" width="25" height="10" />
    {/* Right Short Pillar */}
    <rect x="70" y="25" width="10" height="60" />
    {/* Right Loop */}
    <rect x="70" y="45" width="25" height="10" />
    <rect x="85" y="45" width="10" height="25" />
    <rect x="70" y="60" width="25" height="10" />
  </svg>
);
