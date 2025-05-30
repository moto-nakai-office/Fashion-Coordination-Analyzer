import React from 'react';
import type { KeyFashionItem } from '../types'; // Changed import
import { CheckBadgeIcon, ChatBubbleIcon } from './icons';

interface ItemCardProps {
  item: KeyFashionItem; // Changed type
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-5 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-sky-100">
      <h3 className="text-xl font-semibold text-sky-700 mb-3 flex items-center">
        <CheckBadgeIcon className="w-6 h-6 mr-2 text-sky-500" />
        {item.name}
      </h3>
      <div className="space-y-2 text-sm">
        <p className="flex items-start text-slate-700">
          <ChatBubbleIcon className="w-5 h-5 mr-2 text-teal-500 flex-shrink-0 mt-0.5" />
          <span className="font-medium">コメント:</span>&nbsp;{item.comment}
        </p>
      </div>
    </div>
  );
};