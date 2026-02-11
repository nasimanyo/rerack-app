import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { supabase } from '../lib/supabase';
import * as holiday_jp from '@holiday-jp/holiday_jp';

dayjs.locale('ja');

const Calendar = ({ onDateClick }: { onDateClick: (date: dayjs.Dayjs, post: any) => void }) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [posts, setPosts] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchPosts = async () => {
      const start = currentMonth.startOf('month').format('YYYY-MM-DD');
      const end = currentMonth.endOf('month').format('YYYY-MM-DD');
      const { data } = await supabase.from('posts').select('*').gte('date', start).lte('date', end);
      const fetched: Record<string, any> = {};
      data?.forEach((p) => { fetched[dayjs(p.date).format('YYYY-MM-DD')] = p; });
      setPosts(fetched);
    };
    fetchPosts();
  }, [currentMonth]);

  const days = [];
  let day = currentMonth.startOf('month').startOf('week');
  for (let i = 0; i < 42; i++) {
    days.push(day);
    day = day.add(1, 'day');
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md mx-auto text-slate-900">
      <div className="flex justify-between items-center mb-8 px-2">
        <h2 className="text-xl font-bold tracking-tight">{currentMonth.format('YYYY. MM')}</h2>
        <div className="flex gap-4 text-slate-400">
          <button onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))} className="hover:text-slate-800 transition">←</button>
          <button onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))} className="hover:text-slate-800 transition">→</button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-y-2">
        {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
          <div key={d} className={`text-center text-[10px] font-bold mb-4 tracking-widest ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-300'}`}>{d}</div>
        ))}
        {days.map((d, i) => {
          const dateStr = d.format('YYYY-MM-DD');
          const isToday = dateStr === dayjs().format('YYYY-MM-DD');
          const hasPost = posts[dateStr];
          const isCurrentMonth = d.month() === currentMonth.month();
          
          // 祝日判定（日付のみで比較）
          const dateObj = d.toDate();
          const holiday = holiday_jp.between(dateObj, dateObj)[0];
          const isHoliday = !!holiday;

          return (
            <div
              key={i}
              onClick={() => onDateClick(d, hasPost)}
              className={`h-14 flex flex-col items-center justify-center cursor-pointer rounded-lg transition-all relative mx-0.5
                ${isToday ? 'bg-slate-900 text-white shadow-md z-10' : 'hover:bg-slate-50'}
                ${!isCurrentMonth ? 'opacity-5' : ''}`}
            >
              {isHoliday && isCurrentMonth && (
                <span className={`absolute top-1 text-[8px] scale-[0.8] truncate w-full text-center ${isToday ? 'text-red-300' : 'text-red-400'}`}>
                  {holiday.name}
                </span>
              )}

              <span className={`text-sm font-medium 
                ${!isToday && (d.day() === 0 || isHoliday) ? 'text-red-500' : ''} 
                ${!isToday && d.day() === 6 ? 'text-blue-500' : ''}
                ${isToday ? 'text-white' : ''}`}>
                {d.date()}
              </span>
              
              {hasPost && !isToday && (
                <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${hasPost.is_important ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;