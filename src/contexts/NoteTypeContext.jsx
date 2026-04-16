import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import NOTE_STRUCTURES_RAW from '../data/note-structures.json';

const NOTE_TYPES = NOTE_STRUCTURES_RAW.noteTypes;

// Flatten sections (handles subsections, skips structural-only domains without sampleContent)
function flattenSections(noteTypeKey) {
  const noteType = NOTE_TYPES[noteTypeKey];
  if (!noteType) return [];

  // GroupNote has variants — use first variant
  const sections = noteType.variants
    ? Object.values(noteType.variants)[0].sections
    : noteType.sections || [];

  const flat = [];
  sections.forEach(s => {
    if (s.subsections) {
      // Use subsections if they have sample content, otherwise use parent
      const hasSampleSubs = s.subsections.some(sub => sub.sampleContent);
      if (hasSampleSubs) {
        s.subsections.forEach(sub => flat.push(sub));
      } else {
        flat.push(s);
      }
    } else {
      flat.push(s);
    }
  });
  return flat;
}

function getInitialValues(noteTypeKey) {
  const sections = flattenSections(noteTypeKey);
  const values = {};
  sections.forEach(s => {
    values[s.id] = '';
  });
  return values;
}

// Build suggestions panel data from note type sections
function buildSuggestionsData(sections) {
  return sections
    .filter(s => s.sampleContent)
    .map(s => ({
      section: s.label,
      cards: [{
        field: s.label,
        content: s.sampleContent,
        type: 'text',
        showActions: true,
      }],
    }));
}

// Map Eleos sidebar section labels ('Data', 'Assessment', 'Plan') → section ids
function buildEleosMapping(sections) {
  const mapping = {};
  sections.forEach(s => {
    const id = s.id.toLowerCase();
    const label = (s.label || '').toLowerCase();
    if (id.includes('data') || label.includes('data') || id === 'subjective' || label.includes('subjective') || id.includes('information') || id.includes('focus')) {
      mapping['Data'] = mapping['Data'] || s.id;
    }
    if (id.includes('assessment') || label.includes('assessment') || id.includes('clinical') || id.includes('msePe')) {
      mapping['Assessment'] = mapping['Assessment'] || s.id;
    }
    if (id.includes('plan') || label.includes('plan')) {
      mapping['Plan'] = mapping['Plan'] || s.id;
    }
  });
  // Fallback: map positionally if no match
  if (!mapping['Data']     && sections[0]) mapping['Data']       = sections[0].id;
  if (!mapping['Assessment'] && sections[sections.length - 2]) mapping['Assessment'] = sections[sections.length - 2].id;
  if (!mapping['Plan']     && sections[sections.length - 1]) mapping['Plan']       = sections[sections.length - 1].id;
  return mapping;
}

export const NOTE_TYPE_LIST = Object.entries(NOTE_TYPES).map(([key, val]) => ({
  id: key,
  label: val.name,
}));

const NoteTypeContext = createContext(null);
export const useNoteTypeContext = () => useContext(NoteTypeContext);

export function NoteTypeProvider({ children }) {
  const [selectedNoteType, setSelectedNoteType] = useState('DAP');

  const sections = useMemo(() => flattenSections(selectedNoteType), [selectedNoteType]);
  const eleosMapping = useMemo(() => buildEleosMapping(sections), [sections]);
  const suggestionsData = useMemo(() => buildSuggestionsData(sections), [sections]);

  const [noteValues, setNoteValues] = useState(() => getInitialValues('DAP'));

  // Reset values when note type changes
  useEffect(() => {
    setNoteValues(getInitialValues(selectedNoteType));
  }, [selectedNoteType]);

  const updateNoteValue = (sectionId, valueOrUpdater) => {
    if (typeof valueOrUpdater === 'function') {
      setNoteValues(prev => ({ ...prev, [sectionId]: valueOrUpdater(prev[sectionId] ?? '') }));
    } else {
      setNoteValues(prev => ({ ...prev, [sectionId]: valueOrUpdater }));
    }
  };

  return (
    <NoteTypeContext.Provider value={{
      selectedNoteType,
      setSelectedNoteType,
      sections,
      noteValues,
      updateNoteValue,
      eleosMapping,
      suggestionsData,
    }}>
      {children}
    </NoteTypeContext.Provider>
  );
}
