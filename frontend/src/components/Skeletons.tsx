import React from 'react';

// CSS for Shimmer Animation
const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}
`;

const baseStyle: React.CSSProperties = {
  animationDuration: '2s',
  animationFillMode: 'forwards',
  animationIterationCount: 'infinite',
  animationName: 'shimmer',
  animationTimingFunction: 'linear',
  background: '#f6f7f8',
  backgroundImage: 'linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%)',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1000px 100%',
};

const SkeletonBox: React.CSSProperties = {
  ...baseStyle,
  borderRadius: '8px',
};

export const SkeletonText = ({ width = '100%', height = '20px', style = {} }: { width?: string | number, height?: string | number, style?: React.CSSProperties }) => (
  <>
    <style>{shimmerKeyframes}</style>
    <div style={{ ...SkeletonBox, width, height, ...style }} />
  </>
);

export const SkeletonCard = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '16px', backgroundColor: 'white' }}>
    <SkeletonText height="200px" style={{ borderRadius: '12px' }} />
    <SkeletonText width="60%" height="24px" />
    <SkeletonText width="40%" height="16px" />
    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
      <SkeletonText width="80px" height="32px" style={{ borderRadius: '20px' }} />
      <SkeletonText width="80px" height="32px" style={{ borderRadius: '20px' }} />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonListRow = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
    <SkeletonText width="48px" height="48px" style={{ borderRadius: '50%' }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
      <SkeletonText width="30%" height="16px" />
      <SkeletonText width="50%" height="12px" />
    </div>
    <SkeletonText width="80px" height="24px" style={{ borderRadius: '12px' }} />
  </div>
);

export const GlobalLoader = () => (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '24px', gap: '24px', backgroundColor: 'var(--background)' }}>
    <style>{shimmerKeyframes}</style>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <SkeletonText width="150px" height="40px" />
      <SkeletonText width="40px" height="40px" style={{ borderRadius: '50%' }} />
    </div>
    <SkeletonText height="300px" style={{ borderRadius: '24px' }} />
    <SkeletonGrid count={3} />
  </div>
);
