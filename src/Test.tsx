import React from 'react';

export const Test = () => {
  console.log('Test component rendered');
  return (
    <div style={{ padding: '20px', background: 'lightblue' }}>
      <h1>Test Component</h1>
      <p>If you can see this, React is working!</p>
    </div>
  );
};
