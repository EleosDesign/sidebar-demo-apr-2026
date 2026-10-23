import React from 'react';
import { GROUP_GO_OBJECTIVES, GROUP_GO_STATUSES, GROUP_GO_RESPONSE_LABEL } from '../../data/groupGoNote.js';
import './GroupGONote.css';

export default function GroupGONote({ noteValues, onNoteChange, highlightedField }) {
  const checkbox = (id, label) => (
    <input type="checkbox" aria-label={label} checked={!!noteValues[id]} onChange={e => onNoteChange(id, e.target.checked)} />
  );
  const textarea = (id, label) => (
    <label className="group-go-field" htmlFor={`group-go-${id}`}>{label}
      <textarea id={`group-go-${id}`} data-field={id} value={noteValues[id] ?? ''}
        onChange={e => onNoteChange(id, e.target.value)}
        className={highlightedField === id ? 'group-go-highlight' : ''} />
    </label>
  );
  return (
    <div className="group-go-note">
      <section className="group-go-panel" aria-labelledby="group-go-objectives-heading">
        <div className="group-go-heading">
          <h3 id="group-go-objectives-heading">Objectives Addressed by this Service</h3>
          <label className="group-go-filter">{checkbox('showSelectedObjectives', 'Show only selected items')}Show only selected items</label>
        </div>
        <div className="group-go-objectives">
          {GROUP_GO_OBJECTIVES.filter(o => !noteValues.showSelectedObjectives || noteValues[`goal-${o.goal}`] || noteValues[`objective-${o.id}`]).map(o => (
            <div className="group-go-goal" key={o.id}>
              <label className="group-go-goal-row">{checkbox(`goal-${o.goal}`, `Goal # ${o.goal}: Test`)}<span>Goal # {o.goal}:</span><span>Test</span></label>
              {(!noteValues.showSelectedObjectives || noteValues[`objective-${o.id}`]) && (
                <div className="group-go-objective">
                  <label className="group-go-objective-label">
                    <span>{checkbox(`objective-${o.id}`, `${o.id} ${o.text}`)}Objective {o.id}:</span>
                    <span>{o.text}</span>
                  </label>
                  <label className="group-go-status">Status <select aria-label={`Status ${o.id}`} value={noteValues[`status-${o.id}`] ?? ''} onChange={e => onNoteChange(`status-${o.id}`, e.target.value)}>
                    {GROUP_GO_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                  </select></label>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="group-go-comment">{textarea('objectivesComment', 'Comment')}</div>
      </section>
      <section className="group-go-panel" aria-labelledby="group-go-summary-heading">
        <div className="group-go-heading"><h3 id="group-go-summary-heading">Summary</h3></div>
        <div className="group-go-narrative">{textarea('groupSummary', 'Group Summary')}</div>
      </section>
      <section className="group-go-panel" aria-labelledby="group-go-service-heading">
        <div className="group-go-heading"><h3 id="group-go-service-heading">Service Note</h3></div>
        <div className="group-go-narrative">
          {textarea('serviceNote', GROUP_GO_RESPONSE_LABEL)}
          {textarea('documentPlan', 'Document the Plan')}
        </div>
      </section>
    </div>
  );
}
