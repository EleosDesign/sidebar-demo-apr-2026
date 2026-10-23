import React from 'react';
import {
  PSYCH_NOTE_TABS,
  ROS_SYSTEMS,
  SUBSTANCE_USE_ITEMS,
  MSE_DOMAINS,
  AIMS_ITEMS,
  AIMS_SCALE_OPTIONS,
  AIMS_SEVERITY_OPTIONS,
  AIMS_AWARENESS_OPTIONS,
  MDM_COMPLEXITY_OPTIONS,
  PSYCH_GO_OBJECTIVES,
  PSYCH_GO_STATUSES,
} from '../../data/psychiatricNote.js';
import './PsychiatricNote.css';

export default function PsychiatricNote({ noteValues = {}, onNoteChange, highlightedField }) {
  const activeTab = noteValues.psychActiveTab || 'General';

  const setTab = tab => {
    onNoteChange?.('psychActiveTab', tab);
  };

  const checkbox = (id, label) => (
    <input
      type="checkbox"
      id={`psych-${id}`}
      aria-label={label}
      checked={!!noteValues[id]}
      onChange={e => onNoteChange?.(id, e.target.checked)}
    />
  );

  const radio = (name, val, label) => (
    <label className="psych-check-item" key={val}>
      <input
        type="radio"
        name={`psych-${name}`}
        aria-label={label}
        value={val}
        checked={noteValues[name] === val}
        onChange={() => onNoteChange?.(name, val)}
      />
      {label}
    </label>
  );

  const textarea = (id, label, rows = 3, placeholder = '') => (
    <label className="psych-field" htmlFor={`psych-${id}`}>
      <span className="psych-field-label">{label}</span>
      <textarea
        id={`psych-${id}`}
        data-field={id}
        rows={rows}
        placeholder={placeholder}
        value={noteValues[id] ?? ''}
        onChange={e => onNoteChange?.(id, e.target.value)}
        className={highlightedField === id ? 'psych-highlight' : ''}
      />
    </label>
  );

  const textInput = (id, label, placeholder = '') => (
    <label className="psych-field" htmlFor={`psych-${id}`}>
      <span className="psych-field-label">{label}</span>
      <input
        type="text"
        id={`psych-${id}`}
        data-field={id}
        placeholder={placeholder}
        value={noteValues[id] ?? ''}
        onChange={e => onNoteChange?.(id, e.target.value)}
      />
    </label>
  );

  const select = (id, label, options) => (
    <label className="psych-field" htmlFor={`psych-${id}`}>
      <span className="psych-field-label">{label}</span>
      <select
        id={`psych-${id}`}
        data-field={id}
        aria-label={label}
        value={noteValues[id] ?? ''}
        onChange={e => onNoteChange?.(id, e.target.value)}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="psych-note">
      {/* Tab Navigation Strip */}
      <div className="psych-tabs-strip" role="tablist">
        {PSYCH_NOTE_TABS.map(tab => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`psych-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 1: General */}
      {activeTab === 'General' && (
        <div className="psych-tab-content">
          <section className="psych-panel">
            <div className="psych-heading">
              <h3>Patient Type & Chief Complaint</h3>
            </div>
            <div className="psych-row">
              <span style={{ fontWeight: 600 }}>Patient Type:</span>
              {radio('patientType', 'Adult', 'Adult')}
              {radio('patientType', 'Child', 'Child/Adolescent')}
            </div>
            <div className="psych-grid-2">
              <div>{textarea('todayChiefComplaint', "Today's Chief Complaint")}</div>
              <div>{textarea('otherNotes', 'Other Notes')}</div>
            </div>
          </section>

          <section className="psych-panel">
            <div className="psych-heading">
              <h3>History of Present Illness</h3>
            </div>
            {textarea('historyOfPresentIllness', 'History of Present Illness', 4)}
            <div className="psych-row" style={{ marginTop: 8 }}>
              <span style={{ fontWeight: 600 }}>Reviewed Summary of Records:</span>
              {radio('reviewedRecords', 'Y', 'Yes')}
              {radio('reviewedRecords', 'N', 'No')}
            </div>
            {textarea('personPresentComments', 'Persons Present & Relationship / Comments', 2)}
          </section>

          <section className="psych-panel">
            <div className="psych-heading">
              <h3>Past Medical, Family & Social History</h3>
            </div>
            <div className="psych-grid-3">
              <div>
                <div className="psych-row">
                  <span style={{ fontWeight: 600 }}>Medical:</span>
                  {radio('medHistoryStatus', 'N', 'No Changes')}
                  {radio('medHistoryStatus', 'Y', 'Changes')}
                </div>
                {textarea('medicalHistoryComments', 'Medical History Comments', 2)}
              </div>
              <div>
                <div className="psych-row">
                  <span style={{ fontWeight: 600 }}>Family:</span>
                  {radio('famHistoryStatus', 'N', 'No Changes')}
                  {radio('famHistoryStatus', 'Y', 'Changes')}
                </div>
                {textarea('familyHistoryComments', 'Family History Comments', 2)}
              </div>
              <div>
                <div className="psych-row">
                  <span style={{ fontWeight: 600 }}>Social:</span>
                  {radio('socHistoryStatus', 'N', 'No Changes')}
                  {radio('socHistoryStatus', 'Y', 'Changes')}
                </div>
                {textarea('socialHistoryComments', 'Social History Comments', 2)}
              </div>
            </div>
          </section>

          <section className="psych-panel">
            <div className="psych-heading">
              <h3>Side Effects & Last Visit Plan</h3>
            </div>
            <div className="psych-row">
              <span style={{ fontWeight: 600 }}>Side Effects:</span>
              {radio('sideEffects', 'None', 'None')}
              {radio('sideEffects', 'Specify', 'Specify')}
            </div>
            {textarea('planLastVisit', 'Plan From Last Visit', 2)}
          </section>

          <section className="psych-panel">
            <div className="psych-heading">
              <h3>Psychiatric Review of Systems (ROS)</h3>
              <div className="psych-row" style={{ margin: 0 }}>
                {radio('rosStatus', 'N', 'Reviewed No Changes')}
                {radio('rosStatus', 'C', 'Reviewed With Changes')}
              </div>
            </div>
            <div className="psych-checklist">
              {ROS_SYSTEMS.map(sys => (
                <label className="psych-check-item" key={sys.id}>
                  {checkbox(`ros-${sys.id}`, sys.label)}
                  <span>{sys.label}</span>
                </label>
              ))}
            </div>
            {textarea('reviewComments', 'Review of Systems Comments', 3)}
          </section>

          <section className="psych-panel">
            <div className="psych-heading">
              <h3>Substance Use, Tobacco & Caffeine</h3>
            </div>
            <div className="psych-checklist">
              {SUBSTANCE_USE_ITEMS.map(sub => (
                <label className="psych-check-item" key={sub.id}>
                  {checkbox(`su-${sub.id}`, sub.label)}
                  <span>{sub.label}</span>
                </label>
              ))}
            </div>
            <div className="psych-grid-2" style={{ marginTop: 8 }}>
              <div>
                <div className="psych-row">
                  <span style={{ fontWeight: 600 }}>Tobacco:</span>
                  {radio('tobaccoStatus', 'Non-Smoker', 'Non-Smoker')}
                  {radio('tobaccoStatus', 'Smoker', 'Smoker')}
                </div>
                {textInput('allergiesSmokePerday', 'Cigarettes Per Day')}
                {textarea('allergiesTobacouse', 'Tobacco Use Details', 2)}
              </div>
              <div>
                <div className="psych-row">
                  <span style={{ fontWeight: 600 }}>Pregnancy:</span>
                  {radio('pregnancyStatus', 'N', 'No')}
                  {radio('pregnancyStatus', 'Y', 'Yes')}
                  {radio('pregnancyStatus', 'NA', 'N/A')}
                </div>
                {textarea('allergiesCaffeineConsumption', 'Caffeine Consumption', 2)}
              </div>
            </div>
          </section>

          <section className="psych-panel">
            <div className="psych-heading">
              <h3>Strengths & Barriers</h3>
            </div>
            <div className="psych-grid-2">
              <div>{textarea('strengths', 'Strengths', 2)}</div>
              <div>{textarea('barriers', 'Barriers', 2)}</div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: MSE */}
      {activeTab === 'MSE' && (
        <div className="psych-tab-content">
          <section className="psych-panel">
            <div className="psych-heading">
              <h3>Mental Status Exam (MSE)</h3>
              <label className="psych-check-item" style={{ fontWeight: 600 }}>
                {checkbox('mseAllWnl', 'All Within Normal Limits (WNL)')}
                <span>All Within Normal Limits (WNL)</span>
              </label>
            </div>

            {MSE_DOMAINS.map(dom => (
              <div className="psych-mse-domain" key={dom.id}>
                <div className="psych-mse-header">
                  <span className="psych-mse-title">{dom.title}</span>
                  <div className="psych-mse-status">
                    {radio(`mse-assess-${dom.id}`, 'Assessed', 'Assessed')}
                    {radio(`mse-assess-${dom.id}`, 'NotAssessed', 'Not Assessed')}
                    {radio(`mse-assess-${dom.id}`, 'Unable', 'Unable to Assess')}
                    <label className="psych-check-item" style={{ marginLeft: 6 }}>
                      {checkbox(`mse-wnl-${dom.id}`, dom.wnlText)}
                      <span style={{ fontSize: 10 }}>WNL</span>
                    </label>
                  </div>
                </div>
                <div className="psych-checklist">
                  {dom.items.map(item => (
                    <label className="psych-check-item" key={item}>
                      {checkbox(`mse-item-${dom.id}-${item}`, item)}
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Suicide / Homicide risk assessment */}
            <div className="psych-mse-domain" style={{ borderLeftColor: '#c53929' }}>
              <div className="psych-mse-header">
                <span className="psych-mse-title" style={{ color: '#c53929' }}>
                  Suicide & Homicide Risk Assessment
                </span>
                <div className="psych-mse-status">
                  {radio('suicideRiskPresent', 'None', 'No Concerns')}
                  {radio('suicideRiskPresent', 'Present', 'Present')}
                </div>
              </div>
              <div className="psych-grid-2" style={{ marginTop: 6 }}>
                <div>
                  <div className="psych-row">
                    <span>Suicidal Ideation:</span>
                    {radio('siIdeation', 'Y', 'Yes')}
                    {radio('siIdeation', 'N', 'No')}
                  </div>
                  <div className="psych-row">
                    <span>Suicidal Plan:</span>
                    {radio('siPlan', 'Y', 'Yes')}
                    {radio('siPlan', 'N', 'No')}
                  </div>
                  <div className="psych-row">
                    <span>Suicidal Intent:</span>
                    {radio('siIntent', 'Y', 'Yes')}
                    {radio('siIntent', 'N', 'No')}
                  </div>
                </div>
                <div>
                  <div className="psych-row">
                    <span>Homicidal Ideation:</span>
                    {radio('hiIdeation', 'Y', 'Yes')}
                    {radio('hiIdeation', 'N', 'No')}
                  </div>
                  <div className="psych-row">
                    <span>Homicidal Plan:</span>
                    {radio('hiPlan', 'Y', 'Yes')}
                    {radio('hiPlan', 'N', 'No')}
                  </div>
                  <div className="psych-row">
                    <span>Homicidal Intent:</span>
                    {radio('hiIntent', 'Y', 'Yes')}
                    {radio('hiIntent', 'N', 'No')}
                  </div>
                </div>
              </div>
              {textarea('abnormalPsychoticThoughtComments', 'Abnormal / Psychotic Thoughts & Risk Comments', 3)}
            </div>

            {textarea('mentalStatusComments', 'Mental Status Exam Additional Comments, Descriptions', 4)}
          </section>
        </div>
      )}

      {/* Tab 3: Medical Decision Making */}
      {activeTab === 'Medical Decision Making' && (
        <div className="psych-tab-content">
          <section className="psych-panel">
            <div className="psych-heading">
              <h3>Problem Formulation & Complexity</h3>
            </div>
            <div className="psych-grid-2">
              <div>
                {select('mdmComplexity1', 'Problem 1 Complexity', MDM_COMPLEXITY_OPTIONS)}
                {textarea('problemCondition', 'Problem 1 / Current Problems – Condition', 4)}
              </div>
              <div>
                {select('mdmComplexity2', 'Problem 2 Complexity', MDM_COMPLEXITY_OPTIONS)}
                {textarea('associatedSignsSymptomsOtherText', 'Associated Signs & Symptoms / Secondary Problem', 4)}
              </div>
            </div>
          </section>

          <section className="psych-panel">
            <div className="psych-heading">
              <h3>Data Reviewed, Labs & Medications</h3>
            </div>
            <div className="psych-grid-2">
              <div>{textarea('medicalRecordsRelevantResults', 'Medical Records / Relevant Results / Active Medications', 4)}</div>
              <div>{textarea('labComments', 'Lab Results & Orders Comments', 4)}</div>
            </div>
          </section>

          <section className="psych-panel">
            <div className="psych-heading">
              <h3>Patient Education, Counseling & Care Coordination</h3>
            </div>
            {textarea('informationAndEducation', 'Information & Medication Education', 3)}
            <div className="psych-grid-2" style={{ marginTop: 8 }}>
              <div>{textarea('elaborateCheckedCounselingActivities', 'Counseling Activities & Coordination of Care', 3)}</div>
              <div>{textarea('elaborateCheckedNonCounselingActivities', 'Non-Counseling Activities', 3)}</div>
            </div>
          </section>

          <section className="psych-panel">
            <div className="psych-heading">
              <h3>Plan & Next Steps</h3>
            </div>
            {textarea('planComment', 'Plan of Care / Next Steps', 3)}
            <div className="psych-grid-2" style={{ marginTop: 8 }}>
              <div>{textarea('planLastVisitMDM', 'Plan from Last Visit MDM', 2)}</div>
              <div>{textInput('nextPhysicianVisit', 'Next Physician Visit / Follow-up')}</div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 4: AIMS */}
      {activeTab === 'AIMS' && (
        <div className="psych-tab-content">
          <section className="psych-panel">
            <div className="psych-heading">
              <h3>Abnormal Involuntary Movement Scale (AIMS)</h3>
            </div>
            <table className="psych-table">
              <thead>
                <tr>
                  <th style={{ width: '60%' }}>Assessment Item</th>
                  <th style={{ width: '20%' }}>Previous</th>
                  <th style={{ width: '20%' }}>Current Score</th>
                </tr>
              </thead>
              <tbody>
                {AIMS_ITEMS.map((item, idx) => {
                  const opts =
                    idx >= 9
                      ? AIMS_AWARENESS_OPTIONS
                      : idx >= 7
                      ? AIMS_SEVERITY_OPTIONS
                      : AIMS_SCALE_OPTIONS;
                  return (
                    <tr key={item.id}>
                      <td>{item.label}</td>
                      <td>
                        <span style={{ color: '#666' }}>0 = None</span>
                      </td>
                      <td>
                        <select
                          aria-label={`AIMS ${item.id}`}
                          value={noteValues[`aims-${item.id}`] ?? ''}
                          onChange={e => onNoteChange?.(`aims-${item.id}`, e.target.value)}
                          style={{ width: '100%', fontSize: 11 }}
                        >
                          <option value="">-- Select --</option>
                          {opts.map(o => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="psych-row" style={{ marginTop: 8 }}>
              <span style={{ fontWeight: 600 }}>Dental Status:</span>
              <label className="psych-check-item">
                {checkbox('aimsDentures', 'Dentures')}
                <span>Dentures</span>
              </label>
              <label className="psych-check-item">
                {checkbox('aimsEdentulous', 'Edentulous')}
                <span>Edentulous</span>
              </label>
            </div>
          </section>
        </div>
      )}

      {/* Tab 5: Diagnosis */}
      {activeTab === 'Diagnosis' && (
        <div className="psych-tab-content">
          <section className="psych-panel">
            <div className="psych-heading">
              <h3>Billing & Clinical Diagnosis</h3>
              <label className="psych-check-item">
                {checkbox('noDiagnosis', 'No Diagnosis')}
                <span>No Diagnosis</span>
              </label>
            </div>
            <table className="psych-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>ICD-10</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Billable</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>F29</td>
                  <td>Unspecified psychosis not due to a substance or known physiological condition</td>
                  <td>Primary</td>
                  <td>High</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>F12.10</td>
                  <td>Cannabis abuse, uncomplicated</td>
                  <td>Additional</td>
                  <td>Moderate</td>
                  <td>Yes</td>
                </tr>
              </tbody>
            </table>
            <div className="psych-grid-2" style={{ marginTop: 8 }}>
              <div>{textarea('otherMedicalCondition', 'Other Medical Conditions', 3)}</div>
              <div>{textarea('factorComments', 'Psychosocial & Environmental Factors', 3)}</div>
            </div>
            <div className="psych-grid-3" style={{ marginTop: 8 }}>
              <div>{textInput('gafScore', 'GAF Score')}</div>
              <div>{textInput('whodasScore', 'WHODAS Score')}</div>
              <div>{textInput('cafasScore', 'CAFAS Score')}</div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 6: Psychotherapy */}
      {activeTab === 'Psychotherapy' && (
        <div className="psych-tab-content">
          <section className="psych-panel">
            <div className="psych-heading">
              <h3>Psychotherapy Provided</h3>
              <div className="psych-row" style={{ margin: 0 }}>
                {radio('psychotherapyProvided', 'Y', 'Yes')}
                {radio('psychotherapyProvided', 'N', 'No')}
              </div>
            </div>
            <div className="psych-grid-3">
              <div>{textInput('addonProcedureCode', 'Add-On Procedure Code')}</div>
              <div>{textInput('displayStartTime', 'Start Time')}</div>
              <div>{textInput('addonUnit', 'Unit / Duration')}</div>
            </div>
            <div className="psych-grid-2" style={{ marginTop: 8 }}>
              <div>{textarea('problemDescribedThisSession', 'Problem Described This Session', 3)}</div>
              <div>{textarea('clinicalImpressionWithIndividual', 'Clinical Impression With Individual', 3)}</div>
            </div>
            <div className="psych-grid-2" style={{ marginTop: 8 }}>
              <div>{textarea('sessionSummary', 'Session Summary', 3)}</div>
              <div>{textarea('treatmentPlanRecommendation', 'Treatment Plan & Recommendations', 3)}</div>
            </div>
          </section>

          <section className="psych-panel">
            <div className="psych-heading">
              <h3>Goals & Objectives Addressed</h3>
              <label className="psych-check-item">
                {checkbox('showCheckedGoals', 'Show only selected items')}
                <span>Show only selected items</span>
              </label>
            </div>
            {PSYCH_GO_OBJECTIVES.map(obj => (
              <div className="psych-row" key={obj.id} style={{ justifyContent: 'space-between' }}>
                <label className="psych-check-item" style={{ flex: 1 }}>
                  {checkbox(`carePlanObjective-${obj.id}`, `Objective ${obj.id}: ${obj.text}`)}
                  <span>
                    <strong>Objective {obj.id}:</strong> {obj.text}
                  </span>
                </label>
                <div style={{ width: 170 }}>
                  <select
                    aria-label={`Status ${obj.id}`}
                    value={noteValues[`carePlanStatus-${obj.id}`] ?? ''}
                    onChange={e => onNoteChange?.(`carePlanStatus-${obj.id}`, e.target.value)}
                    style={{ width: '100%', fontSize: 11 }}
                  >
                    {PSYCH_GO_STATUSES.map(s => (
                      <option key={s} value={s}>
                        {s || '-- Select Status --'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            {textarea('psychotherapyComment', 'Objectives Comments', 2)}
          </section>
        </div>
      )}
    </div>
  );
}
