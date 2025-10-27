import React, { useState, useEffect } from 'react';

const CompactClock = ({ className = '', style = {} }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const getVietnameseDayOfWeek = (date) => {
      // Tên hàm giữ nguyên, nhưng nội dung mảng là tiếng Anh
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
  };

  return (
    <div 
      className={`d-flex flex-column ${className}`}
      style={{ fontSize: '1.75rem', ...style }}
    >
      {/*
      <div className="d-flex align-items-center">
        <i className="ni ni-time-alarm mr-2" style={{ fontSize: '28px',  }}></i>
        <div style={{ fontSize: '1.4rem', lineHeight: '1', color: 'black', fontWeight: '500' }}>
          Real Time:
        </div>
      </div>
      */}
      <div style={{ fontSize: '1.15rem', lineHeight: '1', color: 'white' }}>
        {getVietnameseDayOfWeek(currentTime)}
      </div>
      <div style={{ fontSize: '1.15rem', lineHeight: '1.2', fontWeight: '600', color: 'white' }}>
        {formatDateTime(currentTime)}
      </div>
    </div>
  );
};

export default CompactClock;
