import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import EnhancePointer from './EnhancePointer';

interface EnhancePointerToolbarProps {
  /** Whether to hide the toolbar. */
  disabled?: boolean;
  selectedEhr?: string;
  /** Ref to the EHR container (used to limit textarea search scope). */
  ehrContainerRef?: React.RefObject<HTMLElement>;
  /** Called when user clicks the quality-check shield. */
  onCheckQuality?: () => void;
  /** Number of open quality items to show on badge. */
  outstandingCount?: number;
  /** Whether a quality check has been performed (shows badge). */
  showBadge?: boolean;
}

/**
 * Global floating toolbar that positions itself 5px below the last visible
 * textarea on the page (excluding the Eleos companion sidebar).
 *
 * Behaviour:
 *  - Shows when any EHR textarea is focused (with 300ms delay)
 *  - Hides 150ms after focus leaves (unless toolbar itself is focused)
 *  - Repositions on scroll and window resize
 *  - Hidden when disabled
 */
export default function EnhancePointerToolbar({
  disabled = false,
  ehrContainerRef,
  onCheckQuality,
  outstandingCount = 0,
  showBadge = false,
}: EnhancePointerToolbarProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const isExcluded = disabled;

  /** Find the last visible textarea outside the companion sidebar. */
  const findLastTextarea = useCallback((): HTMLTextAreaElement | null => {
    const scope: ParentNode = ehrContainerRef?.current ?? document;
    const all = Array.from(scope.querySelectorAll<HTMLTextAreaElement>('textarea'));

    // Exclude textareas inside the Eleos companion (right-hand sidebar)
    const ehr = all.filter(ta => {
      // Walk up to check we're not inside the companion sidebar
      let el: Element | null = ta;
      while (el) {
        const dataRole = el.getAttribute('data-role');
        if (dataRole === 'companion') return false;
        el = el.parentElement;
      }
      // Must be visible
      const r = ta.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });

    return ehr.length > 0 ? ehr[ehr.length - 1] : null;
  }, [ehrContainerRef]);

  /** Compute and apply position below the last textarea. */
  const reposition = useCallback(() => {
    const ta = findLastTextarea();
    if (!ta) return;
    const r = ta.getBoundingClientRect();
    setPos({ top: r.bottom + 5, left: r.left });
  }, [findLastTextarea]);

  /** Show the toolbar (called on textarea focus with 300ms delay). */
  const handleShow = useCallback(() => {
    if (isExcluded) return;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    showTimerRef.current = setTimeout(() => {
      reposition();
      setVisible(true);
    }, 300);
  }, [isExcluded, reposition]);

  /** Hide the toolbar (called on textarea blur with 150ms delay). */
  const handleHide = useCallback(() => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      // Keep visible if toolbar itself has focus
      if (toolbarRef.current?.contains(document.activeElement)) return;
      setVisible(false);
    }, 150);
  }, []);

  useEffect(() => {
    if (isExcluded) { setVisible(false); return; }

    const onFocus = (e: FocusEvent) => {
      const ta = e.target as HTMLTextAreaElement;
      if (ta.tagName !== 'TEXTAREA') return;
      // Ignore companion sidebar textareas
      let el: Element | null = ta;
      while (el) {
        if (el.getAttribute('data-role') === 'companion') return;
        el = el.parentElement;
      }
      handleShow();
    };

    const onBlur = (e: FocusEvent) => {
      const ta = e.target as HTMLTextAreaElement;
      if (ta.tagName !== 'TEXTAREA') return;
      handleHide();
    };

    const onScroll = () => { if (visible) reposition(); };
    const onResize = () => { if (visible) reposition(); };

    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onBlur);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
    };
  }, [isExcluded, visible, handleShow, handleHide, reposition]);

  if (isExcluded || !visible) return null;

  return ReactDOM.createPortal(
    <div
      ref={toolbarRef}
      data-role="enhance-toolbar"
      onMouseDown={e => e.preventDefault()}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        zIndex: 9,   // below sidebar (zIndex: 10)
        animation: 'enhanceFadeIn 0.15s ease',
      }}
    >
      <style>{`
        @keyframes enhanceFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <EnhancePointer
        outstandingCount={outstandingCount}
        showBadge={showBadge}
        onCheckQuality={onCheckQuality}
      />
    </div>,
    document.body,
  );
}
