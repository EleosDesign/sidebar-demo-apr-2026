import React from 'react';
import {
  PSYCH_NOTE_TABS, ROS_SYSTEMS, SUBSTANCE_USE_ITEMS, PAST_HISTORY_ROWS, MSE_DOMAINS, RISK_ROWS,
  AIMS_SECTIONS, AIMS_SCALE_OPTIONS, MDM_COMPLEXITY_OPTIONS, MDM_DATA_REVIEWED_TOP, MDM_DATA_REVIEWED_ROWS,
  MDM_RISK_ITEMS, ORDER_COLUMNS, MED_COLUMNS, MED_TABLES, COUNSELING_ACTIVITIES, NON_COUNSELING_ACTIVITIES,
  DIAGNOSIS_LIST_COLUMNS,
} from '../../data/psychiatricNote.js';
import './PsychiatricNote.css';

const slug = s => s.replace(/[^a-z0-9]+/gi, '');

const Ctx = React.createContext({ noteValues: {}, set: () => {}, highlightedField: null });
const useNote = () => React.useContext(Ctx);

const Panel = ({ title, aside, children, className = '' }) => (
  <section className={`psych-panel ${className}`}>
    <div className="psych-heading"><h3>{title}</h3>{aside}</div>
    <div className="psych-body">{children}</div>
  </section>
);
const Check = ({ id, label, className = '' }) => {
  const { noteValues, set } = useNote();
  return (
    <label className={`psych-opt ${className}`}>
      <input type="checkbox" aria-label={label} checked={!!noteValues[id]} onChange={e => set(id, e.target.checked)} />
      <span>{label}</span>
    </label>
  );
};
const Radio = ({ name, value, label, disabled }) => {
  const { noteValues, set } = useNote();
  return (
    <label className="psych-opt">
      <input type="radio" name={`psych-${name}`} aria-label={label} disabled={disabled}
        checked={noteValues[name] === value} onChange={() => set(name, value)} />
      <span>{label}</span>
    </label>
  );
};
const Radios = ({ name, options }) => options.map(o => <Radio key={o} name={name} value={o} label={o} />);
const Area = ({ id, label, h = 64, grey, noLabel }) => {
  const { noteValues, set, highlightedField } = useNote();
  return (
    <div className="psych-field">
      {!noLabel && <label htmlFor={`psych-${id}`} className="psych-lbl">{label}</label>}
      <textarea id={`psych-${id}`} data-field={id} aria-label={label} style={{ height: h }}
        className={`${grey ? 'psych-grey' : ''} ${highlightedField === id ? 'psych-highlight' : ''}`}
        value={noteValues[id] ?? ''} onChange={e => set(id, e.target.value)} />
    </div>
  );
};
const Input = ({ id, label, w, className = '' }) => {
  const { noteValues, set } = useNote();
  return (
    <input type="text" id={`psych-${id}`} aria-label={label} className={`psych-input ${className}`} style={w ? { width: w } : undefined}
      value={noteValues[id] ?? ''} onChange={e => set(id, e.target.value)} />
  );
};
const Select = ({ id, label, options = [''], w, disabled }) => {
  const { noteValues, set } = useNote();
  return (
    <select id={`psych-${id}`} aria-label={label} className="psych-select" style={w ? { width: w } : undefined} disabled={disabled}
      value={noteValues[id] ?? ''} onChange={e => set(id, e.target.value)}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
};
const Btn = ({ children, w, onClick }) => (
  <button type="button" className="psych-btn" style={w ? { width: w } : undefined} onClick={onClick}>{children}</button>
);
const Grid = ({ cols, items, prefix }) => (
  <div className="psych-checks" style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}>
    {items.map((it, i) => it == null ? <span key={i} /> : <Check key={it + i} id={`${prefix}-${slug(it)}${i}`} label={it} />)}
  </div>
);
const DataTable = ({ columns, empty = 'No data to display', h = 120 }) => (
  <div className="psych-table-wrap" style={{ minHeight: h }}>
    <table className="psych-table"><thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead></table>
    {empty && <div className="psych-empty">{empty}</div>}
  </div>
);

export default function PsychiatricNote({ noteValues = {}, onNoteChange, highlightedField }) {
  const activeTab = noteValues.psychActiveTab || 'General';
  const set = (id, v) => onNoteChange?.(id, v);

  // ---- General ----------------------------------------------------------
  const General = () => (
    <>
      <Panel title="General" aside={<span className="psych-goals">Goals/Objectives <i className="psych-info">i</i></span>}>
        <div className="psych-row">
          <Radio name="patientType" value="Adult" label="Adult" />
          <Radio name="patientType" value="Child" label="Child/Adolescent" />
        </div>
      </Panel>
      <Panel title="Today's Chief Complaint/Reason for Visit">
        <Area id="chiefComplaintLastVisit" label="Chief Complaint/Reason for Visit - Last Visit" h={151} grey />
        <div className="psych-row psych-lbl">
          <span>Today's Chief Complaint/Reason for Visit</span>
          <Check id="chiefComplaintSame" label="Same as Last Visit" />
        </div>
        <Area id="todayChiefComplaint" label="Today's Chief Complaint/Reason for Visit" noLabel />
      </Panel>
      <Panel title="Other Notes"><Area id="otherNotes" label="Other Notes" noLabel /></Panel>
      <Panel title="History of Present Illness"><Area id="historyOfPresentIllness" label="History of Present Illness" noLabel /></Panel>
      <Panel title="Persons Present other than Consumer">
        <div className="psych-row psych-split">
          <span>History obtained from person present other than patient or reviewed summary of records</span>
          <span className="psych-row"><Radio name="reviewedRecords" value="Y" label="Yes" /><Radio name="reviewedRecords" value="N" label="No" /></span>
        </div>
        <Area id="personPresentComments" label="Comments" />
      </Panel>
      <Panel title="Past History">
        {PAST_HISTORY_ROWS.map(r => (
          <div key={r.id}>
            <div className="psych-row psych-past">
              <span className="psych-past-label">{r.label}</span>
              <Radio name={`${r.id}Status`} value="N" label="Reviewed No Changes" />
              <Radio name={`${r.id}Status`} value="C" label="Reviewed With Changes" />
            </div>
            <Area id={r.field} label={`${r.label} comments`} noLabel />
          </div>
        ))}
      </Panel>
      <Panel title="Side Effects">
        <div className="psych-row"><span className="psych-side-label">Side Effects</span><Radio name="sideEffects" value="None" label="None" /><Radio name="sideEffects" value="Specify" label="Specify" /></div>
      </Panel>
      <Panel title="Plan – Last Visit"><Area id="planLastVisit" label="Plan – Last Visit" /></Panel>
      <Panel title="Review of Systems" aside={<span className="psych-row psych-ros-status"><Radio name="rosStatus" value="N" label="Reviewed No Changes" /><Radio name="rosStatus" value="C" label="Reviewed With Changes" /></span>}>
        <Grid cols={4} items={ROS_SYSTEMS} prefix="ros" />
        <Area id="reviewComments" label="Comments" />
      </Panel>
      <Panel title="Allergies">
        <div className="psych-btn-row"><Btn w={75}>Open Allergy</Btn><Btn w={47}>Refresh</Btn></div>
        <table className="psych-table psych-allergy"><thead><tr><th>Allergies</th><th>Comments</th></tr></thead><tbody><tr><td /><td /></tr></tbody></table>
        <div className="psych-blank-box" />
      </Panel>
      <Panel title="Substance Use Hx">
        <div className="psych-row"><span className="psych-lbl">Substance Use</span><Check id="suNone" label="None" /></div>
        {SUBSTANCE_USE_ITEMS.map(s => (
          <div className="psych-su-row" key={s}><Check id={`su-${slug(s)}`} label={s} /><Input id={`su-${slug(s)}-text`} label={`${s} details`} /></div>
        ))}
        <div className="psych-row">
          <Radio name="tobaccoStatus" value="Non-Smoker" label="Non-Smoker" />
          <Radio name="tobaccoStatus" value="Smoker" label="Smoker" />
          <span>How Much?</span><Input id="allergiesSmokePerday" label="How Much?" w={124} />
        </div>
        <div className="psych-side-row"><span>Other Tobacco Use</span><Area id="allergiesTobacouse" label="Other Tobacco Use" h={35} noLabel /></div>
        <div className="psych-side-row"><span>Caffeine Consumption</span><Area id="allergiesCaffeineConsumption" label="Caffeine Consumption" h={35} noLabel /></div>
      </Panel>
      <Panel title="Pregnant/Last Menstrual Period">
        <div className="psych-row psych-preg"><span>Pregnant</span><Radio name="pregnancyStatus" value="Y" label="Yes" /><Radio name="pregnancyStatus" value="N" label="No" /><Radio name="pregnancyStatus" value="NA" label="N/A" /></div>
        <div className="psych-row"><span>Last Menstrual Period</span><Input id="lastMenstrualPeriod" label="Last Menstrual Period" w={348} /></div>
      </Panel>
      <Panel title="Strengths and Barriers">
        <Area id="strengths" label="Strengths" /><Area id="barriers" label="Barriers" />
      </Panel>
      <Panel title="Vitals"><Btn>Open vitals flow sheet</Btn></Panel>
    </>
  );

  // ---- MSE --------------------------------------------------------------
  const clearDomain = dom => {
    Object.keys(noteValues).filter(k => k.startsWith(`mse-${dom.id}-`)).forEach(k => set(k, typeof noteValues[k] === 'boolean' ? false : ''));
  };
  const inline = (dom, block, bi) => {
    const rows = block.perRow ? Array.from({ length: Math.ceil(block.items.length / block.perRow) }, (_, i) => block.items.slice(i * block.perRow, (i + 1) * block.perRow)) : [block.items];
    return (
      <div className="psych-mse-block">
        {block.heading && <div className="psych-sub">{block.heading}</div>}
        {rows.map((r, ri) => (
          <div className="psych-inline" key={ri}>
            {block.label && ri === 0 && <span className="psych-inline-label">{block.label}</span>}
            {r.map((it, i) => <Check key={it + i} id={`mse-${dom.id}-${bi}-${slug(it)}${ri}${i}`} label={it} />)}
          </div>
        ))}
        {block.text && <Input id={`mse-${dom.id}-${bi}-text`} label={`${dom.title} other`} className="psych-input-wide" />}
      </div>
    );
  };
  const domain = dom => (
    <div className="psych-mse-domain">
      <div className="psych-mse-head">
        <span className="psych-mse-title">{dom.title}</span>
        {dom.assess.map(a => <Radio key={a} name={`mse-${dom.id}-assess`} value={a} label={a} />)}
        <Radio name={`mse-${dom.id}-assess`} value="WNL" label={dom.wnl} />
      </div>
      {dom.blocks.map((b, bi) => {
        if (b.kind === 'checks') return <Grid key={bi} cols={b.cols ?? 5} items={b.items} prefix={`mse-${dom.id}-${bi}`} />;
        if (b.kind === 'inline') return <React.Fragment key={bi}>{inline(dom, b, bi)}</React.Fragment>;
        if (b.kind === 'radios') return <div key={bi} className="psych-row psych-mse-block"><span>{b.label}</span><Radios name={`mse-${dom.id}-${bi}`} options={b.options} /></div>;
        if (b.kind === 'memory') return (
          <div key={bi} className="psych-mse-block">
            {b.rows.map(r => (
              <div className="psych-inline" key={r}>
                <span className="psych-inline-label">{r}</span>
                <Radios name={`mse-${dom.id}-${r}`} options={['Good', 'Fair', 'Impaired']} />
                <span>As Evidenced By</span><Input id={`mse-${dom.id}-${r}-by`} label={`${r} as evidenced by`} w={150} />
                {r === 'Immediate' && <><Input id={`mse-${dom.id}-words`} label="Words recalled" w={30} /><span>/3 Words In Five Minutes</span></>}
              </div>
            ))}
          </div>
        );
        if (b.kind === 'evidence') return (
          <div key={bi} className="psych-mse-block">
            <div className="psych-sub">{b.heading}</div>
            <div className="psych-evidence">
              {b.prompts.map(p => <div key={p}><span>{p}</span><Input id={`mse-${dom.id}-${slug(p)}`} label={p} className="psych-input-wide" /></div>)}
            </div>
          </div>
        );
        if (b.kind === 'risk') return (
          <div key={bi} className="psych-mse-block">
            <div className="psych-row">
              <span className="psych-bold">Suicide/Homicide</span>
              <Radio name="suicideRiskPresent" value="None" label="No Suicidal/homicidal concerns" />
              <Radio name="suicideRiskPresent" value="Present" label="Present" />
            </div>
            <div className="psych-risk">
              {RISK_ROWS.map(([a, b2], ri) => (
                <React.Fragment key={a + ri}>
                  <span>{a}</span><span className="psych-row"><Radios name={`risk-${ri}-0`} options={['Yes', 'No']} /></span>
                  <span>{b2}</span><span className="psych-row"><Radios name={`risk-${ri}-1`} options={['Yes', 'No']} /></span>
                </React.Fragment>
              ))}
            </div>
            <Area id="abnormalPsychoticThoughtComments" label="Comments" h={80} />
          </div>
        );
        return null;
      })}
      <div className="psych-clear"><Btn w={60} onClick={() => clearDomain(dom)}>Clear</Btn></div>
    </div>
  );
  const MSE = () => (
    <>
      <Panel title="Vitals">
        <div className="psych-btn-row"><Btn w={122}>Open vitals flow sheet</Btn><Btn w={52}>Refresh</Btn></div>
        <div className="psych-vitals-box"><span>No data found for the client</span></div>
      </Panel>
      <Panel title="Mental Status Exam">
        <Check id="mseAllWnl" label="All Within Normal Limits (WNL)" />
        {MSE_DOMAINS.map(d => <React.Fragment key={d.id}>{domain(d)}</React.Fragment>)}
        <Area id="mentalStatusComments" label="Mental status exam additional comments, Descriptions" h={90} />
      </Panel>
    </>
  );

  // ---- MDM --------------------------------------------------------------
  const problemCount = Math.max(1, Number(noteValues.mdmProblemCount) || 1);
  const problem = n => {
    const sfx = n === 1 ? '' : String(n);
    return (
      <section className="psych-panel">
        <div className="psych-heading"><h3><span className="psych-x">✕</span> Problem {n}</h3></div>
        <div className="psych-body">
          <div className="psych-problem-top"><Btn w={120}>Problem....</Btn><Area id={`problemCondition${sfx}`} label={`Problem ${n}`} noLabel /></div>
          <div className="psych-row"><span>Complexity of Problem</span><Select id={`mdmComplexity${n}`} label={`Complexity of Problem ${n}`} options={MDM_COMPLEXITY_OPTIONS} w={443} /></div>
          <Area id={`associatedSignsSymptomsOtherText${sfx}`} label="Associated signs/systems; other information" />
        </div>
      </section>
    );
  };
  const MDM = () => (
    <>
      {Array.from({ length: problemCount }, (_, i) => <React.Fragment key={i}>{problem(i + 1)}</React.Fragment>)}
      <div className="psych-link-row"><a href="#add-problem" onClick={e => { e.preventDefault(); set('mdmProblemCount', problemCount + 1); }}>Add Problem</a></div>
      <Panel title="Data Reviewed">
        <div className="psych-row psych-data-top">{MDM_DATA_REVIEWED_TOP.map((l, i) => <Check key={l} id={`mdmData${i}`} label={l} />)}</div>
        {MDM_DATA_REVIEWED_ROWS.map((l, i) => <div key={l}><Check id={`mdmDataRow${i}`} label={l} /></div>)}
        <div className="psych-two-col">
          <Area id="medicalRecordsRelevantResults" label="Relevant/Test Results" h={106} grey />
          <Area id="labsOrderedLastVisit" label="Labs Ordered Last Visit" h={100} />
        </div>
        <div className="psych-btn-row psych-btn-right"><Btn w={120}>Refresh</Btn></div>
        <Area id="labComments" label="Lab Comments" />
      </Panel>
      <Panel title="Risk of complications and/or Morbidity or Mortality of Patient Management">
        <Grid cols={2} items={MDM_RISK_ITEMS} prefix="mdmRisk" />
      </Panel>
      <Panel title="Client Orders">
        <div className="psych-order-form">
          <Input id="orderSearch" label="Search Order" w={143} />
          <span>Clinic/Location:</span><Select id="orderClinic" label="Clinic/Location" w={131} />
          <span>Diagnosis:</span><Select id="orderDx" label="Order Diagnosis" w={187} /><Btn w={112}>Add Diagnosis</Btn>
          <span>Frequency:</span><Select id="orderFreq" label="Frequency" w={107} />
          <span>Labs:</span><Select id="orderLabs" label="Labs" w={143} />
          <span>Ordering Physician:</span><Select id="orderPhys" label="Ordering Physician" w={128} /><Btn w={112}>Send to Lab</Btn>
          <span>Start:</span><Input id="orderStart" label="Start date" w={98} /><Input id="orderStartTime" label="Start time" w={92} />
          <span>End:</span><Input id="orderEnd" label="End date" w={91} /><Input id="orderEndTime" label="End time" w={95} />
          <Btn w={112}>Open Client Orders</Btn><Btn w={112}>Add Order</Btn>
        </div>
        <DataTable columns={ORDER_COLUMNS} h={150} />
        <div className="psych-btn-row psych-btn-right"><Btn w={120}>Refresh</Btn></div>
        <DataTable columns={ORDER_COLUMNS} empty="" h={150} />
      </Panel>
      <Panel title="Medications">
        <p className="psych-note-text">The information displayed in the SmartCare Rx section is entered into the SmartCare Rx module and current read only information as applicable on the date of service is specified below.</p>
        <div className="psych-row"><Btn w={121}>Open SmartCare RX</Btn><Btn w={120}>View Medication History</Btn><Check id="medReconciliation" label="Medication Reconciliation" /></div>
        <div className="psych-row psych-split">
          <span>Risk/benefits/side effects have been discussed with the client/guardian and understood</span>
          <span className="psych-row"><Radios name="medRiskDiscussed" options={['Yes', 'No', 'N/A']} /></span>
        </div>
        {MED_TABLES.map(t => (
          <div className="psych-subpanel" key={t}><h4>{t}</h4><DataTable columns={MED_COLUMNS} empty="" h={140} /></div>
        ))}
        <Area id="informationAndEducation" label="Information and Education" />
      </Panel>
      <Panel title="Activities Completed">
        <div className="psych-row"><span>Total time spent on encounter</span><Input id="totalTimeMinutes" label="Total time spent on encounter" w={56} /><span>Minutes</span></div>
        <div className="psych-subpanel">
          <h4>Counseling Activities</h4>
          <Grid cols={2} items={COUNSELING_ACTIVITIES} prefix="counsel" />
          <Area id="elaborateCheckedCounselingActivities" label="Elaborate on activities checked above" />
        </div>
        <div className="psych-subpanel">
          <h4>Non Counseling Activities</h4>
          <Grid cols={2} items={NON_COUNSELING_ACTIVITIES} prefix="noncounsel" />
          <Area id="elaborateCheckedNonCounselingActivities" label="Elaborate on activities checked above" />
        </div>
      </Panel>
      <Panel title="Plan">
        <Area id="planLastVisitMDM" label="Plan – Last Visit" grey />
        <div className="psych-row psych-split">
          <span>Patient/Parent/Guardian voiced understanding and gave consent for the below plan.</span>
          <span className="psych-row"><Radios name="planConsent" options={['Yes', 'No']} /></span>
        </div>
        <div className="psych-row psych-lbl"><span>Plan</span><Check id="planSame" label="Same as Last Visit" /></div>
        <Area id="planComment" label="Plan" noLabel />
        <div className="psych-row"><b>Next Visit</b><Radios name="nextVisit" options={['PRN', 'N/A']} /></div>
        <Area id="nextPhysicianVisit" label="Next Physician's Visit" h={40} />
        <Check id="treatmentOptionsDiscussed" label="Treatment options and risks of non-compliance with treatment recommendations were discussed with the client." />
      </Panel>
    </>
  );

  // ---- AIMS -------------------------------------------------------------
  const AIMS = () => (
    <>
      <div className="psych-aims-intro">MOVEMENT RATINGS: Rate highest severity observed. Rate movements that occur upon activation one less than those observed spontaneously.</div>
      {AIMS_SECTIONS.map((s, si) => (
        <Panel key={s.title} title={s.title} aside={si === 0 ? <Check id="aimsDefaultZero" label="Default Score to Zero" className="psych-aims-default" /> : null}>
          {si === 0 && <div className="psych-aims-cols"><span>Current Score</span><span>Previous Score</span></div>}
          {s.rows.map(([id, label]) => (
            <div className="psych-aims-row" key={id}>
              <span>{label}</span>
              <Select id={`aims-${id}`} label={`AIMS ${id}`} options={AIMS_SCALE_OPTIONS} w={149} />
              <Select id={`aims-${id}-prev`} label={`AIMS ${id} previous`} options={['']} w={149} disabled />
            </div>
          ))}
        </Panel>
      ))}
      <Panel title="Dental">
        {['Current problems with teeth and/or dentures', 'Does patient usually wear dentures?'].map((l, i) => (
          <div className="psych-aims-row psych-dental" key={l}>
            <span>{l}</span>
            <span className="psych-row"><Radios name={`aimsDental${i}`} options={['Yes', 'No']} /></span>
            <span className="psych-row"><Radio name={`aimsDental${i}-prev`} value="Yes" label="Yes" disabled /><Radio name={`aimsDental${i}-prev`} value="No" label="No" disabled /></span>
          </div>
        ))}
      </Panel>
      <div className="psych-aims-foot">
        <b>Comments</b><Input id="aimsComments" label="AIMS comments" w={355} />
        <b>Current Total Score:</b><b>Previous Total Score:</b>
        <b className="psych-aims-cur">Current:</b><span className="psych-row"><Radios name="aimsCurrentResult" options={['Positive', 'Negative']} /></span>
        <b>Previous:</b><span className="psych-row"><Radio name="aimsPrevResult" value="Positive" label="Positive" disabled /><Radio name="aimsPrevResult" value="Negative" label="Negative" disabled /></span>
      </div>
    </>
  );

  // ---- Diagnosis --------------------------------------------------------
  const Diagnosis = () => (
    <>
      <Check id="noDiagnosis" label="No Diagnosis" />
      <Panel title="Diagnosis">
        <div className="psych-dx-form">
          <div className="psych-dx-row"><span className="psych-star">★</span><Select id="dxFavorites" label="Diagnosis favorites" w={679} /></div>
          <div className="psych-dx-row"><span>Code</span><Input id="dxCode" label="Code" w={60} /><span>Description</span><Input id="dxDescription" label="Description" w={420} /></div>
          <div className="psych-dx-row"><Check id="dxRuleOut" label="Rule Out" /><span className="psych-dx-l">Type</span><Select id="dxType" label="Type" w={248} /><span className="psych-dx-l">Specifier</span><Input id="dxSpecifier" label="Specifier" w={222} /></div>
          <div className="psych-dx-row"><span className="psych-dx-l psych-dx-l2">Severity</span><Select id="dxSeverity" label="Severity" w={248} /><span className="psych-dx-l">Source</span><Input id="dxSource" label="Source" w={222} /></div>
          <div className="psych-dx-row"><span className="psych-dx-l psych-dx-l2">Remission</span><Select id="dxRemission" label="Remission" w={248} /><span className="psych-dx-l">Order</span><Input id="dxOrder" label="Order" w={56} /><span>Billable</span><Radios name="dxBillable" options={['Yes', 'No']} /></div>
          <div className="psych-dx-row"><span className="psych-dx-l psych-dx-l2">Comments</span><Input id="dxComments" label="Diagnosis comments" w={589} /></div>
        </div>
        <div className="psych-subpanel psych-dx-list">
          <div className="psych-dx-listhead"><h4>Diagnosis List</h4><Btn w={67}>Insert</Btn><Btn w={67}>Clear</Btn></div>
          <DataTable columns={DIAGNOSIS_LIST_COLUMNS} empty="" h={100} />
        </div>
        <div className="psych-row"><span>Screening Tools Used</span><Input id="screeningTools" label="Screening Tools Used" className="psych-input-wide" /></div>
        <Area id="otherMedicalCondition" label="Other General Medical Conditions" h={64} />
      </Panel>
      <Panel title="Psychosocial, Environmental, and Other Factors">
        <Btn w={91}>Factor Lookup...</Btn>
        <div className="psych-subpanel"><DataTable columns={['Source']} h={150} /></div>
        <Area id="factorComments" label="Comments" />
      </Panel>
      <Panel title="Level of Functioning Score">
        <div className="psych-gaf">
          <span>GAF Score</span><Input id="gafScore" label="GAF Score" w={56} />
          <span>WHODAS Score</span><Input id="whodasScore" label="WHODAS Score" w={56} />
          <span>CAFAS Score</span><Input id="cafasScore" label="CAFAS Score" w={56} />
        </div>
      </Panel>
    </>
  );

  // ---- Psychotherapy ----------------------------------------------------
  const Psychotherapy = () => (
    <Panel title="Psychotherapy">
      <div className="psych-row"><span>Was add on psychotherapy provided to patient?</span><Radios name="psychotherapyProvided" options={['Yes', 'No']} /></div>
    </Panel>
  );

  const TAB_VIEWS = { General, MSE, 'Medical Decision Making': MDM, AIMS, Diagnosis, Psychotherapy };

  return (
    <Ctx.Provider value={{ noteValues, set, highlightedField }}>
    <div className="psych-note">
      <div className="psych-tabs-strip" role="tablist">
        {PSYCH_NOTE_TABS.map(tab => (
          <button key={tab} type="button" role="tab" aria-selected={activeTab === tab}
            className={`psych-tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => set('psychActiveTab', tab)}>
            {tab}
          </button>
        ))}
      </div>
      <div className="psych-tab-content">{TAB_VIEWS[activeTab] ? TAB_VIEWS[activeTab]() : General()}</div>
    </div>
    </Ctx.Provider>
  );
}
