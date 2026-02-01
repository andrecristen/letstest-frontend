import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { createPortal } from 'react-dom';

interface TooltipProps {
  text: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

const Tooltip: React.FC<TooltipProps> = ({ text, side = 'top', align = 'center' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!isVisible) {
      return;
    }

    const getScrollParent = (node: HTMLElement | null): HTMLElement | Window => {
      let current = node?.parentElement ?? null;
      while (current) {
        const style = window.getComputedStyle(current);
        const overflow = `${style.overflow}${style.overflowY}${style.overflowX}`;
        if (/(auto|scroll|overlay)/.test(overflow)) {
          return current;
        }
        current = current.parentElement;
      }
      return window;
    };

    const updatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) {
        return;
      }
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const gap = 8;

      let top = 0;
      let left = 0;

      if (side === 'top' || side === 'bottom') {
        top =
          side === 'top'
            ? triggerRect.top - tooltipRect.height - gap
            : triggerRect.bottom + gap;

        if (align === 'start') {
          left = triggerRect.left;
        } else if (align === 'end') {
          left = triggerRect.right - tooltipRect.width;
        } else {
          left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        }
      } else {
        left =
          side === 'left'
            ? triggerRect.left - tooltipRect.width - gap
            : triggerRect.right + gap;

        if (align === 'start') {
          top = triggerRect.top;
        } else if (align === 'end') {
          top = triggerRect.bottom - tooltipRect.height;
        } else {
          top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        }
      }

      const padding = 8;
      const maxLeft = window.innerWidth - tooltipRect.width - padding;
      const maxTop = window.innerHeight - tooltipRect.height - padding;

      setPosition({
        top: Math.min(Math.max(top, padding), maxTop),
        left: Math.min(Math.max(left, padding), maxLeft),
      });
    };

    updatePosition();

    const scrollParent = getScrollParent(triggerRef.current);
    const scrollTarget = scrollParent === window ? window : scrollParent;

    scrollTarget.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);

    return () => {
      scrollTarget.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [align, isVisible, side, text]);

  const sideClasses: Record<string, string> = {
    top: '',
    bottom: '',
    left: '',
    right: '',
  };

  const alignClasses: Record<string, string> = {
    start: '',
    center: '',
    end: '',
  };

  const arrowClasses: Record<string, string> = {
    top: 'absolute -bottom-1 left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-ink/90',
    bottom: 'absolute -top-1 left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-b-8 border-b-ink/90',
    left: 'absolute -right-1 top-1/2 -translate-y-1/2 border-y-8 border-y-transparent border-l-8 border-l-ink/90',
    right: 'absolute -left-1 top-1/2 -translate-y-1/2 border-y-8 border-y-transparent border-r-8 border-r-ink/90',
  };

  return (
    <div className="relative ml-2 inline-flex items-center">
      <button
        type="button"
        aria-describedby={tooltipId}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="rounded-full text-ink/60 transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean/40"
        ref={triggerRef}
      >
        <FiInfo size={20} />
      </button>
      {isMounted &&
        isVisible &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            ref={tooltipRef}
            style={{ top: position.top, left: position.left }}
            className={`fixed z-[60] max-w-xs ${sideClasses[side]} ${alignClasses[align]} rounded-lg bg-ink/90 px-3 py-2 text-xs text-sand shadow-soft pointer-events-none`}
          >
            <span className={arrowClasses[side]} />
            {text}
          </div>,
          document.body
        )}
    </div>
  );
};

export default Tooltip;
