import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SectionType, ParsedCV } from '../types/cv';

interface SectionOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionOrder: SectionType[];
  onSave: (newOrder: SectionType[]) => void;
  parsedCV: ParsedCV | null;
}

const SECTION_LABELS: Record<SectionType, string> = {
  contact: 'Contact',
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  publications: 'Publications',
  awards: 'Awards',
  languages: 'Languages',
  interests: 'Interests',
  generic: 'Other',
};

function hasContent(cv: ParsedCV | null, sectionType: SectionType): boolean {
  if (!cv) return true; // Show all if no CV parsed yet
  switch (sectionType) {
    case 'summary':
      return !!cv.summary;
    case 'experience':
      return cv.experience.length > 0;
    case 'education':
      return cv.education.length > 0;
    case 'skills':
      return cv.skills.length > 0;
    case 'projects':
      return cv.projects.length > 0;
    case 'certifications':
      return cv.certifications.length > 0;
    case 'publications':
      return cv.publications.length > 0;
    case 'awards':
      return cv.awards.length > 0;
    case 'languages':
      return cv.languages.length > 0;
    case 'interests':
      return cv.interests.length > 0;
    default:
      return true;
  }
}

interface SortableItemProps {
  id: SectionType;
  hasContent: boolean;
}

function SortableItem({ id, hasContent }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border ${
        isDragging
          ? 'border-blue-500 shadow-lg z-10'
          : 'border-gray-200 dark:border-gray-600'
      } ${!hasContent ? 'opacity-50' : ''}`}
    >
      <button
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        {...attributes}
        {...listeners}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>
      <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
        {SECTION_LABELS[id]}
      </span>
      {!hasContent && (
        <span className="text-xs text-gray-400 dark:text-gray-500">(empty)</span>
      )}
    </div>
  );
}

export function SectionOrderModal({
  isOpen,
  onClose,
  sectionOrder,
  onSave,
  parsedCV,
}: SectionOrderModalProps) {
  const [localOrder, setLocalOrder] = useState<SectionType[]>(sectionOrder);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!isOpen) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalOrder((items) => {
        const oldIndex = items.indexOf(active.id as SectionType);
        const newIndex = items.indexOf(over.id as SectionType);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    onSave(localOrder);
    onClose();
  };

  const handleReset = () => {
    setLocalOrder(sectionOrder);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reorder Sections
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Drag and drop to reorder sections in your CV output.
          </p>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={localOrder} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {localOrder.map((sectionType) => (
                  <SortableItem
                    key={sectionType}
                    id={sectionType}
                    hasContent={hasContent(parsedCV, sectionType)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Save Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
