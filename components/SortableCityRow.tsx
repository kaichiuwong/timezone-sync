import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CityRow } from './CityRow';
import { City } from '../types';

interface SortableCityRowProps {
  city: City;
  referenceDate: Date;
  onRemove: (id: string) => void;
  onSetHome: (id: string) => void;
  onTimeChange: (newMinutes: number) => void;
  isBase: boolean;
  is24Hour: boolean;
}

export const SortableCityRow: React.FC<SortableCityRowProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.city.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as const,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <CityRow 
        {...props} 
        dragHandleListeners={listeners} 
      />
    </div>
  );
};