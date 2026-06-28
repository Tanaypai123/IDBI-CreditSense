import React from 'react';
import Card from './Card';

export default function ChartCard({ title, children, height = "h-72" }) {
  return (
    <Card title={title}>
      <div className={`w-full ${height}`}>
        {children}
      </div>
    </Card>
  );
}
